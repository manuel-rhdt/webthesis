/**
 * DOM-based equation reference replacement using Cheerio
 * Converts eq: references to equation numbers
 */

const cheerio = require('cheerio');
const ReferenceProcessorBase = require('./reference-processor-base');

class EquationReplacer extends ReferenceProcessorBase {
  constructor(manifest, equationMapping) {
    super(manifest, {});
    this.equationMapping = equationMapping;
  }

  /**
   * Replace equation references in content
   * @param {string} content - HTML content to process
   * @param {string} currentChapterId - ID of the chapter being processed
   * @returns {string} Modified HTML content
   */
  replace(content, currentChapterId) {
    const $ = cheerio.load(content);

    // Find all anchor links pointing to equations
    $('a[href^="#eq:"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const eqId = href.substring(1); // Remove leading #
      const linkText = $link.text();

      const newText = this.calculateEquationText(eqId, linkText, currentChapterId);
      if (newText && newText !== linkText) {
        $link.text(newText);
      }
    });

    return $.html();
  }

  /**
   * Calculate text for equation references
   * @private
   */
  calculateEquationText(eqId, linkText, currentChapterId) {
    const eqInfo = this.findEquationInfo(eqId, currentChapterId);

    if (!eqInfo) {
      return null;
    }

    // Determine if cross-chapter
    const isCrossChapter = eqInfo.chapterId !== currentChapterId;

    // Check if link text is an equation reference pattern
    // Handle: "eq:id", "[eq:id]", etc.
    if (linkText === eqId ||                  // "eq:id"
        linkText === `[${eqId}]`) {           // "[eq:id]"
      // Preserve brackets if they were in the original source
      const hasSourceBrackets = linkText.startsWith('[') && linkText.endsWith(']');

      if (isCrossChapter) {
        const text = `Eq. ${eqInfo.equationNumber} (Ch. ${eqInfo.chapterNumber})`;
        return hasSourceBrackets ? `[${text}]` : text;
      } else {
        const text = `Eq. ${eqInfo.equationNumber}`;
        return hasSourceBrackets ? `[${text}]` : text;
      }
    }

    // Otherwise, just return the equation number with context if cross-chapter
    if (isCrossChapter) {
      return `Eq. ${eqInfo.equationNumber} (Ch. ${eqInfo.chapterNumber})`;
    } else {
      return `Eq. ${eqInfo.equationNumber}`;
    }
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

module.exports = EquationReplacer;
