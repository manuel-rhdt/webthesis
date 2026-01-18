---
license: CC-BY-4.0
csl: ../american-physics-society.csl
link-citations: true
reference-section-title: References
---

# Path Weight Sampling {#sec-dpws}

*The contents of this chapter have been published in *Phys. Rev. X* **13**, 041017 (2023) [@2023.Reinhardt].*

> Most natural and engineered information-processing systems transmit
> information via signals that vary in time. Computing the information
> transmission rate or the information encoded in the temporal
> characteristics of these signals requires the mutual information
> between the input and output signals as a function of time, i.e.,
> between the input and output trajectories. Yet, this is notoriously
> difficult because of the high-dimensional nature of the trajectory
> space, and all existing techniques require approximations. We present
> an exact Monte Carlo technique called Path Weight Sampling (PWS) that,
> for the first time, makes it possible to compute the mutual
> information between input and output trajectories for any stochastic
> system that is described by a master equation. The principal idea is
> to use the master equation to evaluate the exact conditional
> probability of an individual output trajectory for a given input
> trajectory and average this via Monte Carlo sampling in trajectory
> space to obtain the mutual information. PWS also makes it possible to
> compute the mutual information between input and output trajectories
> for systems with hidden internal states as well as systems with
> feedback from output to input.


## Introduction
[^1]

Quantifying information transmission is vital for understanding and
designing natural and engineered information-processing systems, ranging
from biochemical and neural networks, to electronic circuits and optical
systems [@2011.Tkacik; @2016.Tkacik; @2003.MacKay]. Claude Shannon
introduced the mutual information and the information rate as the
central measures of Information Theory more than 70 years
ago [@1948.Shannon]. These measures quantify the fidelity by which a
noisy system transmits information from its inputs to its outputs. Yet,
computing these quantities exactly remains notoriously difficult, if not
impossible. This is because the inputs and outputs are often not scalar
values, but rather temporal trajectories.

Most, if not all, information-processing systems transmit signal that
vary in time. The canonical measure for quantifying information
transmission via time-varying signals is the mutual information rate
[@1948.Shannon; @2006.Cover; @2009.Tostevin; @2014.Fiedor]. It
quantifies the speed at which distinct messages are transmitted through
the system, and it depends not only on the accuracy of the input-output
mapping but also on the correlations within the input and output
signals. Computing the mutual information rate thus requires computing
the mutual information between the input and output trajectories, not
between their signal values at given time points. The rate at which this
trajectory mutual information increases with the trajectory duration in
the long-time limit defines the mutual information rate, see
[@eq-intro-info-rate]. In the absence of feedback this rate also equals
the multi-step transfer entropy [@1990.Massey; @2000.Schreiber].

More generally, useful information is often contained in the temporal
dynamics of the signal. A prime example is bacterial chemotaxis, where
the response does not depend on the current ligand concentration, but
rather on whether it has changed in the recent past
[@1983.Block; @1986.Segall]. Moreover, the information from the input
may be encoded in the temporal dynamics of the output
[@1995.Marshall; @2013.Purvis; @2014.Selimkhanov; @2018.Granados].
Quantifying information encoded in these temporal features of the
signals requires the mutual information not between two time points,
i.e. the instantaneous mutual information, but rather between input and
output trajectories [@2009.Tostevin].

Unfortunately, computing the mutual information between trajectories is
exceptionally difficult. The conventional approach requires
non-parametric distribution estimates of the input and output
distributions, e.g. via histograms of data obtained through simulations
or experiments
[@1998.Strong; @2003.Paninski; @2011.Cheong; @2008.Tkacik; @2014.Tkacik; @2021.Meijers].
These non-parametric distribution estimates are necessary because the
mutual information cannot generally be computed from summary statistics
like the mean or variance of the data alone. However, the
high-dimensional nature of trajectories makes it infeasible to obtain
enough empirical data to accurately estimate the required probability
distributions. Moreover, this approach requires the discretization of
time, which becomes problematic when the information is encoded in the
precise timing of signal spikes, as, e.g., in neuronal systems
[@1999.Rieke]. Except for the simplest systems with a binary state space
[@2021.Meijers], the conventional approach to estimate the mutual
information via histograms therefore cannot be transposed to
trajectories.

Because there are currently no general schemes available to compute the
mutual information between trajectories exactly, approximate methods or
simplified models are typically used. While empirical distribution
estimates can be avoided by employing the K-nearest-neighbors entropy
estimator [@2002.Kaiser; @2004.Kraskov], this method depends on a choice
of metric in trajectory space and can become unreliable for long
trajectories [@2019.Cepeda-Humerez]. Alternative, decoding-based
information estimates can be developed for trajectories [@2008.Gao], but
merely provide a lower bound of the mutual information, and it remains
unclear how tight these lower bounds
are [@1999.Borst; @2019.Cepeda-Humerez; @2019.Hledik]. Analytical
results are avaiable for simple systems [@2016.Thomas], and for linear
systems that obey Gaussian statistics, the mutual information between
trajectories can be obtained from the covariance matrix
[@2009.Tostevin]. However, many information processing systems are
complex and non-linear such that the Gaussian approximation does not
hold, and analytical solutions do not exist. A more promising approach
to estimate the trajectory mutual information for chemical reaction
networks has been developed by @2019.Duso and generalized in
Ref. [@2023.Moor]. However, the scheme relies on a moment closure
approximation and has so far only been applied to very simple networks,
seemingly being difficult to extend to complex systems.

Here, we present *Path Weight Sampling* (PWS), an exact technique to
compute the trajectory mutual information for any system described by a
master equation. Master equations are widely used to model chemical
reaction networks
[@1940.Delbrueck; @1963.McQuarrie; @1964.McQuarrie; @2000.Elowitz],
biological population growth [@1939.Feller; @2010.Park; @2012.Cremer],
economic processes [@1992.Weidlich; @1995.Lux], and a large variety of
other systems [@2001.Helbing; @2009.Castellano], making our scheme of
interest to a broad class of problems.

PWS is an exact Monte Carlo scheme, in the sense that it provides an
unbiased statistical estimate of the trajectory mutual information. In
PWS, the mutual information is computed as the difference between the
marginal output entropy associated with the marginal distribution
$\mathcal{P}[\mathbfit{x}]$ of the output trajectories $\mathbfit{x}$,
and the conditional output entropy associated with the output
distribution $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ conditioned on the
input trajectory $\mathbfit{s}$. Our scheme is inspired by the
observation of @2019.Cepeda-Humerez that the path likelihood, i.e., the
probability $\mathcal{P}[\mathbfit{x}|s]$, can be computed exactly from
the master equation for a *static* input signal $s$. This makes it
possible to compute the mutual information between a discrete input and
a time-varying output via a Monte Carlo averaging procedure of the
likelihoods, rather than from an empirical estimate of the intractable
high-dimensional probability distribution functions. The scheme of
@2019.Cepeda-Humerez is however limited to discrete input signals that
do not vary in time. Here we show that the path likelihood
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ can also be computed for a
dynamical input *trajectory* $\mathbfit{s}$, which allows us to compute
the conditional output entropy also for time-varying inputs. While this
solves the problem in part, the marginal output entropy associated with
$\mathcal{P}[\mathbfit{x}]$ cannot be computed with the approach of
@2019.Cepeda-Humerez, and thus requires a different scheme.

In [@sec-sec2] we show how, for time-varying input signals, the marginal
probability $\mathcal{P}[\mathbfit{x}]$ can be obtained as a Monte Carlo
average of $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ over a large number
of input trajectories. We then use the Monte Carlo estimate for
$\mathcal{P}[\mathbfit{x}]$ to compute the marginal output entropy.

