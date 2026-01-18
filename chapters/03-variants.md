---
license: CC-BY-4.0
csl: ../american-physics-society.csl
link-citations: true
reference-section-title: References
---

# More Efficient Variants of PWS {#sec-variants}

> In the previous chapter, we introduced Path Weight Sampling (PWS), a
> computational approach capable of providing exact information rate
> estimates for any stochastic system. However, the direct
> implementation of PWS becomes inefficient for complex systems and long
> trajectories due to the high dimensionality of trajectory space. To
> overcome these limitations, we present two improved PWS variants in
> this chapter, inspired by free-energy estimation techniques from
> statistical physics. First, Rosenbluth-Rosenbluth PWS (RR-PWS)
> leverages computational strategies developed for polymer chemical
> potential calculations, enhancing efficiency for sampling in
> trajectory spaces. Second, Thermodynamic Integration PWS (TI-PWS)
> applies thermodynamic integration combined with trajectory space MCMC
> sampling, inspired by transition path sampling. We benchmark these
> methods using a simple coupled birth-death model, comparing the
> effectiveness of all three PWS variants against analytical results and
> the Gaussian approximation.

## Introduction

[^1]

To quantify information transmission, be it in a natural or engineered
information processing system, we need to be able to compute the mutual
information between input and output trajectories, from which the
information transmission rate can be obtained. However, because of the
high dimensionality of the trajectory space, computing the mutual
information between trajectories is exceedingly difficult, if not
impossible, because the conventional non-parametric binning approach to
estimate the required trajectory probability distributions cannot be
used. Indeed, except for very simple models, the mutual information
between trajectories is typically computed using approximations that are
often uncontrolled. In the previous chapter, we introduced a
computational scheme called Path Weight Sampling (PWS), which, for the
first time, makes it possible to compute the information rate exactly,
for any stochastic system.

Yet, the scheme presented in that chapter, Direct PWS, becomes
inefficient for more complex systems and longer trajectories. The reason
is that the number of possible trajectories increases exponentially with
trajectory length, leading to a corresponding increase in the variance
of the estimate. Hence, for long trajectories the PWS estimate may prove
to be computationally infeasible. To address this issue, we describe two
improved variants of PWS in this section, both based on free-energy
estimators from statistical physics.

Specifically, in [@sec-smc] we present *Rosenbluth-Rosenbluth PWS*
(RR-PWS) which exploits the observation that the computation of
$\mathcal{P}[\mathbfit{x}]$ is analogous to the calculation of the
(excess) chemical potential of a polymer, for which efficient methods
have been developed [@1990.Siepmann; @1997.Grassberger; @2002.Frenkel].
In [@sec-thermodynamic-integration], we present *Thermodynamic
Integration PWS* (TI-PWS) which is based on the classic free energy
estimation technique of thermodynamic integration
[@1984.Frenkel; @1998.Gelman; @2001.Neal] in conjunction with a
trajectory space MCMC sampler using ideas from transition path sampling
[@2002.Bolhuis].

In [@sec-pws_variants_benchmark] we apply PWS to a well-known model
system. It consists a simple pair of coupled birth-death processes which
allows us to test the efficiency of the three PWS variants, as well as
to compare the PWS results with analytical results from the Gaussian
approximation [@2009.Tostevin] and the technique by @2019.Duso.

## Marginalizing in Trajectory Space {#sec-marginalization}

PWS evaluates the mutual information $I(\mathcal{S},\mathcal{X})$ from
the marginal entropy $H(\mathcal{X})$ and the conditional entropy
$H(\mathcal{X}|\mathcal{S})$, see [@eq-mutual_information_entropies]. Of
these two entropies, the conditional one can be efficiently computed
using the scheme described in the previous chapter, and as used in DPWS.
However, obtaining the marginal entropy
$H(\mathcal{X}) = - \int \mathcal{D}[\mathbfit{x}]\ \mathcal{P}[\mathbfit{x}] \ln\mathcal{P}[\mathbfit{x}]$
is much more challenging. Indeed, the computationally most expensive
part of Direct PWS is the evaluation of the marginalization integral
$\mathcal{P}[\mathbfit{x}_i]=\int\mathcal{D}[\mathbfit{s}] \mathcal{P}[\mathbfit{s},\mathbfit{x}_i]$
which needs to be performed for every sample
$\mathbfit{x}_1,\ldots,\mathbfit{x}_N$. Consequently, the computational
efficiency of this marginalization is essential for the overall
performance.

Marginalization is a general term to denote an operation where one or
more variables are integrated out of a joint probability distribution.
For instance, we obtain the marginal probability distribution
$\mathcal{P}[\mathbfit{x}]$ from
$\mathcal{P}[\mathbfit{s},\mathbfit{x}]$ by computing the integral


$$\mathcal{P}[\mathbfit{x}] = \int\mathcal{D}[\mathbfit{s}]\ \mathcal{P}[\mathbfit{s},\mathbfit{x}] = \int\mathcal{D}[\mathbfit{s}]\ \mathcal{P}[\mathbfit{s}]\mathcal{P}[\mathbfit{x}|\mathbfit{s}]\,.
    \label{eq-generic-marginalization}$$ {#eq-generic-marginalization}

In DPWS, we use [@eq-marginal-naive] to compute
$\mathcal{P}[\mathbfit{x}]$ which involves generating independent input
trajectories from $\mathcal{P}[\mathbfit{s}]$. However, this this is not
the optimal Monte Carlo technique to perform the marginalization. The
generated input trajectories are independent from the output trajectory
$\mathbfit{x}$. Thus, we ignore the causal connection between
$\mathbfit{s}$ and $\mathbfit{x}$, and we typically end up sampling
trajectories $\mathbfit{s}^\star$ whose likelihoods
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}^\star]$ are very small. Then,
most sampled trajectories have small integral weights, and only very few
samples provide a significant contribution to the average. The variance
of the result is then very large because the effective sample size is
much smaller than the total sample size. The use of
$\mathcal{P}[\mathbfit{s}]$ as the sampling distribution is thus only
practical in cases where the dependence of the output on the input is
not too strong. It follows that this sampling scheme works best when the
mutual information is not too large [^2].

This is a well known Monte Carlo sampling problem and a large number of
techniques have been developed to solve it. The two variants of our
scheme, RR-PWS and TI-PWS, both make use of ideas from statistical
physics for the efficient computation of free energies.

\centering

::: {#tbl-translation}
   $\mathcal{P}[\mathbfit{s},\mathbfit{x}]$                     $e^{-\mathcal{U}[\mathbfit{s}, \mathbfit{x}]}$
  ------------------------------------------ ------------------------------------------------------------------------------------
         $\mathcal{P}[\mathbfit{s}]$               $\frac{1}{\mathcal{Z}_0[\mathbfit{x}]} e^{-\mathcal{U}_0[\mathbfit{s}]}$
   $\mathcal{P}[\mathbfit{s}|\mathbfit{x}]$   $\frac{1}{\mathcal{Z}[\mathbfit{x}]} e^{-\mathcal{U}[\mathbfit{s}, \mathbfit{x}]}$
                     $1$                                                $\mathcal{Z}_0[\mathbfit{x}]$
         $\mathcal{P}[\mathbfit{x}]$                                     $\mathcal{Z}[\mathbfit{x}]$
   $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$                  $e^{-\Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}]}$

  : Translation to the notation of statistical physics. The definitions
  of $\mathcal{U}$ and $\mathcal{U}_0$ that are used here are given in
  [@eq-h0; @eq-h1].
:::

To understand how these ideas can be applied to compute the marginal
probability $\mathcal{P}[\mathbfit{x}]$, it is helpful to rephrase the
marginalization integral in [@eq-generic-marginalization] in the
language of statistical physics. In this language,
$\mathcal{P}[\mathbfit{x}]$ corresponds to the normalization constant,
or partition function, of the Boltzmann distribution for the
potential[^3]


