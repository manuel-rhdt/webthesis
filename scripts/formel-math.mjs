#!/usr/bin/env node
// Post-process the rendered Quarto book: replace every MathML <math> element with an
// SVG rendered by formel, stored once per unique equation under <book>/math/.
//
// Usage: node scripts/formel-math.mjs <book-dir> <formel-dir>
//
// <formel-dir> must contain pkg/formel_wasm.js, pkg/formel_wasm_bg.wasm and a font with a
// MATH table (fonts/lisnoti-regular.ttf, the sans maths face that matches the Noto Sans body).
// The CI workflow downloads those and checks them against .github/formel-checksums.txt.
//
// The book is rendered with `html-math-method: mathml`, so the input is pandoc's MathML.
// Each <math> is turned into <img src="…/math/<hash>.svg"> sized in em, with the speech text
// formel puts in the SVG's <title> as alt text. Equation anchors (<span id="eq-…">) are
// untouched, but the equations are no longer selectable text.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const [bookDir, formelDir] = process.argv.slice(2);
if (!bookDir || !formelDir) {
  console.error("usage: node scripts/formel-math.mjs <book-dir> <formel-dir>");
  process.exit(2);
}

const pkgDir = path.join(formelDir, "pkg");
const fontFile = path.join(formelDir, "fonts", "lisnoti-regular.ttf");
const mathDir = path.join(bookDir, "math");

const { initSync, MathRenderer } = await import(pathToFileURL(path.join(pkgDir, "formel_wasm.js")));
initSync({ module: new WebAssembly.Module(fs.readFileSync(path.join(pkgDir, "formel_wasm_bg.wasm"))) });
const fontBytes = fs.readFileSync(fontFile);
const renderer = new MathRenderer(new Uint8Array(fontBytes));
const upm = renderer.units_per_em();
// The file name has to follow the font too: same MathML in another face is another picture, and
// the old name would keep serving the previous glyphs from caches.
const fontId = crypto.createHash("sha256").update(fontBytes).digest("hex").slice(0, 8);

const MATH_RE = /<math\b[^>]*>[\s\S]*?<\/math>/g;
const DISPLAY_RE = /display\s*=\s*"block"/;

function htmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(p));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (x) => (Math.round(x * 1e4) / 1e4).toString();

fs.mkdirSync(mathDir, { recursive: true });

// Unique equations only: one SVG file per distinct MathML string.
const svgByHash = new Map();
let occurrences = 0;
let failures = 0;
let svgBytes = 0;

// pandoc writes a function name as <mo>sin</mo>: a multi-character operator that is in no
// operator dictionary, so every renderer falls back to "unknown infix" — 5/18em before and after.
// TeX makes it an Op atom followed by a function application, i.e. no space before and 3/18em
// after (and nothing at all before an opening fence, `\sin(x)`). Rewrite the name as <mi> (which
// renders upright because it is longer than one character) and insert U+2061, which formel spaces
// exactly like TeX. A name that carries limits (`\lim_{x\to0}`, `\max_{i}`) has to stay an
// operator, so it keeps <mo> and loses its right space instead; the U+2061 then follows the
// limits, not the name.
//
// The U+2061 has to be a sibling of the argument: formel looks at the *next child of the same
// row* to decide whether to add the thin space, so a name that pandoc wrapped in its own <mrow>
// has to hand the operator up to the enclosing row, otherwise it lands at the end of a row and
// does nothing (that is exactly the "no space after ln" case).
const FUNCTION_NAME = /^[A-Za-z]{2,}$/;
const NOT_A_FUNCTION = new Set(["mod", "bmod", "pmod"]);
const LIMIT_BASE = new Set(["munder", "mover", "munderover"]);
const ROW_LIKE = new Set(["mrow", "mstyle", "maction", "mtd", "mphantom", "mpadded"]);
const APPLY_FUNCTION = "<mo>&#x2061;</mo>";

const TAGS = /<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

function parseMathML(xml) {
  const root = { name: "#root", attrs: "", children: [] };
  const stack = [root];
  let pos = 0;
  let m;
  TAGS.lastIndex = 0;
  while ((m = TAGS.exec(xml))) {
    if (m.index > pos) stack[stack.length - 1].children.push({ text: xml.slice(pos, m.index) });
    pos = TAGS.lastIndex;
    const [, closing, name, attrs] = m;
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const node = { name, attrs, children: [], empty: m[0].endsWith("/>") };
    stack[stack.length - 1].children.push(node);
    if (!node.empty) stack.push(node);
  }
  if (pos < xml.length) stack[stack.length - 1].children.push({ text: xml.slice(pos) });
  return root;
}