In [@sec-integrating-out] we show that, surprisingly, our PWS methods
additionally make it possible to compute the mutual information between
input and output trajectories of systems with hidden internal states.
Hidden states correspond, for example, to network components that merely
relay, process or transform the signal from the input to the output.
Indeed, the downstream system typically responds to the information that
is encoded in this output, and not the other internal system components.
Most information processing systems contain such hidden states, and
generally we want to integrate out these latent network components. In
addition, we can generalize PWS to systems with feedback from the output
to the input as shown in [@sec-feedback].

## Monte Carlo Estimate of the Mutual Information {#sec-sec2}

In this section we present the fundamental ideas of PWS. These ideas lie
at the heart of Direct PWS (DPWS) and also form the foundation of the
other two more advanced PWS variants which will be explained in
[@sec-variants].

### Statement of the Problem

All information processing systems repeatedly take an input value $s$
and produce a corresponding output $x$. Due to noise, the output
produced for the same input can be different every time, such that the
system samples outputs from the distribution $\mathrm P(x|s)$. In the
information theoretic sense, the device's capabilities are fully
specified by its output distributions for all possible inputs. We
consider the inputs as being distributed according to a probability
density $\mathrm{P}(s)$ such that the whole setup of signal and device
is completely described by the joint probability density
$\mathrm{P}(s, x) = \mathrm{P}(s)\,\mathrm P(x|s)$.

When the conditional output distributions $\mathrm P(x|s)$ overlap with
each other, information is lost because the input can not always be
inferred uniquely from the output (see [@fig-information]). The
remaining information that the output carries about the signal on
average is quantified by the mutual information between input and
output.

![ Schematic of information processing under the influence of noise. Overlapping output distributions for different inputs lead to information loss, because the input cannot always be uniquely inferred from the output. The mutual information $\mathrm{I}(\mathcal{S},\mathcal{X})$ quantifies how much information the observation of the output typically retains about the input signal. ](figures/mi-schema.svg){#fig-information}

Mathematically, the mutual information between a random variable
$\mathcal{S}$, representing the input, and a second random variable
$\mathcal{X}$, representing the output, is defined as


$$\mathrm I(\mathcal{S}, \mathcal{X}) = \iint ds\,dx\  \mathrm{P}(s, x) \ln \frac{\mathrm{P}(s, x)}{\mathrm{P}(s) \mathrm{P}(x)}\,,
    \label{eq-mutual_information}$$ {#eq-mutual_information}

where the marginal output distribution is given by
$\mathrm{P}(x) = \int ds\ \mathrm{P}(s, x)$. The quantity
$\mathrm I(\mathcal{S}, \mathcal{X})$ as defined above is a non-negative
real number, representing the mutual information between $\mathcal{S}$
and $\mathcal{X}$ in nats. The integrals in [@eq-mutual_information] run
over all possible realizations of the random variables $\mathcal{S}$ and
$\mathcal{X}$. In our case, $\mathcal{S}$ and $\mathcal{X}$ represent
stochastic trajectories and so the integrals become path integrals.

In general, the mutual information can be decomposed into two terms, a
conditional and marginal entropy. Due to the symmetry of
[@eq-mutual_information] with respect to exchange of $\mathcal{S}$ and
$\mathcal{X}$, this decomposition can be written as


$$\mathrm I(\mathcal{S}, \mathcal{X}) = \mathrm{H}(\mathcal{S}) - \mathrm{H}(\mathcal{S}|\mathcal{X}) = \mathrm{H}(\mathcal{X}) - \mathrm{H}(\mathcal{X}|\mathcal{S})\,.
    \label{eq-mutual_information_entropies}$$ {#eq-mutual_information_entropies}

The (marginal) input entropy $\mathrm{H}(\mathcal{S})$ represents the
total uncertainty about the input, and the conditional input entropy
$\mathrm{H}(\mathcal{S}|\mathcal{X})$ describes the remaining
uncertainty of the input after having observed the output. Thus, the
mutual information
$\mathrm{I}(\mathcal{S},\mathcal{X})=\mathrm{H}(\mathcal{S}) - \mathrm{H}(\mathcal{S}|\mathcal{X})$
naturally quantifies the reduction in uncertainty about the input
through the observation of the output.

When analyzing data from experiments or simulations however, the mutual
information is generally estimated via
$\mathrm{I}(\mathcal{S},\mathcal{X})=\mathrm{H}(\mathcal{X}) - \mathrm{H}(\mathcal{X}|\mathcal{S})$.
This is because simulation or experimental data generally provide
information about the distribution of outputs for a given input, rather
than vice versa. The accessible entropies are thus the marginal output
entropy $\mathrm{H}(\mathcal{X})$ and the conditional output entropy
$\mathrm{H}(\mathcal{X}|\mathcal{S})$, which are defined as


$$\begin{aligned}
    \mathrm{H}(\mathcal{X}) &= -\int dx\ \mathrm{P}(x) \ln \mathrm{P}(x)
    \label{eq-marginal-entropy} \\
    \mathrm{H}(\mathcal{X}|\mathcal{S}) &= -\int ds\ \mathrm{P}(s) \int dx\  \mathrm{P}(x|s) \ln \mathrm{P}(x|s) \,.
    \label{eq-conditional-entropy}
\end{aligned}$$ {#eq-marginal-entropy}

The conventional way of computing the mutual information involves
generating many samples to obtain empirical distribution estimates for
$\mathrm{P}(x|s)$ and $\mathrm{P}(x)$ via histograms. However, the
number of samples needs to be substantially larger than the number of
histogram bins to reduce the noise in the bin counts. Obtaining enough
samples is effectively impossible for high-dimensional data, like signal
trajectories. Moreover, any nonzero bin size leads to a systematic bias
in the entropy estimates, even in one dimension [@2003.Paninski]. These
limitations of the conventional method make it impractical for
high-dimensional data, highlighting the need for alternative approaches
to accurately compute mutual information for trajectories.

###  Direct PWS {#sec-algorithm}

![The PWS framework to compute the mutual information between trajectories in 4 steps. <strong>1</strong>. Generate $N$ input-output pairs from $\mathcal{P}[\mathbfit{s},\mathbfit{x}]$. <strong>2</strong>. For each input-output pair compute the trajectory likelihood $\mathcal{P}[\mathbfit{x}_i|\mathbfit{s}_i]$ using [@eq-traj_prob]. <strong>3</strong>. Compute $\mathcal{P}[\mathbfit{x}_i]$ for every output. This step differentiates the different variants of PWS from each other. Direct PWS is presented in this chapter, whereas RR-PWS and TI-PWS are described in [@sec-variants]. <strong>4</strong>. Using the likelihoods and the marginal probabilities from the previous steps we can estimate the mutual information using [@eq-average-of-differences]. ](figures/Algorithm.svg){#fig-algorithm}

The central idea of PWS is to compute probability densities for
trajectories exactly, sidestepping the problem having to estimate them
via histograms. We exploit that for systems described by a master
equation, the conditional probability of an output trajectory for a
given input trajectory can be computed analytically. With this insight
we can derive a procedure to compute the mutual information.
Specifically, we will show that

- for a system described by a master equation, the trajectory likelihood
  $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ is a quantity that can be
  computed on the fly in a stochastic simulation;

- input trajectories can be generated from $\mathcal{P}[\mathbfit{s}]$,
  output trajectories for a given input $\mathbfit{s}$ can be generated
  according to $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ using standard
  SSA (Gillespie) simulations;

- by combining the two ideas above, we can derive a direct Monte Carlo
  estimate for the mutual information
  $\mathrm{I}(\mathcal{S},\mathcal{X})$, as illustrated in
  [@fig-algorithm].

Note that we denote trajectories by bold symbols to distinguish them
from scalar quantities.

Our technique is conceptually straightforward. Using Monte Carlo
simulations we can compute averages over the configuration space of
trajectories. Suppose we have a function $f[\mathbfit{z}]$ that takes a
trajectory $\mathbfit{z}$ and produces a scalar value. The mean of
$f[\mathbfit{z}]$ with respect to the trajectory distribution
$\mathcal{P}[\mathbfit{z}]$ is then

$$\langle f[\mathbfit{z}] \rangle_{\mathcal{P}[\mathbfit{z}]}\equiv\int\mathcal{D}[\mathbfit{z}]\, \mathcal{P}[\mathbfit{z}]f(\mathbfit{z}) \,.$$

We write $\int\mathcal{D}[\mathbfit{z}]$ to denote a path integral over
all possible trajectories of a given duration. We estimate
$\langle f[\mathbfit{z}] \rangle_{\mathcal{P}[\mathbfit{z}]}$, by
generating a large number of trajectories
$\mathbfit{z}_1,\ldots,\mathbfit{z}_N$ from $\mathcal{P}[\mathbfit{z}]$
and evaluating the corresponding Monte Carlo average

$$\hat{f}_N = \frac{1}{N} \sum^N_{i=1} f(\mathbfit{z}_i)$$

which converges to the true mean in the limit $N\to\infty$.

Specifically, we want to estimate the conditional and the marginal
entropy to compute the mutual information. Let us imagine that we
generate $N$ input trajectories $\mathbfit{s}_1,\ldots,\mathbfit{s}_N$
from the distribution $\mathcal{P}[\mathbfit{s}]$. Next, for every input
$\mathbfit{s}_i$, we generate a set of $K$ outputs
$\mathbfit{x}_{i,1},\ldots,\mathbfit{x}_{i,K}$ from
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}_i]$. Then, the Monte Carlo
estimate for the conditional entropy is


$$\begin{aligned}
    \mathrm{H}(\mathcal{X}|\mathcal{S}) &= -\int \mathcal{D}[\mathbfit{s}]\ \mathcal{P}[\mathbfit{s}]\int \mathcal{D}[\mathbfit{x}]\ \mathcal{P}[\mathbfit{x}|\mathbfit{s}] \ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}] \\ 
    &=-\left\langle \left\langle \ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}] \right\rangle_{\mathcal{P}[\mathbfit{x}|\mathbfit{s}]} \right\rangle_{\mathcal{P}[\mathbfit{s}]} \\
    &\approx -\frac{1}{N}\sum^{N}_{i=1}\frac{1}{K}\sum^{K}_{j=1} \ln\mathcal{P}[\mathbfit{x}_{i,j}|\mathbfit{s}_i] \,.
