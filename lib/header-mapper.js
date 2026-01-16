/**
 * DOM-based header mapping using Cheerio
 * Extracts and maps all headers with hierarchical section numbering
 */

const cheerio = require('cheerio');

class HeaderMapper {
  constructor() {
    this.headerMapping = {};
  }

  /**
   * Build header mapping from chapters
   * @param {Array} chapters - Array of chapter objects with id, title
   * @param {Object} htmlMap - Object mapping chapter IDs to HTML content
   * @returns {Object} Header mapping structure
   */
  buildMapping(chapters, htmlMap) {
    this.headerMapping = {};

    chapters.forEach((chapter) => {
      if (!htmlMap[chapter.id]) return;

      const html = htmlMap[chapter.id];
      this.mapChapterHeaders(chapter, html);
    });

    return this.headerMapping;
  }

  /**
   * Map headers in a single chapter
   * @private
   */
  mapChapterHeaders(chapter, html) {
    const $ = cheerio.load(html);
    this.headerMapping[chapter.id] = {};

    let h2Counter = 0;
    let h3Counter = 0;
    let h4Counter = 0;
    let lastH2 = 0;

    // Select all h2, h3, h4 elements in document order
    $('h2, h3, h4').each((index, element) => {
      const $heading = $(element);
      const level = parseInt(element.name[1]); // Extract number from h2, h3, h4
      const text = $heading.text().trim();

      // Get all id attributes from this heading
      const ids = this.extractAllIds($heading);

      if (ids.length === 0) return; // Skip headings without IDs

      let sectionNumber = '';

      if (level === 2) {
        h2Counter++;
        h3Counter = 0;
        h4Counter = 0;
        lastH2 = h2Counter;
        sectionNumber = String(h2Counter);
      } else if (level === 3) {
        h3Counter++;
        h4Counter = 0;
        sectionNumber = `${lastH2}.${h3Counter}`;
      } else if (level === 4) {
        h4Counter++;
        sectionNumber = `${lastH2}.${h3Counter}.${h4Counter}`;
      }

      const headerInfo = {
        text: text,
        level: level,
        chapterFile: `${chapter.id}.html`,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        sectionNumber: sectionNumber
      };

      // Register heading under all its IDs
      ids.forEach(id => {
        if (!this.headerMapping[chapter.id][id]) {
          this.headerMapping[chapter.id][id] = headerInfo;
        }
      });
    });
  }

  /**
   * Extract all id attributes from a Cheerio element
   * @private
   */
  extractAllIds($element) {
    const ids = [];

    // Cheerio's attr() returns a single value, so we need to parse the HTML
    const attribs = $element[0].attribs || {};

    // Look for all id attributes in the element
    Object.keys(attribs).forEach(key => {
      if (key.startsWith('id')) {
        ids.push(attribs[key]);
      }
    });

    // If no explicit id attributes, try the standard id attribute
    if (ids.length === 0 && attribs.id) {
      ids.push(attribs.id);
    }

    return ids;
  }

  /**
   * Get the full mapping
   */
  getMapping() {
    return this.headerMapping;
  }
}

module.exports = HeaderMapper;
