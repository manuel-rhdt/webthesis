---
bibliography: /home/ubuntu/thesis/html-converter/../library.bib
csl: /home/ubuntu/thesis/html-converter/american-physics-society.csl
license: CC-BY-4.0
link-citations: true
reference-section-title: References
title: Introduction
---

> The fundamental problem of communication is that of reproducing at one
> point either exactly or approximately a message selected at another
> point. Frequently the messages have meaning; that is they refer to or
> are correlated according to some system with certain physical or
> conceptual entities. These semantic aspects of communication are
> irrelevant to the engineering problem. The significant aspect is that
> the actual message is one selected from a set of possible messages.
> The system must be designed to operate for each possible selection,
> not just the one which will actually be chosen since this is unknown
> at the time of design.

We live in the era of information. Information technology permeates
every aspect of modern life, shaping how we communicate, learn, have
social interactions, and spend our leisure time. Beyond daily life,
information plays a crucial role in fields like physics, biology,
neuroscience, and engineering, where it is used to study and enhance the
function of complex systems and machines. Quantifying the flow of
information within these domains is essential, and, although the concept
of information is abstract, its power in explaining the processes that
shape our world is profound.

The explanatory power of information stems from the intrinsic link
between information and performance. Without a potential reward, or the
possibility of avoiding harm, information has no value.[^1] As a result,
information collection and processing typically serves a clear purpose.
For example, a self-driving car processes information from its sensors
in order to make decisions about navigation [@2018.Schwarting].
Similarly, bacteria acquire chemical information about their environment
in order to optimize their movement toward nutrients and away from
toxins, maximizing their chance of survival [@2021.Mattingly]. More
generally, in evolutionary biology the link between genetic information
and fitness is explored [@2012.Adami; @2022.Hledik]. Thus, whether in
biological organisms or engineered systems, understanding how
information is used is essential for optimizing performance.

Quantifying information transmission is vital for understanding and
improving natural or engineered information-processing systems.
Shannon's *information theory* [@1948.Shannon] provides the framework
for studying the efficiency and reliability of any communication
channel, whether it's a telephone line, a biochemical signaling cascade,
or a neural pathway in the brain. The cornerstone of information theory
is a set of mathematical definitions to rigorously quantify amounts of
information. These makes it possible to determine, in absolute terms,
the amount of information that is transmitted by a given
information-processing mechanism, for a specific input signal. Moreover,
it is possible to quantify the maximum amount of information that can be
transmitted through a given mechanism under optimal conditions: this
limit is known as the channel capacity, measured in bits per time unit.
Shannon's information measures enable us to characterize a wide range of
systems in terms of their information transmission capabilities.

Information theory has found many applications across disciplines, and
is frequently used to understand and improve sensory or computational
systems. In biology, information transmission is studied, e.g., in the
brain, by analyzing the timing of electrical impulses between neurons
[@1998.Strong; @1999.Rieke]. Within cells, information flow in
biochemical signaling and transcription regulation has been extensively
studied by analyzing biochemical pathways
[@2008.Tkacik; @2009.Mehta; @2011.Cheong]. In artificial intelligence,
information theory has proven useful in improving learning in neural
networks. The information bottleneck theory [@2000.Tishby] suggests that
the performance of neural networks can be enhanced by balancing
compression and information retention during training
[@2015.Tishby; @2017.Schwartz-Ziv]. In economics and finance,
information theory has been applied to describe financial markets
[@2014.Fiedor] and to optimize financial decision-making under
uncertainty [@1956.Kelly]. In optics, information theory is employed to
study the efficiency of signal processing in optical resonators, with
applications in precision sensing and optical computing
[@2014.Aspelmeyer; @2022.Peters]. Information theory boasts a wealth of
applications and is essential for the analysis and theoretical
understanding of information-processing systems.

