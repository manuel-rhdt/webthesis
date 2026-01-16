# Section Numbering System

Your thesis now has an automatic section numbering system that assigns beautiful section numbers to all headings and enriches references with these numbers.

## How It Works

### Numbering Hierarchy

The system automatically generates hierarchical section numbers:

```
Chapter: dpws (Path Weight Sampling)
├── §1 Introduction (h2)
├── §2 Monte Carlo Estimate of the Mutual Information (h2)
│   ├── §2.1 Statement of the Problem (h3)
│   ├── §2.2 Direct PWS (h3)
│   │   └── §2.2.1 Driven Markov Jump Process (h4)
│   └── §2.3 Input Statistics (h3)
├── §3 Integrating Out Internal Components (h2)
├── §4 Dealing with Feedback (h2)
│   ├── §4.1 Computing the Mutual Information with Feedback... (h3)
│   └── §4.2 Marginalization Integrals for Systems with Feedback (h3)
├── §5 Discussion (h2)
└── §6 References (h2)
```

### Numbering Rules

- **H2 headings** (major sections): Get top-level numbers (1, 2, 3, ...)
- **H3 headings** (subsections): Get two-level numbers (1.1, 1.2, 2.1, 2.2, ...)
- **H4 headings** (sub-subsections): Get three-level numbers (1.1.1, 2.1.2, ...)

**Section counters reset properly:**
- When moving from h2 to h2, h3 and h4 counters reset
- When moving from h3 to h3, h4 counter resets
- H4 counter increments within the same h3

### The Beautiful Section Symbol

All section numbers use the traditional section symbol: **§**

Examples:
- §1 Introduction
- §2.1 Statement of the Problem
- §2.2.1 Driven Markov Jump Process

## Generated Data

### header-mapping.json

Each heading now includes:

```json
{
  "heading-id": {
    "text": "Heading Text",
    "level": 2,
    "chapterFile": "chapter.html",
    "chapterId": "chapter",
    "chapterTitle": "Chapter Title",
    "sectionNumber": "1.2.3",    // ← NEW: Hierarchical section number
    "displayText": "§1.2.3"       // ← NEW: Beautiful section symbol with number
  }
}
```

This file serves as the central reference for all section numbers across the thesis.

## Reference Enrichment

### Where Section Numbers Appear

1. **Table of Contents Links** - TOC links in each chapter now display section numbers:
   ```html
   <li><a href="#path-weight-sampling">§1 Introduction</a></li>
   <li><a href="#statement-of-the-problem">§2.1 Statement of the Problem</a></li>
   <li><a href="#direct-pws">§2.2 Direct PWS</a></li>
   ```

2. **Heading Anchors** - When heading links are found in the text, they get enriched:
   ```html
   <!-- Before -->
   <a href="#heading-id">Link text</a>
   
   <!-- After -->
   <a href="#heading-id">§2.1 Link text</a>
   ```

### Smart Reference Handling

The system intelligently handles different types of references:

- **Chapter references** (`#ch:dpws`): Not modified (handled separately)
- **Footnote references** (`#fn1`): Not modified (special semantic)
- **Bibliography references** (`#ref-citation-key`): Not modified (special semantic)
- **TOC links** (`id="toc-..."`): Enriched with section numbers
- **Body heading links**: Enriched if the heading is found in the mapping

### Cross-Chapter References

When a link points to a heading in another chapter:

```html
<!-- Source in variants.html -->
<a href="#statement-of-the-problem">See the problem statement</a>

<!-- Becomes in dist/variants.html -->
<a href="dpws.html#statement-of-the-problem">§2.1 See the problem statement</a>
```

The reference is enriched with:
1. The correct chapter file (`dpws.html`)
2. The section number of the target heading (`§2.1`)

## Statistics

Your thesis section numbering:

| Chapter | h2 Count | h3 Count | h4 Count | Range |
|---------|----------|----------|----------|-------|
| introduction | 3 | 0 | 0 | §1 – §3 |
| dpws | 6 | 6 | 1 | §1 – §6.2.1 |
| variants | 5 | 4 | 0 | §1 – §5 |
| chemotaxis | 5 | 4 | 2 | §1 – §5.4.2 |
| lna_vs_pws | 5 | 4 | 2 | §1 – §5.3.2 |
| mlpws | 5 | 4 | 2 | §1 – §5.3.2 |
| appendix | 2 | 2 | 0 | §1 – §2.2 |
| summary | 2 | 0 | 0 | §1 – §2 |
| publications | 1 | 0 | 0 | §1 |
| acknowledgments | 1 | 0 | 0 | §1 |
| about-the-author | 1 | 0 | 0 | §1 |

**Total: 37 h2 + 32 h3 + 12 h4 = 81 headings across 11 chapters**

## Code Implementation

### Section Number Generation

In `build.js`, the `buildHeaderMapping()` function:

1. Iterates through all chapters in order
2. For each chapter, tracks h2, h3, h4 counters
3. Extracts all heading elements using regex
4. Assigns section numbers based on heading level and counter state
5. Stores both `sectionNumber` (numeric) and `displayText` (with § symbol)

```javascript
let h2Counter = 0;
let h3Counter = 0;
let h4Counter = 0;

if (level === 2) {
  h2Counter++;
  h3Counter = 0;
  h4Counter = 0;
  sectionNumber = String(h2Counter);
} else if (level === 3) {
  h3Counter++;
  h4Counter = 0;
  sectionNumber = `${lastH2}.${h3Counter}`;
} else if (level === 4) {
  h4Counter++;
  sectionNumber = `${lastH2}.${h3Counter}.${h4Counter}`;
}
```

### Reference Enrichment

The `fixCrossReferences()` function:

1. Processes all `<a>` tags with `href="#..."` attributes
2. Looks up each heading ID in the header mapping
3. Finds the section number if the heading exists
4. Prepends the section symbol and number to link text
5. Updates href to include chapter file if cross-chapter

```javascript
content = content.replace(
  /<a\s+href="#([a-z0-9\-_]+)"([^>]*)>([^<]+)<\/a>/g,
  (match, headingId, attrs, linkText) => {
    if (headerInfo && targetChapterId) {
      const enrichedText = `${headerInfo.displayText} ${linkText}`;
      return `<a ${href}${attrs}>${enrichedText}</a>`;
    }
    return match;
  }
);
```

## Output Examples

### TOC Links in dpws.html

```
§1 Introduction
§2 Monte Carlo Estimate of the Mutual Information
  §2.1 Statement of the Problem
  §2.2 Direct PWS
    §2.2.1 Driven Markov Jump Process
  §2.3 Input Statistics
§3 Integrating Out Internal Components
§4 Dealing with Feedback
  §4.1 Computing the Mutual Information with Feedback...
  §4.2 Marginalization Integrals for Systems with Feedback
§5 Discussion
§6 References
```

### Body Text Reference

```html
In <a href="variants.html#statement-of-the-problem">
  §2.1 statement of the problem
</a> we showed that...
```

Renders as: "In §2.1 statement of the problem we showed that..."

## Benefits

1. **Professional appearance** - Uses traditional academic section symbol (§)
2. **Quick navigation** - Section numbers make it easy to reference specific parts
3. **Cross-document consistency** - All references include the same beautiful formatting
4. **Accessibility** - Section numbers in link text improve semantic meaning
5. **Print-friendly** - Section numbers work well in print and PDF formats
6. **Automatic generation** - No manual numbering needed, build system handles it

## Limitations & Future Enhancements

**Current:**
- Only h2, h3, h4 are numbered
- Requires `id` attribute on headings
- Applied during build time

**Future possibilities:**
- Display section numbers in actual heading elements (not just links)
- Generate automated outline with section numbers
- Create index of all section numbers
- Support for h1 and h5 if needed
- Generate QR codes for section links
- Export section numbering to JSON API

## Editing & Rebuilding

When you edit chapter content:

1. The section numbers are **automatically regenerated** on build
2. References are **automatically enriched** with new numbers
3. Cross-chapter links maintain correct numbering

Just run: `npm run build`

All section numbers and reference enrichments update automatically!

## See Also

- [HEADER-MAPPING.md](HEADER-MAPPING.md) - Detailed header mapping system
- [header-mapping.json](header-mapping.json) - Full section number data
- [cross-reference-analysis.json](cross-reference-analysis.json) - Section statistics
