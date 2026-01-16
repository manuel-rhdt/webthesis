/**
 * Test fixtures for build system tests
 * Provides sample HTML content, manifest data, and expected outputs
 */

// Mock manifest data
const mockManifest = {
  chapters: [
    {
      id: "introduction",
      number: 1,
      title: "Introduction",
      section: "chapters"
    },
    {
      id: "dpws",
      number: 2,
      title: "Path Weight Sampling",
      section: "chapters"
    },
    {
      id: "variants",
      number: 3,
      title: "More Efficient Variants of PWS",
      section: "chapters"
    },
    {
      id: "lna_vs_pws",
      refId: "lna_vs_pws",
      number: 5,
      title: "The Accuracy of the Gaussian Approximation",
      section: "chapters"
    },
    {
      id: "mlpws",
      refId: "ml-pws",
      number: 6,
      title: "ML-PWS: Quantifying Information Transmission",
      section: "chapters"
    }
  ]
};

// Sample HTML chapter content with various header configurations
const sampleChapterDpws = `
<h2 id="ch:dpws" id="path-weight-sampling">Path Weight Sampling</h2>
<p>Introduction text.</p>

<h3 id="sec:importance">The Importance of Sampling</h3>
<p>This section discusses sampling methods.</p>

<h4 id="sec:basic-approach">Basic Approach</h4>
<p>Here we describe the basic approach.</p>

<h3 id="sec:algorithm">The Algorithm</h3>
<p>This section describes the algorithm.</p>

<h4 id="sec:implementation">Implementation Details</h4>
<p>Implementation information.</p>
`;

const sampleChapterVariants = `
<h2 id="ch:variants" id="efficient-variants">More Efficient Variants</h2>
<p>This chapter discusses variants.</p>

<h3 id="sec:faster-method">Faster Method</h3>
<p>This section describes a faster approach.</p>

<h4 id="sec:complexity">Time Complexity</h4>
<p>Complexity analysis.</p>

<h3 id="sec:comparison">Comparison with Original</h3>
<p>We compare methods here.</p>
`;

const sampleChapterWithCrossReferences = `
<h2 id="ch:lna_vs_pws" id="accuracy">The Accuracy of the Gaussian Approximation</h2>
<p>As mentioned in <a href="#sec:importance">Sec. importance</a>, sampling is crucial.</p>
<p>See <a href="#ch:dpws">Chapter dpws</a> for more details.</p>
<p>More information is in <a href="#sec:algorithm">Section sec:algorithm</a>.</p>
<p>Cross-chapter reference: <a href="#sec:faster-method">cross reference</a>.</p>
`;

const sampleChapterWithPrefixedReferences = `
<h2 id="ch:mlpws" id="neural-networks">ML-PWS</h2>
<p>According to <a href="#sec:importance">Sec. sec:importance</a> in the previous chapter.</p>
<p>We reference <a href="#ch:dpws">Chapter dpws</a> extensively.</p>
<p>See <a href="#sec:algorithm">Sec. sec:algorithm</a> for technical details.</p>
`;

// Expected header mapping output for dpws chapter
const expectedHeaderMappingDpws = {
  'ch:dpws': {
    text: 'Path Weight Sampling',
    level: 2,
    chapterFile: 'dpws.html',
    chapterId: 'dpws',
    chapterTitle: 'Path Weight Sampling',
    sectionNumber: '1',
  },
  'path-weight-sampling': {
    text: 'Path Weight Sampling',
    level: 2,
    chapterFile: 'dpws.html',
    chapterId: 'dpws',
    chapterTitle: 'Path Weight Sampling',
    sectionNumber: '1',
  },
  'sec:importance': {
    text: 'The Importance of Sampling',
    level: 3,
    chapterFile: 'dpws.html',
    chapterId: 'dpws',
    chapterTitle: 'Path Weight Sampling',
    sectionNumber: '1.1',
  },
  'sec:basic-approach': {
    text: 'Basic Approach',
    level: 4,
    chapterFile: 'dpws.html',
    chapterId: 'dpws',
    chapterTitle: 'Path Weight Sampling',
    sectionNumber: '1.1.1',
  },
  'sec:algorithm': {
    text: 'The Algorithm',
    level: 3,
    chapterFile: 'dpws.html',
    chapterId: 'dpws',
    chapterTitle: 'Path Weight Sampling',
    sectionNumber: '1.2',
  },
  'sec:implementation': {
    text: 'Implementation Details',
    level: 4,
    chapterFile: 'dpws.html',
    chapterId: 'dpws',
    chapterTitle: 'Path Weight Sampling',
    sectionNumber: '1.2.1',
  }
};

// Expected header mapping for variants chapter
const expectedHeaderMappingVariants = {
  'ch:variants': {
    text: 'More Efficient Variants',
    level: 2,
    chapterFile: 'variants.html',
    chapterId: 'variants',
    chapterTitle: 'More Efficient Variants of PWS',
    sectionNumber: '1',
  },
  'efficient-variants': {
    text: 'More Efficient Variants',
    level: 2,
    chapterFile: 'variants.html',
    chapterId: 'variants',
    chapterTitle: 'More Efficient Variants of PWS',
    sectionNumber: '1',
  },
  'sec:faster-method': {
    text: 'Faster Method',
    level: 3,
    chapterFile: 'variants.html',
    chapterId: 'variants',
    chapterTitle: 'More Efficient Variants of PWS',
    sectionNumber: '1.1',
  },
  'sec:complexity': {
    text: 'Time Complexity',
    level: 4,
    chapterFile: 'variants.html',
    chapterId: 'variants',
    chapterTitle: 'More Efficient Variants of PWS',
    sectionNumber: '1.1.1',
  },
  'sec:comparison': {
    text: 'Comparison with Original',
    level: 3,
    chapterFile: 'variants.html',
    chapterId: 'variants',
    chapterTitle: 'More Efficient Variants of PWS',
    sectionNumber: '1.2',
  }
};

// Expected header mapping for lna_vs_pws chapter
const expectedHeaderMappingLnaPws = {
  'ch:lna_vs_pws': {
    text: 'The Accuracy of the Gaussian Approximation',
    level: 2,
    chapterFile: 'lna_vs_pws.html',
    chapterId: 'lna_vs_pws',
    chapterTitle: 'The Accuracy of the Gaussian Approximation',
    sectionNumber: '1',
  }
};

// Combined header mapping (simulating multiple chapters)
const combinedHeaderMapping = {
  dpws: expectedHeaderMappingDpws,
  variants: expectedHeaderMappingVariants,
  lna_vs_pws: expectedHeaderMappingLnaPws
};

module.exports = {
  mockManifest,
  sampleChapterDpws,
  sampleChapterVariants,
  sampleChapterWithCrossReferences,
  sampleChapterWithPrefixedReferences,
  expectedHeaderMappingDpws,
  expectedHeaderMappingVariants,
  combinedHeaderMapping
};