The canonical measure for the quality of information transmission is the
mutual information. It quantifies how much information is shared between
two random variables, such as the input and output signals of an
information-processing mechanism, see
[@fig:information_transmission_flow]. Let $S$ and $X$ be two random
variables that are jointly distributed according to the density
$\mathrm{P}(s, x)$ and with marginal densities $\mathrm{P}(s)$ and
$\mathrm{P}(x)$. The mutual information between $S$ and $X$ is then
defined as

$$I(S, X) = \iint \mathrm{P}(s, x) \ln\left(
\frac{\mathrm{P}(s, x)}{\mathrm{P}(s)\mathrm{P}(x)}
\right)ds\,dx$$

and provides a measure of correlation between the random variables.[^2]
From the definition it follows that $I(S, X)=0$ only if $S$ and $X$ are
statistically independent, and $I(S, X)>0$ otherwise. Thus, the mutual
information quantifies the statistical dependence between random
variables, equally characterizing the degrees of influence from
$S \to X$ and from $X \to S$. Hence, the mutual information is a
symmetric measure, satisfying $I(S,X)=I(X,S)$. In a typical information
processing system, the input $S$ influences the output $X$ but there is
no feedback from $X$ to $S$. In such cases, the mutual information
$I(S, X)$ provides a measure for how effectively information about $S$
is transmitted through the system into the output $X$.

<figure id="fig:information_transmission_flow">
<embed src="information_transmission_flow.pdf" style="width:65.0%" />
<figcaption>A generic information processing device takes an input
signal
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>s</mi><annotation encoding="application/x-tex">s</annotation></semantics></math>
and produces an output signal
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="application/x-tex">x</annotation></semantics></math>.
Because the output is correlated with the input, we can quantify the
information that
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>s</mi><annotation encoding="application/x-tex">s</annotation></semantics></math>
and
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="application/x-tex">x</annotation></semantics></math>
share. This quantity is called the mutual information and measures the
information that is transmitted.</figcaption>
</figure>

In biological systems, information transmission has frequently been
quantified via the *instantaneous mutual information* (IMI)
$I(S_{t_1}, X_{t_2})$, i.e. the mutual information between stimulus and
response at two time points. This measure has been applied for analyzing
biochemical pathways
[@2009.Tkacik; @2010.Walczak; @2011.Cheong; @2012.Bowsher; @2014.Clausznitzer; @2015.Palmer; @2016.Pilkiewicz]
and neural spiking dynamics [@1998.Strong; @1999.Borst]. However, in
many cases, the IMI cannot correctly quantify information transmission
due to correlations within the input or the output which reduce the
total information transmitted. More generally, information may be
encoded in the temporal patterns of signals, which cannot be captured by
a pointwise information measure like the IMI. Thus, the IMI is generally
inadequate for computing information transmission in systems which
process dynamical signals.

There are many examples of information being encoded in dynamical
features of signals. In cellular Ca^2+^ signaling, information seems to
be encoded in the timing and duration of calcium bursts
[@2008.Boulware], while in the MAPK pathway information is encoded in
the amplitude and duration of the transient phosphorylation response to
external stimuli [@2018.Mitra; @2023.Nalecz-Jawecki]. Moreover, there
are reasons to believe that encoding information in dynamical signal
features is advantageous for reliable information transmission
[@2014.Selimkhanov]. Studying the information transmitted via temporal
features is thus highly desirable but not possible with an instantaneous
information measure. Therefore, in cases where the dynamics of input or
output time-series may carry relevant information, the need for
appropriate dynamical information measures has been widely recognized
[@2008.Staniek; @2009.Tostevin; @2012.Runge; @2021.Meijers; @2021.Tang; @2021.Mattingly; @2023.Nalecz-Jawecki; @2023.Hahn; @2024.Umeki; @2024.Nicoletti].

The natural measure for quantifying information transmission via
dynamical signals is the *trajectory mutual information*. It takes into
account the total information encoded in the input and output
trajectories of a system, and therefore captures all information
transmitted over a specific time interval. Conceptually, its definition
is simple. The trajectory mutual information is the mutual information
between the input and output trajectories of a stochastic process, given
by

