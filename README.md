# Quantifying the Flow of Information

This repository contains a web version of my PhD thesis, converted from the original LaTeX source using [Quarto](https://quarto.org/). The web format is easier to read, especially on mobile devices.

📖 **[Read the thesis online](https://manuel-rhdt.github.io/webthesis/)** · 📄 **[Download PDF](https://manuel-rhdt.github.io/webthesis/Quantifying-the-Flow-of-Information.pdf)** (9.5 MB)

## About

How do living cells information? Which parts of signals carry information? This thesis develops **Path Weight Sampling (PWS)**, a novel Monte Carlo technique that—for the first time—makes it possible to compute the mutual information between input and output trajectories *exactly* for any stochastic system.

The key idea is to use the master equation or the Onsager-Machlup functional to evaluate the exact conditional probability of an individual output trajectory for a given input trajectory, and to average this via Monte Carlo sampling in trajectory space. By establishing connections between information theory and statistical physics (such as path probabilities and partition functions), we leverage techniques from soft condensed-matter physics to make this computation efficient.

In the thesis, we also demonstrate the practical utility PWS by applying it to bacterial chemotaxis, one of the best-characterized signaling systems in biology.

## Contents

| Chapter | Title | Summary |
|---------|-------|---------|
| 1 | [Introduction](https://manuel-rhdt.github.io/webthesis/chapters/01-introduction.html) | Background on information theory and the challenge of computing mutual information for time-varying signals. |
| 2 | [Path Weight Sampling](https://manuel-rhdt.github.io/webthesis/chapters/02-path-weight-sampling.html) | The core PWS algorithm: using master equations to compute exact trajectory probabilities via Monte Carlo sampling. |
| 3 | [More Efficient Variants of PWS](https://manuel-rhdt.github.io/webthesis/chapters/03-variants.html) | Rosenbluth-Rosenbluth PWS and thermodynamic integration PWS for improved computational efficiency. |
| 4 | [Application—Bacterial Chemotaxis](https://manuel-rhdt.github.io/webthesis/chapters/04-chemotaxis.html) | Applying PWS to *E. coli* chemotaxis, a system of 182 coupled reactions, and resolving discrepancies with experimental data. |
| 5 | [The Accuracy of the Gaussian Approximation](https://manuel-rhdt.github.io/webthesis/chapters/05-gaussian.html) | Assessing when the widely-used linear noise approximation breaks down for non-Gaussian systems. |
| 6 | [ML-PWS](https://manuel-rhdt.github.io/webthesis/chapters/06-mlpws.html) | Combining PWS with neural networks to estimate information rates from empirical data. |

## Software

The methods developed in this thesis are implemented in a Julia package:

**[PathWeightSampling.jl](https://github.com/manuel-rhdt/PathWeightSampling.jl)**

## Related Publications

- <ins>M. Reinhardt</ins>, G. Tkačik, and P. R. ten Wolde, *Path Weight Sampling: Exact Monte Carlo Computation of the Mutual Information between Stochastic Trajectories*, Phys. Rev. X **13**, 041017 (2023). [DOI: 10.1103/PhysRevX.13.041017](https://doi.org/10.1103/PhysRevX.13.041017)

- <ins>M. Reinhardt</ins>, A. J. Tjalma, A.-L. Moor, C. Zechner, and P. R. ten Wolde, *Mutual Information Rate — Linear Noise Approximation and Exact Computation*, arXiv:2508.21220 (2025). [arXiv](https://arxiv.org/abs/2508.21220)

- <ins>M. Reinhardt</ins>, G. Tkačik, and P. R. ten Wolde, *ML-PWS: Estimating the Mutual Information Between Experimental Time Series Using Neural Networks*, arXiv:2508.16509 (2025). [arXiv](https://arxiv.org/abs/2508.16509)

- A.-L. Moor, A. Tjalma, <ins>M. Reinhardt</ins>, P. R. ten Wolde, and C. Zechner, *State- versus Reaction-Based Information Processing in Biochemical Networks*, arXiv:2505.13373 (2025). [arXiv](https://arxiv.org/abs/2505.13373)

## Acknowledgments

This research was conducted between 2019 and 2025 in the [Biochemical Networks group](https://amolf.nl/research-groups/biochemical-networks) of Pieter Rein ten Wolde at [AMOLF](https://amolf.nl), Amsterdam.

Funding from the Dutch Research Council ([NWO](https://nwo.nl)) and the European Research Council (ERC).

## Citation

If you use this thesis in your work, please cite:

> Reinhardt, M. J. (2025). *Quantifying the Flow of Information.* PhD Thesis, Vrije Universiteit Amsterdam. [https://doi.org/10.5463/thesis.1092](https://doi.org/10.5463/thesis.1092)

BibTeX:
```bibtex
@phdthesis{reinhardt2025quantifying,
  author = {Reinhardt, Manuel},
  title = {Quantifying the Flow of Information},
  school = {Vrije Universiteit Amsterdam},
  year = {2025},
  doi = {10.5463/thesis.1092}
}
```

## Building

The site is built with [Quarto](https://quarto.org/) (`quarto render`) and deployed by the GitHub Actions workflow in `.github/workflows/build-and-deploy.yml`. After rendering, `scripts/formel-math.mjs` replaces every MathML equation with an SVG rendered by [formel](https://github.com/manuel-rhdt/formel), written once per distinct equation to `_book/math/`. Function names (`\sin`, `\ln`, `\lim`, `\operatorname{…}`) come out of pandoc as bare `<mo>` elements, which carry no operator-dictionary entry; the script rewrites them into `<mi>` followed by U+2061 FUNCTION APPLICATION so that formel spaces them the way TeX does (no space before the name, a thin space before the argument, none before an opening fence). The equations are therefore vector outlines and do not depend on the math fonts installed on the reader's machine; the trade-off is that they are no longer selectable text (the speech label formel puts in each SVG is used as the image's `alt` text). The formel build is pinned in `.github/formel-checksums.txt`.

## License

This work is licensed under a [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

## Contact

Manuel Reinhardt — [mail@manuel-rhdt.de](mailto:mail@manuel-rhdt.de)
