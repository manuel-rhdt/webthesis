/**
 * Tests for ReferenceReplacer class
 * Tests DOM-based semantic reference conversion (Sec., Ch. patterns)
 */

const ReferenceReplacer = require('../lib/reference-replacer');
const {
  mockManifest,
  combinedHeaderMapping
} = require('./fixtures');

describe('ReferenceReplacer', () => {
  let replacer;

  beforeEach(() => {
    replacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);
  });

  test('replaces chapter reference with bare chapter ID', () => {
    const html = 'See <a href="#ch:dpws">dpws</a> for details.';
    const result = replacer.replace(html, 'variants');

    expect(result).toContain('See <a href="#ch:dpws">2</a>');
  });

  test('replaces chapter reference with "Chapter" prefix', () => {
    const html = 'See <a href="#ch:dpws">Chapter dpws</a> for details.';
    const result = replacer.replace(html, 'variants');

    expect(result).toContain('See <a href="#ch:dpws">Chapter 2</a>');
  });

  test('replaces section reference in same chapter', () => {
    const html = 'As mentioned in <a href="#sec:importance">Sec. sec:importance</a>.';
    const result = replacer.replace(html, 'dpws');

    expect(result).toContain('<a href="#sec:importance">Sec. 1.1</a>');
  });

  test('replaces section reference in different chapter with context', () => {
    const html = 'See <a href="#sec:importance">Sec. sec:importance</a> elsewhere.';
    const result = replacer.replace(html, 'variants');

    expect(result).toContain('Sec. 1.1 (Path Weight Sampling)');
  });

  test('skips footnote references', () => {
    const html = 'Some text<a href="#fn:1">1</a> with footnote.';
    const result = replacer.replace(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('skips bibliography references', () => {
    const html = 'Some citation<a href="#ref-smith2020">Smith 2020</a>.';
    const result = replacer.replace(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('skips equation references', () => {
    const html = 'See <a href="#eq:1">equation 1</a>.';
    const result = replacer.replace(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('skips figure references', () => {
    const html = 'See <a href="#fig:1">figure 1</a>.';
    const result = replacer.replace(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('skips TOC links', () => {
    const html = '<a href="#sec:importance" id="toc-1">1. The Importance of Sampling</a>';
    const result = replacer.replace(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('preserves link attributes during replacement', () => {
    const html = 'See <a href="#sec:importance" class="internal-link">Sec. sec:importance</a>.';
    const result = replacer.replace(html, 'dpws');

    expect(result).toContain('class="internal-link"');
    expect(result).toContain('<a href="#sec:importance" class="internal-link">Sec. 1.1</a>');
  });

  test('handles multiple references in same content', () => {
    const html = `
      See <a href="#sec:importance">Sec. sec:importance</a> and
      <a href="#sec:algorithm">Sec. sec:algorithm</a>.
    `;
    const result = replacer.replace(html, 'dpws');

    expect(result).toContain('Sec. 1.1');
    expect(result).toContain('Sec. 1.2');
  });

  test('handles case-insensitive chapter ID matching', () => {
    const html = 'See <a href="#ch:dpws">DPWS</a> for details.';
    const result = replacer.replace(html, 'variants');

    expect(result).toContain('<a href="#ch:dpws">2</a>');
  });

  test('leaves unknown references unchanged', () => {
    const html = 'See <a href="#unknown-id">some link</a>.';
    const result = replacer.replace(html, 'dpws');

    expect(result).toBe(html); // Should be unchanged
  });

  test('handles chapter references with refId field', () => {
    // mlpws has refId: "ml-pws"
    const html = 'See <a href="#ch:ml-pws">Chapter ml-pws</a>.';
    const result = replacer.replace(html, 'variants');

    expect(result).toContain('<a href="#ch:ml-pws">Chapter 6</a>');
  });

  test('converts bare chapter reference correctly', () => {
    const html = '<a href="#ch:dpws">dpws</a>';
    const result = replacer.replace(html, 'variants');

    // Bare chapter ID should be replaced with just number
    expect(result).toBe('<a href="#ch:dpws">2</a>');
  });

  test('replaces only chapter ID part in link text', () => {
    // When link text is "Chapter lna_vs_pws", only replace "lna_vs_pws" with "5"
    const html = '<a href="#ch:lna_vs_pws">Chapter lna_vs_pws</a>';
    const result = replacer.replace(html, 'introduction');

    // Should preserve "Chapter" and only replace the ID
    expect(result).toContain('Chapter 5');
    expect(result).not.toContain('Ch. 5');
  });

  test('handles chapter ID in various text contexts', () => {
    // Test with different surrounding text
    const html1 = '<a href="#ch:dpws">See Chapter dpws</a>';
    const result1 = replacer.replace(html1, 'introduction');
    expect(result1).toContain('See Chapter 2');

    const html2 = '<a href="#ch:dpws">Refer to dpws</a>';
    const result2 = replacer.replace(html2, 'introduction');
    expect(result2).toContain('Refer to 2');
  });
});