\end{aligned}
\label{eq-conditional-entropy-estimate}$$ {#eq-conditional-entropy-estimate}

Secondly, for a given output $\mathbfit{x}$ we generate $M$ inputs
$\mathbfit{s}^\prime_1,\ldots,\mathbfit{s}^\prime_M$ according to
$\mathcal{P}[\mathbfit{s}]$, then we can obtain a Monte Carlo estimate
for the marginal probability of the output trajectory
$\mathcal{P}[\mathbfit{x}]$:


$$\begin{aligned}
    \mathcal{P}[\mathbfit{x}] &= \int\mathcal{D}[\mathbfit{s}]\  \mathcal{P}[\mathbfit{s}]  \mathcal{P}[\mathbfit{x}|\mathbfit{s}] \\
    &= \left\langle \mathcal{P}[\mathbfit{x}|\mathbfit{s}] \right\rangle_{\mathcal{P}[\mathbfit{s}]} \\
    &\approx \frac{1}{M}\sum^M_{j=1} \mathcal{P}[\mathbfit{x}|\mathbfit{s}^\prime_{j}]\,.
\end{aligned}
    \label{eq-marginal-naive}$$ {#eq-marginal-naive}

The estimate for the marginal entropy is then given by


$$\begin{aligned}
    \mathrm{H}(\mathcal{X}) &= -\int\mathcal{D}[\mathbfit{x}]\ \mathcal{P}[\mathbfit{x}]\ln\mathcal{P}[\mathbfit{x}] \\
    &= -\left\langle \ln\mathcal{P}[\mathbfit{x}] \right\rangle_{\mathcal{P}[\mathbfit{x}]}\\
    &\approx -\frac{1}{N}\sum^{N}_{i=1} \ln\mathcal{P}[\mathbfit{x}_i] \\
    &\approx -\frac{1}{N}\sum^{N}_{i=1} \ln \left[ \frac{1}{M}\sum^M_{j=1} \mathcal{P}[\mathbfit{x}_i|\mathbfit{s}^\prime_{i,j}] \right]\,.
\end{aligned}
    \label{eq-marginal-entropy-estimate}$$ {#eq-marginal-entropy-estimate}

In the last step we inserted the result from [@eq-marginal-naive]. In
this estimate, the trajectories $\mathbfit{x}_1,\ldots,\mathbfit{x}_N$
are sampled from $\mathcal{P}[\mathbfit{x}]$, i.e., by first sampling
from $\mathcal{P}[\mathbfit{s}]$ and then from
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$. Finally, the mutual
information is obtained by taking the entropy difference, i.e.,
$\mathrm{I}(\mathcal{S},\mathcal{X})=\mathrm{H}(\mathcal{X}) - \mathrm{H}(\mathcal{X}|\mathcal{S})$.

While this is the main idea behind PWS, it is computationally
advantageous to change the order of operations in the estimate.
Specifically, computing the difference of two averages, leads to large
statistical errors. We can obtain an improved estimate by reformulating
the mutual information as a single average of differences:


$$\begin{aligned}
    \mathrm{I}(\mathcal{S},\mathcal{X}) &= \int\mathcal{D}[\mathbfit{s}]\int\mathcal{D}[\mathbfit{x}]\ \mathcal{P}[\mathbfit{s},\mathbfit{x}] \ln\frac{\mathcal{P}[\mathbfit{x}|\mathbfit{s}]}{\mathcal{P}[\mathbfit{x}]} \\
    &=  \left\langle
    \ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}] -
    \ln\mathcal{P}[\mathbfit{x}]
    \right\rangle_{\mathcal{P}{[\mathbfit{s},\mathbfit{x}]}}\,.
\end{aligned}
\label{eq-average-of-differences}$$ {#eq-average-of-differences}

This equation applies to all variants of PWS. They differ, however, in
the way $\mathcal{P}[\mathbfit{x}]$ is computed. In the brute-force
version of PWS, called *Direct PWS* (DPWS), we use [@eq-marginal-naive]
to evaluate the marginal probability $\mathcal{P}[\mathbfit{x}]$. DPWS
indeed involves two nested Monte Carlo computations, in which $N$ pairs
$(\mathbfit{s}_i, \mathbfit{x}_i)$ are generated, and for each output
$\mathbfit{x}_i$, $M$ input trajectories $\{\mathbfit{s}\}$ are
generated from scratch to compute $\mathcal{P}[\mathbfit{x}]$. In
[@sec-variants], we present two additional variants of PWS where the
brute-force estimate of the marginal probability
$\mathcal{P}[\mathbfit{x}]$ is replaced by more elaborate schemes. That
said, DPWS is a conceptually simple, straightforward to implement, and
exact scheme to compute the mutual information.

Having explained the core ideas of our technique above, we will continue
this section with a review of the necessary concepts of master equations
to implement PWS. First, in [@sec-mjp], we derive the formula for the
conditional probability $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ which
lies at the heart of our technique. In
[@sec-mjp; @sec-input-statistics], we discuss how trajectories are
generated according to $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ and
$\mathcal{P}[\mathbfit{s}]$, which are the remaining ingredients
required for using DPWS. Then, in [@sec-variants], we will present the
two other variants of PWS that improve on DPWS.

###  Driven Markov Jump Process {#sec-mjp}

In this chapter, we consider systems that can be modeled by a master
equation and are being driven by a stochastic signal. The master
equation specifies the time evolution of the conditional probability
distribution $\mathrm{P}(x,t|x_0, t_0)$ which is the probability for the
process to reach the discrete state $x\in\Omega$ at time $t$, given that
it was at state $x_0\in\Omega$ at the previous time $t_0$. The state
space $\Omega$ is multi-dimensional if the system is made up of multiple
components and therefore $x$ and $x_0$ can be vectors rather than scalar
values. Denoting the transition rate at time $t$ from state $x$ to
another state $x^\prime \neq x$ by $w_t(x^\prime, x)$, the master
equation reads

$$\frac{\partial\mathrm{P}(x,t)}{\partial t} = \sum_{x^\prime\in\Omega\setminus\{x\}} [w_t(x, x^\prime) \mathrm{P}(x^\prime,t) - w_t(x^\prime, x) \mathrm{P}(x,t)] \,,$$

where, for brevity, we suppress the dependence on the initial condition,
i.e., $\mathrm{P}(x,t)=\mathrm{P}(x,t|x_0,t_0)$. By defining
$Q_t(x^\prime,x) = w_t(x^\prime,x)$ for $x \neq x^\prime$ and

$$Q_t(x, x) = -\sum_{x^\prime\in\Omega\smallsetminus\{x\}} w_t(x^\prime, x)$$

the master equation simplifies to


$$\frac{\partial\mathrm{P}(x,t)}{\partial t} = \sum_{x^\prime\in\Omega} Q_t(x, x^\prime) \mathrm{P}(x^\prime,t)\,. \label{eq-master-equation}$$ {#eq-master-equation}

Note that by definition the diagonal matrix element $Q_t(x,x)$ is the
negative exit rate from state $x$, i.e. the total rate at which
probability flows away from state $x$.

Using the master equation we can compute the probability of any
trajectory. A trajectory $\mathbfit{x}$ is defined by a list of jump
times $t_1,\ldots,t_{n-1}$, together with a sequence of system states
$x_0,\ldots,x_{n-1}$. The trajectory starts at time $t_0$ in state $x_0$
and ends at time $t_n$ in state $x_{n-1}$, such that its duration is
$T=t_n-t_0$. At each time $t_i$ (for $i=1,\ldots,n-1$) the trajectory
describes an instantaneous jump $x_{i-1}\rightarrow x_{i}$. The
probability density of $\mathbfit{x}$ is


$$\begin{aligned}
    \mathcal{P}[\mathbfit{x}] &= 
    \mathrm{P}(x_0)\times \left(
    \prod^{n-1}_{i=1} Q_{t_i}\left(x_i, x_{i-1}\right) 
    \right) \\
    &\quad\times\left(
    \prod^{n}_{i=1}
    \exp\int\limits^{t_{i}}_{t_{i-1}} dt\ Q_t(x_{i-1}, x_{i-1})
    \right),
\end{aligned}
\label{eq-traj-prob-master-eq}$$ {#eq-traj-prob-master-eq}

a product of the probability of the initial state $\mathrm{P}(x_0)$, the
rates of the $n-1$ transitions $Q_{t_i}\left(x_i, x_{i-1}\right)$, and
the survival probabilities for the waiting times between jumps, given by
$\exp\int^{t_{i}}_{t_{i-1}} dt\ Q_t(x_{i-1}, x_{i-1})$ for
$i=1,\ldots,n$.

#### Computing the Likelihood $\mathcal{P}[x|s]$  {#sec-likelihood}

To compute the likelihood or conditional
probability $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ of an output
trajectory $\mathbfit{x}$ for a given input trajectory $\mathbfit{s}$,
we note that the input determines the time-dependent stochastic dynamics
of the jump process. Indeed, the transition rates at time $t$, given by
$Q_t(x^\prime,x; {\mathbfit{s}})$, depend explicitly on the input $s(t)$
at time $t$ and may even depend on the entire history of
${\mathbfit{s}}$ prior to $t$.

In the common case that every input trajectory $\mathbfit{s}$ leads to a
unique transition rate matrix $Q_t(x^\prime,x;\mathbfit{s})$, i.e. the
map $\mathbfit{s}\mapsto Q_t(\cdot,\cdot;\mathbfit{s})$ is injective,
the likelihood is directly given by [@eq-traj-prob-master-eq]:


$$\begin{aligned}
    \mathcal{P}[\mathbfit{x}|\mathbfit{s}] &= 
    \mathrm{P}(x_0|s_0)\times \left(
    \prod^{n-1}_{i=1} Q_{t_i}\left(x_i, x_{i-1} ;\mathbfit{s}\right) 
    \right) \\
    &\quad\times\left(
    \prod^{n}_{i=1}
    \exp\int\limits^{t_{i}}_{t_{i-1}} dt\ Q_t(x_{i-1}, x_{i-1};\mathbfit{s})
    \right)
    \label{eq-traj_prob}
\end{aligned}$$ {#eq-traj_prob}

where $\mathrm{P}(x_0|s_0)$ is the probability of the initial state
$x_0$ of the output given the initial state of the input $s_0=s(t_0)$.

The evaluation of the trajectory likelihood is at the heart of our Monte
Carlo scheme. However, numerically computing a large product like
[@eq-traj_prob] very quickly reaches the limits of floating point
arithmetic since the result is often either too large or too close to
zero to be representable as a floating point number. Thus, to avoid
numerical issues, it is vital to perform the computations in log-space,
i.e. to compute


$$\ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}] = \ln \mathrm{P}(x_0|s_0) + \int^T_{t_0}dt\ \mathcal{L}_t[\mathbfit{s},\mathbfit{x}]
    \label{eq-log_traj_prob}$$ {#eq-log_traj_prob}

where


$$\mathcal{L}_t[\mathbfit{s},\mathbfit{x}] = Q_t(x(t),x(t);\mathbfit{s}) +
    \sum^{n-1}_{i=1} \delta(t-t_i) \ln Q_t(x_i,x_{i-1};\mathbfit{s})\,.
    \label{eq-path_action}$$ {#eq-path_action}

The computation of the log-likelihood
$\ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ for given trajectories
$\mathbfit{s}$ and $\mathbfit{x}$ according to
[@eq-log_traj_prob; @eq-path_action] proceeds as follows:

- At the start of the trajectory we compute the log-probability of the
  initial condition $\ln\mathrm{P}(x_0|s_0)$,

- for every jump $x_{i-1}\rightarrow x_i$ in $\mathbfit{x}$ (at time
  $t_i$) compute the log jump propensity
  $\ln Q_{t_i}(x_i,x_{i-1};\mathbfit{s})$, and

- for every interval $(t_{i-1},t_i)$ of constant output value
  $x(t) = x_{i-1}$ between two jumps of $\mathbfit{x}$, we compute
  $\int^{t_i}_{t_{i-1}}dt\ Q_t(x_{i-1},x_{i-1}; \mathbfit{s})$. This
  integral can be performed using standard numerical methods such as the
  trapezoidal rule, which is also exact if $Q_t(x(t),x(t);\mathbfit{s})$
  is a piecewise linear function of $t$.

The sum of the three contributions above yields the exact log-likelihood
$\ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ as given in
[@eq-log_traj_prob].

The algorithm to compute the log-likelihood
$\ln\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ is both efficient and
straightforward to implement, being closely related to the standard
Gillespie algorithm. The only term in [@eq-log_traj_prob] that cannot be
directly obtained from the master equation is $\ln\mathrm{P}(x_0|s_0)$.
This quantity depends on the initial distribution of the system of
interest.

Our scheme can be applied to any system with a well-defined
(non-equilibrium) initial distribution $\mathrm{P}(s_0, x_0)$ as
specified by, e.g. the experimental setup. Most commonly though, one is
interested in studying information transmission for systems in steady
state. Then, the initial condition $\mathrm{P}(s_0,x_0)$ is the
stationary distribution of the Markov process. Depending on the
complexity of the system, this distribution can be found either
analytically from the master equation [@2007.vanKampen; @2017.Weber]
(possibly using simplifying approximations [@2009.Walczak; @2007.Kim]),
or computationally from stochastic simulations [@1976.Gillespie].

#### Sampling from $\mathcal{P}[x|s]$ {#sec-gillespie}

Standard kinetic Monte Carlo simulations naturally produce exact samples
of the probability distribution $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$
as defined in [@eq-traj_prob]. That is, for any signal trajectory
$\mathbfit{s}$ and initial state $x_0$ drawn from $\mathrm{P}(x_0|s_0)$
we can use the Stochastic Simulation Algorithm (SSA) or variants thereof
to generate a corresponding trajectory $\mathbfit{x}$. The SSA
propagates the initial condition $x_0,t_0$ forward in time according to
the transition rate matrix $Q_t(\cdot;\mathbfit{s})$. In the standard
Direct SSA algorithm [@1976.Gillespie] this is done by alternatingly
sampling the waiting time before the next transition, and then selecting
the actual transition.

The transition rates $Q_t(x^\prime,x;\mathbfit{s})$ of a driven master
equation are necessarily time-dependent since they include the coupling
of the jump process to the input trajectory $\mathbfit{s}$, which itself
varies in time. These time-varying transition rates need to be accounted
for in the SSA. While most treatments of the SSA assume that the
transition rates are constant in time, this restriction is easily
lifted. Consider step $i$ of the Direct SSA which generates the next
transition time $t_{i+1} = t_i+\Delta t_i$. For time-varying transition
rates the distribution of the stochastic waiting time $\Delta t_i$ is
characterized by the survival function

$$S_i(\tau) = \mathrm{P}(\Delta t_i > \tau) = \exp\int^{t_i+\tau}_{t_i} dt\ Q_t(x_i, x_i;\mathbfit{s}) \,.$$

The waiting time can be sampled using inverse transform sampling, i.e.
by generating a uniformly distributed random number $u\in[0,1]$ and
computing the waiting time using the inverse survival function
$\Delta t_i = S^{-1}_i(u)$. Numerically, computing the inverse of the
survival function requires solving the equation


$$\ln u = \int^{t_i+\Delta t_i}_{t_i} dt\ Q_t(x_i, x_i;\mathbfit{s})
    \label{eq-inverse-transform-sampling}$$ {#eq-inverse-transform-sampling}

for the waiting time $\Delta t_i$. Depending on the complexity of
$Q_t(x_i, x_i|\mathbfit{s})$, this equation can either be solved
analytically or numerically, e.g. using Newton's method. Hence, this
method to generate stochastic trajectories is only truly exact if we can
solve [@eq-inverse-transform-sampling] analytically. Additionally, in
some cases more efficient variants of the SSA with time dependent rates
could be used [@1997.Prados; @2015.Thanh].

### Input Statistics {#sec-input-statistics}

For our mutual information estimate, we need to be able to draw samples
from the input distribution $\mathcal P[\mathbfit{s}]$. Our algorithm
poses no restrictions on $\mathcal{P}[\mathbfit{s}]$ other than the
possibility to generate sample trajectories.

For example, the input signal may be described by a continuous-time jump
process. One benefit is that it is possible to generate exact
realizations of such a process (using the SSA) and to exactly compute
the likelihood $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ using
[@eq-log_traj_prob]. Specifically, the likelihood can be exactly
evaluated because the transition rates $Q_t(\cdot,\cdot;\mathbfit{s})$
for any input trajectory $\mathbfit{s}$, while time-dependent, are
*piece-wise constant*. This implies that the integral in
[@eq-log_traj_prob] can be evaluated analytically without
approximations. Similarly, for piece-wise constant transition rates, the
inverse function of [@eq-inverse-transform-sampling] can be evaluated
directly such that we can sample exact trajectories from the driven jump
process. As a result, when both input and output are described by a
master equation, PWS is a completely exact Monte Carlo scheme to compute
the mutual information.

However, the techniques described here do *not* require the input signal
$\mathbfit{s}$ to be described by a continuous-time jump process, or
even to be Markovian. The input signal can be any stochastic process for
which trajectories can be generated numerically. This includes
continuous stochastic processes that are found as solutions to
stochastic differential equations [@1992.Kloeden].

## Integrating Out Internal Components  {#sec-integrating-out}

So far the output trajectory $\mathbfit{x}$ has been considered to
correspond to the trajectory of the system in the *full* state space
$\Omega$. Concomitantly, the method presented is a scheme for computing
the mutual information between the input signal $\mathbfit{s}$ and the
trajectory $\mathbfit{x}$, comprising the time evolution of all the $n$
components in the system, $X^1, X^2,\ldots, X^n$. Each component $X^i$
itself has a corresponding trajectory $\mathbfit{x}^i$, such that the
full trajectory can be represented as a vector
$\mathbfit{x}=(\mathbfit{x}^1,\ldots,\mathbfit{x}^n)$. It is indeed also
the conditional probability
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]=\mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^n|\mathbfit{s}]$
and the marginal probability
$\mathcal{P}[\mathbfit{x}]=\mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^n]$
of this vector in the full state space that can be directly computed
from the master equation. In fact, it is this vector, which captures the
states of all the components in the system, that carries the most
information on the input signal $\mathbfit{s}$, and thus has the largest
mutual information. However, typically the downstream system cannot read
out the states of all the components $X^1, \ldots, X^n$. Often, the
downstream system reads out only a few components or often even just one
component, the "output component" $X^r$. The other components then
mainly serve to transmit the information from the input $\mathbfit{s}$
to this readout $X^r$. From the perspective of the downstream system,
the other components are hidden. The natural quantity to measure the
precision of information processing is then the mutual information
$\mathrm{I}(\mathcal{S};\mathcal{X}^r)$ between the input $\mathbfit{s}$
and the output component's trajectory $\mathbfit{x}^r$, not
$\mathrm{I}(\mathcal{S};\mathcal{X})$. The question then becomes how to
compute $\mathcal{P}[\mathbfit{x}^r]$ and
$\mathcal{P}[\mathbfit{x}^r|\mathbfit{s}]$, from which
$\mathrm{I}(\mathcal{S};\mathcal{X}^r)$ can be obtained. Here, we
present a scheme to achieve this.

As an example, consider a chemical reaction network with species
$X^1,\ldots,X^{n}$. Without loss of generality, we will assume that the
$n$-th component is the output component, $X^r=X^n$. The other species
$X^1,\ldots,X^{n-1}$ are thus not part of the output, but only relay
information from the input signal $\mathbfit{s}$ to the output signal
$\mathbfit{x}^n$. To determine the mutual information
$\mathrm{I}(\mathcal{S},\mathcal{X})$ we need
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}]$, where $\mathbfit{x}^n$ is
the trajectory of only the readout component $X^n$. However, from the
master equation we can only obtain an expression for the full
conditional probability
$\mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^n|\mathbfit{s}]$ of all
components. To compute the value of
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}]$, we must perform the
marginalization integral


