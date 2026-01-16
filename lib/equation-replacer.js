/**
 * DOM-based equation reference replacement using Cheerio
 * Converts eq: references to sequential equation numbers
 * Numbers equations in the order they appear (matching EquationNumberInjector)
 */

const cheerio = require('cheerio');
const ReferenceProcessorBase = require('./reference-processor-base');

class EquationReplacer extends ReferenceProcessorBase {
  constructor(manifest, equationMapping) {
    super(manifest, {});
    this.equationMapping = equationMapping; // Full cross-chapter equation mapping
  }

  /**
   * Replace equation references in content
   * Uses the pre-built equation mapping to replace references with numbers
   * @param {string} content - HTML content to process
   * @param {string} currentChapterId - ID of the chapter being processed
   * @returns {string} Modified HTML content
   */
  replace(content, currentChapterId) {
    const $ = cheerio.load(content);

    // Find all anchor links pointing to equations and replace text
    $('a[href^="#eq:"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const eqId = href.substring(1); // Remove leading # (e.g., "eq:concentration_dynamics")
      const linkText = $link.text();

      // Look up the equation in the full mapping (includes all chapters)
      const eqInfo = this.findEquationInfo(eqId);
      if (eqInfo) {
        const newText = this.calculateEquationText(eqInfo, linkText);
        if (newText && newText !== linkText) {
          $link.text(newText);
        }
      }
    });

    return $.html();
  }

  /**
   * Find equation info from the full cross-chapter mapping
   * Searches across all chapters to find the equation
   * @private
   */
  findEquationInfo(eqId) {
    // Search all chapters to find the equation
    for (const chapterId in this.equationMapping) {
      if (this.equationMapping[chapterId][eqId]) {
        return this.equationMapping[chapterId][eqId];
      }
    }

    return null;
  }

  /**
   * Calculate text for equation references using equation info
   * @private
   */
  calculateEquationText(eqInfo, linkText) {
    if (!eqInfo) return null;

    // Check if link text is an equation reference pattern
    // Handle: "eq:id", "[eq:id]", etc.
    const isPlainRef = linkText.match(/^\[?eq:[^\]]*\]?$/);

    const equationNumber = eqInfo.equationNumber;

    if (isPlainRef) {
      // Preserve brackets if they were in the original source
      const hasSourceBrackets = linkText.startsWith('[') && linkText.endsWith(']');
      const text = `Eq. ${equationNumber}`;
      return hasSourceBrackets ? `[${text}]` : text;
    }

    // Otherwise, just return the equation number
    return `Eq. ${equationNumber}`;
  }
}

module.exports = EquationReplacer;
