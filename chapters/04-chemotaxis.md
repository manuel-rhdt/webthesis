---
bibliography: references.bib
csl: american-physics-society.csl
license: CC-BY-4.0
link-citations: true
reference-section-title: References
---

# Application---Bacterial Chemotaxis {#ch:chemotaxis}

> The chemotaxis signaling network of the bacterium *Escherichia coli*
> is a sophisticated information processing system, enabling the
> bacterium to sense nutrient gradients and dynamically adjust its
> movement. The bacterium's ability to climb chemical gradients is
> constrained by the mutual information rate between the sensed nutrient
> concentration and the phosphorylated messenger protein CheYp. A recent
> study by @2021.Mattingly used a Gaussian
> approximation to estimate this rate, based on the assumption that in
> shallow gradients the chemotactic response is approximately linear.
> However, the nonlinear nature of chemotaxis suggests that Gaussian
> methods may only approximate the true information rate. In this
> chapter, we apply an exact technique, Path Weight Sampling (PWS), to
> precisely quantify information transmission in *E. coli* chemotaxis
> and compare the results against the Gaussian approximation. We build a
> stochastic model based on literature data, which we use to simulate
> nonlinear chemotactic responses to time-dependent stimuli. Our PWS
> results for this model yield information rates 4--5 times higher than
> those obtained experimentally. While this finding can be viewed as
> surprisingly accurate for an ab initio prediction, the question
> remains whether the discrepancy is due to the limitations of the
> Gaussian framework used by @2021.Mattingly or due to the assumptions
> of our stochastic model. Examining the latter question reveals that
> our initial model underestimates both the magnitude of the response
> and the biochemical noise. We refined the model by changing two key
> parameters that describe the receptor array, namely the number of
> clusters and their size. This leads to information rate estimates that
> closely align with experimental data, indicating that the number of
> receptor clusters is much smaller than hitherto believed, while their
> size is much larger. Finally, our analysis confirms the accuracy of
> the Gaussian framework for studying chemotaxis in shallow gradients,
> validating its use by @2021.Mattingly a posteriori.

## Introduction

[^1]

The chemotaxis system of the bacterium *Escherichia coli* is a complex
information processing system. It is responsible for detecting nutrient
gradients in the cell's environment and using that information to guide
the bacterium's movement. *E. coli* navigates through its environment by
performing a biased random walk, successively alternating between
so-called *runs*, during which it swims with a nearly constant speed,
and *tumbles*, during which it randomly chooses a new direction
[@1977.Berg]. By adaptively varying the tumbling probability and thus
adjusting the relative duration of runs and tumbles, the bacterium is
able to climb a chemical gradient.

Recently, @2021.Mattingly found that the ability of the bacterium to
climb chemical gradients is fundamentally limited by the information it
can acquire via its receptors. However, to calculate the information
rate from their experimental data, they relied on a Gaussian
approximation which assumes linear Gaussian statistics for the
trajectories. The use of the approximation is justified by the argument
that in shallow concentration gradients the behavior of the chemotaxis
network is approximately linear. Nevertheless, it is well known that
chemotaxis generally exhibits a highly nonlinear response, which
suggests limitations to the Gaussian framework's accuracy in capturing
the full dynamics of the system. Moreover, we have seen in the previous
chapter that the Gaussian approximation may fail in surprising ways.

In this chapter, we use Path Weight Sampling (PWS) to exactly quantify
information transmission in *E. coli* chemotaxis, and to assess the
accuracy of the Gaussian approximation. To study information
transmission in *E. coli* chemotaxis using PWS, we first develop a
stochastic model of the biochemical chemotaxis network based on the MWC
model for receptor cooperativity
[@1965.Monod; @1997.Barkai; @2004.Sourjik]. This model accurately
describes the nonlinear behavior of the chemotaxis network and allows us
to simulate the chemotactic response to an arbitrary time-dependent
stimulus. Furthermore, we can use PWS to compute the mutual information
rate between arbitrary input signals and the response signal generated
by the model. To obtain realistic time-dependent input signals, we
assume a cell performing a random walk in a static exponential gradient,
following @2021.Mattingly. By using the same input dynamics as those in
Ref. [@2021.Mattingly], we can rigorously compare our results against
the experiments.

One of our principal findings is that the information transmission rate
computed by PWS for the model based on the literature data---which we
refer to as the "literature-based model"---is approximately 4--5 times
higher than the rate measured experimentally by @2021.Mattingly. Given
that this model relies entirely on available literature data without any
fitting to the results of @2021.Mattingly, an agreement within a factor
of 4--5 is perhaps unexpectedly good. Still, the source of the
discrepancy remains unclear: does it stem from the inaccuracy of the
Gaussian framework used by @2021.Mattingly or from the inaccuracy of our
literature-based model?

To address this question, we examined the data of @2021.Mattingly on the
response and the noise amplitude. We found that the literature-based
model underestimates not only the response strength but also the noise.
By fitting the response kernel and the noise correlation function, we
developed a "fitted model" in which receptor clusters are larger,
enhancing the response amplitude, but significantly fewer in number,
leading to much greater noise and thus a lower information transmission
rate. Recomputing the information rate with PWS for this model, fitted
to the linear response and the noise, yielded close agreement with the
information rate measurements of @2021.Mattingly, suggesting that the
receptor array composition differs substantially from previous
assumptions. In particular, while the predicted cluster size is about a
factor of 2 larger than previous estimates, the number of clusters is
about tenfold lower. Lastly, we found that the Gaussian framework is
highly accurate in the regime of shallow gradients as studied by
@2021.Mattingly, thus verifying their Gaussian approach *a posteriori*.

In [@sec:chemotaxis_input] we describe the dynamics of the input signal.
[@sec:chemotaxis-model] introduces the stochastic model of the
chemotaxis system that we developed based on available literature. In
[@sec:lna] we describe the Gaussian approximation used by
@2021.Mattingly to compute the information transmission rate and in
[@sec:comparison] we present the results. We conclude with a discussion
of our findings, particularly regarding the number of clusters and their
size.

## Stochastic Dynamics of the Input Signal for Chemotaxis {#sec:chemotaxis_input}

The information transmission rate depends not only on the biochemical
chemotaxis network, but also on the dynamics of the input signal. It is
therefore important that the dynamics of this signal in our model agree
with those in the experiments of @2021.Mattingly. For these experiments
the input signal is the time-dependent ligand concentration $c(t)$ that
is experienced by the swimming bacterium.

