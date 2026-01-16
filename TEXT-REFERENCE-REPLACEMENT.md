# Text-Based Reference Replacement System

Your build system now automatically replaces all text-based section and chapter references with their actual numbers. This means your source chapters can use human-readable reference IDs, and the build output automatically converts them to professional, properly formatted numbers.

## What Gets Replaced

### 1. Bare Chapter IDs
**Source:** `<a href="#ch:dpws">dpws</a>`  
**Output:** `<a href="#ch:dpws">2</a>`  
**Context:** "Chapters 2, 3 and 4 of this thesis..." (reads naturally)

### 2. Chapter References with Prefix
**Source:** `<a href="#ch:dpws">Ch. dpws</a>`  
**Output:** `<a href="#ch:dpws">Ch. 2</a>`  
**Context:** "In Ch. 2 we introduce..." (formal style)

### 3. Section References
**Source:** `<a href="#sec:smc">Sec. smc</a>`  
**Output:** `<a href="#sec:smc">Sec. 3</a>`  
**Context:** "As shown in Sec. 3, the..." (technical style)

### 4. Cross-Chapter Section References
**Source:** `<a href="mlpws.html#sec:ml_variational">Sec. ml_variational</a>`  
**Output:** `<a href="mlpws.html#sec:ml_variational">Sec. 2.4 (ML-PWS: Quantifying Information Transmission Using Neural Networks)</a>`  
**Context:** Includes target chapter name for clarity

## How It Works

The `replaceTextReferences()` function:

1. **Scans all anchor links** in chapter content
2. **Identifies the href ID** (the authoritative reference)
3. **Looks up in header mapping** to find section number or chapter number
4. **Intelligently replaces link text**:
   - Bare chapter IDs → just the number
   - "Ch. chapter-id" → "Ch. number"
   - "Sec. section-id" → "Sec. number" (with chapter context if cross-chapter)

## Smart Reference Handling

The system intelligently handles different reference types:

| Reference Type | Pattern | Action |
|---|---|---|
| Bare chapter ID | `<a href="#ch:xxx">dpws</a>` | → `2` |
| "Ch." prefix | `<a href="#ch:xxx">Ch. dpws</a>` | → `Ch. 2` |
| "Sec." prefix | `<a href="#sec:xxx">Sec. xxx</a>` | → `Sec. 1.2` |
| Cross-chapter section | `<a href="ch2.html#sec:xxx">Sec. xxx</a>` | → `Sec. 1.2 (Ch Name)` |
| Footnotes | `<a href="#fn1">...</a>` | Leave unchanged |
| Bibliography | `<a href="#ref-xyz">...</a>` | Leave unchanged |
| Equations | `<a href="#eq:xyz">...</a>` | Leave unchanged |
| Figures | `<a href="#fig:xyz">...</a>` | Leave unchanged |
| TOC links | Links with `id="toc-..."` | Leave unchanged |
| Already enriched | Links starting with `§` | Leave unchanged |

## Examples from Your Thesis

### Example 1: Bare Chapter References
**Before:**
```html
<p>The remainder of this thesis is divided into 5 chapters. 
Chapters <a href="#ch:dpws">dpws</a>, <a href="#ch:variants">variants</a> 
and <a href="#ch:chemotaxis">chemotaxis</a> of this thesis have been published...</p>
```

**After:**
```html
<p>The remainder of this thesis is divided into 5 chapters. 
Chapters <a href="#ch:dpws">2</a>, <a href="#ch:variants">3</a> 
and <a href="#ch:chemotaxis">4</a> of this thesis have been published...</p>
```

### Example 2: Prefixed Chapter References
**Before:**
```html
<p>In <a href="dpws.html#ch:dpws">Ch. dpws</a> we introduce Direct PWS</p>
```

**After:**
```html
<p>In <a href="dpws.html#ch:dpws">Ch. 2</a> we introduce Direct PWS</p>
```

### Example 3: Section References
**Before:**
```html
<p>Specifically, in <a href="#sec:smc">Sec. smc</a> we present RR-PWS</p>
```

**After:**
```html
<p>Specifically, in <a href="#sec:smc">Sec. 3</a> we present RR-PWS</p>
```

### Example 4: Cross-Chapter Section References
**Before:**
```html
<p>This method is discussed in <a href="mlpws.html#sec:ml_discussion">Sec. ml_discussion</a></p>
```

