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

// pandoc marks a function with U+2061 FUNCTION APPLICATION inside the row that holds the name:
// `<mrow><mi mathvariant="normal">ln</mi><mo>&#8289;</mo></mrow>`. formel now carries the space
// across the row boundary by itself, so the only thing left to decide is the amount: the printed
// thesis sets 5/18em after the operator (TeX's table says 3/18em), nothing before an opening
// fence, and nothing at all when the operator ends the expression.
const FUNCTION_SPACE = "0.2778em";
const FENCES = new Set(["(", "[", "{", "\u27e8", "|", "\u2016", "\u2308", "\u230a", "\u27e6"]);
const WRAPPERS = new Set(["mrow", "mstyle", "mpadded", "mphantom", "semantics", "maction", "mtd"]);
// Nothing inside a fraction or a script follows its first child, so the search for the argument
// has to leave those constructs instead of walking into the denominator or the exponent.
const SCRIPT_LIKE = new Set(["msub", "msup", "msubsup", "munder", "mover", "munderover", "mfrac", "mroot"]);

const decode = (text) =>
  text.trim()
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(+dec));

const isApplyNode = (node) =>
  node.name === "mo" && !node.children.some((c) => c.text === undefined) &&
  decode(node.children.map((c) => c.text).join("")) === "\u2061";

function startsWithFence(node) {
  if (!node) return false;
  if (node.name === "mo") return FENCES.has(decode(node.children.map((c) => c.text ?? "").join("")));
  if (!WRAPPERS.has(node.name)) return false;
  return startsWithFence(node.children.find((c) => c.text === undefined));
}

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
    : node.drop ? ""
    : node.name === "#root" ? node.children.map(serialize).join("")
    : node.empty ? `<${node.name}${node.attrs}/>`
    : `<${node.name}${node.attrs}>${node.children.map(serialize).join("")}</${node.name}>`;

function normalizeFunctionSpacing(mathml) {
  const root = parseMathML(mathml);
  const parent = new Map();
  const nodes = [];
  for (const node of [...root.children]) {
    if (node.text !== undefined) continue;
    nodes.push(node);
  }
  for (let i = 0; i < nodes.length; i++) {
    for (const child of nodes[i].children) {
      if (child.text !== undefined) continue;
      parent.set(child, nodes[i]);
      nodes.push(child);
    }
  }

  // The next element that will be laid out after `node`: past the end of its row, and past the
  // other children of a fraction or a script, which are not laid out after the base. `climbed`
  // says whether leaving the operator where it is would put the space inside a script or a
  // fraction, where it belongs to something else.
  const nextLaidOut = (node) => {
    let current = node;
    let climbed = false;
    for (;;) {
      const up = parent.get(current);
      if (!up || up.name === "#root") return { next: null, climbed };
      if (SCRIPT_LIKE.has(up.name)) climbed = true;
      else {
        const siblings = up.children.filter((c) => c.text === undefined);
        const i = siblings.indexOf(current);
        if (i >= 0 && i + 1 < siblings.length) return { next: siblings[i + 1], climbed };
      }
      current = up;
    }
  };

  // Move `node` in front of `before` in `before`'s parent, so its space is added where the argument
  // starts rather than inside a limit or a subscript.
  const moveBefore = (node, before) => {
    const from = parent.get(node);
    from.children.splice(from.children.indexOf(node), 1);
    const to = parent.get(before);
    to.children.splice(to.children.indexOf(before), 0, node);
    parent.set(node, to);
  };

  const setAttr = (node, name, value) => {
    const pattern = new RegExp(`\\s${name}="[^"]*"`);
    node.attrs = pattern.test(node.attrs)
      ? node.attrs.replace(pattern, ` ${name}="${value}"`)
      : `${node.attrs} ${name}="${value}"`;
  };

  for (const node of nodes) {
    if (!isApplyNode(node)) continue;
    const { next, climbed } = nextLaidOut(node);
    if (!next) { node.drop = true; continue; } // nothing to apply the function to
    if (climbed) moveBefore(node, next);
    setAttr(node, "rspace", startsWithFence(next) ? "0" : FUNCTION_SPACE);
  }

  return serialize(root);
}

function renderOne(mathml) {
  mathml = normalizeFunctionSpacing(mathml);
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
