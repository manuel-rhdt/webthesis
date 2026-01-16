/**
 * DOM-based equation reference replacement using Cheerio
 * Converts eq: references to sequential equation numbers
 * Numbers equations in the order they appear (matching EquationNumberInjector)
 */

const cheerio = require('cheerio');
const ReferenceProcessorBase = require('./reference-processor-base');

class EquationReplacer extends ReferenceProcessorBase {
  constructor(manifest, chapterInfo) {
    super(manifest, {});
    this.chapterInfo = chapterInfo; // { [chapterId]: { number } }
  }

  /**
   * Replace equation references in content
   * First pass: build a map of equation IDs to their sequential numbers
   * Second pass: replace references with those numbers
   * @param {string} content - HTML content to process
   * @param {string} currentChapterId - ID of the chapter being processed
   * @returns {string} Modified HTML content
   */
  replace(content, currentChapterId) {
    const $ = cheerio.load(content);
    const chapter = this.chapterInfo[currentChapterId];

    if (!chapter) {
      return content; // No chapter info, return unchanged
    }

    // Build equation ID to number mapping based on sequential order
    const equationMap = this.buildEquationMap($, currentChapterId);

    // Find all anchor links pointing to equations and replace text
    $('a[href^="#eq:"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const eqId = href.substring(1); // Remove leading # (e.g., "eq:concentration_dynamics")
      const linkText = $link.text();

      const equationNumber = equationMap[eqId];
      if (equationNumber) {
        const newText = this.calculateEquationText(equationNumber, linkText);
        if (newText && newText !== linkText) {
          $link.text(newText);
        }
      }
    });

    return $.html();
  }

  /**
   * Build a map of equation IDs to their sequential numbers
   * by scanning all display math elements in order
   * @private
   */
  buildEquationMap($, currentChapterId) {
    const map = {};
    const chapter = this.chapterInfo[currentChapterId];
    const chapterNumber = chapter.number;
    let counter = 0;

    // Find all display math elements in order
    $('math[display="block"]').each((index, element) => {
      counter++;
      const $mathElement = $(element);

      // Check if the math element or its parent (or grandparent) has an id="eq:*"
      // After equation number injection, structure is:
      // <div id="eq:..."><div class="equation-display"><div class="equation-content"><math>...</math></div>...</div></div>
      let eqId = $mathElement.attr('id') ||
                 $mathElement.parent().attr('id') ||
                 $mathElement.parent().parent().attr('id') ||
                 $mathElement.parent().parent().parent().attr('id');

      if (eqId && eqId.startsWith('eq:')) {
        // Map the equation ID to its number
        map[eqId] = `${chapterNumber}.${counter}`;
      }
    });

    return map;
  }

  /**
   * Calculate text for equation references
   * @private
   */
  calculateEquationText(equationNumber, linkText) {
    // Check if link text is an equation reference pattern
    // Handle: "eq:id", "[eq:id]", etc.
    const isPlainRef = linkText.match(/^\[?eq:[^\]]*\]?$/);

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
