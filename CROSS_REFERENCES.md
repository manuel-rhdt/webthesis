# Cross-References

This document explains the comprehensive header mapping system that resolves cross-chapter heading references in the thesis.

## Overview

The build system automatically scans all chapter HTML files and creates a complete mapping of all headings (h2, h3, h4 elements with ID attributes). This mapping is used to:

1. **Resolve Cross-Chapter Heading References**: Automatically convert internal anchor links like `href="#heading-id"` to cross-chapter links like `href="chapter.html#heading-id"` when the heading exists in a different chapter.
2. **Generate Analysis Reports**: Create JSON reports for debugging and reference.
3. **Validate Structure**: Ensure all heading references can be resolved.

## How It Works

### 1. Header Extraction (buildHeaderMapping)

During the build process, the script:
1. Reads all chapter HTML files from the `chapters/` directory
2. Uses regex to extract all h2, h3, h4 elements with `id` attributes
3. Stores heading metadata: ID, text, level, chapter file, chapter ID, and chapter title
4. Creates a nested mapping structure for fast lookup

**Regex Pattern Used:**
```javascript
/<h([234])\s+[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h\1>/g
```

This matches:
- Heading levels 2, 3, or 4
- Any attributes before the `id`
- The `id` value (captured)
- The heading text (captured)
- Proper closing tag matching the opening level

### 2. Reference Resolution (fixCrossReferences)

The `fixCrossReferences()` function processes each chapter's content and:

1. **Fixes Chapter References** (already implemented): `href="#ch:dpws"` → `href="dpws.html#ch:dpws"`
   - Uses chapter refId mapping from manifest for chapters where reference IDs differ from filenames

2. **Fixes Heading References** (NEW): `href="#heading-id"` → `href="chapter.html#heading-id"` when needed
   - Checks if the heading exists in the current chapter (keep as-is)
   - Searches all other chapters to find where the heading exists
   - Converts to cross-chapter link if found in another chapter
   - Skips special references (footnotes `fn*`, bibliography `ref-*`, chapter anchors `ch:*`)

**Reference Type Detection:**
```javascript
// These are skipped (not converted to cross-chapter links):
- href="#fn1"      // Footnotes
- href="#fnref1"   // Footnote references back
- href="#ref-xyz"  // Bibliography references
- href="#ch:xyz"   // Chapter references (handled separately)
```

## Generated Files

### header-mapping.json

Complete mapping of all headers in the thesis. Structure:

```json
{
  "introduction": {
    "chapterTitle": "Introduction",
    "headers": {
      "heading-id": {
        "text": "Heading Text",
        "level": 2,
        "chapterFile": "introduction.html",
        "chapterId": "introduction",
        "chapterTitle": "Introduction"
      },
      ...
    }
  },
  "dpws": { ... },
  ...
}
```

**Use this file to:**
- Look up heading locations across chapters
- Debug reference issues
- Validate heading structure
- Generate documentation

### cross-reference-analysis.json

Statistical analysis and summary of all headers. Structure:

```json
{
  "generatedAt": "2026-01-16T00:57:44.065Z",
  "summary": {
    "totalHeaders": 81,
    "totalChapters": 11,
    "headersByLevel": {
      "h2": 37,
      "h3": 32,
      "h4": 12
    }
  },
  "chapters": {
    "introduction": {
      "chapterTitle": "Introduction",
      "totalHeaders": 3,
      "headers": [
        {
          "id": "contributions-of-this-work",
          "text": "Contributions of This Work",
          "level": 2
        },
        ...
      ]
    },
    ...
  }
}
```

**Use this file to:**
- Track header statistics
- Verify chapter structure
- Identify sections with many/few subsections
- Generate thesis outline

## Reference Patterns in Your Thesis

### Chapter-Level References
Pattern: `href="#ch:chapter-id"`

**Examples:**
```html
<a href="#ch:dpws">Path Weight Sampling chapter</a>
<a href="#ch:ml-pws">ML-PWS chapter</a>
<a href="#ch:lna_vs_pws">Gaussian Approximation comparison</a>
```

**Handled by:** `fixCrossReferences()` - uses chapter mapping from manifest
**Output:** `href="dpws.html#ch:dpws"` etc.

### Section-Level References
Pattern: `href="#section-id"` where section-id is a heading in another chapter

**Examples:**
```html
<a href="#statement-of-the-problem">See statement of the problem</a>
<a href="#gaussian-approximation">Gaussian approximation details</a>
<a href="#mwc-model">MWC model description</a>
```

**Handled by:** `fixCrossReferences()` header mapping logic
**Output:** `href="dpws.html#statement-of-the-problem"` (if heading is in dpws)

### Within-Chapter References (Unchanged)
Pattern: `href="#section-id"` where section-id is in the same chapter

**Example in dpws.html:**
```html
<li><a href="#statement-of-the-problem">Statement of the Problem</a></li>
```

**Handling:** Left as-is (same chapter)
**Output:** `href="#statement-of-the-problem"` (unchanged)

### Special References (Not Converted)
These are skipped by the cross-reference resolver:

