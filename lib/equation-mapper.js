/**
 * DOM-based equation extraction and numbering
 * Maps ALL display equations (matching EquationNumberInjector)
 * Extracts equations with their IDs and assigns chapter-specific equation numbers
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
   * Numbers ALL display equations, matching EquationNumberInjector behavior
   * @private
   */
  mapChapterEquations(chapter, html) {
    const $ = cheerio.load(html);
    this.equationMapping[chapter.id] = {};

    let equationCounter = 0;
    const chapterNum = chapter.number;

    // Find all display math elements (matching EquationNumberInjector)
    $('math[display="block"]').each((index, element) => {
      equationCounter++;

      // Format equation number with chapter prefix
      const equationNumber = `${chapterNum}.${equationCounter}`;

      // Find the ID by checking element and parents (up to 3 levels)
      // Original structure: <div id="eq:..."><math display="block">...</math></div>
      const $mathElement = $(element);
      let eqId = $mathElement.attr('id') ||
                 $mathElement.parent().attr('id') ||
                 $mathElement.parent().parent().attr('id') ||
                 $mathElement.parent().parent().parent().attr('id');

      // If no ID found, skip this equation (no references to replace)
      if (!eqId) {
        return;
      }

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
