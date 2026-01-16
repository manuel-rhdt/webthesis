/**
 * Tests for EquationNumberInjector class
 * Tests DOM-based equation number injection for all display equations
 */

const EquationNumberInjector = require('../lib/equation-number-injector');

describe('EquationNumberInjector', () => {
  const mockManifest = {
    chapters: [
      { id: 'dpws', number: 2, title: 'Path Weight Sampling' },
      { id: 'chemotaxis', number: 4, title: 'Application—Bacterial Chemotaxis' },
      { id: 'appendix', number: 'A', title: 'Appendix' }
    ]
  };

  const chapterInfo = {
    dpws: { number: 2 },
    chemotaxis: { number: 4 },
    appendix: { number: 'A' }
  };

  let injector;

  beforeEach(() => {
    injector = new EquationNumberInjector(mockManifest, chapterInfo);
  });

  test('injects equation numbers for all display math elements', () => {
    const html = '<math display="block"><mrow>E=mc^2</mrow></math>';
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('equation-display');
    expect(result).toContain('equation-number');
    expect(result).toContain('(2.1)');
  });

  test('numbers equations sequentially per chapter', () => {
    const html = `
      <math display="block"><mrow>x</mrow></math>
      <p>Some text</p>
      <math display="block"><mrow>y</mrow></math>
      <math display="block"><mrow>z</mrow></math>
    `;
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('(2.1)');
    expect(result).toContain('(2.2)');
    expect(result).toContain('(2.3)');
  });

  test('uses chapter number prefix in equation numbering', () => {
    const html = '<math display="block"><mrow>formula</mrow></math>';
    const result = injector.inject(html, 'chemotaxis');

    expect(result).toContain('(4.1)');
  });

  test('handles letter chapter numbers for appendix', () => {
    const html = '<math display="block"><mrow>formula</mrow></math>';
    const result = injector.inject(html, 'appendix');

    expect(result).toContain('(A.1)');
  });

  test('wraps equations in flexbox container for styling', () => {
    const html = '<math display="block"><mrow>x^2</mrow></math>';
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('class="equation-display"');
    expect(result).toContain('class="equation-content"');
    expect(result).toContain('class="equation-number"');
  });

  test('preserves display="block" attribute', () => {
    const html = '<math display="block"><mrow>formula</mrow></math>';
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('display="block"');
  });

  test('ignores inline math elements', () => {
    const html = '<math display="inline"><mrow>x</mrow></math>';
    const result = injector.inject(html, 'dpws');

    expect(result).not.toContain('equation-display');
  });

  test('returns unchanged content if chapter not found', () => {
    const html = '<math display="block"><mrow>formula</mrow></math>';
    const result = injector.inject(html, 'unknown-chapter');

    expect(result).toBe(html);
    expect(result).not.toContain('equation-display');
  });
});
