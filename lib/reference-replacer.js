/**
 * DOM-based text reference replacement using Cheerio
 * Converts semantic references (Sec., Ch.) to section numbers
 */

const cheerio = require('cheerio');
const ReferenceProcessorBase = require('./reference-processor-base');

class ReferenceReplacer extends ReferenceProcessorBase {
  constructor(manifest, headerMapping) {
    super(manifest, headerMapping);
  }

  /**
   * Replace text references in content
   * @param {string} content - HTML content to process
   * @param {string} currentChapterId - ID of the chapter being processed
   * @returns {string} Modified HTML content
   */
  replace(content, currentChapterId) {
    const $ = cheerio.load(content);

    // Find all anchor links and process them
    $('a[href^="#"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const linkText = $link.text();
      const hrefId = href.substring(1); // Remove leading #

      // Skip special reference types
      if (this.shouldSkipLink(hrefId, $link)) {
        return;
      }

      const newText = this.calculateNewText(hrefId, linkText, currentChapterId);
      if (newText && newText !== linkText) {
        $link.text(newText);
      }
    });

    return $.html();
  }

  /**
   * Determine if a link should be skipped
   * @private
   */
  shouldSkipLink(hrefId, $link) {
    // Skip special reference types
    if (this.isSpecialReference(hrefId)) {
      return true;
    }

    // Skip TOC links
    if ($link.attr('id') && $link.attr('id').startsWith('toc-')) {
      return true;
    }

    return false;
  }

  /**
   * Calculate the new text for a link
   * @private
   */
  calculateNewText(hrefId, linkText, currentChapterId) {
    // Handle chapter references
    if (hrefId.startsWith('ch:')) {
      return this.calculateChapterText(hrefId, linkText);
    }

    // Handle section references
    return this.calculateSectionText(hrefId, linkText, currentChapterId);
  }

  /**
   * Calculate text for chapter references
   * Only replaces the chapter ID part, preserving surrounding text
   * @private
   */
  calculateChapterText(hrefId, linkText) {
    const chapterId = hrefId.substring(3); // Remove "ch:" prefix
    const chapter = this.manifest.chapters.find(ch => {
      const refId = ch.refId || ch.id;
      return refId === chapterId || ch.id === chapterId;
    });

    if (!chapter) {
      return null;
    }

    // Check if link text is EXACTLY the bare chapter ID
    const isBareId = linkText.trim().toLowerCase() === chapterId ||
                     linkText.trim().toLowerCase() === chapter.id;

    if (isBareId) {
      // Bare chapter ID - just replace with number
      return chapter.number ? String(chapter.number) : chapter.title;
    }

    // For any other text, only replace the chapter ID part within it
    // Replace case-insensitively, preserving the surrounding text
    const numberValue = chapter.number ? String(chapter.number) : chapter.title;
    const pattern = new RegExp(`\\b${chapterId}\\b|\\b${chapter.id}\\b`, 'i');
    return linkText.replace(pattern, numberValue);
  }

  /**
   * Calculate text for section references
   * @private
   */
  calculateSectionText(hrefId, linkText, currentChapterId) {
    const sectionInfo = this.findHeaderInfo(hrefId, currentChapterId);

    if (!sectionInfo) {
      return null;
    }

    // Determine if cross-chapter
    const isCrossChapter = sectionInfo.chapterId !== currentChapterId;

    if (isCrossChapter) {
      return `Sec. ${sectionInfo.sectionNumber} (${sectionInfo.chapterTitle})`;
    } else {
      return `Sec. ${sectionInfo.sectionNumber}`;
    }
  }
}

module.exports = ReferenceReplacer;
