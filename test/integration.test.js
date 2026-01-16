/**
 * Integration tests for DOM-based implementations
 * Tests the complete pipeline: HeaderMapper → ReferenceReplacer → CrossReferenceFixer
 */

const HeaderMapper = require('../lib/header-mapper');
const ReferenceReplacer = require('../lib/reference-replacer');
const CrossReferenceFixer = require('../lib/cross-reference-fixer');
const {
  mockManifest,
  sampleChapterDpws,
  sampleChapterVariants,
  combinedHeaderMapping
} = require('./fixtures');

describe('Integration: DOM vs Regex implementations', () => {
  let headerMapper;
  let referenceReplacer;
  let crossReferenceFixer;

  beforeEach(() => {
    headerMapper = new HeaderMapper();
  });

  describe('HeaderMapper', () => {
    test('DOM implementation matches expected output for single chapter', () => {
      const mapping = headerMapper.buildMapping(
        [{ id: 'dpws', title: 'Path Weight Sampling' }],
        { dpws: sampleChapterDpws }
      );

      // Verify main IDs are mapped
      expect(mapping.dpws['ch:dpws']).toBeDefined();
      expect(mapping.dpws['sec:importance']).toBeDefined();
      expect(mapping.dpws['sec:algorithm']).toBeDefined();

      // Verify section numbers are correct
      expect(mapping.dpws['ch:dpws'].sectionNumber).toBe('1');
      expect(mapping.dpws['sec:importance'].sectionNumber).toBe('1.1');
      expect(mapping.dpws['sec:basic-approach'].sectionNumber).toBe('1.1.1');
      expect(mapping.dpws['sec:algorithm'].sectionNumber).toBe('1.2');
      expect(mapping.dpws['sec:implementation'].sectionNumber).toBe('1.2.1');
    });

    test('DOM implementation handles multiple chapters correctly', () => {
      const mapping = headerMapper.buildMapping(
        [
          { id: 'dpws', title: 'Path Weight Sampling' },
          { id: 'variants', title: 'More Efficient Variants of PWS' }
        ],
        {
          dpws: sampleChapterDpws,
          variants: sampleChapterVariants
        }
      );

      // Both chapters should have independent numbering
      expect(mapping.dpws['ch:dpws'].sectionNumber).toBe('1');
      expect(mapping.variants['ch:variants'].sectionNumber).toBe('1');

      // Verify specific sections exist
      expect(mapping.dpws['sec:importance'].sectionNumber).toBe('1.1');
      expect(mapping.variants['sec:faster-method'].sectionNumber).toBe('1.1');
    });

    test('DOM-based mapping produces expected core structure', () => {
      const mapping = headerMapper.buildMapping(
        [{ id: 'dpws', title: 'Path Weight Sampling' }],
        { dpws: sampleChapterDpws }
      );

      // Verify the core ID mappings exist and have correct values
      expect(mapping.dpws['ch:dpws']).toEqual(expect.objectContaining({
        text: 'Path Weight Sampling',
        level: 2,
        sectionNumber: '1'
      }));

      expect(mapping.dpws['sec:importance']).toEqual(expect.objectContaining({
        text: 'The Importance of Sampling',
        level: 3,
        sectionNumber: '1.1'
      }));
    });
  });

  describe('ReferenceReplacer', () => {
    test('DOM implementation correctly replaces chapter references', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      const html = 'See <a href="#ch:dpws">Chapter dpws</a> for details.';
      const result = referenceReplacer.replace(html, 'variants');

      // "Chapter dpws" → "Chapter 2" (only the ID part is replaced)
      expect(result).toContain('See <a href="#ch:dpws">Chapter 2</a>');
    });

    test('DOM implementation correctly replaces section references within chapter', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      const html = 'As mentioned in <a href="#sec:importance">Sec. sec:importance</a>.';
      const result = referenceReplacer.replace(html, 'dpws');

      expect(result).toContain('Sec. 1.1');
    });

    test('DOM implementation handles cross-chapter section references', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      const html = 'See <a href="#sec:importance">Section</a>.';
      const result = referenceReplacer.replace(html, 'variants');

      expect(result).toContain('Sec. 1.1 (Path Weight Sampling)');
    });

    test('DOM implementation skips special references', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      const html = 'Some text<a href="#fn:1">1</a> and <a href="#ref-smith">Smith</a>.';
      const result = referenceReplacer.replace(html, 'dpws');

      // Should be unchanged
      expect(result).toContain('href="#fn:1"');
      expect(result).toContain('href="#ref-smith"');
    });

    test('DOM implementation preserves link attributes', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      const html = 'See <a href="#ch:dpws" class="internal" data-ref="1">Chapter dpws</a>.';
      const result = referenceReplacer.replace(html, 'variants');

      expect(result).toContain('class="internal"');
      expect(result).toContain('data-ref="1"');
      // "Chapter dpws" → "Chapter 2" (only the ID part is replaced)
      expect(result).toContain('Chapter 2');
    });

    test('DOM implementation handles multiple references', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      const html = `
        <a href="#sec:importance">Sec. importance</a> and
        <a href="#sec:algorithm">Sec. algorithm</a>
      `;
      const result = referenceReplacer.replace(html, 'dpws');

      expect(result).toContain('Sec. 1.1');
      expect(result).toContain('Sec. 1.2');
    });

    test('DOM implementation replaces only chapter ID part in link text', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      // When link text is "Chapter lna_vs_pws", only replace "lna_vs_pws" with "5"
      const html = '<a href="#ch:lna_vs_pws">Chapter lna_vs_pws</a>';
      const result = referenceReplacer.replace(html, 'introduction');

      // Should preserve "Chapter" and only replace the ID
      expect(result).toContain('Chapter 5');
      expect(result).not.toContain('Ch. 5');
    });

    test('DOM implementation handles chapter ID in various text contexts', () => {
      referenceReplacer = new ReferenceReplacer(mockManifest, combinedHeaderMapping);

      // Test with different surrounding text
      const html1 = '<a href="#ch:dpws">See Chapter dpws</a>';
      const result1 = referenceReplacer.replace(html1, 'introduction');
      expect(result1).toContain('See Chapter 2');

      const html2 = '<a href="#ch:dpws">Refer to dpws</a>';
      const result2 = referenceReplacer.replace(html2, 'introduction');
      expect(result2).toContain('Refer to 2');
    });
  });

  describe('CrossReferenceFixer', () => {
    test('DOM implementation fixes same-chapter references', () => {
      crossReferenceFixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);

      const html = '<a href="#sec:importance">Importance</a>';
      const result = crossReferenceFixer.fix(html, 'dpws');

      // Should keep href as-is for same-chapter
      expect(result).toContain('href="#sec:importance"');
      expect(result).not.toContain('.html');
      // Text should be unchanged - fixCrossReferences doesn't modify text
      expect(result).toContain('Importance');
    });

    test('DOM implementation fixes cross-chapter references', () => {
      crossReferenceFixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);

      const html = '<a href="#sec:importance">Importance</a>';
      const result = crossReferenceFixer.fix(html, 'variants');

      // Should fix href to include chapter file
      expect(result).toContain('href="dpws.html#sec:importance"');
      // Text should be unchanged - fixCrossReferences doesn't modify text
      expect(result).toContain('Importance');
    });

    test('DOM implementation fixes chapter references', () => {
      crossReferenceFixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);

      const html = '<a href="#ch:dpws">Path Weight Sampling</a>';
      const result = crossReferenceFixer.fix(html, 'variants');

      expect(result).toContain('href="dpws.html#ch:dpws"');
    });

    test('DOM implementation keeps same-chapter chapter reference local', () => {
      crossReferenceFixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);

      const html = '<a href="#ch:dpws">Path Weight Sampling</a>';
      const result = crossReferenceFixer.fix(html, 'dpws');

      expect(result).toContain('href="#ch:dpws"');
      expect(result).not.toContain('.html');
    });

    test('DOM implementation skips special references', () => {
      crossReferenceFixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);

      const html = '<a href="#fn:1">1</a> <a href="#ref-smith">Smith</a>';
      const result = crossReferenceFixer.fix(html, 'dpws');

      expect(result).toContain('href="#fn:1"');
      expect(result).toContain('href="#ref-smith"');
    });

    test('DOM implementation preserves attributes on links', () => {
      crossReferenceFixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);

      const html = '<a href="#sec:importance" class="link-style" data-id="1">Importance</a>';
      const result = crossReferenceFixer.fix(html, 'dpws');

      // Attributes should be preserved
      expect(result).toContain('class="link-style"');
      expect(result).toContain('data-id="1"');
      // Text should be unchanged
      expect(result).toContain('Importance');
    });

    test('DOM implementation handles multiple references in one pass', () => {
      crossReferenceFixer = new CrossReferenceFixer(mockManifest, combinedHeaderMapping);

      const html = `
        <a href="#ch:dpws">Chapter 1</a> and
        <a href="#ch:variants">Chapter 2</a>
      `;
      const result = crossReferenceFixer.fix(html, 'lna_vs_pws');

      expect(result).toContain('href="dpws.html#ch:dpws"');
      expect(result).toContain('href="variants.html#ch:variants"');
    });
  });

  describe('Combined pipeline', () => {
    test('All three functions work together correctly', () => {
      const mapper = new HeaderMapper();
      const mapping = mapper.buildMapping(
        [
          { id: 'dpws', title: 'Path Weight Sampling' },
          { id: 'variants', title: 'More Efficient Variants of PWS' }
        ],
        {
          dpws: sampleChapterDpws,
          variants: sampleChapterVariants
        }
      );

      const replacer = new ReferenceReplacer(mockManifest, mapping);
      const fixer = new CrossReferenceFixer(mockManifest, mapping);

      let html = `
        <p>See <a href="#sec:importance">Sec. importance</a> and
        <a href="#ch:dpws">Chapter dpws</a>.</p>
      `;

      // First replace text references
      html = replacer.replace(html, 'variants');
      expect(html).toContain('Sec. 1.1 (Path Weight Sampling)');
      // "Chapter dpws" becomes "Chapter 2" (only ID is replaced)
      expect(html).toContain('Chapter 2');

      // Then fix cross references (fixes hrefs only, doesn't modify text)
      html = fixer.fix(html, 'variants');
      expect(html).toContain('href="dpws.html#sec:importance"');
      expect(html).toContain('href="dpws.html#ch:dpws"');
      // Text from replaceTextReferences should be intact
      expect(html).toContain('Sec. 1.1 (Path Weight Sampling)');
      expect(html).toContain('Chapter 2');
    });
  });
});
