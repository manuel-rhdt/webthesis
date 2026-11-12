#!/usr/bin/env node
// Post-process the rendered Quarto book: replace every MathML <math> element with an
// SVG rendered by formel, stored once per unique equation under <book>/math/.
//
// Usage: node scripts/formel-math.mjs <book-dir> <formel-dir>
//
// <formel-dir> must contain pkg/formel_wasm.js, pkg/formel_wasm_bg.wasm and a font with a
// MATH table (fonts/newcomputermodern-math.otf). The CI workflow downloads those and checks
// them against .github/formel-checksums.txt.
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
const fontFile = path.join(formelDir, "fonts", "newcomputermodern-math.otf");
const mathDir = path.join(bookDir, "math");

const { initSync, MathRenderer } = await import(pathToFileURL(path.join(pkgDir, "formel_wasm.js")));
initSync({ module: new WebAssembly.Module(fs.readFileSync(path.join(pkgDir, "formel_wasm_bg.wasm"))) });
const renderer = new MathRenderer(new Uint8Array(fs.readFileSync(fontFile)));
const upm = renderer.units_per_em();

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

function renderOne(mathml) {
  const hash = crypto.createHash("sha256").update(mathml).digest("hex").slice(0, 16);
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
