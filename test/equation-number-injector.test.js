/**
 * Tests for EquationNumberInjector class
 * Tests DOM-based equation number injection
 */

const EquationNumberInjector = require('../lib/equation-number-injector');

describe('EquationNumberInjector', () => {
  const mockEquationMapping = {
    'dpws': {
      'eq:mutual_information': {
        id: 'eq:mutual_information',
        equationNumber: '2.1',
        chapterId: 'dpws',
        chapterNumber: 2
      },
      'eq:marginal-entropy': {
        id: 'eq:marginal-entropy',
        equationNumber: '2.3',
        chapterId: 'dpws',
        chapterNumber: 2
      }
    },
    'chemotaxis': {
      'eq:concentration_dynamics': {
        id: 'eq:concentration_dynamics',
        equationNumber: '4.2',
        chapterId: 'chemotaxis',
        chapterNumber: 4
      }
    }
  };

  let injector;

  beforeEach(() => {
    injector = new EquationNumberInjector(mockEquationMapping);
  });

  test('injects equation number after equation element', () => {
    const html = '<div id="eq:mutual_information"><math>formula</math></div>';
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('<span class="equation-number" id="eqn:eq:mutual_information">2.1</span>');
  });

  test('injects correct equation number for chapter', () => {
    const html = '<div id="eq:concentration_dynamics"><math>formula</math></div>';
    const result = injector.inject(html, 'chemotaxis');

    expect(result).toContain('4.2');
  });

  test('handles multiple equations in same content', () => {
    const html = `
      <div id="eq:mutual_information"><math>formula1</math></div>
      <div id="eq:marginal-entropy"><math>formula2</math></div>
    `;
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('2.1');
    expect(result).toContain('2.3');
  });

  test('skips equations not in mapping', () => {
    const html = '<div id="eq:unknown"><math>formula</math></div>';
    const result = injector.inject(html, 'dpws');

    // Should not add any equation number span
    expect(result).not.toContain('equation-number');
  });

  test('finds equations from other chapters', () => {
    const html = '<div id="eq:concentration_dynamics"><math>formula</math></div>';
    const result = injector.inject(html, 'dpws');

    // Should find equation from chemotaxis chapter
    expect(result).toContain('4.2');
  });

  test('preserves equation element structure', () => {
    const html = '<div id="eq:mutual_information" class="math-block"><math>formula</math></div>';
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('class="math-block"');
    expect(result).toContain('id="eq:mutual_information"');
  });

  test('creates unique ID for equation number span', () => {
    const html = '<div id="eq:mutual_information"><math>formula</math></div>';
    const result = injector.inject(html, 'dpws');

    expect(result).toContain('id="eqn:eq:mutual_information"');
  });
});