$$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}] = \int\mathcal{D}[\mathbfit{x}^1] \cdots \int\mathcal{D}[\mathbfit{x}^{n-1}]\; \mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^n|\mathbfit{s}]\,.
    \label{eq-marginalization_integral}$$ {#eq-marginalization_integral}

We can compute this integral using a Monte Carlo scheme as described
below and use the resulting estimate for
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}]$ to compute the mutual
information using our technique presented in [@sec-algorithm].

The marginalization of [@eq-marginalization_integral] entails
integrating out degrees of freedom from a known joint probability
distribution. In [@eq-marginal-naive] we solved the analogous problem of
obtaining the marginal probability $\mathcal{P}[\mathbfit{x}]$ by
integrating out the input trajectories through the integral
$\mathcal{P}[\mathbfit{x}]=\int d\mathbfit{s}\ \mathcal{P}[\mathbfit{s},\mathbfit{x}]=\int d\mathbfit{s}\ \mathcal{P}[\mathbfit{s}]\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$.
As described in [@sec-algorithm], the integral from [@eq-marginal-naive]
can be computed via a Monte Carlo estimate by sampling many input
trajectories from $\mathcal{P}[\mathbfit{s}]$ and taking the average of
the corresponding conditional probabilities
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}_i]$. We will show that in the
case where there is no feedback from the readout component back to the
other components, a completely analogous Monte Carlo estimate can be
derived for [@eq-marginalization_integral].

