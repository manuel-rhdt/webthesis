# Build System Documentation

This project includes a minimalistic Node.js-based build system for injecting headers, footers, and navigation into chapter HTML files. The build outputs to a `dist/` directory ready for deployment.

## Quick Start

```bash
npm run build
```

This command:
1. Copies all assets (CSS, JS, images, logos, index.html, sitemap.xml) to `dist/`
2. Processes all chapters with injected headers, footers, and navigation
3. Outputs built chapters to `dist/chapters/`

The `dist/` directory is now ready to deploy or publish to GitHub Pages.

## Output Directory Structure

The build creates a complete, self-contained website in `dist/`:

```
dist/
├── index.html              (main landing page)
├── sitemap.xml             (search engine sitemap)
├── css/
│   └── thesis-style.css    (styles)
├── js/
│   └── equation-tooltips.js (interactivity)
├── images/                 (SVG figures)
├── logos/                  (institutional logos)
└── chapters/               (generated chapter files)
    ├── introduction.html
    ├── dpws.html
    └── ... (all 11 chapters)
```

This directory is deployment-ready and can be served directly or pushed to GitHub Pages.

## How It Works

The build system consists of three main components:

### 1. Chapter Manifest (`chapters-manifest.json`)
Defines all chapters in order with metadata:
- Chapter ID (used as filename)
- Number/label (displayed in navigation)
- Title
- Section (chapters, appendix, backmatter)

Used to automatically generate navigation links between chapters.

### 2. Templates (`_templates/`)

**`_header.html`**: Injected at the beginning of each chapter
- Contains DOCTYPE, head, and opening body tag
- Template variables: `{{title}}`, `{{dataChapter}}`

**`_footer.html`**: Injected at the end of each chapter
- Contains chapter navigation section
- Template variables: `{{prevLink}}`, `{{nextLink}}`

### 3. Build Script (`build.js`)

The build process:
1. Reads original HTML from `chapters/` directory
2. Extracts content between `</header>` and `</body>`
3. Generates navigation links based on manifest order
4. Combines header + content + footer with template variables replaced
5. Writes processed HTML back to the same file

## Customizing

### Add/Reorder Chapters
Edit `chapters-manifest.json` to add, remove, or reorder chapters. The navigation will automatically update.

### Change Headers/Footers
Edit files in `_templates/` directory. Available template variables:
- `{{title}}`: Chapter title
- `{{dataChapter}}`: Chapter number (for CSS counters)
- `{{prevLink}}`: Previous chapter navigation link (empty if first chapter)
- `{{nextLink}}`: Next chapter navigation link (empty if last chapter)

### Modify Navigation Styling
Update `css/thesis-style.css`. Navigation-related CSS classes:
- `.chapter-nav`: Top navigation bar
- `.chapter-nav-footer`: Bottom navigation bar
- `.nav-container`: Navigation container
- `.nav-link`: Individual navigation button
- `.nav-back`, `.nav-home`, `.nav-prev`, `.nav-next`: Specific link types

## Technical Details

- **Requires**: Node.js (v14+)
- **Dependencies**: None (uses only Node.js built-in `fs` module)
- **Performance**: Processes all chapters + assets in <1 second
- **Safety**: Idempotent—safe to run multiple times
- **Output**: Complete, self-contained website in `dist/`

## Deployment with GitHub Actions

The build system is designed to work with GitHub Actions. Here's a minimal workflow example:

```yaml
# .github/workflows/build.yml
name: Build Website

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

This workflow automatically rebuilds and deploys your website whenever you push to main.

## Workflow

1. Edit chapter HTML in `chapters/` as needed
2. Modify manifest/templates if chapter order or structure changes
3. Run `npm run build` to regenerate everything in `dist/`
4. Verify the output looks correct
5. Commit changes (both source and dist directory if needed)
6. Push to trigger GitHub Actions deployment

## Git Configuration

Add `dist/` to `.gitignore` if you want to keep the repository smaller and only commit generated files on releases:

```bash
echo "dist/" >> .gitignore
```

Alternatively, commit `dist/` if you want the build artifacts in the repository (useful for CI/CD workflows).

## Limitations & Future Improvements

The current implementation:
- Extracts content based on exact `</header>` and `</body>` tags
- Does not support conditional rendering or complex templating logic
- Chapter templates are static (all chapters use same structure)

Possible enhancements:
- Minify HTML output
- Validate cross-references between chapters
- Support for custom template engines (Handlebars, EJS)
- Incremental builds (only rebuild changed chapters)