**After:**
```html
<p>This method is discussed in <a href="mlpws.html#sec:ml_discussion">Sec. 4 (ML-PWS: Quantifying Information Transmission Using Neural Networks)</a></p>
```

## Writing Source Chapters

Use semantic, readable reference IDs in your source:

```html
<!-- dpws.html source -->
<p>As we showed in <a href="#sec:algorithm">Sec. algorithm</a>, 
the method is efficient.</p>

<!-- variants.html source -->
<p>In <a href="dpws.html#ch:dpws">Ch. dpws</a> we introduced Direct PWS, 
but there are <a href="#sec:smc">Sec. smc</a> improvements.</p>

<!-- introduction.html source -->
<p>The key chapters are <a href="dpws.html#ch:dpws">dpws</a> and 
<a href="variants.html#ch:variants">variants</a>.</p>
```

## Build Output

Run: `npm run build`

Your source references are automatically converted to professional numbers in `dist/`:

```html
<!-- dpws.html output -->
<p>As we showed in <a href="#sec:algorithm">Sec. 2.2</a>, 
the method is efficient.</p>

<!-- variants.html output -->
<p>In <a href="dpws.html#ch:dpws">Ch. 2</a> we introduced Direct PWS, 
but there are <a href="#sec:smc">Sec. 3</a> improvements.</p>

<!-- introduction.html output -->
<p>The key chapters are <a href="dpws.html#ch:dpws">2</a> and 
<a href="variants.html#ch:variants">3</a>.</p>
```

## Statistics from Your Thesis

Text references automatically updated:

- **Bare chapter references:** 9 instances (e.g., "dpws" → "2")
- **Prefixed chapter references:** 41 instances (e.g., "Ch. dpws" → "Ch. 2")
- **Section references:** 29 instances (e.g., "Sec. smc" → "Sec. 3")
- **Cross-chapter references:** 5 instances (with added chapter context)

**Total: 84 automatic replacements** on every build!

## Key Features

✓ **Automatic Updates:** Change content, run build, all numbers update  
✓ **Zero Manual Maintenance:** No hardcoded numbers in source  
✓ **Context Preservation:** Bare IDs, "Ch.", "Sec." all handled correctly  
✓ **Cross-Chapter Awareness:** Automatically adds chapter context when needed  
✓ **Smart Skipping:** Special references (footnotes, figures) left unchanged  
✓ **Natural Language:** Bare chapter IDs produce natural reading flow  
✓ **Professional Format:** "Ch. 2", "Sec. 3.1" in formal contexts  

## Technical Implementation

The system uses two data sources:

1. **Header Mapping** (`header-mapping.json`) - Maps section IDs to numbers
2. **Chapter Manifest** (`chapters-manifest.json`) - Maps chapter IDs to numbers

The `replaceTextReferences()` function:
- Uses href ID as authoritative source
- Looks up in current chapter mapping first, then searches other chapters
- Formats output based on link text context (bare vs. prefixed)
- Handles cross-chapter context by including chapter name

## Integration with Build System

Reference replacement happens in this order:

1. **Extract content** from source chapter
2. **Replace text references** (this function) - Updates "Sec. xxx", "Ch. xxx", bare IDs
3. **Fix cross-references** - Updates href attributes to point to correct files
4. **Enrich references** - Adds section symbols (§) to enriched links
5. **Inject templates** - Add header/footer/navigation
6. **Write to dist/**

This order ensures all three systems work together perfectly.

## Limitations

- Processes only anchor link text
- References must point to mapped sections/chapters
- Changes all matching link text (no selective preservation)
- Section/chapter must exist in mapping to be replaced

## Future Enhancements

- Preserve custom link text while appending numbers
- Generate "See also" cross-references
- Create dynamic reference index
- Export to PDF with bookmarks
- Generate hyperlinked outline

## Debugging

If a reference isn't being replaced:

1. **Check href ID exists:** Does it match a section or chapter ID?
2. **Verify mapping:** Is it in `header-mapping.json` or `chapters-manifest.json`?
3. **Check skip conditions:** Is it fn, ref, eq, fig, toc, or §?
4. **Verify chapter:** Is the reference in the correct chapter?

## See Also

- [SECTION-NUMBERING.md](SECTION-NUMBERING.md) - Section numbering details
- [HEADER-MAPPING.md](HEADER-MAPPING.md) - Header mapping system
- [header-mapping.json](header-mapping.json) - Full mapping reference
- [chapters-manifest.json](chapters-manifest.json) - Chapter metadata