<figure>
<p><embed src="figures/ecoli_swimming.pdf" /> </p>
<figcaption>In a shallow exponential gradient
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>c</mi><mo stretchy="false" form="prefix">(</mo><mi>x</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">c(x)</annotation></semantics></math>,
the bacterium diffuses nearly freely in the
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="application/x-tex">x</annotation></semantics></math>-direction.
The variance of the position increases with time, the hallmark of a
random walk. The input signal is the concentration
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>c</mi><mo stretchy="false" form="prefix">(</mo><mi>t</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mi>c</mi><mo stretchy="false" form="prefix">(</mo><mi>x</mi><mo stretchy="false" form="prefix">(</mo><mi>t</mi><mo stretchy="false" form="postfix">)</mo><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">c(t)=c(x(t))</annotation></semantics></math>
as experienced by the bacterium at time
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>t</mi><annotation encoding="application/x-tex">t</annotation></semantics></math>.</figcaption>
</figure>

We consider an *Escherichia coli* bacterium that swims in a static
nutrient concentration gradient $c(x)$. Following @2021.Mattingly, the
gradient is exponential: $c(x)=c_0 e^{gx}$ with steepness $g$. In a
shallow gradient, the speed $v_x(t)$ of *E. coli* along the gradient
axis can be considered as a stochastic process that fluctuates around
the net chemotactic drift velocity. Following @2021.Mattingly, we assume
that in a shallow gradient the bacterial swimming dynamics are, to a
good approximation, the same as they are in the absence of a gradient.
Their experimental evidence shows that the velocity fluctuations in
absence of a gradient are described by an exponentially decaying
auto-correlation function:

$$V(t) = \langle v_x(0) v_x(t) \rangle = a_v e^{-\lambda |t|} \,.$$

Therefore, in a shallow gradient, the gradient-climbing speed can be
modeled as a zero-mean Ornstein-Uhlenbeck process

$$\frac{dv_x}{dt} = -\lambda v_x + \sigma \xi(t)$$

where $\sigma = \sqrt{2 a_v \lambda}$, and $\xi(t)$ is white noise with
$\langle \xi(t) \xi(t^\prime) \rangle = \delta (t - t^\prime)$. The
$x$-position of the bacterium is given by the integral of the velocity,
i.e., $x(t)=\int^t_0d\tau\, v_x(\tau)$. Thus, when projected onto the
gradient axis, the bacterium performs a 1D random walk described by the
Langevin equation

::: {#eq:random_walk}
$$\frac{d^2 x}{dt^2} = -\lambda \frac{dx}{dt} + \sigma \xi(t) \,.
    \label{eq:random_walk}$$
:::

Since the bacterium moves in a static concentration gradient described
by $c(x)$, the concentration dynamics that the cell observes are
generated directly from its own movement dynamics, see Fig. 
`\ref{fig:ecoli_swimming}`{=latex}. At time $t$ the cell is at position
$x(t)$ and thus measures the concentration $c(t)=c(x(t))$. We find the
stochastic dynamics of $c$ by differentiating using the chain rule

::: {#eq:concentration_dynamics}
$$\frac{dc}{dt} = \frac{\partial c}{\partial x} \frac{\partial x}{\partial t} = g c(t)\,v_x(t)\,.
    \label{eq:concentration_dynamics}$$
:::

The concentration dynamics are thus fully determined by the stochastic
dynamics of the cell's swimming velocity $v_x(t)$ in the absence of a
gradient and by the shape of the concentration gradient $c(x)$. The
resulting stochastic dynamics are visualized in [@fig:trajectories].

![Input dynamics. *Left column:* two example time traces of the
up-gradient velocity $v_x(t)$ and the observed concentration $c(t)$
obtained by integrating [@eq:concentration_dynamics]. *Right column:*
averages of velocity and concentration traces obtained from 1000
simulated trajectories. The solid lines show the mean as a function of
time and boundaries of the shaded regions indicate the 5% and 95%
quantiles.](input_trajectories.pdf){#fig:trajectories
width="\\textwidth"}

In the PWS simulations we use $c(t)$ directly as the input to our
system. Yet, for the Gaussian approximation, to which we will compare
the PWS result, we need to use a different input signal because the
chemotaxis system does not respond linearly to $c(t)$. Instead,
@2021.Mattingly show that the chemotaxis system responds approximately
linear to an input $s(t)$ defined by

$$s(t) = \frac{d}{dt} \ln c(t) = gv_x(t) \,.$$

The correlation function of $s(t)$ is given by

$$C_{ss}(t) = \langle s(\tau) s(t + \tau) \rangle = g^2 V(t)\,.$$

The power spectral density of this signal is given by the Fourier
transform of its correlation function:

$$P_{ss}(\omega) = g^2 V(\omega) = g^2 \frac{2a_v \lambda}{\omega^2 + \lambda^2}\,.$$

We use this same input below in [@sec:lna] to compute the Gaussian
approximation of the mutual information rate. As discussed in more
detail in the main text, we note that the mutual information between the
output and the input trajectory $c(t)$, as measured in the PWS
simulations, is identical to that between the output and the input
trajectory $s(t)$, as computed in the Gaussian model because of the
deterministic and monotonic mapping between $c(t)$ and $s(t)$.

## Stochastic Chemotaxis Model {#sec:chemotaxis-model}

<figure id="fig:chemotaxis_cartoon">
<embed src="figures/chemotaxis_cartoon.pdf" />
<figcaption>Cartoon of the chemotaxis network of <em>E. coli</em>.
Receptors form clusters with an associated CheA kinase. A cluster can
either be active or inactive, depending on the number of bound ligands
(green dots) and methylated sites (orange dots). Active CheA can
phosphorylate CheY; phosphorylated CheY controls the rotation direction
of the flagellar motors and thereby the movement of the
bacterium.</figcaption>
</figure>

We apply PWS to a stochastic model of the chemotaxis network that
describes individual reactions via a master equation. In this model, the
receptors are grouped in clusters. Each receptor can switch between an
active and an inactive conformational state, but, in the spirit of the
Monod-Wyman-Changeux model [@1965.Monod], the energetic cost of having
two different conformations in the same cluster is prohibitively large.
We can then speak of each cluster as either being active or inactive.
Each receptor in a cluster can bind ligand and be (de)methylated, which,
together, control the probability that the cluster is active. In the
simulations, receptor (de)methylation is modeled explicitly, because the
(de)methylation reactions are slow. In contrast, the timescale of
receptor-ligand (un)binding is much faster than the other timescales in
the system, i.e., those of the input dynamics, CheY (de)phosphorylation,
and receptor (de)methylation. The receptor-ligand binding dynamics can
therefore be integrated out without affecting information transmission,
in order to avoid wasting CPU time. In addition, the receptor clusters
can phosphorylate CheY, while phosphorylated CheY is dephosphorylated at
a constant rate. The dynamics of the kinase CheA and the phosphatase
CheZ which drive (de)phosphorylation are not modeled explicitly.
[@fig:chemotaxis_cartoon] shows a depiction of the bacterial chemotaxis
network.

Table @tbl-chemotaxis-parameters shows the parameter
values of our chemotaxis model, which are all based on values reported
in the literature. For what follows below, the key parameters are the
number of receptors per cluster, which is taken to be $N=6$ based on
Refs. [@2010.Shimizu; @2020.Kamino], while the number of clusters is
$N_{\mathrm c} = N_{\mathrm r} / N = 400$, where
$10^3 < N_{\mathrm r} < 10^4$ is an estimate for the total number of
receptors based on Ref. [@2004.Li]. These are the numbers of the
"literature-based model". The key parameters, the number of clusters and
their size, change in the "fitted model", which is based on fitting the
response kernel and noise correlation function to the data of
@2021.Mattingly.

| **parameter** | **value** |  | **description** |
|---:|:--|:--|:--|
| $a_v$ | 157.1 | μm²/s² | variance of up-gradient velocity [@2021.Mattingly] |
| $\lambda$ | 0.86 | s⁻¹ | velocity correlation decay constant [@2021.Mattingly] |
| $c_0$ | 100 | μM | mean ligand concentration [@2021.Mattingly] |
| $N$ | 6 |  | number of receptor units per cluster [@2010.Shimizu] |
| $N_c$ | 400 |  | number of receptor clusters [@2004.Li] |
| $M$ | 4 |  | number of methylation sites per receptor [@2010.Shimizu] |
| $N_Y$ | 10 000 |  | total copy number of CheY proteins (phosphorylated and unphosphorylated) [@2004.Li] |
| $K_a$ | 2900 | μM | ligand dissociation constant of active receptors [@2020.Kamino] |
| $K_i$ | 18 | μM | ligand dissociation constant of inactive receptors [@2020.Kamino] |
| $k_R$ | 0.1 | s⁻¹ | methylation rate [@2010.Shimizu; @2021.Mattingly] |
| $k_B$ | 0.2 | s⁻¹ | demethylation rate [@2010.Shimizu; @2021.Mattingly] |
| $k_A$ | 0.015 | s⁻¹ | phosphorylation rate [@2002.Sourjik; @2002.Sourjikt5] |
| $k_Z$ | 10.0 | s⁻¹ | dephosphorylation rate [@2002.Sourjik; @2002.Sourjikt5] |
| $\phi_Y$ | 0.17 |  | steady-state fraction of phosphorylated CheY [@2002.Sourjik] |
| $m_0 / N$ | 0.5 |  | receptor methylation level without ligands [@2010.Shimizu] |
| $\delta\!f_m$ | -2.0 | $k_\mathrm{B}T$ | free energy change of active conformation from attachment of one methyl group [@2010.Shimizu] |

: The parameters required for the chemotaxis model, based on literature values. These are the parameters used in the so-called literature-based model. In the fitted model (see @sec-comparison) the same parameter values are chosen, except for $N=15$ and $N_c=9$, which were obtained by fitting to the data of @2021.Mattingly; we note that changing $N$ and $N_c$ also requires updating $k_A$ to keep the fraction $\phi_Y$ of phosphorylated CheY constant. {#tab:chemotaxis-parameters}

### MWC Model

In our model, each cluster consists of $N$ receptors.
`\Citet{2010.Shimizu}`{=latex} report a typical value for the cluster
size of $N=6$. Detailed balance requires that the ligand binding
affinity depends on whether a cluster is in the active or inactive
state. Consequently, we have a dissociation constant $K_a$ for a ligand
bound to an active receptor and another dissociation constant $K_i$ for
a ligand bound to an inactive receptor. For chemotaxis, $K_a\gg K_i$,
i.e. the ligand binding affinity is higher for the inactive state.

Additionally, each receptor monomer has $M$ methylation sites that can
affect its conformation and therefore the kinase activity. The aspartate
receptor Tar has $M=4$ methylation sites [@2010.Shimizu]. We model the
receptors' methylation dynamics such that CheB only demethylates active
receptors while CheR only methylates inactive receptors, following
previous models for chemotaxis [@1997.Barkai; @1999.Morton-Firth]. This
approach represents arguably the simplest way to model methylation with
exact receptor adaptation.

In an environment with ligand concentration $c$, the probability of a
receptor cluster with $m$ methylated sites to be active, $p_a(c, m)$, is
determined by the free-energy difference between the active and inactive
receptor states

::: {#eq:prob_active}
$$p_a(c, m) = \frac{1}{1 + e^{-f(c, m)}} \label{eq:prob_active}$$
:::

where

::: {#eq:free_energy_active}
$$f(c, m) = N \ln\left( \frac{1 + c/K_i}{1 + c/K_a} \right) + \delta f_m (m - m_0) \,. \label{eq:free_energy_active}$$
:::

Here, the number of methylated sites of a cluster (not receptor) is
denoted by $m$, ranging from $0$ to $NM$. The parameters are again taken
from @2010.Shimizu. Their experimental results indicate that
$\delta\!f_m = -2 k_\mathrm{B}T,\ m_0=-N/2$. @2020.Kamino report ligand
dissociation constants of $K_a = 2900\,\mu\text{M}$ for active receptors
and $K_i = 18\,\mu\text{M}$ for inactive Tar receptors (for MeASP). Note
that in the equations we assume units such that $k_\mathrm{B} T=1$.

The dynamics of methylation in our model are described by the following
mean-field equation

::: {#eq:methylation_dynamics}
$$\frac{dm}{dt} = (1-p_a(c, m)) k_R - p_a(c, m) k_B \,.
    \label{eq:methylation_dynamics}$$
:::

The system reaches a steady state for the adapted activity
$p_a(c, m)=a_0$ where

::: {#eq:adapted_activity}
$$a_0 = \frac{k_R}{k_R + k_B} \,.
    \label{eq:adapted_activity}$$
:::

Ṯhe steady-state methylation $m^\star$ can be obtained from
[@eq:prob_active; @eq:free_energy_active] by solving
$p_a(c, m^\star)=a_0$:

$$m^\star = m_0 + \frac{N \ln\left( \frac{1 + c/K_i}{1 + c/K_a} \right)+ \ln\left( \frac{1-a_0}{a_0} \right)}{-\delta f_m}\,.$$

Ṯo characterize the methylation timescale, we linearize the dynamics of
$m(t)$ around the steady state (at constant ligand concentration
$c(t)=c_0$). To first order, we can write

::: {#eq:dmdt}
$$\frac{d m}{d t} = -\frac{m(t) - m^\star}{\tau_m}\,. \label{eq:dmdt}$$
:::

where $\tau_m$ is the characteristic timescale of the methylation
dynamics. We find $\tau_m$ by expanding $p_a$ \[[@eq:prob_active]\]
around $m=m^\star$:

$$\begin{aligned}
    p_a(c, m) &= p_a(c, m^\star) + \frac{\partial p_a}{\partial m} \Bigg|_{m^\star} (m - m^\star) + \mathcal{O}(m^2) \\
    &= a_0 [1 - \delta f_m (1-a_0) (m-m^\star)] + \mathcal{O}(m^2)
    \,,
\end{aligned}$$

and then plugging this first-order expansion into
[@eq:methylation_dynamics] to get

$$\frac{d m}{d t} =   
     \frac{\delta f_m (m - m^\star)}{k_R^{-1} + k_B^{-1}} \,.$$

By comparing with [@eq:dmdt] we find that for small perturbations, the
timescale for methylation to approach steady state is given by

$$\tau_m = \frac{k^{-1}_R + k^{-1}_B}{-\delta f_m} \,.$$

Thus, the parameters $k_R$ and $k_R$ determine two important
characteristics of the methylation system: the adapted activity $a_0$
and the methylation time scale $\tau_m$. @2010.Shimizu report an adapted
activity of $a_0 = 1/3$ and based on experimental data
[@2021.Mattingly; @2010.Shimizu] we assume a methylation time scale of
$\tau_m = 10\,\text{s}$. Our parameter choice, which is consistent with
both of these observations, is $k_R=0.075\,\text{s}^{-1}$ and
$k_B=0.15\,\text{s}^{-1}$.

CheY is phosphorylated by CheA, the receptor-associated kinase. The
kinase activity is directly linked to the activity of a receptor
cluster. Therefore, we assume that CheY is phosphorylated by active
receptor clusters. Dephosphorylation of CheY-p is catalyzed by the
phosphatase CheZ, which we assume to be present at a constant
concentration. Ṯhe CheZ-catalyzed dephosphorylation rate was reported to
be $2.2\,\text{s}^{-1}$ for attractant response and $22\,\text{s}^{-1}$
for repellent response [@2002.Sourjikt5]. Based on this data, we use the
approximate dephosphorylation rate $k_Z = 10\,\text{s}^{-1}$ in our
model. In the fully adapted state the fraction of active receptors is
$a_0$ and therefore the mean fraction of phosphorylated CheY,
$\phi_Y = [\text{CheYp}]/([\text{CheY}] + [\text{CheYp}])$, is given by

$$\phi_Y = \frac{a_0 N_c k_A}{k_Z + a_0 N_c k_A} \,.$$

In the fully adapted state the phosphorylated fraction was found to be
$\phi_Y \approx 0.16$ [@2002.Sourjik]. Hence, we infer a phosphorylation
rate of
$k_A = k_Z \phi_Y / (a_0 N_c (1 - \phi_Y)) = 0.015\,\text{s}^{-1}$ for
the literature-based model. Accordingly, for the "fitted model", based
on fitting $K(t)$ and $N(t)$ to those measured by @2021.Mattingly, we
use a larger phosphorylation rate due to the smaller number of clusters
$N_c$.

### Reaction Kinetics

S̱ince the timescale of conformational switching of active and inactive
receptors and ligand binding is much faster [@2013.Ortega] than the
timescale of phosphorylation or methylation, we don't explicitly model
ligand (un)binding and conformational switching. Each cluster is
characterized by its methylation state $m$. This ranges from 0 to the
total number of methylation sites, which equals the number of sites per
receptor $M$ times the number of receptors per cluster $N$. In our
Gillespie simulation, each possible state of a cluster is its own
species, i.e., we have species $\mathrm{C}_m$ for $m=0,\ldots,NM$.
Overall, our chemotaxis model consists of four types of reactions that
describe (a) the methylation of a receptor
$\mathrm{C}_m\to\mathrm{C}_{m+1}$, (b) the demethylation of a receptor
$\mathrm{C}_m\to\mathrm{C}_{m-1}$, (c) the phosphorylation of CheY
$\mathrm{C}_m + \mathrm{Y} \to \mathrm{C}_m + \mathrm{Y_p}$, and (d) the
single dephosphorylation reaction $\mathrm{Y_p} \to \mathrm{Y}$. Thus,
due to the combinatorial explosion of receptor states, the system has a
total number of $3NM+2$ elementary reactions (which amounts to 75
reactions in the literature-based model and 182 reactions in the fitted
model).

The ligand-concentration dependent methylation rate for
$\mathrm{C}_m\rightarrow \mathrm{C}_{m+1}$ is given by

$$k_{m+}(c,m) = (1-p_a(c,m)) k_R \,.$$

The term $1-p_a(c,m)$ is needed because only inactive receptors can be
methylated. The demethylation rate for
$\mathrm{C}_{m}\rightarrow \mathrm{C}_{m-1}$ is given by

$$k_{m-}(c, m) = p_a(c,m) k_B$$

where only active receptors can be demethylated. These zero-order
dynamics of (de)methylation of receptors lead to the adaptive behavior
of the chemotaxis system as described above.

Only active receptors can phosphorylate the CheY protein using the
receptor-associated kinase CheA. We therefore model phosphorylation as a
reaction
$\mathrm{C}_{m} + \mathrm{Y} \rightarrow \mathrm{C}_{m} + \mathrm{Y_p}$
with rate

$$k_{\mathrm{Y}\rightarrow\mathrm{Y_p}}(c,m) = p_a(c, m) k_A$$

where $k_A$ is a constant that represents the phosphorylation rate of an
active cluster. The dephosphorylation
$\mathrm{Y_p}\rightarrow \mathrm{Y}$ is carried out by the phosphatase
CheZ at a constant rate $k_Z=10\,\text{s}^{-1}$.

## Mutual Information Rate for the Chemotaxis System in the Gaussian Approximation  {#sec:lna}

To test the validity of the Gaussian approach used by @2021.Mattingly,
we also compared the exact PWS results for our discrete, stochastic
model to the prediction of the Gaussian approximation for this same
model. In continuous time, the information transmission rate
$R(\mathcal{S}, \mathcal{X})$ of a Gaussian system in steady state can
be computed exactly from the power spectral density functions of the
system [@2009.Tostevin]:

::: {#eq:info_rate_gaussian}
$$R(\mathcal{S}, \mathcal{X}) = -\frac{1}{4\pi} \int^\infty_{-\infty} d\omega\ \ln\left[1 - \frac{|P_{sx}(\omega)|^2}{P_{ss}(\omega)P_{xx}(\omega)}\right] \,.
    \label{eq:info_rate_gaussian}$$
:::

Here, the power spectral density $P_{\alpha\beta}(\omega)$ is defined as

$$P_{\alpha\beta}(\omega) = \int^\infty_{-\infty} dt\ e^{-i\omega t} C_{\alpha\beta}(t)$$

where
$C_{\alpha\beta}(t_i - t_j) = \langle \alpha(t_i) \beta(t_j) \rangle$
denote the stationary (cross-)correlation functions of the system.

Thus, we need to obtain the (cross-)correlation functions to compute the
information rate in the Gaussian framework. In their experiments with
*E. coli* bacteria, @2021.Mattingly don't obtain these correlation
functions directly, however. Instead, they obtain three kernels, $V(t)$,
$K(t)$ and $N(t)$, from which the correlation functions can be inferred.
We follow this approach for calculating the Gaussian information
transmission rate.

### Computing the Gaussian information rate using linear response kernels *V(t), K(t),* and *N(t)*

$V(t)$ denotes the autocorrelation function of the swimming velocity of
bacteria, i.e., $V(t)=\langle v_x(\tau) v_x(\tau + t)\rangle$. As
explained in [@sec:chemotaxis_input], the swimming dynamics of the
bacteria determine the statistics of the input signal
$s(t) = \frac{d}{dt}\ln c(t)$, where $c(t)$ is the ligand concentration
as experienced by the bacterium and $g$ is the gradient steepness. The
input signal correlation function, denoted by $C_{ss}(t)$, can then be
expressed as

$$C_{ss}(t) = g^2 V(t) \,.$$

The response kernel, denoted by $K(t)$, represents the time evolution of
the average activity of the receptors in response to an instantaneous
step change in the input concentration. More precisely, $K(t)$ is
defined as

$$K(t) = \theta(t)  \langle a(t) - a_0 \rangle \ln\frac{c_s}{c_0}$$

where we assume the input concentration jumps instantaneously from $c_0$
to $c_s$ at time $t=0$. $\theta(t)$ is the Heaviside step function. Note
that because the signal $s(t)$ is defined as the time-derivative of the
concentration $c(t)$, a step-change in $c(t)$ corresponds to a delta
impulse in $s(t)$. Thus, $K(t)$ describes the deterministic dynamics of
the system after being subjected to a delta stimulus $s(t) = \delta(t)$,
making $K(t)$ the Green's function of the system. The activity $a(t)$
resulting from arbitrary time-dependent signal $s(t)$ can be written as
a convolution of $K(t)$ with $s(t)$

$$a(t) = a_0 + \int^t_{-\infty} dt^\prime\ K(t-t^\prime) s(t^\prime) + \eta_a(t)$$

where $\eta_a(t)$ is the receptor activity noise. We define the response
$x(t)=a(t) - a_0$. Assuming the input statistics are stationary and
described by the correlation function $C_{ss}(t)$, it is easy to show
that the cross-correlation between $s(t)$ and $x(t)$ is given by

::: {#eq:conv_correlation}
$$C_{sx}(t) = \langle s(\tau) x(\tau + t) \rangle = \int^t_{-\infty} dt^\prime\ K(t-t^\prime) C_{ss}(t^\prime) \,.
    \label{eq:conv_correlation}$$
:::

In other words, the cross-correlation between $s(t)$ and $x(t)$ is given
by the convolution of the response kernel with the input correlation
function.

The noise kernel $N(t)$ describes the autocorrelation of the activity
fluctuations in the absence of an input stimulus. In particular,
$N(t) = \langle \eta_a(\tau) \eta_a(\tau + t) \rangle$.

We now rewrite [@eq:info_rate_gaussian] for the mutual information rate
in terms of the three kernels described above. We express the power
spectra $P_{\alpha\beta}(\omega)$ in terms of the Fourier-transformed
kernels $V(\omega)$, $K(\omega)$, and $N(\omega)$. In
[@sec:chemotaxis_input] we already showed that
$P_{ss}(\omega) = g^2 V(\omega)$. The cross power spectrum is given by
$P_{sx}(\omega) = K(\omega) P_{ss}(\omega)$ which follows from
[@eq:conv_correlation]. Finally, from Ref. [@2009.Tostevin] we use the
identity $P_{xx}(\omega) = P_{ss}(\omega) |K(\omega)|^2 + N(\omega)$ to
express the output power spectrum. We insert these expressions into
[@eq:info_rate_gaussian] which yields

$$R(\mathcal{S}, \mathcal{X}) = \frac{1}{4\pi} \int^\infty_{-\infty} d\omega\ \ln\left(1+\frac{g^2 V(\omega) |K(\omega)|^2}{N(\omega)}\right).$$

Then, for shallow gradients, we can make a Taylor approximation in $g$
to obtain

::: {#eq:gauss_mi_approx}
$$R(\mathcal{S}, \mathcal{X}) = \frac{g^2}{4\pi} \int^\infty_{-\infty} d\omega\ \frac{V(\omega)|K(\omega)|^2}{N(\omega)} + \mathcal{O}(g^4) \,.
    \label{eq:gauss_mi_approx}$$
:::

This result shows that the information rate in shallow gradients is
proportional to $g^2$ and the proportionality constant is determined by
the measured kernels. @2021.Mattingly obtain the relevant kernels
$V(\omega)$, $K(\omega)$, and $N(\omega)$ from experiments by fitting
phenomenological models to their single-cell data. We obtain the kernels
from the simulation outputs of our stochastic chemotaxis model.

### Estimating the kernels from simulations

#### Response Kernel *K(t)*

To compute the response kernel from simulations of our model, we study
how the system responds to a sudden increase in ligand concentration.
First, we allow the system to reach steady state by adapting it to an
initial ligand concentration of $c_0=100\,\mu\text{M}$ for
$t_0 = 50\,\text{s}$. At time $t=t_0$, we instantaneously increase the
concentration by 10% to $c_s=c_0 + 0.1 c_0$. We then record the system's
response over the next 200 s, sampling at intervals of 0.01 s.

Rather than directly obtaining the receptor activity from the
simulations, we follow the experimental approach of inferring the
receptor activity from the phosphorylated CheY levels. Specifically, we
record the fraction $f(t)=[\mathrm{Y_p}]/[\mathrm{Y}]$ between
phosphorylated and unphosphorylated CheY. Since the copy number of CheY
is relatively large, this fraction serves as a good proxy for the
activity $a(t)$. We relate the $f(t)$ to the activity $a(t)$ via the
expression

::: {#eq:frac_to_act}
$$a(t) = \frac{k_Z}{k_A N_c} f(t) 
    \label{eq:frac_to_act}$$
:::

where $k_A$ and $k_Z$ are the phosphorylation and dephosphorylation
rate, respectively, and $N_c$ is the number of receptor clusters.

Finally, we estimate the response Kernel $K(t)$ by averaging the changes
in measured activity over $10^5$ simulated trajectories

$$K(t) = \ln\left( \frac{c_s}{c_0} \right) \langle a(t-t_0)-a(t_0) \rangle\,.$$

#### Output Noise Kernel *N(t)*

We can similarly obtain the noise statistics of the output from
simulations of our chemotaxis model. In this case, we stochastically
evolve the chemotaxis model at constant ligand concentration
$c_0=100\,\mu\text{M}$ for a very long time of 1 × 10^4^ s. The result
is a time trace of the activity $a(t)$, which we again obtain from the
fraction $f(t)$ using [@eq:frac_to_act]. We discretize this time trace
at a resolution of 0.01 s. This results in a time series
$\mathbfit{a}=(a_1,\ldots,a_N)^T$ where $a_i=a(t_i)$. To estimate the
correlations in the time series we subtract the overall average activity
from each data point and thus obtain the data vector $\mathbfit{x}$
where $x_i=a_i - \sum^N_{j=1} a_j/N$. From $\mathbfit{x}$ we estimate
the auto-correlation function
$C_{xx}(t) = \langle x(\tau) x(\tau + t) \rangle$ of the activity. To
obtain precise results we average the correlation function for $10^5$
trajectories.

#### Obtaining the Fourier Kernels using the FFT

Ṯo compute the Gaussian information rate, we need the frequency-space
representations of the kernels $V(t)$, $K(t)$, and $N(t)$. We already
derived the analytical form of $V(\omega)$ in [@sec:chemotaxis_input].
We obtain $K(\omega)$ and $N(\omega)$ numerically via a discrete Fourier
transform of the corresponding time-domain kernel.

As explained above, we compute time-discretized kernels $K_i = K(t_i)$
and $N_i = N(t_i)$ from time traces obtained via stochastic simulations
of our model. We sample these functions at the instants
$t_0,\ldots,t_{N-1}$, the sampling frequency being
$f_s = 100\,\text{Hz}$. Then, we use the discrete Fourier transform
(DFT) to obtain approximations for $K(\omega)$ and $N(\omega)$ as
follows. The DFT coefficients $\tilde{K}_k$ are given by

$$\tilde{K}_k = \sum_{n=0}^{N-1} K_n e^{-i2\pi nk/N}$$

where $k=0,1,\ldots,N-1$. These DFT coefficients can be computed
efficiently using the Fast Fourier Transform (FFT) algorithm. The DFT
provides point estimates for the Fourier-domain kernel $K(\omega)$ at
discrete frequencies

$$\omega_k = \frac{2\pi f_s k}{N},\quad k=0,1,...,N-1 \,,$$

i.e., $K(\omega_k) \approx \tilde{K}_k$. This approximation introduces
some level of error, known as spectral leakage, due to the finite
duration and sampling of the signal. This error can be reduced by
multiplying the time-domain kernel with a window function. Thus, before
computing the DFT, we multiply the kernel with a Hanning window, which
is a smooth function that tapers at the edges of the kernel, reducing
the effect of discontinuities at the beginning and end of the time
series. The Hanning window is defined as:

$$h_n = \frac{1}{2}\left[1 - \cos\left(\frac{2\pi n}{N-1}\right)\right],\quad n=0,1,...,N-1 \,.$$

The windowed kernel $k_n$ is obtained by multiplying the time-domain
kernel $K_n$ with the Hanning window $h_n$:

$$k_n = K_n h_n,\quad n=0,1,...,N-1$$

Using the FFT algorithm we then compute the DFT coefficients
$\tilde{k}_k$ of the windowed kernel.

The procedure described above to obtain the DFT coefficients
$\tilde{k}_k$ from $K(t)$ is also applied to $N(t)$ to obtain the
coefficients $\tilde{n}_k$.

We can then evaluate the information rate using [@eq:gauss_mi_approx] by
discretizing the integral
$\int d\omega\,F(\omega) \to \sum_k \Delta\omega\,F(\omega_k)$ with
$\Delta\omega = 2\pi f_s / N$. More precisely, we compute the Gaussian
information rate as

$$R(\mathcal{S}, \mathcal{X}) = \frac{g^2}{4\pi} \sum^{N-1}_{k=0} \Delta\omega\ \frac{V(\omega_k)|\tilde{k}_k|^2}{\tilde{n}_k} \,.$$

##  Results {#sec:comparison}

We first asked whether our chemotaxis model based on the current
literature can reproduce the information transmission rate as recently
measured by @2021.Mattingly. In what follows, we call this model the
"literature-based" model.

### Discrepancy between experimental results and literature-based model

In our model, the output is the concentration of phosphorylated CheY,
while in the experiments of @2021.Mattingly it is the average activity
of the receptor clusters as obtained via FRET measurements. We argue
that this difference does not significantly affect the obtained
information rates, and thus, that it is valid to compare our results to
the experiments. In particular, since the copy number of CheY is much
larger than the number of receptor clusters, the fluctuations in CheY
are dominated by the extrinsic fluctuations coming from the receptor
activity noise rather than from the intrinsic fluctuations associated
with CheY (de)phosphorylation. To a good approximation, the copy number
of phosphorylated CheY, ${\mathrm Yp}(t)$, is thus a deterministic
function of the average receptor activity $a(t)$. Mathematically, the
mutual information $I(X;Y)$ between two stochastic variables $X$ and $Y$
is the same as the mutual information $I(f(X);g(Y))$ for deterministic
and monotonic functions $f$ and $g$. It follows that the mutual
information between $c(t)$ and ${\mathrm Yp}(t)$, is nearly the same as
that between $c(t)$ and the receptor activity $a(t)$. It is therefore
meaningful to compare the information transmission rates as predicted by
our PWS simulations to those measured by @2021.Mattingly.

We use RR-PWS to compute the mutual information for the literature-based
model. Specifically, we measure the mutual information
$I(\mathbf{C}, \mathbf{Y_p}; T)$ between the input trajectory of the
ligand concentration $c(t)$ and the output trajectory of phosphorylated
CheY, $y_p(t)$, and where each trajectory is of duration $T$. With
RR-PWS it is possible to compute $I(\mathbf{C}, \mathbf{Y_p}; \tau)$ for
all $\tau \leq T$ within a single PWS simulation of duration $T$ by
saving intermediate results after each sampled segment, see [@sec:smc].
The receptor states are considered hidden internal states, and we use
the technique described in [@sec:integrating-out] to integrate them out.

<figure id="fig:chemotaxis_info_and_rate">
<embed src="figures/chemotaxis_info_and_rate.pdf" />
<figcaption>PWS simulations for the trajectory mutual information of
chemotaxis in the shallow gradient regime. <strong>a</strong> Mutual
information
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>I</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>𝐂</mi><mi>T</mi></msub><mo>,</mo><msub><mi>𝐘</mi><mi>T</mi></msub><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">I(\mathbf{C}_T, \mathbf{Y}_T)</annotation></semantics></math>
between input trajectories
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>c</mi><mo stretchy="false" form="prefix">(</mo><mi>t</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">c(t)</annotation></semantics></math>
and output trajectories
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>p</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>t</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">y_p(t)</annotation></semantics></math>
as a function of trajectory duration
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>T</mi><annotation encoding="application/x-tex">T</annotation></semantics></math>.
In each RR-PWS simulation,
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>=</mo><mn>7200</mn></mrow><annotation encoding="application/x-tex">N = 7200</annotation></semantics></math>
Monte Carlo samples were used
(<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi><mo>=</mo><mn>256</mn></mrow><annotation encoding="application/x-tex">M = 256</annotation></semantics></math>
for the particle filter). <strong>b</strong> The information
transmission rate is defined as
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>I</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>𝐂</mi><mi>T</mi></msub><mo>,</mo><msub><mi>𝐘</mi><mi>T</mi></msub><mo stretchy="false" form="postfix">)</mo><mi>/</mi><mi>T</mi></mrow><annotation encoding="application/x-tex">I(\mathbf{C}_T, \mathbf{Y}_T)/T</annotation></semantics></math>
in the limit
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>→</mo><mi>∞</mi></mrow><annotation encoding="application/x-tex">T\to\infty</annotation></semantics></math>.</figcaption>
</figure>

[@fig:chemotaxis_info_and_rate]a shows the PWS estimate of the
information transmission rate for cells swimming in gradients of
different steepnesses $g$. The information transmission rate is obtained
from the PWS estimate of the trajectory mutual information
$I(\mathbf{C}, \mathbf{Y_p}; T)$, different trajectory durations $T$. As
seen in [@fig:chemotaxis_info_and_rate]b, for short trajectories the
mutual information increases non-linearly with trajectory duration $T$,
but in the long-duration limit the slope becomes constant. This
asymptotic rate of increase of the mutual information with $T$ is the
desired information transmission rate $R(\mathbf{C}, \mathbf{Y_p})$. The
precise definition is given by

$$R(\mathbf{C}, \mathbf{Y_p}) = \lim_{T\to\infty} \frac{I(\mathbf{C}, \mathbf{Y_p}; T)}{T} \,.$$

<figure id="fig:chemotaxis_comparison">
<embed src="chemotaxis_comparison.pdf" />
<figcaption>Comparison of theoretical models with experimental data for
bacterial chemotaxis system. Panels <strong>a</strong> and
<strong>b</strong> show the response and noise kernels, respectively,
for the model based on literature parameters (green), parameters fitted
to experiments (blue), and experiments from <span class="citation"
data-cites="2021.Mattingly"></span> (orange). In panel
<strong>c</strong>, the information transmission rate is shown for each
model as a function of gradient steepness, with results from the
Gaussian approximation shown alongside exact PWS calculations. The
fitted model closely matches the experiments, while the literature-based
model over-estimates information transmission rate by a factor of
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≈</mo><mn>4</mn></mrow><annotation encoding="application/x-tex">\approx 4</annotation></semantics></math>
despite having a lower response amplitude (panel <strong>a</strong>).
This is because the literature-based model has a large number of
independents receptor clusters
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>N</mi><mi>c</mi></msub><annotation encoding="application/x-tex">N_c</annotation></semantics></math>,
resulting in much lower noise in the output (panel <strong>b</strong>).
In all cases, the Gaussian approximation matches the exact PWS results,
providing support for the accuracy of the measurements of <span
class="citation" data-cites="2021.Mattingly"></span>.</figcaption>
</figure>

We then compared our results for the information transmission rate of
the literature-based model to those of @2021.Mattingly.
[@fig:chemotaxis_comparison]c shows that the model predictions differ
from the experiments by a factor of $\approx 4$. Despite this
discrepancy, we believe that the agreement between experiment and theory
is, in fact, remarkable, because these predictions were made *ab
initio*: the model was developed based on the existing literature and we
did not fit our model to the data of @2021.Mattingly

Yet, the question about the origin of the discrepancy remains. The
difference between their measurements and our predictions could be
attributed either to the inaccuracy of our model or to the approximation
that @2021.Mattingly had to employ to compute the information
transmission rate from experimental data. Concerning the latter
hypothesis, due to the curse of dimensionality and experimental
constraints, @2021.Mattingly could not directly obtain the information
transmission rate from measured time traces of the input and output of
the system. Instead, they measured three different kernels that describe
the system in the linear regime. Specifically, they obtained the
response $K(t)$ of the kinase activity to a step-change in input signal,
the autocorrelation function of the input signal $V(t)$, and the
autocorrelation $N(t)$ of the kinase activity in a constant background
concentration. Then they used a Gaussian model to compute the
information transmission rate from these measured functions $K(t)$,
$V(t)$, and $N(t)$ [@2009.Tostevin; @2021.Mattingly] (see also
[@sec:lna]). This Gaussian model is based on a linear noise assumption
and cannot perfectly capture the true non-linear dynamics of the
biochemical network. This could be the cause for the observed
discrepancies in the information rate. We have indeed already seen in
[@ch:variants] that there can be substantial differences between exact
computations and the Gaussian approximation for the trajectory mutual
information.

### Revising the literature-based model

To uncover the reason for the discrepancy we first tested whether our
literature-based model reproduces the experimentally measured kernels.
If the kernels do not match, then, clearly, the discrepancy in the
information rate may be caused by the difference between our model and
the experimental system, as opposed to the inaccuracy of the Gaussian
framework. Our input correlation function, $V(t)$, is, by construction,
the same as that of @2021.Mattingly. The simulation protocol we used for
measuring the other kernels was directly modeled after the experimental
protocol [@2021.Mattingly].

We find that the response kernel $K(t)$ and the autocorrelation function
of the noise $N(t)$ of our system are different.
[@fig:chemotaxis_comparison]a, b shows that our model reproduces the
timescales of $N(t)$ and $K(t)$ as measured experimentally. This is
perhaps not surprising, because the decay of both $N(t)$ and $K(t)$ is
set by the (de)methylation rate, which has been well-characterized
experimentally. Yet, the figure also shows that our model significantly
underestimates the amplitudes of both $N(t)$ and $K(t)$.

This raises the question of whether other parameter values would allow
our model to better reproduce the measured kernels $K(t)$ and $N(t)$,
and, secondly, whether this would resolve the discrepancy in information
rate between our simulations and the experiments.

The amplitude $\sigma^2_N$ of the output noise correlation function
$N(t)$ is bounded by the number of receptor clusters $N_{\mathrm c}$. In
particular, the variance of the receptor activity is
$\sigma^2_N = \sigma^2_a / N_{\mathrm c} \leq 1 / 4 N_{\mathrm c}$,
where $\sigma^2_a\leq 1/4$ is the variance of the activity of a single
receptor cluster. Comparing this bound to the measured receptor noise
strength $\sigma^2_N$ reveals that $N_{\mathrm c}$ needs to be much
smaller than our original model assumes: the number of clusters needs to
be as small as $N_{\mathrm c} \lesssim 10$. Indeed,
[@fig:chemotaxis_comparison]b shows that with $N_{\mathrm c}=9$, our
model quantitatively fits the correlation function $N(t)$ of the
receptor activity in a constant background concentration, as measured
experimentally [@2021.Mattingly].

The amplitude of $K(t)$, i.e. the gain, depends on the ratio
$K_{\mathrm D}^{\mathrm A}/ K_{\mathrm D}^{\mathrm I}$ of the
dissociation constants of the receptor for ligand binding in its active
or inactive state, respectively, as well as on the number of receptors
per cluster, $N$. Both dissociation constants have been well
characterized experimentally [@2011.Lazova; @2010.Shimizu], but the
number of receptors per cluster has only been inferred indirectly from
experiments [@2020.Kamino; @2010.Shimizu]. The higher gain as measured
experimentally by @2021.Mattingly indicates that $N$ is larger than
assumed in our model: with $N=15$ our model can quantitatively fit
$K(t)$ ([@fig:chemotaxis_comparison]a).

We thus find that by reducing the number of clusters from
$N_{\mathrm c} = 400$ to $N_{\mathrm c}=9$ while simultaneously
increasing their size from $N=6$ to $N=15$, our model is able to
quantitatively fit both $N(t)$ and $K(t)$ [@2021.Mattingly], see
[@fig:chemotaxis_comparison] and [@fig:fourier_kernels] for their
Fourier representations. This suggests that the number of independent
receptor clusters is smaller than hitherto believed, while their size is
larger.

\begin{tcolorbox}[float=t, title=PWS Estimate for the Fitted Chemotaxis Model]

In the main text, we described that a chemotaxis model with $N_c = 9$ receptor clusters, each containing $N=15$ receptors, matches the experimental kernels of \citet{2021.Mattingly}. We then computed the information rate for this model using both the exact PWS method and a Gaussian approximation. How the rate in the Gaussian model is computed is described in \cref{sec:lna}. Here, we describe briefly how we compute the exact rate using PWS.

While in principle the rate could be computed directly via PWS for the model with $N_c=9$ and $N=15$, the receptor activity noise was so large that obtaining this estimate directly in a single PWS simulation proved to be inefficient.
Instead, we computed the rate via an extrapolation procedure. 
In particular, we computed the rate for a series of models with $N=15$, yet with $N_c$ going down from 400 to 50.
The rate for the model of interest, with $N=15$ and $N_c=9$, was then obtained by fitting this data to a simple polynomial and then extrapolating to $N_c=9$.

In \cref{fig:num_clusters} we show the information rate for a range of values of $N_c$, and for different gradient steepnesses $g$. 
We see that the information rate increases non-linearly with the number $N_c$ of independent clusters.
Based on the assumption that the information rate is zero in the limit $N_c\to 0$, we fit a quadratic function $R(N_c) = a N_c - b N^2_c$ with positive coefficients $a, b$ to the data.
We provide the fit coefficients for different gradient steepnesses $g$ in \cref{tab:fit_coefficients}. From these fits we can obtain the extrapolated information rates for $N_c=9$ that are shown in the main text.
\end{tcolorbox}

<figure id="fig:fourier_kernels">
<embed src="fourier_comparison.pdf" />
<figcaption>Fourier representation of the kernels for computing the
information transmission rate in the Gaussian approximation, the
velocity power spectrum
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi><mo stretchy="false" form="prefix">(</mo><mi>ω</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">V(\omega)</annotation></semantics></math>
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false" form="prefix">[</mo><mo stretchy="false" form="prefix">(</mo><mrow><mtext mathvariant="normal">m</mtext><mtext mathvariant="normal">m</mtext><msup><mtext mathvariant="normal">s</mtext><mrow><mi>−</mi><mn>1</mn></mrow></msup></mrow><msup><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msup><mo stretchy="false" form="postfix">]</mo></mrow><annotation encoding="application/x-tex">[(\si{\milli\meter\text{s}^{-1}})^2]</annotation></semantics></math>,
the squared frequency response
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false" form="prefix">|</mo><mi>K</mi><mo stretchy="false" form="prefix">(</mo><mi>ω</mi><mo stretchy="false" form="postfix">)</mo><msup><mo stretchy="false" form="prefix">|</mo><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">|K(\omega)|^2</annotation></semantics></math>,
and the noise power spectrum
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo stretchy="false" form="prefix">(</mo><mi>ω</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">N(\omega)</annotation></semantics></math>.
The top-left panel shows the individual Fourier kernels as a function of
frequency
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>ω</mi><annotation encoding="application/x-tex">\omega</annotation></semantics></math>
for the different models. On the top-right the normalized kernels are
shown with linear axis scales. In the bottom panels the integrand for
computing the mutual information rate in the Gaussian approximation is
shown. In the bottom right, the area under the curves represents the
proportionality between the squared gradient steepness
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msup><mi>g</mi><mn>2</mn></msup><annotation encoding="application/x-tex">g^2</annotation></semantics></math>
and the information rate (units  s mm<sup>−−2</sup>). In the bottom left
plot, the integrand is multiplied by
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>ω</mi><annotation encoding="application/x-tex">\omega</annotation></semantics></math>,
so that with log scaling of the axes the area under the curve is equal
to the integral. </figcaption>
</figure>

### Comparing the chemotaxis information rate of the models against experiments

<figure id="fig:num_clusters">
<embed src="num-clusters.pdf" style="width:75.0%" />
<figcaption>The information rate as a function of the number of receptor
clusters
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>N</mi><mi>c</mi></msub><annotation encoding="application/x-tex">N_c</annotation></semantics></math>.
The cluster size is fixed at
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>=</mo><mn>15</mn></mrow><annotation encoding="application/x-tex">N=15</annotation></semantics></math>.
The left panel shows the increase of information rate as a function of
gradient steepness for different values of
<math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>N</mi><mi>c</mi></msub><annotation encoding="application/x-tex">N_c</annotation></semantics></math>,
including a line for the experimental data from <span class="citation"
data-cites="2021.Mattingly"></span>. The right panel shows the same data
but highlights the increase of the information rate and when increasing
the number of receptor clusters. A quadratic fit (shown as dotted lines)
is used to extrapolate the information rate. All results were obtained
using RR-PWS. </figcaption>
</figure>

How accurately can our revised model reproduce the measured information
rate, and how accurate is the Gaussian framework for the experimental
system in the regime studied by @2021.Mattingly? In the revised model,
called the "fitted model", with $N_{\mathrm c}=9$ and $N=15$, all key
quantities for computing the information transmission rate within the
Gaussian framework, $V(t)$, $N(t)$ and $K(t)$, are nearly identical to
the experiments of @2021.Mattingly, see [@fig:chemotaxis_comparison].
Within the Gaussian framework (see [@sec:lna]), the information
transmission rate in our model is thus expected to be very similar to
the experimentally measured one, and [@fig:chemotaxis_comparison]c shows
that this is indeed the case. To quantify the accuracy of the Gaussian
framework, we then recomputed the information transmission rate for the
revised model, using exact PWS. We found that the result matches the
Gaussian prediction very well. For these shallow and static chemical
gradients, the Gaussian model is thus highly accurate. Our analysis
validates *a posteriori* the Gaussian framework adopted by
@2021.Mattingly.

## Discussion

The application of PWS to the bacterial chemotaxis system shows how
crucial it is to have a simulation technique that is exact. Without the
latter it would be impossible to determine whether the difference
between our predictions and the Mattingly data [@2021.Mattingly] is due
to the inaccuracy of the model, the inaccuracy of the numerical
technique to simulate the model, or the approximations used by Mattingly
and coworkers in analyzing the data. In contrast, because PWS is exact,
we knew the difference between theory and experiment is either due to
the inaccuracy of the model or the approximations used to analyze the
data. By then employing the same Gaussian framework to analyze the
behavior of the model and the experimental system, we were able to
establish that the difference is due to the inaccuracy of our original
model.

Our analysis indicates that the size of the receptor clusters in the *E.
coli* chemotaxis system, $N\approx 15$, is larger than that based on
previous estimates, $N\sim 6$
[@2007.Mello; @2010.Shimizu; @2020.Kamino]. The early estimates of the
cluster size were based on bulk dose-response measurements with a
relatively slow ligand exchange, yielding $N \approx 6$
[@2007.Mello; @2010.Shimizu]. More recent dose-response measurements, at
the single cell level and with faster ligand exchange, yield an average
that is higher, $\langle N\rangle\approx 8$, and with a broad
distribution around it, arising from cell-to-cell variability
[@2020.Kamino]. Our estimate, $N\approx 15$, based on fitting the
response kernel $K(t)$ to that measured by @2021.Mattingly, therefore
appears reasonable. At the same time, the number of clusters, obtained
by fitting the noise correlation function $N(t)$ to the data of
@2021.Mattingly is surprisingly low, $N_c \sim 10$, given the total
number of receptors, $N_r \sim 10^3\text{--}10^4$ [@2004.Li].
Interestingly, recent experiments indicate that the receptor array is
poised near the critical point [@2023.Keegstra], where receptor
switching becomes correlated over large distances. This effectively
partitions receptors into a few large domains, which may explain our
fitted values for $N$ and $N_c$.

It has been suggested that information processing systems are positioned
close to a critical point to maximize information transmission
[@2015.Tkacik; @2021.Meijers], although it has been argued that the
sensing error of the *E. coli* chemotaxis system is minimized for
independent receptors [@2011.Skoge]. @2021.Mattingly have demonstrated
that the chemotactic drift speed in shallow exponential gradients is
limited by the information transmission rate [@2021.Mattingly], but
whether the system has been optimized for information transmission, and
how the latter affects chemotactic performance in other spatio-temporal
concentration profiles, remain interesting questions for future work.

[^1]: The contents of this chapter have been published in *Phys. Rev. X*
    **13**, 041017 (2023) [@2023.Reinhardt].