$$\label{eq-h1} \mathcal{U}[\mathbfit{s},\mathbfit{x}] = -\ln\mathcal{P}[\mathbfit{s},\mathbfit{x}] \,.$$ {#eq-h1}

In [@eq-h1], $\mathbfit{s}$ is interpreted as a variable in the
configuration space, while $\mathbfit{x}$ acts as an auxiliary variable,
i.e., a parameter. Note that both $\mathbfit{s}$ and $\mathbfit{x}$
still represent trajectories. For this potential, the partition function
is given by


$$\mathcal{Z}[\mathbfit{x}] = \int\mathcal{D}[\mathbfit{s}]\; e^{-\mathcal{U}[\mathbfit{s},\mathbfit{x}]} \,.
    \label{eq-partition-function}$$ {#eq-partition-function}

The integral only runs over the configuration space, i.e. we integrate
only with respect to $\mathbfit{s}$. By inserting the expression for
$\mathcal{U}[\mathbfit{s},\mathbfit{x}]$, we see that the partition
function is exactly equal to the marginal probability of the output,
i.e. $\mathcal{Z}[\mathbfit{x}] = \mathcal{P}[\mathbfit{x}]$. The free
energy is given by


$$\mathcal{F}[\mathbfit{x}] = -\ln \mathcal{Z}[\mathbfit{x}] = -\ln \mathcal{P}[\mathbfit{x}]\,.
    \label{eq-free-energy}$$ {#eq-free-energy}

In statistical physics it is well known that the free energy cannot be
directly measured from a simulation. Instead, one estimates the
free-energy difference


$$\Delta\mathcal{F}[\mathbfit{x}] = \mathcal{F}[\mathbfit{x}] - \mathcal{F}_0[\mathbfit{x}] = -\ln \frac{\mathcal{Z}[\mathbfit{x}]}{\mathcal{Z}_0[\mathbfit{x}]}
    \label{eq-free-energy-difference}$$ {#eq-free-energy-difference}

between the system and a reference system with known free energy
$\mathcal{F}_0[\mathbfit{x}]$. The reference system can be freely chosen
and is usually defined using a Boltzmann distribution for a convenient
reference potential $\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]$. In our
case, a natural choice of reference potential is


$$\label{eq-h0} \mathcal{U}_0[\mathbfit{s},\mathbfit{x}]=-\ln\mathcal{P}[\mathbfit{s}]$$ {#eq-h0}

with the corresponding partition function being simply

$$\mathcal{Z}_0[\mathbfit{x}]=\int\mathcal{D}[\mathbfit{s}]\ \mathcal{P}[\mathbfit{s}]=1\,.$$

The reference free energy therefore is zero
($\mathcal{F}_0[\mathbfit{x}]=-\ln\mathcal{Z}_0[\mathbfit{x}]=0$).
Hence, the free-energy difference is


$$\Delta\mathcal{F}[\mathbfit{x}]= \mathcal{F}[\mathbfit{x}] = -\ln\mathcal{P}[\mathbfit{x}]\,.
    \label{eq-free-energy-difference-equals-lnp}$$ {#eq-free-energy-difference-equals-lnp}

Note that in our case the reference potential
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]=-\ln\mathcal{P}[\mathbfit{s}]$
does not depend on the output trajectory $\mathbfit{x}$, i.e.
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]\equiv\mathcal{U}_0[\mathbfit{s}]$.
It describes a *non-interacting* version of our input-output system
where the input trajectories evolve independently of the fixed output
trajectory $\mathbfit{x}$.

What is the interaction between the output $\mathbfit{x}$ and the input
trajectory ensemble? We define the interaction potential
$\Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}]$ through


$$\mathcal{U}[\mathbfit{s}, \mathbfit{x}] = \mathcal{U}_0[\mathbfit{s}] + \Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}] \,.
    \label{eq-interaction-potential}$$ {#eq-interaction-potential}

The interaction potential makes it apparent that the distribution of
$\mathbfit{s}$ corresponding to the potential
$\mathcal{U}[\mathbfit{s}, \mathbfit{x}]$ is biased by $\mathbfit{x}$
with respect to the distribution corresponding to the reference
potential $\mathcal{U}_0[\mathbfit{s}]$. By inserting the expressions
for $\mathcal{U}_0[\mathbfit{s}]$ and
$\mathcal{U}[\mathbfit{s}, \mathbfit{x}]$ into
[@eq-interaction-potential] we see that


$$\begin{aligned}
    \Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}] &= -\ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}] \\
    &= -\ln\mathrm{P}(x_0|s_0)-\int^T_0 dt\ \mathcal{L}_t[\mathbfit{s}, \mathbfit{x}]
\end{aligned}
\label{eq-boltzmann-weight}$$ {#eq-boltzmann-weight}

where $\mathcal{L}_t[\mathbfit{s}, \mathbfit{x}]$ is given by
[@eq-log_traj_prob] and can be directly computed from the master
equation. This expression illustrates that the interaction of the output
trajectory $\mathbfit{x}$ with the ensemble of input trajectories is
characterized by the trajectory likelihood
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$.

To summarize, in this section we have introduced notation (see
[@tbl-translation]) showing that computing a marginalization integral is
equivalent to the computation of a free-energy difference. This picture
allows us to distinguish between two ensembles for $\mathbfit{s}$, the
*non-interacting* ensemble distributed according to
$\exp(-\mathcal{U}_0[\mathbfit{s}])=\mathcal{P}[\mathbfit{s}]$, and the
*interacting* ensemble distributed according to
$\exp(-\mathcal{U}[\mathbfit{s},\mathbfit{x}])\propto\mathcal{P}[\mathbfit{s}|\mathbfit{x}]$.
With these notions we can rewrite the brute force estimate in Direct PWS
([@sec-dpws]) as


$$\begin{aligned}
     \mathcal{P}[\mathbfit{x}] = \frac{\mathcal{Z}[\mathbfit{x}]}{\mathcal{Z}_0[\mathbfit{x}]} &= \langle e^{-\Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}]} \rangle_0 
     \label{eq-boltzmann-average}
