#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load manifest
const manifestPath = path.join(__dirname, 'chapters-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const chaptersDir = path.join(__dirname, 'chapters');
const templatesDir = path.join(__dirname, '_templates');
const distDir = path.join(__dirname, 'dist');
const distChaptersDir = path.join(distDir, 'chapters');

const headerTemplate = fs.readFileSync(path.join(templatesDir, '_header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(templatesDir, '_footer.html'), 'utf8');

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
 * Process a single chapter
 */
function processChapter(chapter, index) {
  const inputPath = path.join(chaptersDir, `${chapter.id}.html`);
  const outputPath = path.join(distChaptersDir, `${chapter.id}.html`);

  // Read original file
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found - ${inputPath}`);
    return false;
  }

  const originalHtml = fs.readFileSync(inputPath, 'utf8');
  const content = extractContent(originalHtml);
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
 * Copy static assets to dist directory
 */
function copyAssets() {
  const cssSource = path.join(__dirname, 'css');
  const jsSource = path.join(__dirname, 'js');
  const imagesSource = path.join(__dirname, 'images');
  const logosSource = path.join(__dirname, 'logos');
  const indexSource = path.join(__dirname, 'index.html');
  const sitemapSource = path.join(__dirname, 'sitemap.xml');

  copyRecursive(cssSource, distCssDir);
  copyRecursive(jsSource, distJsDir);
  copyRecursive(imagesSource, distImagesDir);
  copyRecursive(logosSource, distLogosDir);

  // Copy index.html and sitemap
  if (fs.existsSync(indexSource)) {
    fs.copyFileSync(indexSource, path.join(distDir, 'index.html'));
  }
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

  let successCount = 0;
  let errorCount = 0;

  manifest.chapters.forEach((chapter, index) => {
    try {
      if (processChapter(chapter, index)) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${chapter.id}: ${error.message}`);
      errorCount++;
    }
  });

  console.log(`\n${successCount} chapter(s) built successfully`);
  if (errorCount > 0) {
    console.log(`${errorCount} error(s) encountered`);
    process.exit(1);
  }
}

// Run build
build();
