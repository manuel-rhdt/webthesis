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
const FUNCTION_NAME = /^[A-Za-z]{2,}$/;
const NOT_A_FUNCTION = new Set(["mod", "bmod", "pmod"]);
const LIMIT_BASE = new Set(["munder", "mover", "munderover"]);
const APPLY_FUNCTION = "<mo>&#x2061;</mo>";

function normalizeFunctionNames(mathml) {
  const tag = /<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const out = [];
  const stack = []; // open elements: { name, children, applyAfter }
  let pos = 0;
  let m;

  const firstChild = () => stack.length === 0 || stack[stack.length - 1].children === 0;

  while ((m = tag.exec(mathml))) {
    out.push(mathml.slice(pos, m.index));
    pos = tag.lastIndex;
    const [, closing, name] = m;

    if (closing) {
      const frame = stack.pop();
      out.push(m[0]);
      if (frame?.applyAfter) out.push(APPLY_FUNCTION);
      continue;
    }

    // <mo>name</mo> with an all-letter body: a function name as pandoc writes it.
    const body = /^([^<]*)<\/mo>/.exec(mathml.slice(pos));
    if (name === "mo" && body && FUNCTION_NAME.test(body[1].trim()) && !NOT_A_FUNCTION.has(body[1].trim())) {
      const text = body[1].trim();
      pos += body[0].length;
      tag.lastIndex = pos; // the </mo> was consumed by hand
      const parent = stack[stack.length - 1];
      if (firstChild() && parent && LIMIT_BASE.has(parent.name)) {
        // keep the operator (it needs limits under/over it), zero its right space, apply after
        const attrs = m[3].replace(/\srspace="[^"]*"/, "");
        out.push(`<mo${attrs} rspace="0">${text}</mo>`);
        parent.children++;
        parent.applyAfter = true;
      } else {
        out.push(`<mi>${text}</mi>`, APPLY_FUNCTION);
        if (parent) parent.children++;
      }
      continue;
    }

    out.push(m[0]);
    if (stack.length) stack[stack.length - 1].children++;
    if (!m[0].endsWith("/>")) stack.push({ name, children: 0, applyAfter: false });
  }
  out.push(mathml.slice(pos));
  return out.join("");
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