\end{aligned}$$ {#eq-boltzmann-average}

where the notation $\langle\cdots\rangle_0$ refers to an average with
respect to the non-interacting ensemble. By inserting the expressions
for $\mathcal{U}_0$ and $\Delta\mathcal{U}$, it is easy to verify that
this estimate is equivalent to [@eq-marginal-naive].

The more advanced variants of PWS introduced below leverage the analogy
with statistical physics to improve the efficiency of marginalization.
RR-PWS draws ideas from soft condensed matter simulations by recognizing
that [@eq-free-energy-difference] has the same form as the excess
chemical potential of a polymer for which efficient computation
techniques have been developed [@1990.Siepmann; @1994.Mueller].
Meanwhile, TI-PWS is inspired by Transition Path Sampling (TPS) for
sampling rare trajectories [@2002.Bolhuis] and uses thermodynamic
integration for free-energy estimation.

## RR-PWS {#sec-smc}

![Illustration of one step of the bootstrap particle filter in RR-PWS. We start with a set of trajectories $\mathbfit{s}^k_{[0,i-1]}$ with time span $[\tau_0,\tau_{i-1}]$ (left panel). In the next step we propagate these trajectories forward in time to $\tau_i$, according to $\mathcal{P}[\mathbfit{s}]$ (central panel). Then we resample the trajectories according to the Boltzmann weights of their most recent segments, effectively eliminating or duplicating individual segments. An example outcome of the resampling step is shown in the right panel where the bottom trajectory was duplicated and one of the top trajectories was eliminated. These steps are repeated for each segment, until a set of input trajectories of the desired length is generated. The intermediate resampling steps bias the trajectory distribution from $\mathcal{P}[\mathbfit{s}]$ towards $\mathcal{P}[\mathbfit{s}|\mathbfit{x}]$. ](figures/FigureSMC.svg){#fig-smc}

In Rosenbluth-Rosenbluth PWS we compute the free-energy difference
$\Delta\mathcal{F}$ between the ideal system $\mathcal{U}_0$ and
$\mathcal{U}$ in a *single* simulation just like in the brute force
method. However, instead of generating $\mathbfit{s}$ trajectories in an
uncorrelated fashion according to
$\exp(-\mathcal{U}_0[\mathbfit{s}])=\mathcal{P}[\mathbfit{s}]$, we bias
our sampling distribution towards
$\exp(-\mathcal{U}[\mathbfit{s}, \mathbfit{x}])\propto\mathcal{P}[\mathbfit{s}|\mathbfit{x}]$
to reduce the sampling problems found in DPWS.

The classical scheme for biasing the sampling distribution in polymer
physics is due to @1955.Rosenbluth in their study of self-avoiding
chains. A substantial improvement of the Rosenbluth algorithm was
achieved by Grassberger, by generating polymers using pruning and
enrichment steps, thereby eliminating configurations that do not
significantly contribute to the average. This scheme is known as the
pruned-enriched Rosenbluth method, or PERM [@1997.Grassberger]. While
PERM is much more powerful than the standard Rosenbluth algorithm, its
main drawback is that it requires careful tuning of the pruning and
enrichment schedule to achieve optimal convergence. Therefore we have
opted to use a technique that is similar in spirit to PERM but requires
less tuning, the bootstrap particle filter [@1993.Gordon]. We will
describe how to use PWS with a particle filter below. That said, we want
to stress that the particle filter can easily be replaced by PERM or
other related methods [@2004.Prellberg]. Also schemes inspired by
variants of Forward Flux Sampling [@2006.Allen; @2012.Becker] could be
developed.

### Bootstrap Particle Filter

In the methods discussed above, a polymer is grown monomer by monomer.
In a continuous-time Markov process this translates to trajectories
being grown segment by segment. To define the segments, we choose a time
discretization $0<\tau_1<\tau_2<\cdots<\tau_{n-1}<T$. Thus, each
trajectory $\mathbfit{s}$ of duration $T$ consists of $n$ segments where
we denote the segment between $\tau_i$ and $\tau_j$ by
$\mathbfit{s}_{[i,j]}$ (we define $\tau_0=0$ and $\tau_n=T$). The
particle filter uses the following procedure to grow an ensemble of
trajectories segment by segment:

1.  Generate $M$ starting points $s^1_0, \ldots, s^M_0$ according to the
    initial condition of the input signal $\mathrm{P}(s_0)$.

2.  Iterate for $i=1,\ldots,n$:

    1.  Starting with an ensemble of $M$ partial trajectories of
        duration $\tau_{i-1}$ (if $i=1$ an ensemble of starting points)
        which we label $\mathbfit{s}^k_{[0,i-1]}$ for $k=1,\ldots,M$:
        $$\left(\mathbfit{s}^1_{[0,i-1]}, \ldots, \mathbfit{s}^M_{[0,i-1]}\right)\,,$$
        propagate each trajectory (or each starting point) forward in
        time from $\tau_{i-1}$ to $\tau_{i}$. Propagation is performed
        according to the natural dynamics of $\mathbfit{s}$, i.e.
        generating a new segment $\mathbfit{s}^k_{[i-1,i]}$ with
        probability
        $$p^\text{gen}_i(k) = \mathcal{P}\left[\mathbfit{s}^k_{[i-1,i]}|\mathbfit{s}^k_{[0,i-1]}\right] = e^{-\mathcal{U}_0\left[\mathbfit{s}^k_{[i-1,i]}\right]}$$
        for $k=1,\ldots,M$.

    2.  Compute the Boltzmann weight
        $$U^k_i = \Delta\mathcal{U}[\mathbfit{s}^k_{[i-1,i]},\mathbfit{x}_{[i-1,i]}]$$
        of each new segment. This Boltzmann weight of a segment from
        $\tau_{i-1}$ to $\tau_i$ can be expressed as $$U^k_i =
                -\delta_{1i} \ln\mathrm{P}(x_0|s_0) -\int^{\tau_i}_{\tau_{i-1}} dt\ \mathcal{L}_t[\mathbfit{s}^k_{[i-1,i]}, \mathbfit{x}_{[i-1,i]}]\,,
                \label{eq-weight_segment}$$ see [@eq-boltzmann-weight],
        and is therefore straightforward to compute from the master
        equation.

    3.  Sample $M$ times from the distribution
        $$p^\text{select}_i(k) = \frac{e^{-U^k_i}}{w_i}
                \label{eq-index-prob}$$ where the Rosenbluth weight
        $w_i$ is defined as $$w_i = \sum^M_{k=1} e^{-U^k_i}\,.$$ This
        sampling procedure yields $M$ randomly drawn indices
        $\ell^1_i, \ldots, \ell^M_i$. Each $\ell^k_i$ is an index that
        lies in the range from $1,\ldots,M$ and that points to one of
        the trajectories that have been generated up to $\tau_i$. To
        continue the sampling procedure, we relabel the indices such
        that the resampled set of trajectories is defined by
        $\tilde{\mathbfit{s}}^k_{[0,i]} \gets \mathbfit{s}^{\ell^k_i}_{[0,i]}$
        for $k=1,\ldots,M$. The list
        $\left( \tilde{\mathbfit{s}}^1_{[0,i]}, \ldots, \tilde{\mathbfit{s}}^M_{[0,i]} \right)$
        is subsequently used as the input for the next iteration of the
        algorithm.

The normalized Rosenbluth factor of the final ensemble is then given by


$$\mathcal{W} = \prod^n_{i=1} \frac{w_i}{M} \,.
    \label{eq-normalized-rosenbluth-factor}$$ {#eq-normalized-rosenbluth-factor}

As shown in [@sec-smc-correctness], we can derive an *unbiased* estimate
for the desired ratio
$\mathcal{Z}[\mathbfit{x}]/\mathcal{Z}_0[\mathbfit{x}] = \mathcal{P}[\mathbfit{x}]$
based on the Rosenbluth factor:


$$\hat{\mathcal{P}}[\mathbfit{x}] = \mathrm{P}(x_0)\ \mathcal{W}
    \label{eq-smc-marginal}$$ {#eq-smc-marginal}

with $\mathrm{P}(x_0)$ being the probability of the initial output
$x_0$. The particle filter can therefore be integrated into the DPWS
algorithm to compute the marginal density $\mathcal{P}[\mathbfit{x}]$,
substituting the brute-force estimate given in [@eq-marginal-naive]. We
call the resulting algorithm to compute the mutual information *RR-PWS*.

### Intuitive Justification of the Algorithm

First note that steps 1 and 2(a) of the procedure above involve just
propagating $M$ trajectories in parallel, according to
$\mathcal{P}[\mathbfit{s}]=\exp(-\mathcal{U}_0[\mathbfit{s}])$. The
interesting steps are 2(b-c) where we eliminate or duplicate some of the
trajectories according to the Boltzmann weights of the most recent
segment. Note, that in general the list of indices
$(\ell^1_i,\ldots,\ell^M_i)$ that are sampled in step 2(c) will contain
duplicates ($\ell^k_i=\ell^{k^\prime}_i$ for $k\neq k^\prime$), thus
cloning the corresponding trajectory. Concomitantly, the indices
$\ell^1_i, \ldots, \ell^M_i$ may not include every original index
$1,\ldots,M$, therefore eliminating some trajectories. Since indices of
trajectories with high Boltzmann weight are more likely to be sampled
from [@eq-index-prob], this scheme biases the sampling distribution
towards trajectories with large Boltzmann weight, ensuring that we are
only spending computational effort on propagating trajectories which
contribute significantly to the marginalization integral.

Hence, at its heart, the particle filter is an importance sampling
scheme. It produces samples that are biased towards the ideal importance
sampling distribution
$\exp(-\mathcal{U}_0[\mathbfit{s}])\exp(-\Delta\mathcal{U}[\mathbfit{s},\mathbfit{x}])$,
i.e., towards to the Boltzmann distribution of the interacting ensemble.
The Rosenbluth factor $\mathcal{W}$ represents the importance sampling
weight which would be required to correct for the sampling bias when
computing averages using the sampled trajectories. Importantly for our
case, the Rosenbluth factor can also be used to estimate the marginal
probability $\mathcal{P}[\mathbfit{x}]$. For illustration of the
algorithm, one iteration of the particle filter is presented
schematically in [@fig-smc].

### Detailed Justification {#sec-smc-correctness}

This subsection justifies the marginal probability estimate shown in
[@eq-smc-marginal] in greater detail, and may be skipped on first
reading. We show that the bootstrap particle filter provides a
consistent estimator for the marginal probability
$\mathcal{P}[\mathbfit{x}]$, or, equivalently, the ratio of partition
functions $\mathcal{Z}[\mathbfit{x}]/\mathcal{Z}_0[\mathbfit{x}]$. The
result that this estimate is also unbiased is more difficult to
establish; a proof is given by @1997.Moral.

We structure our justification of the particle filter into three steps.
We first give a brief description of how a resampling procedure can
generally be used to generate samples approximating a target
distribution when only samples from a different distribution are
available. Secondly, we use these insights to explain how the resampling
procedure used in the particle filter generates trajectories whose
distribution is biased towards $\mathcal{P}[\mathbfit{s}|\mathbfit{x}]$,
even though we only generate trajectories according to
$\mathcal{P}[\mathbfit{s}]$. Finally, we use this result to show that
the particle filter provides a consistent estimate for
$\mathcal{P}[\mathbfit{x}]$.

#### Sampling and resampling

Sampling and then resampling is a strategy to use samples
$\mathbfit{s}^1,\ldots,\mathbfit{s}^M$ from a given prior distribution
$f[\mathbfit{s}]$ to generate *approximate* [^4] samples from a
different distribution of interest, with density proportional to the
product $h[\mathbfit{s}]=f[\mathbfit{s}]g[\mathbfit{s}]$. In general,
$h[\mathbfit{s}]$ is not normalized, and we denote the corresponding
normalized probability density by
$\hat{h}[\mathbfit{s}]=h[\mathbfit{s}]/\int\mathcal{D}[\mathbfit{s}]h[\mathbfit{s}]$.
To generate samples from $\hat{h}[\mathbfit{s}]$, we assign each of the
existing samples from $f[\mathbfit{s}]$ a normalized weight


$$W^k = \frac{g[\mathbfit{s}^k]}{\sum^M_{j=1}g[\mathbfit{s}^j]}\,.
    \label{eq-weights-appendix}$$ {#eq-weights-appendix}

Then, by sampling from the discrete set
$\{\mathbfit{s}^1,\ldots,\mathbfit{s}^M\}$ according to the assigned
weights $W^1,\ldots,W^M$, we select samples that are approximately
distributed according to $\hat{h}[\mathbfit{s}]$. Indeed, for
$M\rightarrow\infty$ the distribution of the resulting samples
approaches the density $\hat{h}[\mathbfit{s}]$ [@1992.Smith]. We use
resampling at each iteration of the algorithm of [@sec-smc] to regularly
prune those trajectories with low overall contribution to the
marginalization integral.

#### Particle filter

In the bootstrap particle filter, at each iteration, we start with a set
of trajectories
$\mathbfit{s}^1_{[0,i-1]},\ldots,\mathbfit{s}^M_{[0,i-1]}$. In each
iteration of the particle filter, the goal is to produce a set of
elongated trajectories (from time step $(i-1) \to i$) whose distribution
tends towards $\mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i]}]$.
By iterating such a procedure, we can generate a set of trajectories
distributed approximately according to
$\mathcal{P}[\mathbfit{s}_{[0,n]}|\mathbfit{x}_{[0,n]}]$ for any $n>1$.
Thus, the particle filter is a biased sampling scheme which provides an
approximation of
$\mathcal{P}[\mathbfit{s}_{[0,n]}|\mathbfit{x}_{[0,n]}]$. Moreover,
using the particle filter we can also compute the corresponding
importance weights which can be used to compute the marginal probability
$\mathcal{P}[\mathbfit{x}_{[0,n]}]$ for $n=1,2,\ldots$.

We now take a closer look at one iteration of the particle filter. Start
with a set of trajectories in $[\tau_0,\tau_{i-1}]$, denoted by
$\left\{\mathbfit{s}^1_{[0,i-1]},\ldots,\mathbfit{s}^M_{[0,i-1]}\right\}$.
These trajectories are then propagated forward to time $\tau_i$, by
adding a new segment $\mathbfit{s}^k_{[i-1,i]}$ to the trajectory
$\mathbfit{s}^k_{[0,i-1]}$ for $k=1,\ldots,M$. Each new segment is
generated from the distribution
$\mathcal{P}[\mathbfit{s}^k_{[i-1,i]}|\mathbfit{s}^k_{[0,i-1]}]$ such
that the propagation step results in a set of trajectories
$\{\mathbfit{s}^1_{[0,i]},\ldots,\mathbfit{s}^M_{[0,i]}\}$, distributed
according to
$f[\mathbfit{s}_{[0,i]}]=\mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]$.

Next, we resample from the set of trajectories, with the goal of
producing a set of trajectories distributed according to the target
density
$\hat{h}[\mathbfit{s}] = \mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i]}]$.
Thus, we have to find the appropriate weighting function
$g[\mathbfit{s}_{[0,i]}]$ in order to approximately produce samples
according to the target distribution. By choosing
$g[\mathbfit{s}_{[0,i]}] = \exp\left\{ -\Delta\mathcal{U}[\mathbfit{s}_{[i-1,i]}, \mathbfit{x}_{[i-1,i]}] \right\} = \mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]},\mathbfit{s}_{[0,i]}]$,
we generate normalized weights


