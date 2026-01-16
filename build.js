#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import DOM-based implementations
const HeaderMapper = require('./lib/header-mapper');
const ReferenceReplacer = require('./lib/reference-replacer');
const CrossReferenceFixer = require('./lib/cross-reference-fixer');
const EquationMapper = require('./lib/equation-mapper');
const EquationReplacer = require('./lib/equation-replacer');
const EquationNumberInjector = require('./lib/equation-number-injector');

// Load manifest
const manifestPath = path.join(__dirname, 'chapters-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const chaptersDir = path.join(__dirname, 'chapters');
const templatesDir = path.join(__dirname, '_templates');
const distDir = path.join(__dirname, 'dist');
const distChaptersDir = path.join(distDir, 'chapters');

const headerTemplate = fs.readFileSync(path.join(templatesDir, '_header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(templatesDir, '_footer.html'), 'utf8');
const indexTemplate = fs.readFileSync(path.join(templatesDir, '_index.html'), 'utf8');

// Ensure dist directories exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(distChaptersDir)) {
  fs.mkdirSync(distChaptersDir, { recursive: true });
}

const distCssDir = path.join(distDir, 'css');
const distJsDir = path.join(distDir, 'js');
const distImagesDir = path.join(distDir, 'images');
const distLogosDir = path.join(distDir, 'logos');

if (!fs.existsSync(distCssDir)) {
  fs.mkdirSync(distCssDir, { recursive: true });
}
if (!fs.existsSync(distJsDir)) {
  fs.mkdirSync(distJsDir, { recursive: true });
}

/**
 * Find chapter index by id
 */
function findChapterIndex(id) {
  return manifest.chapters.findIndex(ch => ch.id === id);
}

/**
 * Get previous chapter (if exists)
 */
function getPrevChapter(currentIndex) {
  if (currentIndex <= 0) return null;
  return manifest.chapters[currentIndex - 1];
}

/**
 * Get next chapter (if exists)
 */
function getNextChapter(currentIndex) {
  if (currentIndex >= manifest.chapters.length - 1) return null;
  return manifest.chapters[currentIndex + 1];
}

/**
 * Format chapter number for display
 */
function formatNumber(num) {
  if (typeof num === 'string') return num;
  if (!num) return '';
  return num + '.';
}

/**
 * Create chapter navigation links
 */
function createNavLinks(currentIndex) {
  const prev = getPrevChapter(currentIndex);
  const next = getNextChapter(currentIndex);

  let prevHtml = '';
  let nextHtml = '';

  if (prev) {
    const prevNum = formatNumber(prev.number);
    prevHtml = `<a href="${prev.id}.html" class="nav-link nav-prev">← ${prevNum} ${prev.title}</a>`;
  }

  if (next) {
    const nextNum = formatNumber(next.number);
    nextHtml = `<a href="${next.id}.html" class="nav-link nav-next">${nextNum} ${next.title} →</a>`;
  }

  return { prevLink: prevHtml, nextLink: nextHtml };
}

/**
 * Extract chapter content (everything between </header> and </body>)
 */
function extractContent(html) {
  const headerEnd = html.indexOf('</header>');
  const bodyEnd = html.indexOf('</body>');

  if (headerEnd === -1 || bodyEnd === -1) {
    console.warn('Warning: Could not find </header> or </body> tags');
    return html;
  }

  return html.substring(headerEnd + 9, bodyEnd).trim();
}

/**
 * Get data-chapter attribute value from chapter number
 */
function getDataChapterValue(chapterNumber) {
  if (typeof chapterNumber === 'string') return chapterNumber;
  return String(chapterNumber);
}

/**
 * Create mapping of chapter IDs to filenames
 * Maps both standard IDs and variants (with hyphens)
 */
function createChapterMapping() {
  const mapping = {};
  manifest.chapters.forEach(chapter => {
    // Map the chapter ID to the filename
    mapping[chapter.id] = chapter.id + '.html';
    // Also map variations with hyphens/underscores
    const idWithHyphens = chapter.id.replace(/_/g, '-');
    if (idWithHyphens !== chapter.id) {
      mapping[idWithHyphens] = chapter.id + '.html';
    }
  });
  return mapping;
}

/**
 * Build header mapping from all chapter files with section numbering
 * Extracts all h2, h3, h4 headings with their IDs and assigns section numbers
 * Returns: { chapterId: { 'heading-id': { text, level, chapterFile, sectionNumber, displayText, ... } }, ... }
 */
function buildHeaderMapping() {
  // Use DOM-based implementation for more robust header extraction
  const htmlMap = {};
  manifest.chapters.forEach(chapter => {
    const inputPath = path.join(chaptersDir, `${chapter.id}.html`);
    if (fs.existsSync(inputPath)) {
      htmlMap[chapter.id] = fs.readFileSync(inputPath, 'utf8');
    }
  });

  const mapper = new HeaderMapper();
  return mapper.buildMapping(manifest.chapters, htmlMap);
}

/**
 * Replace section name references with section numbers
 * Converts any link text pointing to a section ID to use the section number
 * Examples: "Sec. smc" → "Sec. 3", "see section" → "Sec. 2.1", etc.
 * Also converts "Ch. chapter-id" to "Ch. 2" format in link text
 */
function replaceTextReferences(content, currentChapterId, headerMapping) {
  // Use DOM-based implementation
  const replacer = new ReferenceReplacer(manifest, headerMapping);
  return replacer.replace(content, currentChapterId);
}

/**
 * Fix cross-chapter references in content
 * Converts #ch:chapter-id to chapters/chapter-id.html#ch:chapter-id
 * Also converts heading references to cross-chapter links where needed
 * (Text replacement is handled by replaceTextReferences, not here)
 */
function fixCrossReferences(content, currentChapterId, headerMapping) {
  // Use DOM-based implementation
  const fixer = new CrossReferenceFixer(manifest, headerMapping);
  return fixer.fix(content, currentChapterId);
}

/**
 * Build equation mapping from all chapter files
 * Extracts all equations with IDs and assigns chapter-specific equation numbers
 * Returns: { chapterId: { 'eq:id': { id, equationNumber, chapterId, chapterNumber } }, ... }
 */
function buildEquationMapping() {
  // Use DOM-based implementation for equation extraction
  const htmlMap = {};
  manifest.chapters.forEach(chapter => {
    const inputPath = path.join(chaptersDir, `${chapter.id}.html`);
    if (fs.existsSync(inputPath)) {
      htmlMap[chapter.id] = fs.readFileSync(inputPath, 'utf8');
    }
  });

  const mapper = new EquationMapper();
  return mapper.buildMapping(manifest.chapters, htmlMap);
}

/**
 * Replace equation references with equation numbers
 * Converts eq:id references to actual equation numbers
 * Examples: "eq:random_walk" → "Eq. 4.1"
 */
function replaceEquationReferences(content, currentChapterId, equationMapping) {
  // Use DOM-based implementation
  const replacer = new EquationReplacer(manifest, equationMapping);
  return replacer.replace(content, currentChapterId);
}

/**
 * Inject equation numbers into equation elements
 * Adds labels like "4.2" next to each equation
 */
function injectEquationNumbers(content, currentChapterId, equationMapping) {
  // Use DOM-based implementation
  const injector = new EquationNumberInjector(equationMapping);
  return injector.inject(content, currentChapterId);
}

/**
 * Process a single chapter
 */
function processChapter(chapter, index, headerMapping, equationMapping) {
  const inputPath = path.join(chaptersDir, `${chapter.id}.html`);
  const outputPath = path.join(distChaptersDir, `${chapter.id}.html`);

  // Read original file
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found - ${inputPath}`);
    return false;
  }

  const originalHtml = fs.readFileSync(inputPath, 'utf8');
  let content = extractContent(originalHtml);

  // Replace text references (Sec. xxx, Ch. xxx) with actual section/chapter numbers
  content = replaceTextReferences(content, chapter.id, headerMapping);

  // Inject equation numbers into equation elements
  content = injectEquationNumbers(content, chapter.id, equationMapping);

  // Replace equation references (eq:xxx) with actual equation numbers
  content = replaceEquationReferences(content, chapter.id, equationMapping);

  // Fix cross-chapter references (including heading references)
  content = fixCrossReferences(content, chapter.id, headerMapping);

  const navLinks = createNavLinks(index);
  const dataChapter = getDataChapterValue(chapter.number);

  // Build new HTML - use replaceAll to handle multiple occurrences
  let newHtml = headerTemplate
    .replaceAll('{{title}}', chapter.title)
    .replaceAll('{{dataChapter}}', dataChapter);

  newHtml += '\n' + content + '\n';

  let footerHtml = footerTemplate
    .replace('{{prevLink}}', navLinks.prevLink)
    .replace('{{nextLink}}', navLinks.nextLink);

  newHtml += '\n' + footerHtml;

  // Write updated file
  fs.writeFileSync(outputPath, newHtml, 'utf8');
  console.log(`✓ ${chapter.id}.html`);
  return true;
}

/**
 * Copy a file or directory recursively
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Generate table of contents from manifest
 */
function generateTOC() {
  let toc = '';
  let currentSection = null;

  manifest.chapters.forEach(chapter => {
    // Add section header if section changed
    if (chapter.section !== currentSection) {
      if (currentSection !== null) {
        toc += '        </ul>\n\n';
      }

      const sectionNames = {
        'chapters': 'Chapters',
        'appendix': 'Appendix',
        'backmatter': 'Back Matter'
      };

      toc += `        <p class="section-header">${sectionNames[chapter.section]}</p>\n`;
      toc += '        <ul class="chapter-list">\n';
      currentSection = chapter.section;
    }

    // Format chapter number
    const number = typeof chapter.number === 'string'
      ? chapter.number + '.'
      : chapter.number + '.';

    const displayNumber = chapter.number ? `<span class="chapter-number">${number}</span> ` : '';
    toc += `            <li><a href="chapters/${chapter.id}.html">${displayNumber}${chapter.title}</a></li>\n`;
  });

  // Close last section
  if (currentSection !== null) {
    toc += '        </ul>\n';
  }

  return toc;
}

/**
 * Generate index.html from template
 */
function generateIndex() {
  const toc = generateTOC();
  const indexHtml = indexTemplate.replace('{{TOC}}', toc);
  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml, 'utf8');
  console.log('✓ index.html');
}

/**
 * Save header mapping to JSON file for reference and debugging
 */
function saveHeaderMappingFile(headerMapping) {
  const mappingFile = path.join(__dirname, 'header-mapping.json');

  // Convert to a more readable format
  const readable = {};
  for (const chapterId in headerMapping) {
    const chapter = manifest.chapters.find(ch => ch.id === chapterId);
    readable[chapterId] = {
      chapterTitle: chapter ? chapter.title : 'Unknown',
      headers: headerMapping[chapterId]
    };
  }

  fs.writeFileSync(mappingFile, JSON.stringify(readable, null, 2), 'utf8');
}

/**
 * Save cross-reference report
 */
function saveCrossReferenceReport(headerMapping) {
  const reportFile = path.join(__dirname, 'cross-reference-analysis.json');

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalHeaders: 0,
      totalChapters: Object.keys(headerMapping).length,
      headersByLevel: { h2: 0, h3: 0, h4: 0 }
    },
    chapters: {}
  };

  // Analyze each chapter
  for (const chapterId in headerMapping) {
    const chapter = manifest.chapters.find(ch => ch.id === chapterId);
    const headers = headerMapping[chapterId];
    const headerIds = Object.keys(headers);

    report.summary.totalHeaders += headerIds.length;

    // Count by level
    headerIds.forEach(headerId => {
      const level = `h${headers[headerId].level}`;
      report.summary.headersByLevel[level]++;
    });

    // Build chapter report
    report.chapters[chapterId] = {
      chapterTitle: chapter ? chapter.title : 'Unknown',
      totalHeaders: headerIds.length,
      headers: headerIds.map(id => ({
        id: id,
        text: headers[id].text,
        level: headers[id].level
      }))
    };
  }

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
}

/**
 * Copy static assets to dist directory
 */
function copyAssets() {
  const cssSource = path.join(__dirname, 'css');
  const jsSource = path.join(__dirname, 'js');
  const imagesSource = path.join(__dirname, 'images');
  const logosSource = path.join(__dirname, 'logos');
  const sitemapSource = path.join(__dirname, 'sitemap.xml');

  copyRecursive(cssSource, distCssDir);
  copyRecursive(jsSource, distJsDir);
  copyRecursive(imagesSource, distImagesDir);
  copyRecursive(logosSource, distLogosDir);

  // Copy sitemap
  if (fs.existsSync(sitemapSource)) {
    fs.copyFileSync(sitemapSource, path.join(distDir, 'sitemap.xml'));
  }
}

/**
 * Main build function
 */
function build() {
  console.log('Building thesis chapters...\n');

  // Copy assets
  copyAssets();

  // Build header mapping from all chapters
  console.log('Building header mapping...');
  const headerMapping = buildHeaderMapping();

  // Count total headers mapped
  let totalHeaders = 0;
  for (const chapterId in headerMapping) {
    totalHeaders += Object.keys(headerMapping[chapterId]).length;
  }
  console.log(`✓ Mapped ${totalHeaders} headers across ${Object.keys(headerMapping).length} chapters`);

  // Build equation mapping from all chapters
  console.log('Building equation mapping...');
  const equationMapping = buildEquationMapping();

  // Count total equations mapped
  let totalEquations = 0;
  for (const chapterId in equationMapping) {
    totalEquations += Object.keys(equationMapping[chapterId]).length;
  }
  console.log(`✓ Mapped ${totalEquations} equations across ${Object.keys(equationMapping).length} chapters`);

  // Save mapping files for reference
  saveHeaderMappingFile(headerMapping);
  saveCrossReferenceReport(headerMapping);
  console.log('✓ Saved header-mapping.json and cross-reference-analysis.json\n');

  let successCount = 0;
  let errorCount = 0;

  manifest.chapters.forEach((chapter, index) => {
    try {
      if (processChapter(chapter, index, headerMapping, equationMapping)) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${chapter.id}: ${error.message}`);
      errorCount++;
    }
  });

  // Generate index.html
  try {
    generateIndex();
  } catch (error) {
    console.error(`✗ Error generating index: ${error.message}`);
    errorCount++;
  }

  console.log(`\n${successCount} chapter(s) built successfully`);
  if (errorCount > 0) {
    console.log(`${errorCount} error(s) encountered`);
    process.exit(1);
  }
}

// Run build
build();
