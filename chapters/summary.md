---
bibliography: references.bib
csl: american-physics-society.csl
license: CC-BY-4.0
link-citations: true
reference-section-title: References
---

# Summary {.unnumbered}

Understanding and quantifying information transmission is crucial for
improving and analyzing biological and engineered systems. Most, if not
all, information-processing systems process signals that vary in time
and generally information is not just contained in the instantaneous
values of these signals, but also in their temporal characteristics.
Quantifying information transmitted via time-varying signals thus
requires the mutual information between input and output signals as a
function of time, i.e., between the input and output trajectories.
Moreover, the trajectory mutual information is needed for calculating
the key performance measure of information processing---the mutual
information rate---quantifying the amount of information transmitted per
unit time. Yet, computing the mutual information between trajectories is
notoriously difficult due to the high dimensionality of trajectory
space. The curse of dimensionality makes traditional non-parametric
information estimates infeasible, so existing methods for computing the
mutual information between trajectories rely on approximations or
simplifying assumptions.

This thesis introduces Path Weight Sampling (PWS), a novel Monte Carlo
framework for exactly calculating the trajectory mutual information for
any system described by a dynamical stochastic model. The principal idea
is to use the stochastic model to evaluate the exact conditional
probability of an individual output trajectory, for a given input
trajectory, and to compute the marginal probability for the same output
trajectory via a Monte Carlo marginalization in trajectory space. By
averaging the log-ratio of these probabilities over many stochastic
realizations of the system, we obtain an unbiased estimate of the
trajectory mutual information. Moreover, PWS also makes it possible to
compute the mutual information between input and output trajectories for
systems with hidden internal states as well as systems with feedback
from output to input. In this thesis, we present three variants of PWS,
which all compute the conditional probability in the same way but differ
in the way the marginal output probability is obtained.

In **[@sec-dpws]**, we present Direct PWS, the simplest variant of PWS
which computes the marginal output probability as a brute-force average
over the conditional trajectory probabilities. While this scheme is
feasible for simple systems, the direct Monte Carlo averaging procedure
becomes more difficult for larger systems and exponentially harder for
longer trajectories.

Our second and third variants of PWS are based on the realization that
computing the marginal trajectory probability for a stochastic model is
equivalent to computing the partition function in statistical physics.
These schemes leverage techniques for computing free energies from
statistical physics. In **[@sec-variants]**, we first introduce
Rosenbluth-Rosenbluth PWS (RR-PWS) which exploits the analogy between
signal trajectory sampling and polymer sampling, and is based on
efficient techniques for computing the (excess) chemical potential of a
polymer. Secondly, we introduce thermodynamic integration PWS (TI-PWS)
which is based on using MCMC sampling trajectory space to compute the
marginal probability via thermodynamic integration. We apply PWS to a
simple toy model of gene expression, showing that both of these
variants, but especially RR-PWS, significantly improve the performance
of PWS.

To demonstrate the power of PWS and to gain new insights about the
accuracy of biochemical signaling we apply PWS to the bacterial
chemotaxis system, a complex biological information-processing system.
In **[@sec-chemotaxis]**, we build a mechanistic model of chemotaxis
based on previous literature and use PWS with this model to compute the
mutual information rate of a bacterium in a shallow gradient. By
comparing our model against experiments performed by @2021.Mattingly, we
find discrepancies between the model predictions and the experimental
results. We resolve these discrepancies by adapting our literature-based
model, suggesting that in *E. coli* the number of receptor clusters is
much smaller than hitherto believed, while their size is much larger.
Moreover, using the adjusted model we find that in shallow gradients the
mutual information rate computed using PWS closely matches the rate
obtained by @2021.Mattingly via a Gaussian approximation, justifying
their use of the approximation *a posteriori*.

The Gaussian approximation for the mutual information rate is widely
used in practice, yet it relies on assumptions of linear dynamics and
additive Gaussian noise which are often violated in inherently nonlinear
physical or biological systems. To assess the accuracy of the Gaussian
approximation when applied to nonlinear systems we require an exact
method, such as PWS, to provide an accurate benchmark for the trajectory
mutual information. In **[@sec-lna_vs_pws]** we use PWS to systematically
assess the accuracy of the Gaussian approximation through two case
studies: first, a discrete linear system which has near-Gaussian
statistics but leads to a surprisingly large error in the Gaussian
information rate; and second, a continuous diffusive system with a
nonlinear transfer function, allowing us to quantify the error of the
Gaussian approximation as nonlinearity increases. These findings
highlight key instances where the Gaussian approximation fails and exact
methods like PWS become essential.

While PWS does not suffer from the limitations of the Gaussian
approximation, it requires a stochastic model of the system of interest,
which is often unavailable. In **[@sec-ml-pws]** we leverage recent
advances in machine learning to learn a data-driven stochastic model
directly from experimental time-series data and use PWS with the
resulting model to compute the trajectory mutual information. This
approach, which we call ML-PWS, makes it possible to compute the mutual
information rate of nonlinear systems, even in the absence of a known
mechanistic or phenomenological model. We demonstrate that ML-PWS can
yield highly accurate mutual information estimates purely from data,
outperforming the Gaussian approximation for nonlinear systems.