$$W^k_i = \frac{\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]},\mathbfit{s}^k_{[0,i]}]}{\sum^M_{j=1} \mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]},\mathbfit{s}^j_{[0,i]}]}\,,
    \label{eq-normalized-weights}$$ {#eq-normalized-weights}

cf. [@eq-weights-appendix]. Note that this is the same choice of
weighting function as in [@sec-smc], [@eq-index-prob]. By comparison
with the notation used there, we see that the Boltzmann factors $U^k_i$
and Rosenbluth weights $w_i$ were defined such that we can express the
normalized weight equivalently as

$$W^k_i = \frac{e^{-U^k_i}}{w_i} \,.$$

Why is this choice of weighting function the correct one? First, observe
that resampling with the normalized weights of [@eq-normalized-weights]
produces samples approximately distributed according to


$$\begin{aligned}
    h[\mathbfit{s}_{[0,i]}] &= f[\mathbfit{s}_{[0,i]}] g[\mathbfit{s}_{[0,i]}] \\
    &= \mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]\  \mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]},\mathbfit{s}_{[0,i]}]\,.
\end{aligned}
\label{eq-h-unnormalized}$$ {#eq-h-unnormalized}

What remains to be shown is that this density $h[\mathbfit{s}_{[0,i]}]$,
when normalized, becomes the desired target distribution
$\mathcal{P}[\mathbfit{s}_{[0,i]}| \mathbfit{x}_{[0,i]}]$.

To do so, we need to rewrite the expression for
$g[\mathbfit{s}_{[0,i]}]=\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]},\mathbfit{s}_{[0,i]}]$
using Bayes' theorem

$$g[\mathbfit{s}_{[0,i]}]=\frac{ \mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]},\mathbfit{x}_{[i-1,i]}]\ \mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]}]}{\mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]}\,.$$

Notice that the first term of the numerator can be written as
$\mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i]}]$. After
inserting this result into [@eq-h-unnormalized], we obtain

$$h[\mathbfit{s}_{[0,i]}] = \mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i]}]\ \mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]}]\,.$$

The second term in this product is a constant, since $\mathbfit{x}$ is
fixed. The first term is a normalized probability density for
$\mathbfit{s}_{[0,i]}$. Therefore we find that the normalized density
corresponding to $h[\mathbfit{s}_{[0,i]}]$ is

$$\hat{h}[\mathbfit{s}_{[0,i]}] = \mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i]}]\,.$$

Consequently, this is the distribution that is approximated by the set
of trajectories at the end of the $i$-th iteration of the particle
filter, which is what we wanted to show. At its heart, the particle
filter is therefore an algorithm to produce samples that are
approximately distributed according to
$\mathcal{P}[\mathbfit{s}|\mathbfit{x}]$.

#### Marginal probability estimate

We now use these insights to derive an estimate of
$\mathcal{P}[\mathbfit{x}]$. We start by noting that the marginal
density of the $i$-th output segment,
$\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]}]$, is given
by

$$\begin{aligned}
    &\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]}] \\
    &=\int\mathcal{D}[\mathbfit{s}_{[0,i]}]\ 
    \mathcal{P}[\mathbfit{x}_{[i-1,i]},\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]\\
    &=\int\mathcal{D}[\mathbfit{s}_{[0,i]}]\ 
    \mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]\ 
    g[\mathbfit{s}_{[0,i]}]\,.
    \end{aligned}$$

The third line follows from the definition of
$g[\mathbfit{s}_{[0,i]}]=\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]},\mathbfit{s}_{[0,i]}]$.
Hence, we find that the probability
$\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]}]$ can be
expressed as the average


$$\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]}] = \left\langle
    g[\mathbfit{s}_{[0,i]}]
    \right\rangle_{\mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]}\,.
    \label{eq-marginal-segment-average}$$ {#eq-marginal-segment-average}

In principle, this average can be computed using a Monte Carlo scheme,
using trajectories generated from
$\mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]$. Notice that
at each iteration of the particle filter, we *do* dispose of a set of
trajectories $\mathbfit{s}^1_{[0,i]},\ldots,\mathbfit{s}^M_{[0,i]}$
which are approximately distributed according to
$\mathcal{P}[\mathbfit{s}_{[0,i]}|\mathbfit{x}_{[0,i-1]}]$ above.
Therefore, we can compute the average [@eq-marginal-segment-average]
directly from the trajectories that are present for each iteration of
the particle filter. With the notation from [@sec-smc], using
$g[\mathbfit{s}^k_{[0,i]}]=\exp(-U^k_i)$, we thus obtain the estimate

$$\mathcal{P}[\mathbfit{x}_{[i-1,i]}|\mathbfit{x}_{[0,i-1]}] \approx
    \frac{1}{M}\sum^M_{k=1} e^{-U^k_i} = \frac{w_i}{M}\,.$$

The probability of the entire output trajectory
$\mathcal{P}[\mathbfit{x}]$ is given by the product

$$\mathcal{P}[\mathbfit{x}] = \mathrm{P}(x_0) \mathcal{P}[\mathbfit{x}_{[0,1]}|x_0]\cdots \mathcal{P}[\mathbfit{x}_{[n-1,n]}|\mathbfit{x}_{[0,n-1]}]$$

where $\mathrm{P}(x_0)$ is the probability of the initial output state
$x_0$ which is assumed to be known. In conclusion, we arrive at the
following estimate for the marginal output probability

$$\hat{\mathcal{P}}[\mathbfit{x}] = \mathrm{P}(x_0) \prod^n_{i=1} \frac{w_i}{M}$$

which is precisely [@eq-smc-marginal].

### Tuning the Particle Filter

For the efficiency of the particle filter, it is important to carefully
choose the number of segments $n$. When segments are very short (i.e.,
when $n$ is large), the accumulated weights ([@eq-weight_segment]) tend
to differ very little between newly generated segments
$\mathbfit{s}^k_{[i-1,i]}$. Hence, the pruning and enrichment of the
segments is dominated by noise. In contrast, when the segments are very
long, the distribution of Boltzmann weights $U^k_i$ becomes very wide.
Then only a small number of segments contribute substantially to the
corresponding Rosenbluth weight $w_i$. Hence, to correctly choose $n$,
we need a measure that quantifies the variance in the trajectory weights
of the $n$ particles. To this end, we follow @2017.Martino and introduce
an effective sample size (ESS)

$$M^\text{(eff)}_i = \frac{w_i^2}{\sum^M_{k=1} \left(e^{-U^k_i}\right)^2},$$

