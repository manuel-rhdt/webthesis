/**
 * DOM-based equation number injection
 * Adds equation numbers (e.g., "(4.2)") to all display equations
 * Numbers all block-level math elements sequentially per chapter
 */

const cheerio = require('cheerio');

class EquationNumberInjector {
  constructor(manifest, chapterInfo) {
    this.manifest = manifest;
    this.chapterInfo = chapterInfo; // { [chapterId]: { number } }
  }

  /**
   * Inject equation numbers into all display equation elements
   * @param {string} content - HTML content to process
   * @param {string} currentChapterId - ID of the chapter being processed
   * @returns {string} Modified HTML content with equation numbers
   */
  inject(content, currentChapterId) {
    const $ = cheerio.load(content);
    const chapter = this.chapterInfo[currentChapterId];

    if (!chapter) {
      return content; // No chapter info, return unchanged
    }

    const chapterNumber = chapter.number;
    let equationCounter = 0;

    // Find all block-level math elements (display equations)
    // These can be direct <math> elements or wrapped in <div>
    $('math[display="block"]').each((index, element) => {
      equationCounter++;

      // Create equation number: "4.2", "A.1", etc.
      const equationNumber = `(${chapterNumber}.${equationCounter})`;

      // Create wrapper div with flexbox styling for right alignment
      const wrapper = `<div class="equation-display"><div class="equation-content">$$MATH$$</div><div class="equation-number">${equationNumber}</div></div>`;

      const $mathElement = $(element);
      const mathHtml = $.html($mathElement);

      // Replace $$MATH$$ placeholder with actual math element
      const wrappedHtml = wrapper.replace('$$MATH$$', mathHtml);

      // Replace the original element with wrapped version
      $mathElement.replaceWith(wrappedHtml);
    });

    return $.html();
  }
}

module.exports = EquationNumberInjector;