More specifically, we can evaluate [@eq-marginalization_integral] via a
direct Monte Carlo estimate under the condition that the stochastic
dynamics of the other components $X^1,\ldots,X^{n-1}$ are not influenced
by $X^n$ (i.e., no feedback from the readout). Using the identity

$$\mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^n|\mathbfit{s}] = \mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^{n-1}|\mathbfit{s}]\ \mathcal{P}[\mathbfit{x}^n|\mathbfit{x}^1_i,\ldots,\mathbfit{x}^{n-1}_i,\mathbfit{s}]$$

to rewrite the integrand in [@eq-marginalization_integral], we are able
to represent the conditional probability
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}]$ as an average over the
readout component's trajectory probability


$$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}] = 
    \left\langle \mathcal{P}[\mathbfit{x}^n|\mathbfit{x}^1_i,\ldots,\mathbfit{x}^{n-1}_i,\mathbfit{s}] \right\rangle_{\mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^{n-1}|\mathbfit{s}]} \,.
    \label{eq-marginalization_average}$$ {#eq-marginalization_average}

Thus, assuming that we can evaluate the conditional probability of the
readout given all the other components,
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{x}^1_i,\ldots,\mathbfit{x}^{n-1}_i,\mathbfit{s}]$,
we arrive at the estimate