$$I(\mathbfit{S}, \mathbfit{X}) = \iint \mathrm{P}(\mathbfit{s}, \mathbfit{x}) \ln\left(
\frac{\mathrm{P}(\mathbfit{s}, \mathbfit{x})}{\mathrm{P}(\mathbfit{s})\mathrm{P}(\mathbfit{x})}
\right)d\mathbfit{s}\,d\mathbfit{x}$$

where the bold symbols $\mathbfit{s}$ and $\mathbfit{x}$ are used to
denote trajectories. These trajectories arise from a stochastic process
that defines the joint probability distribution
$\mathrm{P}(\mathbfit{s}, \mathbfit{x})$. The integral itself runs over
all possible input and output trajectories.

The closely related *mutual information rate* is defined as the rate at
which the trajectory mutual information increases with the duration of
the trajectories in the long-time limit. Let $\mathbfit{S}_T$ and
$\mathbfit{X}_T$ be trajectories of duration $T$, then the mutual
information rate is given by

::: {#eq:intro-info-rate}
$$R = \lim_{T\to\infty} \frac{I(\mathbfit{S}_T, \mathbfit{X}_T)}{T} \,.
    \label{eq:intro-info-rate}$$
:::

The mutual information rate quantifies how many independent messages can
be transmitted per unit time, on average, via a communication channel.
It depends on both, the signal statistics of the input, as well as the
transmission properties of the channel. In the absence of feedback it is
equal to the transfer entropy [@2000.Schreiber; @2002.Kaiser].

The trajectory mutual information and the mutual information rate are
fundamental measures for information transmission in dynamical systems.
They serve as key performance metrics for biochemical signaling networks
[@2009.Tostevin; @2011.Cheong], as well as for neural sensory systems
[@1998.Strong; @1999.Borst]. More generally, in communication channels
with memory, the mutual information rate for the optimal input signal
determines the channel capacity [@2006.Cover]. In financial markets, it
quantifies correlations in stochastic time series, such as stock prices
and trading volumes [@2014.Fiedor]. Finally, in non-equilibrium
thermodynamics, the trajectory mutual information provides a link
between information theory and stochastic thermodynamics
[@2013.Barato; @2014.Hartich]. Efficient methods for calculating the
trajectory mutual information and the mutual information rate are needed
and constitute the primary objective of this thesis.

Unfortunately, calculating the mutual information between trajectories
is notoriously difficult due to the high dimensionality of trajectory
space [@2003.Paninski]. Conventional approaches for computing mutual
information require non-parametric estimates of the input and output
entropy, typically obtained via histograms or kernel density estimators
[@1998.Strong; @2003.Paninski; @2011.Cheong; @2008.Tkacik; @2014.Tkacik; @2021.Meijers].
However, the high-dimensional nature of trajectories makes it infeasible
to obtain enough data for accurate non-parametric distribution
estimates. Other non-parametric entropy estimators such as the
k-nearest-neighbor estimator [@2002.Kaiser; @2004.Kraskov] depend on a
choice of metric in trajectory space and become unreliable for long
trajectories [@2019.Cepeda-Humerez]. Thus, except for very simple
systems [@2021.Meijers], the curse of dimensionality makes it infeasible
to obtain accurate results for the trajectory mutual information using
conventional mutual information estimators.

Due to the inherent difficulty of directly estimating the mutual
information between trajectories, previous research has often employed
simplified models or approximations. In some cases, the problem can be
simplified by considering static (scalar) inputs instead of input signal
trajectories [@2014.Selimkhanov; @2019.Cepeda-Humerez; @2021.Tang]. But
this approach ignores the dynamics of the input signal. Lower bounds for
the mutual information can be derived from the Donsker-Varadhan
inequality [@1983.Donsker; @2018.Belghazi; @2018.McAllester], or
obtained through general-purpose compression algorithms
[@2005.Baronchelli; @2008.Gao; @2019.Cepeda-Humerez]. While exact
analytical results for the trajectory mutual information are available
for certain simple processes such as Gaussian [@2009.Tostevin] or
Poisson channels [@2023.Sinzger; @2024.Gehri], many complex, realistic
systems lack analytical solutions, and approximations have to be
employed. For systems governed by a master equation, numerical or
analytical approximations are sometimes feasible
[@2019.Duso; @2023.Moor] but these become intractable for complex
systems. Finally, the Gaussian framework for approximating the mutual
information rate is particularly widely used
[@2009.Tostevin; @2021.Mattingly; @2023.Hahn], though it assumes linear
system dynamics and Gaussian noise statistics. These assumptions make it
ill-suited for many realistic nonlinear information-processing systems.

To address the limitations of previous methods, we introduce *Path
Weight Sampling* (PWS), a novel Monte Carlo technique for computing the
trajectory mutual information efficiently and accurately. PWS leverages
free-energy estimators from statistical physics and combines analytical
and numerical methods to circumvent the curse of dimensionality
associated with long trajectories. The approach relies on exact
calculations of trajectory likelihoods derived analytically from a
stochastic model. By averaging these likelihoods in a Monte Carlo
fashion, PWS can accurately compute the trajectory mutual information,
even in high-dimensional settings.

PWS is an exact Monte Carlo scheme, in the sense that it provides an
unbiased statistical estimate of the trajectory mutual information. In
PWS, the mutual information is computed via the identity

$$I(\mathbfit{S}, \mathbfit{X}) = H(\mathbfit{X}) - H(\mathbfit{X} \mid \mathbfit{S})$$

as the difference between the marginal output entropy $H(\mathbfit{X})$
associated with the marginal distribution $\mathrm{P}(\mathbfit{x})$ of
the output trajectories $\mathbfit{x}$ and the conditional output
entropy $H(\mathbfit{X} \mid \mathbfit{S})$ associated with
$\mathrm{P}(\mathbfit{x}|\mathbfit{s})$, the conditional output
distribution for a given input $\mathbfit{s}$. Both entropies are
evaluated as Monte-Carlo averages over the associated distribution,
i.e., $H(\mathbfit{X}) = -\langle \ln \mathrm{P}(\mathbfit{x}) \rangle$
and
$H(\mathbfit{X} \mid \mathbfit{S}) = -\langle \ln \mathrm{P}(\mathbfit{x}|\mathbfit{s}) \rangle$,
where the notation $\langle\cdot\rangle$ denotes an average with respect
to the joint distribution $\mathrm{P}(\mathbfit{s}, \mathbfit{x})$. The
key insights of PWS are that the conditional probability
$\mathrm{P}(\mathbfit{x}|\mathbfit{s})$ can be directly evaluated from a
generative model of the system, and that the marginal probability
$\mathrm{P}(\mathbfit{x})$ can be computed efficiently via
marginalization using Monte Carlo procedures inspired by computational
statistical physics.

The crux of PWS lies in the efficient computation of
$\mathrm{P}(\mathbfit{x})$ via the marginalization integral

::: {#eq:intro-marginaliztion}
$$\mathrm{P}(\mathbfit{x}) = \int \mathrm{P}(\mathbfit{x}|\mathbfit{s}) \mathrm{P}(\mathbfit{s})\,d\mathbfit{s}\,.
    \label{eq:intro-marginaliztion}$$
:::

To evaluate this integral efficiently, we present different variants of
PWS. In [@ch:dpws] we introduce *Direct PWS*, the simplest variant of
PWS, where [@eq:intro-marginaliztion] is computed bia a "brute-force"
Monte Carlo approach that works well for short trajectories, but which
becomes exponentially harder for long trajectories. In [@ch:variants],
we present two additional variants of PWS that evaluate the
marginalization integral more efficiently, *RR-PWS* and *TI-PWS*.
Rosenbluth-Rosenbluth PWS (RR-PWS) is based on efficient free-energy
estimation techniques developed in polymer physics
[@1955.Rosenbluth; @1990.Siepmann; @1997.Grassberger; @2002.Frenkel].
Thermodynamic integration PWS (TI-PWS) uses techniques from transition
path sampling to derive a MCMC sampler in trajectory space
[@2002.Bolhuis]. From this MCMC chain, we can compute the
marginalization integral using thermodynamic integration
[@1998.Gelman; @2001.Neal; @2002.Frenkel]. Finally, in [@ch:ml-pws], we
introduce a fourth marginalization technique based on variational
inference via neural networks [@2013.Kingma]. Its conceptual simplicity,
coupled with powerful marginalization methods, make PWS a versatile
framework for computing the trajectory mutual information in a variety
of scenarios.

Yet, to compute the mutual information PWS requires evaluating the
conditional trajectory probability
$\mathrm{P}(\mathbfit{x}| \mathbfit{s})$, which in turn requires a
stochastic model defining a probability measure over trajectories. While
(stochastic) mechanistic models of experimental systems are increasingly
becoming available, the question remains whether PWS can be applied
directly to experimental data when no such model is available. In
[@ch:ml-pws], we show that machine learning can be used to construct a
data-driven stochastic model that captures the trajectory statistics,
i.e. $\mathrm{P}(\mathbfit{x}| \mathbfit{s})$, enabling the application
of PWS to experimental data.

We demonstrate the practical utility of PWS by calculating the
trajectory mutual information for a range of systems. In
[@ch:variants; @ch:lna_vs_pws], we study a minimal model for gene
expression, showing that PWS can estimate the mutual information rate
for this system more accurately than any previous technique. Using PWS,
we reveal that the Gaussian approximation, though expected to hold due
to the system's linearity, does not provide an accurate estimate in this
case. In [@ch:lna_vs_pws; @ch:ml-pws] we extend our analysis to simple
nonlinear models for information transmission, comparing PWS results
against the Gaussian approximation; for these models, PWS is the first
technique capable of accurately computing trajectory mutual information.
Moreover, in [@ch:chemotaxis] we apply PWS to a complex stochastic model
of bacterial chemotaxis, marking the first instance where the
information rate for a system of this complexity can be computed
exactly. Together, these examples demonstrate that an exact technique
like PWS is indispensable for understanding information transmission in
realistic scenarios.

## Contributions of This Work

The main contributions of this thesis are as follows:

1.  **PWS: A novel framework for computing the trajectory mutual
    information**: We introduce Path Weight Sampling, a computational
    framework for calculating the trajectory mutual information in
    dynamical stochastic systems. This framework is exact, applicable to
    both continuous and discrete time processes, and does not rely on
    any assumptions about the system's dynamics. PWS and its main
    variants are described in [@ch:dpws; @ch:variants].

2.  **Discovery of discrepancies between experiments and mathematical
    models of chemotaxis**: We apply PWS to various systems, including
    the complex bacterial chemotaxis signaling network. By studying the
    information transmission rate of chemotaxis and comparing our
    results against those of @2021.Mattingly, we find that the
    widely-used MWC model of chemotaxis cannot explain the experimental
    data. We find that the number of receptor clusters is smaller and
    that the size of these clusters is larger than hitherto believed. We
    describe and characterize this finding in [@ch:chemotaxis].

3.  **Study of the accuracy of the gaussian approximation for the
    information rate**: In [@ch:lna_vs_pws], we use PWS to
    quantitatively study the accuracy of the widely-used Gaussian
    approximation. Before PWS, no exact technique was available to
    obtain *ground truth* results of the mutual information rate for
    non-linear systems, and the accuracy of the Gaussian framework could
    not be evaluated. We reveal that the Gaussian model can be
    surprisingly inaccurate, even for linear reaction systems.

4.  **Neural networks for learning the stochastic dynamics from
    time-series data**: In [@ch:ml-pws], we demonstrate that recent
    machine learning techniques can be employed to automatically learn
    the stochastic dynamics from experimental data. We show that by
    combining these learned models with PWS, it becomes possible to
    compute the trajectory mutual information directly from time-series
    data. This approach outperforms previous techniques, like the
    Gaussian approximation, for estimating information rates from data.

## Thesis Outline

The remainder of this thesis is divided into 5 chapters. We first
present three variants of PWS, all of which compute the conditional
entropy in the same manner, but differ in the way this Monte Carlo
averaging procedure for computing the marginal probability
$\mathcal{P}[\mathbfit{x}]$ is carried out.
[@ch:dpws; @ch:variants; @ch:chemotaxis] of this thesis have been
published previously in *Physical Review X*.[^3]

In [@ch:dpws] we present the simplest PWS variant, *Direct* PWS (DPWS).
To compute $\mathcal{P}[\mathbfit{x}]$, DPWS performs a brute-force
average of the path likelihoods $\mathcal{P}[\mathbfit{x}|\mathbfit{s}]$
over the input trajectories $\mathbfit{s}$. While we show that this
scheme works for simple systems, the brute-force Monte Carlo averaging
procedure becomes more difficult for larger systems and exponentially
harder for longer trajectories.

In [@ch:variants], we present our second and third variant of PWS which
are based on the realization that the marginal probability
$\mathcal{P}[\mathbfit{x}]$ is akin to a partition function. These
schemes leverage techniques for computing free energies from statistical
physics. We also apply PWS to a simple model system which consists of a
simple pair of coupled birth-death processes which allows us to compare
the efficiency of the three PWS variants, as well as to compare the PWS
results against analytical results from the Gaussian approximation
[@2009.Tostevin].

In [@ch:chemotaxis], we apply PWS to the bacterial chemotaxis system,
which is arguably the best characterized signaling system in biology.
@2021.Mattingly recently argued that bacterial chemotaxis in shallow
gradients is information limited. Yet, to compute the information rate
from their experimental data they had to employ a Gaussian framework.
PWS makes it possible to asses the accuracy of this approximation.

[@ch:lna_vs_pws] is devoted to studying the accuracy of the Gaussian
approximation for non-Gaussian systems. By understanding the limitations
and strengths of the Gaussian approximation, this chapter aims to
provide deeper insights into selecting the appropriate method for MI
estimation depending on the system.

Finally, [@ch:ml-pws] we introduce ML-PWS, which combines recent machine
learning models with PWS, to compute the mutual information directly
from data. This idea significantly extends the range of applications for
PWS, since we no longer require a mechanistic model of the system.
Instead, the stochastic model is automatically learned from the data.

[^1]: In mathematical terms, this interplay between information and
    reward can be characterized by utility functions, which quantify the
    benefits of different actions based on available information
    [@2004.Neumann; @1972.Savage].

[^2]: In contrast to other correlation measures used in statistics, such
    as the Pearson correlation coefficient, the mutual information
    captures both linear and nonlinear dependencies between variables.
    Additionally, in contrast to other correlation measures, the mutual
    information satisfies the data processing inequality, which states
    that no type of post-processing can increase the mutual information
    between the input and output [@2006.Cover; @2014.Kinney]. These
    properties make the mutual information uniquely suited for
    describing the fidelity of the input-output mapping in
    information-processing systems. Note however that a naïve use of the
    data processing inequality leads to seemingly contradictory results
    when applied to the stationary dynamics of processing cascades
    [@2016.Pilkiewicz; @2024.Fan; @2024.Das].

[^3]: M. Reinhardt, G. Tkačik, and P. R. ten Wolde, Path Weight
    Sampling: Exact Monte Carlo Computation of the Mutual Information
    between Stochastic Trajectories, *Phys. Rev. X* **13**, 041017
    (2023) [@2023.Reinhardt]
