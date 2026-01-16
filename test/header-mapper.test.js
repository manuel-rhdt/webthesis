/**
 * Tests for HeaderMapper class
 * Tests DOM-based header extraction and hierarchical section numbering
 */

const HeaderMapper = require('../lib/header-mapper');
const {
  mockManifest,
  sampleChapterDpws,
  sampleChapterVariants
} = require('./fixtures');

describe('HeaderMapper', () => {
  let mapper;

  beforeEach(() => {
    mapper = new HeaderMapper();
  });

  test('extracts single h2 heading correctly', () => {
    const html = '<h2 id="ch:test">Test Heading</h2>';
    const mapping = mapper.buildMapping(
      [{ id: 'test', title: 'Test Chapter' }],
      { test: html }
    );

    expect(mapping.test['ch:test']).toBeDefined();
    expect(mapping.test['ch:test'].text).toBe('Test Heading');
    expect(mapping.test['ch:test'].level).toBe(2);
    expect(mapping.test['ch:test'].sectionNumber).toBe('1');
  });

  test('calculates hierarchical section numbers correctly', () => {
    const mapping = mapper.buildMapping(
      [{ id: 'dpws', title: 'Path Weight Sampling' }],
      { dpws: sampleChapterDpws }
    );

    expect(mapping.dpws['ch:dpws'].sectionNumber).toBe('1');
    expect(mapping.dpws['sec:importance'].sectionNumber).toBe('1.1');
    expect(mapping.dpws['sec:basic-approach'].sectionNumber).toBe('1.1.1');
    expect(mapping.dpws['sec:algorithm'].sectionNumber).toBe('1.2');
    expect(mapping.dpws['sec:implementation'].sectionNumber).toBe('1.2.1');
  });

  test('resets subsection counters when moving to new h2', () => {
    const mapping = mapper.buildMapping(
      [{ id: 'dpws', title: 'Path Weight Sampling' }],
      { dpws: sampleChapterDpws }
    );

    // h3 counter resets after each h2
    expect(mapping.dpws['sec:importance'].sectionNumber).toBe('1.1');
    expect(mapping.dpws['sec:algorithm'].sectionNumber).toBe('1.2');
  });

  test('skips headings without ID attributes', () => {
    const html = `
      <h2 id="ch:test">Test Heading</h2>
      <h3>No ID Heading</h3>
      <h3 id="sec:test2">Has ID Heading</h3>
    `;
    const mapping = mapper.buildMapping(
      [{ id: 'test', title: 'Test Chapter' }],
      { test: html }
    );

    expect(mapping.test['ch:test']).toBeDefined();
    expect(mapping.test['sec:test2']).toBeDefined();
    expect(Object.keys(mapping.test).length).toBe(2); // Only IDs: ch:test, sec:test2
  });

  test('handles multiple chapters independently', () => {
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

    // Both chapters should have their own mappings
    expect(mapping.dpws).toBeDefined();
    expect(mapping.variants).toBeDefined();

    // Section numbers should reset for each chapter
    expect(mapping.dpws['ch:dpws'].sectionNumber).toBe('1');
    expect(mapping.variants['ch:variants'].sectionNumber).toBe('1');
  });

  test('extracts heading text correctly', () => {
    const html = '<h2 id="ch:test">Actual Heading Text</h2>';
    const mapping = mapper.buildMapping(
      [{ id: 'test', title: 'Test Chapter' }],
      { test: html }
    );

    expect(mapping.test['ch:test'].text).toBe('Actual Heading Text');
  });

  test('handles h4 subsection numbering correctly', () => {
    const mapping = mapper.buildMapping(
      [{ id: 'dpws', title: 'Path Weight Sampling' }],
      { dpws: sampleChapterDpws }
    );

    // h4 under first h3 of first h2
    expect(mapping.dpws['sec:basic-approach'].sectionNumber).toBe('1.1.1');

    // h4 under second h3 of first h2 should reset h4 counter
    expect(mapping.dpws['sec:implementation'].sectionNumber).toBe('1.2.1');
  });

  test('stores chapter metadata in header info', () => {
    const mapping = mapper.buildMapping(
      [{ id: 'dpws', number: 2, title: 'Path Weight Sampling' }],
      { dpws: sampleChapterDpws }
    );

    const headerInfo = mapping.dpws['ch:dpws'];
    expect(headerInfo.chapterId).toBe('dpws');
    expect(headerInfo.chapterFile).toBe('dpws.html');
    expect(headerInfo.chapterTitle).toBe('Path Weight Sampling');
  });

  test('handles empty HTML map gracefully', () => {
    const mapping = mapper.buildMapping(
      [{ id: 'nonexistent', title: 'Missing Chapter' }],
      {}
    );

    expect(mapping.nonexistent).toBeUndefined();
  });
});
