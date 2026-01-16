/**
 * Tests for CrossReferenceFixer class
 * Tests DOM-based href fixing for cross-chapter references
 */

const CrossReferenceFixer = require('../lib/cross-reference-fixer');
const {
  mockManifest,
  combinedHeaderMapping
} = require('./fixtures');

describe('CrossReferenceFixer', () => {
  let fixer;

  beforeEach(() => {
    fixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);
  });

  test('keeps same-chapter reference local', () => {
    const html = '<a href="#sec:importance">Importance</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toContain('href="#sec:importance"');
    expect(result).not.toContain('.html');
  });

  test('fixes cross-chapter reference with file path', () => {
    const html = '<a href="#sec:importance">Importance</a>';
    const result = fixer.fix(html, 'variants');

    expect(result).toContain('href="dpws.html#sec:importance"');
  });

  test('fixes chapter reference to cross-chapter link', () => {
    const html = '<a href="#ch:dpws">Path Weight Sampling</a>';
    const result = fixer.fix(html, 'variants');

    expect(result).toContain('href="dpws.html#ch:dpws"');
  });

  test('keeps same-chapter chapter reference as anchor', () => {
    const html = '<a href="#ch:dpws">Path Weight Sampling</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toContain('href="#ch:dpws"');
    expect(result).not.toContain('.html');
  });

  test('skips footnote references', () => {
    const html = '<a href="#fn:1">1</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('skips bibliography references', () => {
    const html = '<a href="#ref-smith2020">Smith 2020</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('skips TOC references', () => {
    const html = '<a href="#toc-1">TOC Link</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('preserves link attributes during transformation', () => {
    const html = '<a href="#sec:importance" class="internal" data-ref="1">Importance</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toContain('class="internal"');
    expect(result).toContain('data-ref="1"');
    // Text should be unchanged - text enrichment is handled by ReferenceReplacer
    expect(result).toContain('Importance');
  });

  test('handles multiple references in same content', () => {
    const html = `
      See <a href="#sec:importance">Importance</a> and
      <a href="#sec:algorithm">Algorithm</a>.
    `;
    const result = fixer.fix(html, 'dpws');

    // Both should remain as same-chapter local anchors
    expect(result).toContain('href="#sec:importance"');
    expect(result).toContain('href="#sec:algorithm"');
    expect(result).not.toContain('.html');
  });

  test('handles chapter reference with refId field', () => {
    // mlpws has refId: "ml-pws"
    const html = '<a href="#ch:ml-pws">ML-PWS</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toContain('href="mlpws.html#ch:ml-pws"');
  });

  test('leaves unknown reference unchanged', () => {
    const html = '<a href="#unknown-id">Unknown</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('handles heading reference across chapters', () => {
    const html = '<a href="#sec:faster-method">Fast Method</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toContain('href="variants.html#sec:faster-method"');
    // Text should be unchanged - text enrichment is handled by ReferenceReplacer
    expect(result).toContain('Fast Method');
  });

  test('fixes multiple chapter references in one pass', () => {
    const html = `
      <a href="#ch:dpws">Chapter 1</a> and
      <a href="#ch:variants">Chapter 2</a>
    `;
    const result = fixer.fix(html, 'lna_vs_pws');

    expect(result).toContain('href="dpws.html#ch:dpws"');
    expect(result).toContain('href="variants.html#ch:variants"');
  });

  test('maintains href structure for relative cross-file paths', () => {
    const html = '<a href="#sec:importance">Section</a>';
    const result = fixer.fix(html, 'variants');

    // Should use relative path (dpws.html not /dpws.html or ../dpws.html)
    expect(result).toContain('href="dpws.html#sec:importance"');
    expect(result).not.toContain('/dpws.html');
  });

  test('preserves multiple attributes on link', () => {
    const html = '<a href="#sec:importance" title="Go to section" onclick="foo()">Text</a>';
    const result = fixer.fix(html, 'dpws');

    expect(result).toContain('title="Go to section"');
    expect(result).toContain('onclick="foo()"');
    // Text should be unchanged - text enrichment is handled by ReferenceReplacer
    expect(result).toContain('Text');
  });
});
