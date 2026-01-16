/**
 * Base class for reference processing
 * Provides common utilities for finding headers and checking reference types
 */

class ReferenceProcessorBase {
  constructor(manifest, headerMapping) {
    this.manifest = manifest;
    this.headerMapping = headerMapping;
  }

  /**
   * Find header information by ID, checking current chapter first, then others
   * @protected
   */
  findHeaderInfo(hrefId, currentChapterId) {
    // Check current chapter first
    if (this.headerMapping[currentChapterId] && this.headerMapping[currentChapterId][hrefId]) {
      return this.headerMapping[currentChapterId][hrefId];
    }

    // Search other chapters
    for (const chapterId in this.headerMapping) {
      if (chapterId === currentChapterId) continue;
      if (this.headerMapping[chapterId][hrefId]) {
        return this.headerMapping[chapterId][hrefId];
      }
    }

    return null;
  }

  /**
   * Check if a reference type should be skipped (footnotes, bibliography, etc)
   * @protected
   */
  isSpecialReference(hrefId) {
    return hrefId.startsWith('fn') ||
           hrefId.startsWith('ref-') ||
           hrefId.startsWith('eq:') ||
           hrefId.startsWith('fig:');
  }

  /**
   * Check if a reference is a chapter reference
   * @protected
   */
  isChapterReference(hrefId) {
    return hrefId.startsWith('ch:');
  }

  /**
   * Check if a reference is a TOC link
   * @protected
   */
  isTocReference(hrefId) {
    return hrefId.startsWith('toc-');
  }
}

module.exports = ReferenceProcessorBase;