const serialize = (node) =>
  node.text !== undefined ? node.text
    : node.empty ? `<${node.name}${node.attrs}/>`
    : `<${node.name}${node.attrs}>${node.children.map(serialize).join("")}</${node.name}>`;

const functionName = (node) => {
  if (!node || node.name !== "mo" || node.children.length !== 1) return null;
  const text = node.children[0].text?.trim();
  return text && FUNCTION_NAME.test(text) && !NOT_A_FUNCTION.has(text) ? text : null;
};

// Returns the serialized element plus `pending`: a function application that is still owed at the
// end of this element and has to be emitted by the enclosing row.
function rewrite(node) {
  if (node.text !== undefined) return { xml: node.text, pending: false };
  if (node.empty) return { xml: serialize(node), pending: false };

  const out = [];
  let pending = false;
  const firstElement = (node.children.find((c) => !c.text) ?? {});
  for (const child of node.children) {
    if (child.text !== undefined) { out.push(child.text); continue; }

    const name = functionName(child);
    if (name && LIMIT_BASE.has(node.name) && child === firstElement) {
      // keep the operator (it needs limits under/over it), zero its right space, apply after
      out.push(`<mo${child.attrs.replace(/\srspace="[^"]*"/, "")} rspace="0">${child.children[0].text.trim()}</mo>`);
      pending = true;
      continue;
    }
    if (name) {
      out.push(`<mi>${name}</mi>`);
      const more = node.children.slice(node.children.indexOf(child) + 1).some((c) => !c.text);
      if (more && ROW_LIKE.has(node.name)) out.push(APPLY_FUNCTION);
      else pending = true;
      continue;
    }

    const sub = rewrite(child);
    out.push(sub.xml);
    if (sub.pending) {
      if (ROW_LIKE.has(node.name)) out.push(APPLY_FUNCTION);
      else pending = true;
    }
  }

  if (node.name === "#root") return { xml: out.join(""), pending: false };
  return { xml: `<${node.name}${node.attrs}>${out.join("")}</${node.name}>`, pending };
}

function normalizeFunctionNames(mathml) {
  return rewrite(parseMathML(mathml)).xml;
}

function renderOne(mathml) {
  mathml = normalizeFunctionNames(mathml);
  const hash = crypto.createHash("sha256").update(fontId).update(mathml).digest("hex").slice(0, 16);
  if (!svgByHash.has(hash)) {
    const r = renderer.render(mathml, false);
    const alt = (r.svg.match(/<title>([\s\S]*?)<\/title>/) || [, ""])[1];
    const svg = r.svg;
    const box = {
      height: num(r.height / upm),
      width: num(r.width / upm),
      depth: num((r.height - r.baseline) / upm),
      alt: escapeAttr(alt),
    };
    r.free();
    fs.writeFileSync(path.join(mathDir, `${hash}.svg`), svg);
    svgBytes += svg.length;
    svgByHash.set(hash, box);
  }
  return { hash, ...svgByHash.get(hash) };
}

const pages = htmlFiles(bookDir).filter((p) => !p.startsWith(mathDir));
let written = 0;

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  if (!html.includes("<math")) continue;
  const rel = path.relative(path.dirname(page), mathDir).split(path.sep).join("/");
  let changed = false;

  const out = html.replace(MATH_RE, (mathml) => {
    occurrences++;
    let box;
    try {
      box = renderOne(mathml);
    } catch (err) {
      failures++;
      console.error(`FAIL ${path.relative(bookDir, page)}: ${err && err.message ? err.message : err}`);
      console.error(`  ${mathml.replace(/\s+/g, " ").slice(0, 200)}`);
      return mathml;
    }
    changed = true;
    const src = `${rel}/${box.hash}.svg`;
    // Inline math sits on the text baseline; display math is a centred block. The SVG keeps its
    // intrinsic aspect ratio, so width/height scale together when the column is narrow.
    const style = DISPLAY_RE.test(mathml)
      ? `display:block;margin:0.7em auto;width:${box.width}em;max-width:100%;height:auto`
      : `height:${box.height}em;width:auto;vertical-align:-${box.depth}em`;
    // No loading="lazy": the equations are inline content, so a late load would shift the text.
    return `<img class="formel-math" src="${src}" alt="${box.alt}" style="${style}" decoding="async">`;
  });

  if (changed) {
    fs.writeFileSync(page, out);
    written++;
  }
}

renderer.free();

const summary = {
  pages: written,
  occurrences,
  uniqueSvg: svgByHash.size,
  svgMB: +(svgBytes / 1048576).toFixed(2),
  failures,
};
console.log(`formel: ${summary.occurrences} equations on ${summary.pages} pages, ` +
  `${summary.uniqueSvg} unique SVGs (${summary.svgMB} MB), ${summary.failures} failures`);
if (failures) process.exit(1);
