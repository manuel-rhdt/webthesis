/**
 * DOM-based cross-reference fixing using Cheerio
 * Fixes hrefs for cross-chapter references
 */

const cheerio = require('cheerio');
const ReferenceProcessorBase = require('./reference-processor-base');

class CrossReferenceFixer extends ReferenceProcessorBase {
  constructor(manifest, headerMapping) {
    super(manifest, headerMapping);
  }

  /**
   * Fix cross-references in content
   * @param {string} content - HTML content to process
   * @param {string} currentChapterId - ID of the chapter being processed
   * @returns {string} Modified HTML content
   */
  fix(content, currentChapterId) {
    const $ = cheerio.load(content);

    // Fix chapter references first
    this.fixChapterReferences($, currentChapterId);

    // Then fix heading references
    this.fixHeadingReferences($, currentChapterId);

    return $.html();
  }

  /**
   * Fix chapter references (e.g., href="#ch:dpws")
   * @private
   */
  fixChapterReferences($, currentChapterId) {
    $('a[href^="#ch:"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const refId = href.substring(4); // Remove "#ch:" prefix

      const targetChapter = this.manifest.chapters.find(ch => {
        const chapterRefId = ch.refId || ch.id;
        return chapterRefId === refId;
      });

      if (targetChapter && targetChapter.id !== currentChapterId) {
        // Cross-chapter reference - fix to include file
        $link.attr('href', `${targetChapter.id}.html#ch:${refId}`);
      }
    });
  }

  /**
   * Fix heading references by correcting cross-chapter hrefs
   * @private
   */
  fixHeadingReferences($, currentChapterId) {
    $('a[href^="#"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const hrefId = href.substring(1); // Remove leading #

      // Skip chapter references, footnotes, bibliography, TOC
      if (this.shouldSkipReference(hrefId)) {
        return;
      }

      // Find the heading in mapping
      const headerInfo = this.findHeaderInfo(hrefId, currentChapterId);

      if (!headerInfo) {
        return; // Header not found, leave unchanged
      }

      // Determine target chapter
      const targetChapterId = headerInfo.chapterId;

      // Fix href if cross-chapter
      if (targetChapterId !== currentChapterId) {
        $link.attr('href', `${targetChapterId}.html#${hrefId}`);
      }
    });
  }

  /**
   * Determine if a reference should be skipped
   * @private
   */
  shouldSkipReference(hrefId) {
    return this.isChapterReference(hrefId) ||
           this.isSpecialReference(hrefId) ||
           this.isTocReference(hrefId);
  }

}

module.exports = CrossReferenceFixer;