which lies in the range $1 \leq M^\text{(eff)}_i \leq M$;
$M^\text{(eff)}_i = 1$ if one trajectory has a much higher weight than
all the others and $M^\text{(eff)}_i = M$ if all trajectories have the
same weight. As a rule of thumb, we resample only when the
$M^\text{(eff)}_i$ drops below $M/2$. Additionally, as recommended in
Ref. [@2011.Doucet], we use the *systematic sampling* algorithm to
randomly draw the indices in step 2(c) which helps to reduce the
variance; we find, however, the improvement over simple sampling is very
minor. Using these techniques, the only parameter that needs to be
chosen by hand for the particle filter is the ensemble size $M$.

## TI-PWS {#sec-thermodynamic-integration}

Thermodynamic integration PWS (TI-PWS), is based on the analogy of
marginalization integrals with free-energy computations. As before, we
view the problem of computing the marginal probability
$\mathcal{P}[\mathbfit{x}]$ as equivalent to that of computing the
free-energy difference between ensembles defined by the potentials
$\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]$ and
$\mathcal{U}[\mathbfit{s}, \mathbfit{x}]$, respectively. For TI-PWS, we
define a potential $\mathcal{U}_\theta[\mathbfit{s},\mathbfit{x}]$ with
a continuous parameter $\theta\in[0,1]$ that allows us to transform the
ensemble from $\mathcal{U}_0$ to $\mathcal{U}=\mathcal{U}_1$. The
corresponding partition function is

$$\mathcal{Z}_\theta[\mathbfit{x}]=\int\mathcal{D}[\mathbfit{s}]\ e^{-\mathcal{U}_\theta[\mathbfit{s},\mathbfit{x}]} \,.$$

For instance, for $0\leq\theta\leq 1$, we can define our potential as


$$\mathcal{U}_\theta[\mathbfit{s},\mathbfit{x}]=\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]+\theta\,\Delta\mathcal{U}[\mathbfit{s},\mathbfit{x}]\,,
    \label{eq-ti-hamiltonian}$$ {#eq-ti-hamiltonian}

such that
$e^{-\mathcal{U}_\theta[\mathbfit{s},\mathbfit{x}]}=\mathcal{P}[\mathbfit{s}]\mathcal{P}[\mathbfit{x}|\mathbfit{s}]^\theta$.
Note that this is the simplest choice for a continuous transformation
between $\mathcal{U}_0$ and $\mathcal{U}_1$, but by no means the only
one. For reasons of computational efficiency, it can be beneficial to
choose a different path between $\mathcal{U}_0$ and $\mathcal{U}_1$,
depending on the specific system [@1998.Gelman]. Here we will not
consider other paths however, and derive the thermodynamic integration
estimate for the potential given in [@eq-ti-hamiltonian].

To derive the thermodynamic integration estimate for the free-energy
difference, we first compute the derivative of
$\ln\mathcal{Z}_\theta[\mathbfit{x}]$ with respect to $\theta$:


$$\begin{aligned}
    \frac{\partial}{\partial \theta} \ln\mathcal{Z}_\theta[\mathbfit{x}] &= \frac{1}{\mathcal{Z}_\theta[\mathbfit{x}]} \frac{\partial}{\partial \theta} \int\mathcal{D}[\mathbfit{s}]\  e^{-\mathcal{U}_\theta[\mathbfit{s},\mathbfit{x}]} \\
    &= -\left\langle \frac{\partial \mathcal{U}_\theta[\mathbfit{s},\mathbfit{x}]}{\partial\theta} \right\rangle_\theta\\
    &= -\left\langle
    \Delta\mathcal{U}[\mathbfit{s},\mathbfit{x}]
    \right\rangle_\theta\,.
\end{aligned}
\label{eq-z-derivative}$$ {#eq-z-derivative}

Thus, the derivative of $\ln\mathcal{Z}_\theta[\mathbfit{x}]$ is an
average of the Boltzmann weight with respect to
$\mathcal{P}_\theta[\mathbfit{s}|\mathbfit{x}]$ which is the ensemble
distribution of $\mathbfit{s}$ given by

$$\mathcal{P}_\theta[\mathbfit{s}|\mathbfit{x}] = \frac{1}{\mathcal{Z}_\theta[\mathbfit{x}]} e^{-\mathcal{U}_\theta[\mathbfit{s}, \mathbfit{x}]}\,.$$

Integrating [@eq-z-derivative] with respect to $\theta$ leads to the
formula for the free-energy difference


$$\Delta\mathcal{F}[\mathbfit{x}] = -\int^1_0 d\theta\ \left\langle 
    \Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}]
    \right\rangle_\theta
    \label{eq-ti-estimate}$$ {#eq-ti-estimate}

which is the fundamental identity underlying thermodynamic integration.

To compute the free-energy difference using [@eq-ti-estimate], we
evaluate the integral with respect to $\theta$ numerically using
Gaussian quadrature, while the inner average
$\left\langle \Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}] \right\rangle_\theta$
is computed using MCMC simulations. To perform MCMC simulations in
trajectory space we use ideas from transition path sampling (TPS).
Specifically, we define a MCMC proposal distribution for trajectories
using forward shooting and backward shooting [@2002.Bolhuis]. These
proposals regrow either the end, or the beginning of a trajectory,
respectively. A proposal is accepted according to the Metropolis
criterion [@1953.Metropolis]. Since the efficiency of MCMC samplers
strongly depends on the proposal moves that are employed, we are certain
that better MCMC estimates are possible with more sophisticated proposal
distributions.

### MCMC Sampling in Trajectory Space {#sec-mcmc}

TI-PWS relies on the computation of averages with respect to the
ensembles corresponding to the interaction parameter $\theta$, given by
$\mathcal{P}_\theta[\mathbfit{s}|\mathbfit{x}]\propto\exp(-\mathcal{U}_\theta[\mathbfit{s}, \mathbfit{x}])$.
Sampling from this family of distributions using the SSA (Gillespie)
algorithm is not possible. Instead, in this section, we show different
ways of how to implement a Markov Chain Monte Carlo (MCMC) sampler in
trajectory space to generate correctly distributed trajectories.

We can build an MCMC sampler in trajectory space using the
Metropolis-Hastings algorithm. To create a Markov chain in trajectory
space, we need to find a suitable proposal kernel, that generates a new
trajectory $\mathbfit{s}^\prime$ from a given trajectory $\mathbfit{s}$
with probability $T(\mathbfit{s}\rightarrow\mathbfit{s}^\prime)$. We
accept the proposal using the Metropolis criterion with probability