$$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}] 
    \approx \frac{1}{M}\sum^M_{i=1} \mathcal{P}[\mathbfit{x}^n|\mathbfit{x}^1_i,\ldots,\mathbfit{x}^{n-1}_i,\mathbfit{s}]
\label{eq-marginalization_mc}$$ {#eq-marginalization_mc}

where the samples $\mathbfit{x}^1_i,\ldots,\mathbfit{x}^{n-1}_i$ for
$i=1,\ldots,M$ are drawn from
$\mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^{n-1}|\mathbfit{s}]$.
Notice that the derivation of this Monte Carlo estimate is fully
analogous to the estimate in [@eq-marginal-naive], but instead of
integrating out the input trajectory $\mathbfit{s}$ we integrate out the
component trajectories $\mathbfit{x}^1,\ldots,\mathbfit{x}^{n-1}$.

To obtain
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{x}^1_i,\ldots,\mathbfit{x}^{n-1}_i,\mathbfit{s}]$
in [@eq-marginalization_average; @eq-marginalization_mc], we note that,
in absence of feedback, we can describe the stochastic dynamics of the
readout component $X^n$ as a jump process with time-dependent transition
rates whose time-dependence arises from the trajectories of the other
components $\mathbfit{x}^1,\ldots,\mathbfit{x}^{n-1}$ and the input
input $\mathbfit{s}$. In effect, this is a driven jump process for
$X^n$, driven by all upstream components $X^1,\ldots,X^{n-1}$ and the
input signal. Specifically, denoting
$\mathbfit{u}=(\mathbfit{x}^1,\ldots,\mathbfit{x}^{n-1},\mathbfit{s})$
as the joint trajectory representing the history of all upstream
components as well as the input signal, we can, as explained in
[@sec-mjp], write the time dependent transition rate matrix
$Q_t(\cdot|\mathbfit{u})$ for the stochastic dynamics of $X^n$ and use
[@eq-traj_prob] to compute
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{u}]=\mathcal{P}[\mathbfit{x}^n|\mathbfit{x}^1_i,\ldots,\mathbfit{x}^{n-1}_i,\mathbfit{s}]$.
Using [@eq-marginalization_mc], this then allows us to compute
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}]$.

Finally, to compute the mutual information
$\mathrm{I}(\mathcal{S};\mathcal{X}^n)$, e.g. using the estimate in
[@eq-average-of-differences], we additionally need to evaluate the
marginal output probability $\mathcal{P}[\mathbfit{x}^n]$. This requires
us to perform one additional integration over the space of input
trajectories $\mathbfit{s}$:

$$\begin{aligned}
    \mathcal{P}[\mathbfit{x}^n] &= \int\mathcal{D}[\mathbfit{s}]\ \mathcal{P}[\mathbfit{s}] \mathcal{P}[\mathbfit{x}^n|\mathbfit{s}] \\
    &= \left\langle \mathcal{P}[\mathbfit{x}^n|\mathbfit{s}] \right\rangle_{\mathcal{P}[\mathbfit{s}]} \,.
\end{aligned}$$

The corresponding Monte Carlo estimate is

$$\begin{aligned}
    \mathcal{P}[\mathbfit{x}^n] &\approx \frac{1}{N}\sum^N_{i=1} \mathcal{P}[\mathbfit{x}^n|\mathbfit{s}_i] \\
    &\approx \frac{1}{N}\sum^N_{i=1}\frac{1}{M}\sum^M_{j=1} \mathcal{P}[\mathbfit{x}^n|\mathbfit{x}^1_{ij}, \ldots, \mathbfit{x}^{n-1}_{ij}, \mathbfit{s}_i]
    \end{aligned}$$

where the input trajectories $\mathbfit{s}_i$ follow
$\mathcal{P}[\mathbfit{s}]$ and the intermediate components
$(\mathbfit{x}^1_{ij},\ldots,\mathbfit{x}^{n-1}_{ij})$, for
$i=1,\ldots,N$ and $j=1,\ldots,M$, follow
$\mathcal{P}[\mathbfit{x}^1,\ldots,\mathbfit{x}^{n-1}|\mathbfit{s}_i]$.

In summary, the scheme to obtain
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{u}]$ in the presence of hidden
intermediate components is analogous to that used for computing
$\mathcal{P}[\mathbfit{x}]$ from
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$. In both cases, one needs to
marginalize a distribution function by integrating out components.
Indeed, the schemes presented here and in [@sec-algorithm] are bona fide
schemes to compute the mutual information between the input
$\mathbfit{s}$ and either the trajectory of the output component
$\mathbfit{x}^n$ or the full output $\mathbfit{x}$. However, when the
trajectories are sufficiently long or the stochastic dynamics are
sufficiently complex, then the free-energy schemes of [@sec-variants] may
be necessary to enhance the efficiency of computing the marginalized
distribution, $\mathcal{P}[\mathbfit{x}]$ or
$\mathcal{P}[\mathbfit{x}^n|\mathbfit{s}]$.

## Dealing with Feedback {#sec-feedback}

In principle all physical information processing systems exhibit
feedback. The physical interaction needed to measure the input signal
necessarily affects the incoming signal, and indeed, it follows that no
information can be extracted from the input signal without any
perturbation of the input dynamics. Often, it is assumed that the
amplitude of such perturbations is comparatively small and thus that the
feedback can safely be ignored.

