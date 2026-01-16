/**
 * DOM-based equation extraction and numbering
 * Extracts equations with IDs and assigns chapter-specific equation numbers
 */

const cheerio = require('cheerio');

class EquationMapper {
  constructor() {
    this.equationMapping = {};
  }

  /**
   * Build equation mapping from chapters
   * @param {Array} chapters - Array of chapter objects with id, number
   * @param {Object} htmlMap - Object mapping chapter IDs to HTML content
   * @returns {Object} Equation mapping structure
   */
  buildMapping(chapters, htmlMap) {
    this.equationMapping = {};

    chapters.forEach((chapter) => {
      if (!htmlMap[chapter.id]) return;

      const html = htmlMap[chapter.id];
      this.mapChapterEquations(chapter, html);
    });

    return this.equationMapping;
  }

  /**
   * Map equations in a single chapter
   * @private
   */
  mapChapterEquations(chapter, html) {
    const $ = cheerio.load(html);
    this.equationMapping[chapter.id] = {};

    let equationCounter = 0;

    // Find all elements with id="eq:*" (can be div, math, or any element)
    $('[id^="eq:"]').each((index, element) => {
      const $eqElement = $(element);
      const eqId = $eqElement.attr('id');

      if (!eqId) return; // Skip if no ID

      equationCounter++;

      // Format equation number with chapter prefix
      // Chapter numbers can be strings (like "A" for appendix) or integers
      const chapterNum = chapter.number;
      const equationNumber = `${chapterNum}.${equationCounter}`;

      const equationInfo = {
        id: eqId,
        equationNumber: equationNumber,
        chapterId: chapter.id,
        chapterNumber: chapterNum
      };

      this.equationMapping[chapter.id][eqId] = equationInfo;
    });
  }

  /**
   * Get the full mapping
   */
  getMapping() {
    return this.equationMapping;
  }
}

module.exports = EquationMapper;