```html
<a href="#fn1" id="fnref1">footnote reference</a>  <!-- Footnotes -->
<a href="#fnref1">footnote backlink</a>             <!-- Footnote backlinks -->
<a href="#ref-citation-key">bibliography ref</a>    <!-- Bibliography -->
```

## Statistics

From your thesis (81 headers across 11 chapters):

| Chapter | H2 | H3 | H4 | Total |
|---------|----|----|----| ----- |
| introduction | 3 | 0 | 0 | 3 |
| dpws | 5 | 4 | 3 | 12 |
| variants | 5 | 4 | 0 | 9 |
| chemotaxis | 5 | 4 | 2 | 11 |
| lna_vs_pws | 5 | 4 | 2 | 11 |
| mlpws | 5 | 4 | 2 | 11 |
| appendix | 2 | 2 | 0 | 4 |
| summary | 2 | 0 | 0 | 2 |
| publications | 1 | 0 | 0 | 1 |
| acknowledgments | 1 | 0 | 0 | 1 |
| about-the-author | 1 | 0 | 0 | 1 |
| **Total** | **37** | **32** | **12** | **81** |

## Build Output

During build, you'll see:
```
Building header mapping...
✓ Mapped 81 headers across 11 chapters
✓ Saved header-mapping.json and cross-reference-analysis.json
```

The two JSON files are created in the project root for reference and debugging.

## Integration with Build Process

The header mapping is built once at the start of the build process (in the `build()` function):

```javascript
// Build header mapping from all chapters
const headerMapping = buildHeaderMapping();

// Save mapping files for reference
saveHeaderMappingFile(headerMapping);
saveCrossReferenceReport(headerMapping);
```

Then passed to each chapter processing:

```javascript
processChapter(chapter, index, headerMapping)
```

Which uses it in the reference fixing step:

```javascript
content = fixCrossReferences(content, chapter.id, headerMapping);
```

## Limitations & Future Enhancements

**Current Limitations:**
- Only handles h2, h3, h4 elements (not h1 or lower levels)
- Requires `id` attribute on headings to be recognized
- Cannot resolve references to heading text without IDs
- Doesn't validate that all references resolve to actual headings

**Possible Future Enhancements:**
- Report unresolved references during build (warnings or errors)
- Auto-generate IDs for headings without them
- Support for heading text-based references (slower, less reliable)
- Cross-reference statistics (which chapters reference which sections)
- Visual cross-reference graph
- Dead link detection (references that don't exist)

## Troubleshooting

### Warning: "Could not find </header> or </body> tags"

This warning appears when processing backmatter files that don't have proper HTML structure. The build still completes successfully - it means the `extractContent()` function couldn't find the boundary markers, so it returns the full content as-is.

**Not a problem** - the cross-reference fixing still works on all content.

### References not being converted

Check:
1. **Does the heading exist?** Look in `header-mapping.json` for the heading ID
2. **Is it in another chapter?** The mapping shows which chapter contains each heading
3. **Is it a special reference?** Footnotes (`#fn*`), bibliography (`#ref-*`), and chapter links (`#ch:*`) are handled separately

### Heading IDs have special characters

The regex pattern `/<h([234])\s+[^>]*id="([^"]+)"/` will capture any ID string. Common issues:
- IDs with spaces: Won't match (invalid HTML ID)
- IDs with special characters: Should match if valid per HTML spec
- Multiple IDs on same element: Only first is captured (HTML limitation)

## Examples

### Example 1: Cross-Chapter Reference

**Source (variants.html):**
```html
<p>As we saw in <a href="#statement-of-the-problem">Statement of the Problem</a>...</p>
```

**Processing:**
1. Header mapping shows `statement-of-the-problem` exists in `dpws.html`
2. Reference is in `variants.html` (different chapter)
3. Converting...

**Output (dist/chapters/variants.html):**
```html
<p>As we saw in <a href="dpws.html#statement-of-the-problem">Statement of the Problem</a>...</p>
```

### Example 2: Same-Chapter Reference

**Source (dpws.html):**
```html
<li><a href="#statement-of-the-problem">Statement of the Problem</a></li>
```

**Processing:**
1. Header mapping shows `statement-of-the-problem` exists in `dpws.html`
2. Reference is also in `dpws.html` (same chapter)
3. No conversion needed

**Output (dist/chapters/dpws.html):**
```html
<li><a href="#statement-of-the-problem">Statement of the Problem</a></li>
```
(unchanged)

### Example 3: Chapter Reference

**Source (introduction.html):**
```html
<a href="#ch:dpws">Direct PWS chapter</a>
```

**Processing:**
1. Chapter reference detected (`#ch:dpws`)
2. `dpws` chapter found in manifest
3. Converting...

**Output (dist/chapters/introduction.html):**
```html
<a href="dpws.html#ch:dpws">Direct PWS chapter</a>
```

## See Also

- [BUILD.md](BUILD.md) - Build system documentation
- [chapters-manifest.json](chapters-manifest.json) - Chapter metadata
- [header-mapping.json](header-mapping.json) - Generated mapping (created by build)
- [cross-reference-analysis.json](cross-reference-analysis.json) - Generated analysis (created by build)