Indeed, the PWS scheme was derived with the assumption of no feedback.
In this section, we drop the assumption and will explicitly consider
systems where the produced output perturbs the input, i.e. systems where
the output feeds back onto the input. We will first discuss the
additional problems that arise when computing the mutual information for
a system with feedback, and subsequently present a modified version of
PWS that can be used to compute the trajectory mutual information for
these systems.

### Computing the Mutual Information with Feedback between Input and Output {#sec-mi-feedback}

PWS requires the computation of the trajectory likelihood
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$, a quantity that is not readily
available for systems with feedback. Indeed, as already mentioned in
[@sec-likelihood], for a given input trajectory $\mathbfit{s}$, the
output dynamics are no longer described by a Markov process in a system
with feedback, and therefore we cannot find an expression for
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ based on the master equation.
This implies that for systems with feedback, PWS schemes cannot be used
without modification. While it is generally not possible to derive an
expression for the conditional probability
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$ in systems with feedback, we
often still can compute the joint probability density
$\mathcal{P}[\mathbfit{s},\mathbfit{x}]$ instead. Based on this
quantity, we will present a modified PWS scheme to compute the mutual
information for systems with feedback.

Specifically, since PWS is a model-based approach to compute the mutual
information, when there is feedback from the output back to the input,
we require a complete model of the combined system. Specifically, such a
model must provide an expression for the joint probability
$\mathcal{P}[\mathbfit{s},\mathbfit{x}]$, describing the input dynamics
and the interaction between input and output, including the feedback.

An estimate of the mutual information that only relies on the
computation of joint probability densities
$\mathcal{P}[\mathbfit{s},\mathbfit{x}]$ can be obtained by expressing
the mutual information as

$$\mathrm{I}(\mathcal{S}, \mathcal{X}) = \int\mathcal{D}[\mathbfit{s}]\int\mathcal{D}[\mathbfit{x}]\ \mathcal{P}[\mathbfit{s},\mathbfit{x}] \ln \frac{\mathcal{P}[\mathbfit{s}, \mathbfit{x}]}{\mathcal{P}[\mathbfit{s}]\,\mathcal{P}[\mathbfit{x}]}\,.$$

Thus, the PWS scheme with feedback consists of the computation of


$$\mathrm{I}(\mathcal{S}, \mathcal{X}) = \left\langle
    \ln\frac{\mathcal{P}[\mathbfit{s}, \mathbfit{x}]}{\mathcal{P}[\mathbfit{s}]\,\mathcal{P}[\mathbfit{x}]}
    \right\rangle_{\mathcal{P}[\mathbfit{s},\mathbfit{x}]}
    \label{eq-mi-with-feedback}$$ {#eq-mi-with-feedback}

which we want to estimate via a Monte Carlo average using samples from
$\mathcal{P}[\mathbfit{s}, \mathbfit{x}]$. We see that while we don't
need to evaluate the likelihood
$\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$, we now need to explicitly
compute the joint density $\mathcal{P}[\mathbfit{s}, \mathbfit{x}]$, and
two marginal densities, $\mathcal{P}[\mathbfit{s}]$ and
$\mathcal{P}[\mathbfit{x}]$, for each Monte Carlo sample
$(\mathbfit{s}, \mathbfit{x})\sim\mathcal{P}[\mathbfit{s},\mathbfit{x}]$.
While the joint density can be evaluated directly by assumption, each of
the marginalized densities can only be computed using a nested Monte
Carlo estimate.

Specifically, for PWS with feedback, we need to compute *two*
marginalization integrals per Monte Carlo sample:


$$\mathcal{P}[\mathbfit{s}] = \int\mathcal{D}[\mathbfit{x}]\ \mathcal{P}[\mathbfit{s}, \mathbfit{x}]\,,
    \label{eq-marg1}$$ {#eq-marg1}

and


$$\mathcal{P}[\mathbfit{x}] = \int\mathcal{D}[\mathbfit{s}]\ \mathcal{P}[\mathbfit{s}, \mathbfit{x}] \,.
    \label{eq-marg2}$$ {#eq-marg2}

However, these marginalization integrals cannot be directly computed
with the techniques described so far. Therefore, in the following
subsection, we discuss how to compute marginalization integrals for
systems with feedback.

Additionally, as discussed in [@sec-integrating-out], we may also need
to integrate out internal components of the master equation even when
the output feeds back onto these internal components. The technique
discussed below can also be used in this case as a way to compute the
marginalization integral in [@eq-marginalization_integral].

### Marginalization Integrals for Systems with Feedback {#sec-marginalization-feedback}

Computing marginalization integrals in systems with feedback is harder
than it is in the case without feedback. Specifically, we will show that
it is not obvious how apply the Monte Carlo estimate from
[@eq-marginal-naive] to systems with feedback. Nevertheless, if the
system with feedback can be decomposed into a non-interacting part and
an interacting part that includes the feedback, it is often still
possible to compute marginalization integrals. Below, we sketch the
steps that are necessary in order to compute marginalization integrals
for systems with feedback using such a decomposition.

For concreteness, we discuss how to compute


$$\mathcal{P}[\mathbfit{x}]=\int\mathcal{D}[\mathbfit{s}]\ \mathcal{P}[\mathbfit{s},\mathbfit{x}]
    \label{eq-feedback-marginalization-integral}$$ {#eq-feedback-marginalization-integral}

as the prototype for a marginalization integral we want to compute.
Unlike before, we now assume that $\mathbfit{x}$ feeds back onto
$\mathbfit{s}$. That means that we have access to the joint
distribution's density $\mathcal{P}[\mathbfit{s},\mathbfit{x}]$, but not
to the marginal density $\mathcal{P}[\mathbfit{s}]$ or the conditional
density $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$.

Formulated in the language of statistical physics, marginalization is
equivalent to the computation of the free-energy difference
$\Delta\mathcal{F}[\mathbfit{x}]=\mathcal{F}[\mathbfit{x}]-\mathcal{F}_0[\mathbfit{x}]$
between two ensembles described by potentials
$\mathcal{U}[\mathbfit{s},\mathbfit{x}]$ and
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]$. Previously, for systems
without feedback, we chose these potentials to be
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]=-\ln\mathcal{P}[\mathbfit{s}]$
and
$\mathcal{U}[\mathbfit{s},\mathbfit{x}]=-\ln\mathcal{P}[\mathbfit{s}, \mathbfit{x}]$
with the idea that $\mathcal{U}$ is the potential corresponding to the
actual system and $\mathcal{U}_0$ is the potential of a reference system
with known free energy. Then, by computing the free-energy difference
between the reference system and the actual system, we could compute the
marginal probability $\mathcal{P}[\mathbfit{x}]$.

However, in systems with feedback we face a problem. Note that the
actual system is still described by the potential
$\mathcal{U}[\mathbfit{s},\mathbfit{x}]=-\ln\mathcal{P}[\mathbfit{s}, \mathbfit{x}]$,
even with feedback. Yet, for the reference system described by
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]$ we cannot make the same
choice as before, because the previous choice involved the marginal
probability $\mathcal{P}[\mathbfit{s}]$ which is not available with
feedback.

Instead, we have to find an alternative expression for
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]$. To construct a suitable
reference potential, we can use a decomposition of the full potential
into three parts