$$A(\mathbfit{s}^\prime,\mathbfit{s})=\min\left( 1, e^{\mathcal{U}_\theta[\mathbfit{s}, \mathbfit{x}] - \mathcal{U}_\theta[\mathbfit{s}^\prime, \mathbfit{x}]}\frac{T(\mathbfit{s}^\prime\rightarrow\mathbfit{s})}{T(\mathbfit{s}\rightarrow\mathbfit{s}^\prime)} \right)
    \label{eq-metropolis-acceptance}$$ {#eq-metropolis-acceptance}

to create a chain of trajectories with stationary distribution given by
$\mathcal{P}_\theta[\mathbfit{s}|\mathbfit{x}]=e^{-\mathcal{U}_\theta[\mathbfit{s}, \mathbfit{x}]}/\mathcal{Z}_\theta[\mathbfit{x}]$
for $0\leq\theta\leq 1$. To ensure efficient convergence of the
resulting Markov chain to its stationary distribution, the proposal
kernel must balance two conflicting requirements. To efficiently explore
the state space per unit amount of CPU time, the proposed trajectory
$\mathbfit{s}^\prime$ must be sufficiently different from the original
trajectory $\mathbfit{s}$, while at the same time it should not be so
different that the acceptance probability becomes too low. Thus, the
design of the proposal kernel is crucial for an efficient MCMC sampler,
and we will discuss various strategies to create trial trajectories.
Since different types of trial moves can easily be combined in a
Metropolis-Hastings algorithm, the most efficient samplers often
incorporate multiple complementary proposal strategies to improve the
exploration speed of the trajectory space.

The simplest (and naïve) proposal kernel is to generate an entirely new
trajectory $\mathbfit{s}^\prime$ independent of $\mathbfit{s}$, by
sampling directly from $\mathcal{P}[\mathbfit{s}]$ using the SSA. Hence,
the transition kernel is given by
$T(\mathbfit{s}\rightarrow\mathbfit{s}^\prime)=\mathcal{P}[\mathbfit{s}^\prime]$
and a proposal $\mathbfit{s}\rightarrow\mathbfit{s}^\prime$ is accepted
with probability


$$\begin{aligned}
    A(\mathbfit{s}^\prime,\mathbfit{s}) &= \min\left( 1, e^{\mathcal{U}_\theta[\mathbfit{s}, \mathbfit{x}] - \mathcal{U}_\theta[\mathbfit{s}^\prime, \mathbfit{x}]}\frac{\mathcal{P}[\mathbfit{s}]}{\mathcal{P}[\mathbfit{s}^\prime]} \right) \\
    &= \min\left( 1, \frac{\mathcal{P}[\mathbfit{x}|\mathbfit{s}^\prime]^\theta}{\mathcal{P}[\mathbfit{x}|\mathbfit{s}]^\theta} \right)
\end{aligned}
\label{eq-acceptance-rate}$$ {#eq-acceptance-rate}

where the second line follows by using the definition of
$\mathcal{U}_\theta[\mathbfit{s},\mathbfit{x}]$ given in
[@eq-ti-hamiltonian]. Although this simple scheme is correct, it should
not be used in practice to compute $\mathcal{P}[\mathbfit{x}]$. Indeed,
on would get a better estimate of $\mathcal{P}[\mathbfit{x}]$ by just
using the same number of independent sample trajectories from
$\mathcal{P}[\mathbfit{s}]$ and using the brute-force scheme in
[@eq-marginal-naive] without taking the detour of using MCMC to estimate
the normalization constant.

Instead, an idea from transition path sampling is to only regenerate a
part of the old trajectory as part of the proposal kernel
[@1998a.Dellago]. By not regenerating the entire trajectory, the new
trajectory $\mathbfit{s}^\prime$ is going to be correlated with the
original trajectory $\mathbfit{s}$, improving the acceptance rate. The
simplest way to generate trial trajectories using a partial update is a
move termed *forward shooting* in which a time point $\tau$ along the
existing trajectory $\mathbfit{s}$ is randomly selected, and a new
trajectory segment is regrown from this point to the end, resulting in
the proposal $\mathbfit{s}^\prime$. Since the new segment is generated
according to the unbiased input statistics, the acceptance probability
for the proposed trajectory is given by [@eq-acceptance-rate], i.e., the
same as if the entire trajectory had been regenerated. If the input
dynamics given by $\mathcal{P}[\mathbfit{s}]$ are time-reversible, we
can also perform a *backward shooting* move. Here, the beginning of
$\mathbfit{s}$ is replaced by a new segment that is generated backwards
in time. Assuming that the initial condition is the input's steady state
distribution, the corresponding acceptance probability of the backward
shooting move is again given by [@eq-acceptance-rate]. Using these two
moves we create an MCMC sampler where both ends of the trajectory are
flexible, and thus if the trajectory is not too long, the chain will
quickly relax to its stationary distribution.

For long trajectories it can prove to be a problem that the middle
section is too inflexible when the proposal moves only regenerate either
the beginning or the end of a trajectory. Therefore, one could
additionally try to incorporate mid-section regrowth to make sure that
also the middle parts of the trajectory become flexible. To regrow a
middle segment with duration $\tau$ of a trajectory $\mathbfit{s}$, we
have to generate a new segment of duration $\tau$ according to the
stochastic dynamics given by $\mathcal{P}[\mathbfit{s}]$ but with the
additional condition that we have to connect *both* endpoints of the new
segment to the existing trajectory. Although the starting point of the
segment can be freely chosen, the challenge is to ensure that the end
point of the new segment satisfies the end-point constraint. Stochastic
processes that generate trajectories under the condition of hitting a
specific point after a given duration $\tau$ are called stochastic
bridging processes.

The simplest way to generate trajectories from a bridging process is by
generating a trajectory segment of length $\tau$ from the normal
stochastic process and rejecting the segment if it does not hit the
correct end point [@2009.Hobolth]. Clearly, this strategy is only
feasible for very short segments and when the state space is discrete,
as otherwise almost every generated segment will be rejected due to not
hitting the correct end point. To avoid this problem, more efficient
algorithms have been developed to simulate stochastic bridges for some
types of stochastic processes. For diffusion processes, bridges can be
simulated efficiently by introducing a guiding term into the
corresponding Langevin equation [@2017.Meulen]. For jump processes,
bridges can be simulated using particle filters [@2015.Golightly], by a
weighted stochastic simulation algorithm (wSSA) [@2019.Gillespie], or
using random time-discretization (uniformization) [@2009.Hobolth].

Further techniques to create a trajectory space MCMC samplers have been
developed in the literature. @2000.Crooks describes a scheme to create
MCMC moves for trajectories evolving in non-equilibrium dynamics, by
making MCMC moves to change the trajectories' noise histories. In the
Particle Markov Chain Monte Carlo (PMCMC) algorithm, proposal
trajectories are generated using a particle filter and accepted with an
appropriate Metropolis criterion [@2010.Andrieu]. Another class of
efficient samplers for Markov jump processes can be built using
uniformization [@2013.Rao].

## Simple Application and Benchmark {#sec-pws_variants_benchmark}

To demonstrate the power of our framework and illustrate how the
techniques of the previous sections can be used in practice, we apply
PWS to a simple chemical reaction network. We consider a linearly
coupled birth-death process which has been studied previously using a
Gaussian model [@2009.Tostevin], and by @2019.Duso using an approximate
technique, and we compare our results with these studies. This simple
birth-death system serves to illustrate the main ideas of our approach
and also highlights that linear systems can be distinctly non-Gaussian.

The code used to produce the PWS estimates was written in the Julia
programming language [@2017.Bezanson] and has been made freely
available [@manuel_reinhardt_2021_6334035; @pws_github]. For performing
stochastic simulations we use the DifferentialEquations.jl
package [@2017.Rackauckas].

We consider a stochastic process $\emptyset\rightleftharpoons\mathrm{X}$
of species $\mathrm{X}$ which is created at rate $\rho(t)$ and decays
with constant rate $\mu$ per copy of $\mathrm{X}$. This system receives
information from an input signal that modulates the birth rate
$\rho(t)$. For simplicity, we assume it is given by

$$\rho(t)=\rho_0 s(t)$$

where $\rho_0$ is a constant and $s(t)$ is the input copy number at time
$t$. This is a simple model for gene expression, where the rate of
production of a protein $\mathrm{X}$ is controlled by a transcription
factor $\mathrm{S}$, and $\mathrm{X}$ itself has a characteristic decay
rate. The input trajectories $s(t)$ themselves are generated via a
separate birth-death process $\emptyset\rightleftharpoons\mathrm{S}$
with production rate $\kappa$ and decay rate $\lambda$.

We compute the trajectory mutual information for this system as a
function of the trajectory duration $T$ of the input and output
trajectories. For $T\rightarrow\infty$, the trajectory mutual
information is expected to increase linearly with $T$, since, on
average, every additional output segment contains the same additional
amount of information on the input trajectory. Because we are interested
in the mutual information in steady state, the initial states
$(s_0,x_0)$ were drawn from the stationary distribution
$\mathrm{P}(s_0,x_0)$. This distribution was obtained using a Gaussian
approximation. This does not influence the asymptotic rate of increase
of the mutual information, but leads to a nonzero mutual information
already for $T=0$.

![Comparing different schemes to compute the mutual information as a function of trajectory duration for a simple coupled birth-death process with rates $\kappa = 50, \lambda=1, \rho_0=10, \mu = 10$ and steady-state initial condition. The top panels show example trajectories of input and output as well as the mean (solid line) and standard deviation (shaded region). Below, the mutual information is shown as a function of trajectory duration. The inset shows an enlarged version of the dotted rectangle near the origin. For short trajectories all PWS estimates agree. Yet, for longer trajectories, DPWS and TI-PWS require a much larger number of input trajectories $M$ for computing $\mathcal{P}[\mathbfit{x}]$ than RR-PWS to converge. Results for the three PWS variants are compared with the [@2019.Duso] estimate, and with the linear noise approximation from Ref. [@2009.Tostevin]. We find excellent agreement between the Duso scheme and RR-PWS. The Gaussian linear noise approximation systematically underestimates the mutual information. All PWS estimates, as well as the Duso approximation were computed using $N=10^4$ samples from $\mathcal{P}[\mathbfit{s},\mathbfit{x}]$. ](figures/gene-expr-figure.svg){#fig-gene-expr}

[@fig-gene-expr] shows the mutual information as a function of the
trajectory duration $T$. We compare the three PWS variants and two
approximate schemes. One is that of @2019.Duso. To apply it, we used the
code publicly provided by the authors[^5], and to avoid making
modifications to this code, we chose a fixed initial condition
$(s_0=x_0=50)$ which causes the mutual information to be zero for $T=0$.
The figure also shows the analytical result of a Gaussian model
[@2009.Tostevin], obtained using the linear-noise approximation (see
[@sec-gaussian-covariance]).

We find that the efficiency of the respective PWS variants depends on
the duration of the input-output trajectories. For short trajectories
all PWS variants yield very similar estimates for the mutual
information. However, for longer trajectories the estimates of DPWS and,
to a smaller degree, TI-PWS diverge, because of poor sampling of the
trajectory space in the estimate of $\mathcal{P}[\mathbfit{x}]$. For
longer trajectories, the estimate becomes increasingly dominated by rare
trajectories, which make an exceptionally large contribution to the
average of $\mathcal{P}[\mathbfit{x}]$. Missing these rare trajectories
with a high weight tends to increase the marginal entropy
$\mathrm{H}(\mathcal{X})$ \[see [@eq-marginal-entropy-estimate]\], and
thereby the mutual information; indeed, the estimates of DPWS and TI-PWS
are higher than that of RR-PWS. For brute-force DPWS, the error
decreases as we increase the number $M$ of input trajectories per output
trajectory used to estimate $\mathcal{P}[\mathbfit{x}]$. Similarly, for
TI-PWS the error decreases as we use more MCMC samples for the
marginalization scheme. For the RR-PWS, however, already for $M=128$ the
estimate has converged; we verified that a further increase of $M$ does
not change the results.

We also find excellent agreement between the RR-PWS estimate and the
approximate result of @2019.Duso. Only very small deviations are visible
in [@fig-gene-expr]. These deviations are mostly caused by the different
choice for the initial conditions. In RR-PWS, the initial conditions are
drawn from the stationary distribution, while in the Duso scheme they
are fixed, such that the mutual information computed with RR-PWS is
finite while that computed with the Duso scheme is zero. Yet, as the
trajectory duration $T$ increases, the Duso estimate slowly "catches up"
with the RR-PWS result.

[@fig-gene-expr] also shows that although the Gaussian model matches the
PWS result for $T=0$, it systematically underestimates the mutual
information for trajectories of finite duration $T>0$. Interestingly,
this is not a consequence of small copy-number fluctuations: increasing
the average copy number does not significantly improve the Gaussian
estimate.[^6]

![Comparing estimation bias for the different PWS variants in relation to their CPU time requirements. Each dot represents a single mutual information estimate with $N=10^4$ samples for output trajectories of duration $T=5$. Almost all the CPU time of a PWS estimate is spent on the computation of the marginal probability $\mathcal{P}[\mathbfit{x}]$. The bias of the marginal probability estimate can be reduced by using a larger number $M$ of sampled input trajectories to compute the marginalization integral, which also increases the required CPU time. The RR-PWS estimate converges much faster than the estimate of DPWS and TI-PWS. For DPWS and TI-PWS, the dots represents estimates ranging from $M=2^5$ to $M=2^{14}$, for RR-PWS ranging from $M=2^3$ to $M=2^{10}$. As the baseline of zero bias we use the converged result from the RR-PWS estimates.](figures/Timing.svg){#fig-timing}

The different approaches for computing the marginal probability
$\mathcal{P}[\mathbfit{x}]$ lead to different computational efficiencies
of the respective PWS schemes. In [@fig-timing], as a benchmark, we show
the magnitude of the error of the different PWS estimates in relation to
the required CPU time. Indeed, as expected, the computation of the
marginal probability poses problems for long trajectories when using the
brute force DPWS scheme. More interestingly, while TI-PWS improves the
estimate of the mutual information, the improvement is not dramatic.
Unlike the brute-force scheme, thermodynamic integration does make it
possible to generate input trajectories $\mathbfit{s}$ that are
correlated with the output trajectories $\mathbfit{x}$, but it still
overestimates the mutual information for long trajectories unless a very
large number of MCMC samples are used.

The RR-PWS implementation evidently outperforms the other estimates for
this system. The regular resampling steps ensure that we mostly sample
input trajectories $\mathbfit{s}$ with non-vanishing likelihood
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$, thereby avoiding the sampling
problem from DPWS. Moreover, sequential Monte Carlo techniques such as
RR-PWS and FFS [@2006.Allen] have a considerable advantage over MCMC
techniques in trajectory sampling. With MCMC path sampling, we
frequently make small changes to an existing trajectory such that the
system moves slowly in path space, leading to poor statistics. In
contrast, in RR-PWS we generate new trajectories from scratch, segment
by segment, and these explore the trajectory space much faster.

## Discussion

Aside from Direct PWS introduced in [@sec-dpws], we developed two
additional variants of PWS, capitalizing on the connection between
information theory and statistical physics. Specifically, the
computation of the mutual information requires the evaluation of the
marginal probability of individual output trajectories
$\mathcal{P}[\mathbfit{x}]$. This corresponds to the computation of a
partition function in statistical physics,
$\mathcal{P}[\mathbfit{x}]=\int \mathcal{P}[\mathbfit{s}]\,\mathcal{P}[\mathbfit{s}]\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$.
RR-PWS and TI-PWS are based on techniques from polymer and rare-event
simulations to make the computation of the marginal trajectory
probability more efficient.

The different PWS variants share some characteristics yet also differ in
others. DPWS and RR-PWS are static Monte Carlo schemes in which the
trajectories are generated independently from the previous ones. These
methods are similar to static polymer sampling schemes like PERM
[@1997.Grassberger] and rare-event methods like DFFS or BG-FFS
[@2006.Allen]. In contrast, TI-PWS is a dynamic Monte Carlo scheme,
where a new trajectory is generated from the previous trajectory. In
this regard, this method is similar to the CBMC scheme for polymer
simulations [@1992.Siepmann] and the TPS [@2002.Bolhuis], TIS
[@2003.Erp], and RB-FFS [@2006.Allen] schemes to harvest transition
paths. The benefit of static schemes is that the newly generated
trajectories are uncorrelated from the previous ones, which means that
they are less likely to get stuck in certain regions of path space.
Concomitantly, they tend to diffuse faster through the configuration
space. Indeed, TI-PWS suffers from a problem that is also often
encountered in TPS or TIS, which is that the middle sections of the
trajectories move only slowly in their perpendicular direction. Tricks
that have been applied to TPS and TIS to solve this problem, such as
parallel tempering, could also be of use here [@2001.Vlugt].

Another distinction is that RR-PWS generates all the trajectories in the
ensemble simultaneously yet segment by segment, like DFFS, while DPWS
and TI-PWS generate only one full trajectory at the time, similar to
RB-FFS, BG-FFS, and also TPS and TIS. Consequently, RR-PWS, like DFFS,
faces the risk of *genetic drift*, which means that, after sufficiently
many resampling steps, most paths of the ensemble will originate from
the same initial seed. Thus, when continuing to sample new segments, the
old segments that are far in the past become essentially fixed, which
makes it possible to miss important paths in the RR-PWS sampling
procedure. As in DFFS, the risk of genetic drift in RR-PWS can be
mitigated by increasing the initial number of path segments. Although we
did not employ this trick here, we found that RR-PWS was by far the most
powerful scheme of the three variants studied.

Nonetheless, we expect that DPWS and TI-PWS become more efficient in
systems that respond to the input signal with a significant delay
$\tau$. In these cases, the weight of a particular output trajectory
depends on the degree to which the dynamics of the output trajectory
correlates with the dynamics of the intput trajectory a time $\tau$
earlier. Because in RR-PWS a new segment of an output trajectory is
generated based on the corresponding segment of the input trajectory
that spans the same time-interval, it may therefore miss these
correlations between the dynamics of the output and that of the input a
time $\tau$ earlier. In contrast, DPWS and TI-PWS generate full
trajectories one at the time, and are therefore more likely to capture
these correlations. Also the machine-learning based approach for
determining the optimal importance sampling distribution
$q[\mathbfit{s}|\mathbfit{x}]$ presented in [@sec-ml-pws]
([@sec-ml_variational]) is likely to prove useful in these scenarios
with complex temporal dependences between the input and output
trajectories.

## Supplementary Information

### Gaussian Approximation of the Linear System  {#sec-gaussian-covariance}

We derive the Gaussian approximation of the simple reaction system used
in [@sec-pws_variants_benchmark]. We recall the elementary biochemical
reaction motif consisting of four reactions


$$\text{0  →  S}, \quad
    \text{S  →  0}, \quad
    \text{S  →  S + X}, \quad
    \text{X  →  0}
    \label{eq-reaction-scheme}$$ {#eq-reaction-scheme}

with input $S$ and output $X$. This reaction motif is a simple model for
gene expression, where the rate of production of a protein $X$ is
controlled by a transcription factor $S$, and X itself has a
characteristic decay rate. The dynamics of $S$ are given by a constant
birth rate and a constant (per-molecule) decay rate.

We compute the covariance functions of this model which are then used to
derive Gaussian signal statistics, and allow us to compute the Gaussian
information rate. Specifically, we assume that the process is sampled at
a sampling rate $\nu$, with $S_1,\ldots,S_n$ being the sequence of
sampled inputs and $X_1,\ldots,X_n$ being the sequence of outputs in
time. We can describe the dynamics of the input and output as
fluctuations around the mean, i.e. we write
$\delta S_i = S_i - \langle S_i \rangle$ and
$\delta X_i = X_i - \langle X_i \rangle$. In the limit of large copy
numbers, due to the central limit theorem, the distribution of these
fluctuations become Gaussian [@2009.Gardiner].

In particular, let
$\mathbfit{Z}=(\delta S_1,\ldots,\delta S_n, \delta X_1,\ldots,\delta X_n)^T$
be the concatenation of the input and output sequences. Then, the
distribution of $\mathbfit{Z}$ is multivariate normal, i.e.,

$$\mathrm{P}(\mathbfit{Z}=\mathbfit{z}) = \frac{1}{\sqrt{(2\pi)^{2n}|\Sigma|}} e^{-\frac{1}{2}(\mathbfit{z}^T \Sigma^{-1} \mathbfit{z})}$$

where the covariance Matrix $\Sigma\in\mathbb{R}^{2n\times 2n}$ has the
following block structure


$$\Sigma = \left( \begin{array}{cc}
        \Sigma_{SS} & \Sigma_{XS} \\
        \Sigma_{SX} & \Sigma_{XX}
    \end{array} \right)\,.
    \label{eq-cov_z}$$ {#eq-cov_z}

Here $\Sigma_{SS}$ and $\Sigma_{XX}$ are the (auto-)covariance matrices
of the input and the output, respectively, whereas
$\Sigma_{SX}=\Sigma^T_{XS}$ contain the cross-covariances. The matrix
elements are given by
$\Sigma^{ij}_{AB} = \langle \delta A_i \delta B_j \rangle = C_{AB}(t_i - t_j)$
where $C_{AB}(t)$ denote the (cross-)covariance functions and
$t_1,\ldots,t_n$ are the sampling times. Thus, the full statistics of
the trajectories are determined from the (cross-)covariance functions.

Since the reaction scheme in [@eq-reaction-scheme] features only
first-order reactions, the covariance functions can be calculated
explicitly using the regression theorem [@2006.Warren; @2009.Gardiner].
For $t\geq 0$, we obtain the following expressions for the covariance
functions:


$$\begin{aligned}
    \label{eq-c_ss} C_{SS}(t) &= \sigma^2_{SS} \exp(-\lambda t) \\
    \label{eq-c_sx} C_{SX}(t) &= \rho\sigma^2_{SS}t\ \mathrm{exprel}[(\lambda - \mu) t]\ \exp(-\lambda t) + \sigma^2_{SX} \exp(-\mu t) \\
    \label{eq-c_xs} C_{XS}(t) &= \sigma^2_{SX} \exp(-\lambda t) \\
   \label{eq-c_xx} C_{XX}(t) &= \rho \sigma^2_{SX} t\ \mathrm{exprel}[(\lambda - \mu) t]\ \exp(-\lambda t) + \sigma^2_{XX} \exp(-\mu t)\,.
\end{aligned}$$ {#eq-c_ss}

In the expressions above we used the relative exponential function

$$\mathrm{exprel}(x) = \begin{cases}
                    \frac{{\exp(x) - 1}}{{x}}, & \text{if } x \neq 0 \\
                    1, & \text{if } x = 0
                  \end{cases}$$

and the point (co-)variances

$$\begin{aligned}
    \sigma^2_{SS} &= \frac{\kappa}{\lambda} \\
    \sigma^2_{SX} &= \frac{\rho \sigma^2_{SS}}{\lambda + \mu} \\
    \sigma^2_{XX} &= \frac{\rho}{\mu} (\sigma^2_{SS} + \sigma^2_{SX})\,.
\end{aligned}$$

Because the process is stationary, the values of the covariance
functions for $t<0$ can be obtained by applying the symmetry relation
$C_{AB}(t) = C_{BA}(-t)$.

Now, we can directly compute the mutual information from the
covariances. Using [@eq-c_ss; @eq-c_sx; @eq-c_xs; @eq-c_xx] we obtain
the matrix elements of the joint covariance matrix $\Sigma$ defined in
[@eq-cov_z] and then the mutual information is given by the expression

$$I(\mathcal{S}, \mathcal{X}) = \frac{1}{2} \ln \left( \frac{|\Sigma_{SS}||\Sigma_{XX}|}{|\Sigma|} \right).$$

Note, that for discretized trajectories of length $n$, the matrix
$\Sigma$ has dimensions of $2n\times 2n$. Thus, the computation of the
trajectory mutual information requires the computation of a
$2n\times 2n$ matrix, which can be computationally challenging for long
trajectories (large $n$). In [@sec-notes-gaussian] of this thesis, we
discuss some techniques to considerably accelerate the computation of
the mutual information.

Using spectral analysis, @2010.Tostevin were able to derive an
analytical expression for the Gaussian mutual information rate of this
model in the continuous-time limit, given by


$$R(\mathcal{S}, \mathcal{X}) = \frac{\lambda}{2}\left[ \sqrt{1 + \frac{\rho}{\lambda}} - 1 \right] \,.
    \label{eq-spectral_tostevin_gaussian}$$ {#eq-spectral_tostevin_gaussian}

The information rate of the discretely sampled process converges to this
value as the sampling rate approaches infinity [@2010.Tostevin]. Notably
however, the model corresponding to [@eq-spectral_tostevin_gaussian] is
a continuum description that assumes Gaussian statistics; indeed, this
rate deviates from the mutual information rate of the exact model that
is described by the chemical master equation, even in the limit of large
copy numbers [@2023.Moor]. This finding is also further discussed in
[@sec-lna_vs_pws] ([@sec-linsys]).

[^1]: The contents of this chapter have been published in *Phys. Rev. X*
    **13**, 041017 (2023) [@2023.Reinhardt].

[^2]: Indeed, the mutual information
    $\mathrm{I}(\mathcal{S}, \mathcal{X})$ precisely quantifies how
    strong the statistical dependence is between the trajectory-valued
    random variables $\mathcal{S}$ and $\mathcal{X}$. From its
    definition
    $\mathrm{I}(\mathcal{S}, \mathcal{X})=\mathrm{H}(\mathcal{S}) - \mathrm{H}(\mathcal{S}|\mathcal{X})$
    we can understand more clearly how this affects the efficiency of
    the Monte Carlo estimate. Roughly speaking,
    $\mathrm{H}(\mathcal{S})$ is related to the number of distinct
    trajectories $\mathbfit{s}$ that can arise from the dynamics given
    by $\mathcal{P}[\mathbfit{s}]$, while
    $\mathrm{H}(\mathcal{S}|\mathcal{X})$ is related to the number of
    distinct trajectories $\mathbfit{s}$ that could have lead to a
    specific output $\mathbfit{x}$, on average. Therefore, if the mutual
    information is very large, the difference between these two numbers
    is very large, and consequently the number of overall distinct
    trajectories is much larger than the number of distinct trajectories
    compatible with output $\mathbfit{x}$. Now, if we generate
    trajectories according to the dynamics given by
    $\mathcal{P}[\mathbfit{s}]$, with overwhelming probability we
    generate a trajectory $\mathbfit{s}$ which is not compatible with
    the output trajectory $\mathbfit{x}$, and therefore
    $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]\approx 0$. Hence, the
    effective number of samples $M_\text{eff}$ is much smaller than the
    actual number of generated trajectories $M$, i.e.
    $M_\text{eff} \ll M$. We therefore only expect the estimate in
    [@eq-marginal-naive] to be reliable when computing the mutual
    information for systems where it is not too high. Thus, strikingly,
    the difficulty of computing the mutual information is proportional
    to the magnitude of the mutual information itself.

[^3]: Note that while the distribution
    $\exp(-\mathcal{U}[\mathbfit{s},\mathbfit{x}])/Z[\mathbfit{x}]$
    resembles the equilibrium distribution of a canonical ensemble from
    statistical mechanics, this does not imply that we are studying
    systems in thermal equilibrium. Indeed, PWS is used to quantify
    information transmission in systems driven out of equilibrium by the
    input signal. Thus, the notation introduced in this section is
    merely a mathematical reformulation of the marginalization integral
    to make the analogy to statistical physics apparent. We assign no
    physical meaning to the potentials and free energies. Also note that
    we set $k_{\mathrm{B}}T = 1$ since temperature is irrelevant here.

[^4]: The samples generated through resampling are only approximate
    because they are limited to the discrete set
    $\{\mathbfit{s}^1, \ldots, \mathbfit{s}^M\}$, which was originally
    drawn from the prior distribution $f[\mathbfit{s}]$. The resampling
    process assigns weights based on the target distribution, which are
    used to select from that set, but it does not generate entirely new
    samples directly from the target. Therefore, the sampled points do
    not constitute draws from the target distribution unless
    $M \rightarrow \infty$.

[^5]: <https://github.com/zechnerlab/PathMI>

[^6]: A detailed analysis of this observation was carried out in a
    (currently unpublished) collaborative work with Anne-Lena Moor and
    Christoph Zechner from the MPI-CBG in Dresden [@2024.Moor]. This
    work demonstrates that the discrepancy arises because all the
    information on the input signal is contained in the output species'
    production process, which is catalyzed by the input, rather than in
    the decay process of the output, which occurs independently of the
    input. The PWS result captures this distinction by using a fully
    discrete approach. In contrast, the Gaussian estimate of the
    linear-noise approximation misses this distinction because in the
    noise term for the output the contributions from the production and
    decay reactions are added together. We also comment further on this
    matter in [@sec-lna_vs_pws].
