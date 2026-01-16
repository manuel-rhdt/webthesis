/**
 * DOM-based equation number injection
 * Adds equation numbers (e.g., "Eq. 4.2") to equation elements
 */

const cheerio = require('cheerio');

class EquationNumberInjector {
  constructor(equationMapping) {
    this.equationMapping = equationMapping;
  }

  /**
   * Inject equation numbers into equation elements
   * @param {string} content - HTML content to process
   * @param {string} currentChapterId - ID of the chapter being processed
   * @returns {string} Modified HTML content with equation numbers
   */
  inject(content, currentChapterId) {
    const $ = cheerio.load(content);

    // Find all equation elements with IDs
    $('[id^="eq:"]').each((index, element) => {
      const $eqElement = $(element);
      const eqId = $eqElement.attr('id');

      // Get equation info from mapping
      const eqInfo = this.findEquationInfo(eqId, currentChapterId);

      if (!eqInfo) {
        return; // Skip if not in mapping
      }

      // Create equation number label
      const label = this.createEquationLabel(eqInfo);

      // Add label after the equation element
      $eqElement.after(label);
    });

    return $.html();
  }

  /**
   * Create HTML for equation label
   * @private
   */
  createEquationLabel(eqInfo) {
    return `<span class="equation-number" id="eqn:${eqInfo.id}">${eqInfo.equationNumber}</span>`;
  }

  /**
   * Find equation information by ID, checking current chapter first
   * @private
   */
  findEquationInfo(eqId, currentChapterId) {
    // Check current chapter first
    if (this.equationMapping[currentChapterId] && this.equationMapping[currentChapterId][eqId]) {
      return this.equationMapping[currentChapterId][eqId];
    }

    // Search other chapters
    for (const chapterId in this.equationMapping) {
      if (chapterId === currentChapterId) continue;
      if (this.equationMapping[chapterId][eqId]) {
        return this.equationMapping[chapterId][eqId];
      }
    }

    return null;
  }
}

module.exports = EquationNumberInjector;