$$\mathcal{U}[\mathbfit{s}, \mathbfit{x}] = \mathcal{U}_S[\mathbfit{s}] + \mathcal{U}_X[\mathbfit{x}] + \Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}]
    \label{eq-hamiltonian-decomposition}$$ {#eq-hamiltonian-decomposition}

where $\Delta\mathcal{U}[\mathbfit{s}, \mathbfit{x}]$ describes the
features of the system that induce interaction, or correlation, between
$\mathbfit{s}$ and $\mathbfit{x}$. The first two terms of the potential
above, $\mathcal{U}_S[\mathbfit{s}] + \mathcal{U}_X[\mathbfit{x}]$,
therefore describe a *non-interacting* version of the system, where the
input and output are fully independent of each other. We want to use the
potential of that non-interacting version as our expression for
$\mathcal{U}_0$, i.e.
$\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}] = \mathcal{U}_S[\mathbfit{s}] + \mathcal{U}_X[\mathbfit{x}]$.
To be able to do so, we require that the partition function
(normalization constant)


$$\mathcal{Z}_0[\mathbfit{x}] = \int\mathcal{D}[\mathbfit{s}]\ e^{-\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]}
    \label{eq-z0}$$ {#eq-z0}

is known. In other words, we need to choose the decomposition in
[@eq-hamiltonian-decomposition] such that the partition function
[@eq-z0] is known either analytically or numerically. If such a
decomposition is found, we can compute the marginal probability
$\mathcal{P}[\mathbfit{x}]$ from the difference in free energy
$\Delta\mathcal{F}[\mathbfit{x}]$ between $\mathcal{U}$ and
$\mathcal{U}_0$:

$$-\ln\mathcal{P}[\mathbfit{x}] = \mathcal{F}[\mathbfit{x}] = \mathcal{F}_0[\mathbfit{x}] + \Delta\mathcal{F}[\mathbfit{x}]$$

where $\mathcal{F}_0 = -\ln\mathcal{Z}_0[\mathbfit{x}]$ is known.
Because we have a known expression for
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]$, the free-energy difference
$\Delta\mathcal{F}[\mathbfit{x}]$ can now be computed using any of the
techniques described in [@sec-marginalization].

As an example for finding a decomposition like
[@eq-hamiltonian-decomposition], let us consider the case where the
joint system of input and output is described by a single master
equation, i.e. we have a master equation with two components, $S$ which
represents the input, and $X$ which represents the output. In such a
system, information is transmitted if there exist transitions that
change the copy number of $X$ with a rate that depends on the copy
number of $S$. In terms of chemical reactions, $S\rightarrow S+X$ is an
example for such a transition. In turn, this system exhibits feedback if
at least one of the transitions that change the copy number of $S$ has a
rate that depends on $X$, as for example with the reaction
$S + X\rightarrow X$. Note that with such reactions, the dynamics of $S$
depend on the current copy number of $X$, and therefore we cannot evolve
$S$ trajectories independently of $X$ trajectories, a consequence of
feedback. Both of the reactions $S\rightarrow S+X$ and
$S + X\rightarrow X$ introduce correlations between the $S$ and $X$
trajectories.

In a non-interacting system, such interactions between the input and
output must be absent. Thus, a non-interacting version of the reaction
system contains no single reaction that involves both $S$ and $X$. We
will now describe how we can use that non-interacting version of the
reaction system, to obtain the reference potential
$\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]$. Since the input and output
trajectories are completely independent in the non-interacting system,
we can express the joint distribution's probability density as the
product of the individual component's trajectory densities,
$\mathcal{P}_0[\mathbfit{s}, \mathbfit{x}]=\mathcal{P}_0[\mathbfit{s}]\ \mathcal{P}_0[\mathbfit{x}]$.
Note that $\mathcal{P}_0[\mathbfit{s}]$ and
$\mathcal{P}_0[\mathbfit{x}]$ should not be confused with the marginal
probabilities $\mathcal{P}[\mathbfit{s}]$ and
$\mathcal{P}[\mathbfit{x}]$ of the *interacting* version of the reaction
system, which must be computed using a marginalization integral. Since
in the non-interacting version both $S$ and $X$ obey independent
dynamics which are characterized by individual master equations, both
$\mathcal{P}_0[\mathbfit{s}]$ and $\mathcal{P}_0[\mathbfit{x}]$ can be
individually computed using [@eq-traj-prob-master-eq]. Thus, in this
case, the non-interacting potential is
$\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}] = -\ln\mathcal{P}_0[\mathbfit{s}]-\ln\mathcal{P}_0[\mathbfit{x}]$
and, since the probability densities $\mathcal{P}_0[\mathbfit{s}]$ and
$\mathcal{P}_0[\mathbfit{x}]$ are normalized, the corresponding
partition function is $\mathcal{Z}_0=1$. Hence, for this reaction
system, we can straightforwardly define a non-interacting version that
can be used to obtain the reference potential
$\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]$. Using the techniques
described in [@sec-marginalization], we can then compute the free-energy
difference between $\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]$ and
$\mathcal{U}[\mathbfit{s}, \mathbfit{x}]=-\ln\mathcal{P}[\mathbfit{s}, \mathbfit{x}]$,
where the latter potential describes the dynamics of the fully
interacting system. Specifically, we can compute the marginal
probabilities $\mathcal{P}[\mathbfit{s}]$, $\mathcal{P}[\mathbfit{x}]$
pertaining to the interacting system which are required for the mutual
information estimate in [@eq-mi-with-feedback].

In summary, for systems with feedback, we can compute marginalization
integrals by specifying a reference potential
$\mathcal{U}_0[\mathbfit{s}, \mathbfit{x}]$ by finding a non-interacting
version of the system. However, barring a decomposition into interacting
and non-interacting potentials, there is generally no unambiguous choice
of the reference potential $\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]$ to
compute the marginal probability $\mathcal{P}[\mathbfit{x}]$. In fact,
the optimal reference potential
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]$ is likely to be
system-specific. Still, if a suitable expression for
$\mathcal{U}_0[\mathbfit{s},\mathbfit{x}]$ can be found, we can make use
of the techniques developed in [@sec-marginalization] to compute
marginal probability $\mathcal{P}[\mathbfit{x}]$.

## Discussion

In this chapter, we have described a general, practical, and flexible
method that makes it possible to compute the mutual information between
trajectories exactly. PWS is a Monte Carlo scheme based on the exact
computation of trajectory probabilities. We showed how to compute exact
trajectory probabilities from the master equation and thus how to use
PWS for any system described by a master equation. Since the master
equation is employed in many fields and in particular provides an exact
stochastic model for well-mixed chemical reaction dynamics, PWS is very
broadly applicable.

However, it must be noted that PWS cannot be used to directly obtain the
mutual information between trajectories from experimental data, in
contrast to model-free (yet approximate) methods such as
K-nearest-neighbors estimators [@2002.Kaiser; @2004.Kraskov],
decoding-based information estimates [@2008.Gao], or schemes that
compute the mutual information from the data within the Gaussian
framework [@2021.Mattingly]. PWS requires a (generative) model based on
a master equation or Langevin equation. Yet, in [@sec-ml-pws], we will
show how PWS can be combined with machine learning to obtain the rate
directly from time-series data.

We have applied PWS to compute the mutual information rate in steady
state, but PWS can be used equally well to study systems out of steady
state. For such systems a (non-)equilibrium initial condition
$\mathrm{P}(s_0, x_0)$ must be specified in addition to the stochastic
dynamics of input trajectories $\mathcal{P}[\mathbfit{s}]$. These
distributions are defined by the (experimental) setup and lead to a
well-defined output distribution $\mathcal{P}[\mathbfit{x}]$ when the
system is coupled to the input. Thus, a steady state is no prerequisite
for the application of PWS to study the trajectory mutual information.

Overall, PWS is a general framework for computing the mutual information
between trajectories. Because of its flexibility and simplicity, we
envision that it will become an important and reliable tool for studying
information transmission in dynamic stochastic systems.
