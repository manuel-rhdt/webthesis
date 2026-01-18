---
bibliography: references.bib
csl: american-physics-society.csl
license: CC-BY-4.0
link-citations: true
reference-section-title: References
---

# ML-PWS: Quantifying Information Transmission Using Neural Networks {#sec-ml-pws}

> Understanding the flow of information in natural and engineered
> systems is crucial for their design and analysis. The mutual
> information rate is the fundamental measure to describe the
> transmission of information for systems with time-varying signals.
> Yet, computing it accurately is extremely challenging due to the
> high-dimensional nature of trajectories. Previous methods include the
> Gaussian approximation which is limited to linear systems with
> Gaussian noise. A recent technique, Path Weight Sampling (PWS), in
> principle addresses these limitations, but it requires a stochastic
> model, which is often not available for the systems of interest. We
> propose leveraging recent advances in machine learning to obtain such
> a stochastic model directly from data, and provide a general-purpose
> tool for estimating the mutual information rate. Specifically, using
> unsupervised learning, we estimate the probability distribution of
> trajectories by training a neural stochastic model on time-series
> data. We demonstrate that by combining machine learning with PWS
> (ML-PWS) we can accurately compute the information transmission rate
> of nonlinear systems, even in the absence of a known mechanistic or
> phenomenological model. This approach represents a significant advance
> for data-driven quantification of information transmission in general
> nonlinear and non-Gaussian systems.

## Introduction

[^1]

Information theory is the most general framework for studying signal
processing systems and quantifying their performance. @1948.Shannon
introduced the mutual information as a measure to quantify how much
information is communicated between two random variables, such as the
input and output of a system at a given time. However, for most systems
the mapping from input to the output cannot be directly described as a
sequence of independent transmissions, rather information can generally
be contained in temporal correlations within the input or output
signals. Therefore, the mutual information between signal values at a
given instant is in general ill-suited for measuring the amount of
information transmission. To correctly quantify the information
transmitted via time-varying signals requires computing the mutual
information between the entire input and output trajectories of the
system [@2009.Tostevin]. The rate at which this trajectory mutual
information increases with the trajectory duration in the long-time
limit defines the mutual information rate [@1948.Shannon]. This rate
represents the speed at which distinct messages are transmitted through
the system, and it depends not only on the accuracy of the input-output
mapping but also on the correlations within the input and output
signals. In the absence of feedback this rate also equals the multi-step
transfer entropy [@1990.Massey; @2000.Schreiber].

The mutual information rate is the key measure to quantify information
flow in dynamical systems. It is used to quantify biochemical signaling
performance [@2021.Mattingly; @2023.Hahn; @2023.Moor], to perform model
reduction [@2023.Schmitt], to detect the causality of interactions
[@2007.Frenzel; @2007.Hlaváčková-Schindler] or to test for
nonlinearities in time series [@1995.Paluš]. This includes applications
such as financial markets, to assess dependencies between stock prices
or market indices over time
[@2002.Marschinski; @2013.Dimpfl; @2016.Dimpfl], or neuroscience, where
it is used to measure the amount of information exchanged between
different regions of the brain [@2011.Rad; @2012.So]. Being one of the
key performance measures in information theory, the mutual information
rate is thus of paramount practical relevance.

Yet, computing the mutual information rate poses a significant challenge
because trajectories are high-dimensional objects, making its accurate
estimation difficult. Traditional techniques first estimate the joint
probability distribution of input and output, e.g. via histograms or
kernel density estimates, and then compute the mutual information from
the distribution estimate [@1986.Fraser; @1995.Moon]. However, these
distribution estimates are typically infeasible in high-dimensional
spaces [@2003.Paninski; @2019.Cepeda-Humerez], and have only been
successfully used for computing the mutual information between
trajectories in very simple systems [@2021.Meijers]. Non-parametric
estimators, such as the k-nearest-neighbor estimator [@2004.Kraskov]
attempt to circumvent some of these issues but require selecting an
appropriate metric in trajectory space and still suffer from
uncontrolled biases for high-dimensional data
[@2014.Gao; @2019.Cepeda-Humerez]. For systems that exhibit
approximately Gaussian dynamics, the mutual information can be estimated
directly from correlation functions [@2009.Tostevin; @2010.Tostevin],
though this method is limited to linear systems.[^2] Finally, analytical
and numerical approaches have been developed to accurately compute or
approximate the trajectory mutual information from a dynamical model of
the system
[@2009.Tostevin; @2019.Duso; @2023.Reinhardt; @2023.Moor; @2023.Sinzger].
In particular, we recently introduced Path Weight Sampling (PWS), a
model-based Monte Carlo technique to exactly compute the mutual
information rate [@2023.Reinhardt]. But, since all these techniques
require an accurate stochastic model describing the system, they cannot
be directly applied to data.

Neural network-based methods offer a promising alternative. By
leveraging gradient descent for learning complex high-dimensional
distributions, we can potentially estimate the mutual information more
accurately. So far, most of these approaches have primarily focused on
training neural networks to optimize variational bounds of the mutual
information
[@2004.Barber; @2010.Nguyen; @2016.Alemi; @2018.Belghazi; @2018.Oord; @2019.Poole],
often with the goal of learning effective latent state representations.
However, these variational bounds are frequently not tight due to
limited amounts of training data and the difficulty of optimizing over
high-dimensional spaces
[@2018.McAllester; @2019.Poole; @2019.Kolchinsky; @2019.Cepeda-Humerez; @2019.Hledik],
leading to significant underestimation of the mutual information. The
Difference-of-Entropies (DoE) estimator by @2018.McAllester neither
provides an upper nor a lower bound on the mutual information, but often
results in more accurate mutual information estimates. As discussed in
[@sec-ml_discussion], this estimator shares some similarities with PWS.
Given the effectiveness of neural networks for modeling sequential data,
we thus asked whether machine learning could be combined with PWS to
create a robust, data-driven estimator for the mutual information rate.

In this chapter, we present ML-PWS, an extension of PWS for computing
the mutual information rate directly from experimental time-series data.
By leveraging current machine learning methods, and combining them with
PWS, we obtain a flexible architecture for computing the mutual
information rate. We demonstrate that neural autoregressive sequence
prediction models, which have been used in speech synthesis [@2016.Oord]
or text generation [@2011.Sutskever], can be trained to learn a
nonlinear stochastic model directly from data consisting of many
input-output pairs of time-series. The model is trained by minimizing
the Kullback-Leibler divergence between the model predictions and the
observed trajectories. With this approach, the model learns the
stochastic properties of the trajectories, enabling the computation of
the mutual information rate using PWS. Here, the neural network is both
used to generate stochastic trajectories, as well as to compute the path
weights required for the PWS Monte Carlo estimate. Moreover, we show
that by leveraging variational techniques we can significantly improve
the PWS estimator itself, employing neural importance sampling
[@2019.Muller] to efficiently marginalize the joint distribution of
input and output---a key step in the algorithm. We posit that these
advances lead to a generic, flexible, and efficient framework for
computing the mutual information rate directly from experimental data.

We test our approach by computing the mutual information rate for a
minimal nonlinear model and comparing our results against the true
mutual information as well as against the Gaussian approximation. We
find that the autoregressive sequence model effectively learns the
stochastic dynamics of the nonlinear system, and that PWS yields
accurate mutual information estimates, including in regimes where the
widely-used Gaussian approximation fails. Notably, we find that even for
approximately linear systems, our model combined with PWS provides more
accurate mutual information estimates than the Gaussian approximation
because it suffers less from bias caused by using a finite-size dataset.

## Methods

### The Mutual Information Rate for Discrete-time Processes

The mutual information between two random variables $S$ and $X$ is
defined as

$$I(S, X) = \iint \mathrm{P}(s, x) \ln \frac{\mathrm{P}(s, x)}{\mathrm{P}(s)\mathrm{P}(x)}\ ds\,dx \,,$$

or, equivalently, using Shannon entropies

$$\begin{aligned}
I(S, X) 
&= H(S) + H(X) - H(S, X) \\
&= H(S) - H(S|X) \\
&= H(X) - H(X|S)\,.
\end{aligned}$$

In the context of a noisy communication channel, $S$ and $X$ represent
the messages at the sending and receiving end, respectively. Then,
$I(S, X)$ is the amount of information about $S$ that is communicated
when only $X$ is received. If $S$ can be perfectly reconstructed from
$X$, then $I(S,X)=H(S)$. On the contrary, if $S$ and $X$ are
independent, $I(S, X)=0$. The mutual information thus is always
non-negative and quantifies the degree of statistical dependence between
two random variables.

For systems that repeatedly transmit information, this concept must be
extended to sequences of messages $S_{1:n}=(S_1,\ldots,S_n)$ and
$X_{1:n}=(X_1,\ldots,X_n)$. The mutual information between random
sequences is defined analogously as


$$I(S_{1:n},X_{1:n}) = \left\langle \ln\frac{\mathrm{P}(s_{1:n}, x_{1:n})}{\mathrm{P}(s_{1:n}) \mathrm{P}(x_{1:n})} \right\rangle_{\mathrm{P}(s_{1:n}, x_{1:n})}
\label{eq-trajectory_mi_sequence}$$ {#eq-trajectory_mi_sequence}

where the expected value is taken with respect to the full joint
probability of both sequences. This quantity can be interpreted as the
total information that is communicated via $n$ transmissions
$S_i\mapsto X_i$.

Note that, unless the individual messages are independent, the total
amount of information communicated is not equal to the sum of the mutual
information between individual messages. Thus, in general

$$I(S_{1:n},X_{1:n}) \neq \sum^n_{i=1} I(S_i, X_i) \,.$$

Intuitively, this makes sense. On one hand, auto-correlations within the
input or output sequences reduce the amount of information transmitted
per message such that the left term of the inequality may become smaller
than the right term. On the other hand, information can be encoded in
temporal features of the sequences, such that the left term could become
larger than the right term. These observations show that generally the
instantaneous mutual information $I(S_t, X_t)$ at any given time $t$
does not provide a meaningful measure of information flow, as has been
pointed out before [@2021.Meijers; @2024.Fan]. To correctly quantify the
amount of information transmitted per unit time we must take the whole
sequence of messages over time into account.

For that reason, the relevant performance measure for an information
processing system is the mutual information rate. Let the input and
output of an information processing system be given by two discrete-time
stochastic processes $\mathcal{S}=\{S_t\mid t=1,2,\ldots\}$ and
$\mathcal{X}=\{X_t\mid t=1,2,\ldots\}$. Then, the mutual information
rate between $\mathcal{S}$ and $\mathcal{X}$ is

$$R(\mathcal{S}, \mathcal{X}) = \lim_{t\to\infty} \frac{1}{t} I(S_{1:t}, X_{1:t})\,.$$

The mutual information rate quantifies the amount of information that
can reliably be transmitted per unit time.

The definitions above however do not provide an obvious way of how to
compute the mutual information rate in practice. Path Weight Sampling is
a Monte Carlo estimator introduced recently for exactly computing the
mutual information between trajectories [@2023.Reinhardt].

### Path Weight Sampling

In the previous chapters, we developed Path Weight Sampling, which
addresses many of the shortcomings of previous techniques for computing
the mutual information. PWS is an exact technique that supports
nonlinear systems and, in contrast to the Gaussian approximation,
correctly takes into account higher-order correlations that may be
present. Given a mechanistic model that describes the stochastic
dynamics of a system, PWS makes it possible to directly compute the
mutual information rate for this model.

PWS is based on the exact evaluation of conditional path probabilities
and requires that we have a model of the system as well as its input
statistics. Specifically, it has three requirements. To compute the
Monte Carlo estimate of the mutual information one needs to

1.  sample from the input distribution $\mathrm{P}(s_{1:n})$,

2.  sample from the conditional output distribution
    $\mathrm{P}(x_{1:n}|s_{1:n})$, and

3.  evaluate the conditional probability density
    $\mathrm{P}(x_{1:n}|s_{1:n})$, i.e., the path weight.

We thus require a model of the system, that describes how the output
$x_i$ evolves stochastically for a given input sequence $s_{1:n}$, as
well as a model that describes the stochastic input
$s_{1:n} \sim \mathrm{P}(s_{1:n})$ to the system. Note, that we only
need an estimate of the probability density for the output
$\mathrm{P}(x_{1:n}|s_{1:n})$, but not for the input.

Given these models for input and output, the mutual information is
computed using a Monte Carlo estimate of [@eq-trajectory_mi_sequence]


$$I_{MC}(S_{1:n}, X_{1:n}) = \frac{1}{N} \sum^N_{i=1} \ln \frac{\mathrm{P}(x^i_{1:n} | s^i_{1:n})}{\mathrm{P}(x^i_{1:n})}
\label{eq-monte_carlo_information}$$ {#eq-monte_carlo_information}

where $(s^1_{1:n}, x^1_{1:n}), \ldots, (s^N_{1:n}, x^N_{1:n})$ are pairs
of input-output trajectories that need to be drawn independently from
the full joint distribution of trajectories, given by
$\mathrm{P}(s_{1:n}, x_{1:n})=\mathrm{P}(s_{1:n})\mathrm{P}(x_{1:n}|s_{1:n})$.
Such draws can be realized by first generating an input sequence
$s_{1:n} \sim \mathrm{P}(s_{1:n})$, and subsequently generating an
output from the conditional model
$x_{1:n}\sim \mathrm{P}(x_{1:n}|s_{1:n})$. As $N\to\infty$ this estimate
converges to the true mutual information $I(S_{1:n}, X_{1:n})$, making
PWS an exact Monte Carlo scheme. [@eq-monte_carlo_information] requires
evaluating the conditional probability density
$\mathrm{P}(x_{1:n} | s_{1:n})$, as well as the marginal probability
density $\mathrm{P}(x_{1:n})$ for a potentially large set of Monte Carlo
samples. How to evaluate these densities efficiently is the crux of PWS.

The first important observation is that we can typically directly
evaluate the conditional probability density of output sequences
$\mathrm{P}(x_{1:n} | s_{1:n})$ from the stochastic model of our system.
For instance, suppose the output model is given by a Langevin equation
$\dot x = f(x, s, t) + \sigma\xi(t)$ with delta-correlated unit white
noise $\xi(t)$. A discretized path $x_{1:n}$ sampled from the model, can
be represented by the initial state $x_1$ and the sequence of random
numbers $\epsilon_1,\ldots,\epsilon_{n-1}\sim\mathcal{N}(0, 1)$ that
were used to generate the path with a stochastic integration scheme. The
conditional probability density of the path can then be written as


$$\mathrm{P}(x_{1:n}|s_{1:n}) = \mathrm{P}(x_1|s_1) \prod^{n-1}_{i=1} \frac{1}{\sqrt{2\pi}\sigma} \exp\left(- \epsilon_{i}^2 / 2 \right) \,.
    \label{eq-tractable_conditional}$$ {#eq-tractable_conditional}

A similar formula exists if the model is given by a master equation
[@2019.Cepeda-Humerez; @2023.Reinhardt], which is based on the random
numbers drawn in the Gillespie algorithm. There is also a class of deep
generative models with tractable probability distributions. More
generally, it is known that efficiently evaluating the conditional
probability density $\mathrm{P}(x_{1:n} | s_{1:n})$ of sequences is
tractable for any autoregressive sequence model without latent
(unobserved) variables [@1998.Frey]. In this chapter we will exclusively
deal with tractable conditional distributions, allowing us to evaluate
the numerator in [@eq-monte_carlo_information].

Unfortunately, the for denominator of [@eq-monte_carlo_information],
i.e., the marginal probability $\mathrm{P}(x_{1:n})$, no simple formulae
like [@eq-tractable_conditional] typically exist. Yet,
$\mathrm{P}(x_{1:n})$ is required for the Monte Carlo estimate of the
mutual information. The only way of computing $\mathrm{P}(x_{1:n})$
exactly from the conditional probability density
$\mathrm{P}(x_{1:n} | s_{1:n})$ is via marginalization over the input
paths:


$$\mathrm{P}(x_{1:n}) = \int \mathrm{P}(x_{1:n} | s_{1:n}) \mathrm{P}(s_{1:n}) ds_{1:n} \,.
    \label{eq-marginalization}$$ {#eq-marginalization}

In practice, directly evaluating this integral is typically infeasible.
A simple "brute force" Monte Carlo estimate of [@eq-marginalization] can
be obtained by sampling $s^1_{1:n}, \ldots, s^M_{1:n}$ from
$\mathrm{P}(s_{1:n})$ and computing

$$\mathrm{P}(x_{1:n}) \approx \frac{1}{M} \sum^M_{i=1} \mathrm{P}(x_{1:n} | s^i_{1:n}) \,.$$

For $M\to\infty$ this estimate converges to $\mathrm{P}(x_{1:n})$. This
direct Monte Carlo estimate forms the basis of *Direct PWS*, the
simplest variant of PWS, and can be sufficiently accurate for short
trajectories. However, due to the combinatorial explosion, the required
amount of samples $M$ to achieve an accurate result grows exponentially
with trajectory length, and thus for long trajectories the brute force
estimate becomes intractable. The problem is that for a given $x_{1:n}$
most of the density $\mathrm{P}(x_{1:n} | s_{1:n})$ will typically be
concentrated in a very small region of $s_{1:n}$-space. Therefore, for
longer trajectories more sophisticated Monte Carlo samplers must be used
to achieve good results. Two more powerful variants of PWS were
introduced in [@sec-variants].

While PWS is a powerful exact method to compute the mutual information
between trajectories, it cannot be applied directly to experimental
data. The need for a stochastic model that provides an expression for
$\mathrm{P}(x_{1:n} | s_{1:n})$ represents the most significant
challenge for the use of PWS in practice. In many cases, a detailed
mechanistic or phenomenological model of the experimental system is not
available. To overcome this problem, we learn a stochastic model from
data which can then be used in combination with PWS to compute the
mutual information rate directly from experimental time series data.

### Autoregressive neural networks for stochastic sequence modeling

For computing the mutual information between trajectories using PWS, we
require a generative sequence model that specifies the stochastic
dynamics of the input-output mapping. We assume that the input
distribution $\mathrm{P}(s_{1:n})$ is known and can be sampled from. In
experimental practice, we often have control over the input that is
delivered to the system. The challenge is thus in accurately modeling
the unknown stochastic dynamics of the system.

Hence, we require a model which, given an input sequence
$s_{1:n}=(s_1,\ldots,s_n)$, models the statistics of the stochastic
output sequence $x_{1:n}=(x_1,\ldots,x_n)$, i.e., we want a generative
model for the distribution
$\mathrm{P}(x_1,\ldots,x_n \mid s_1,\ldots,s_n) = \mathrm{P}(x_{1:n} \mid s_{1:n})$.
However, for large $n$ the space of multivariate distributions in
$x_{1:n}$ is vast, and we need to make simplifying assumptions to be
able to fit a stochastic model to observed data. We develop a trainable
machine learning model to obtain a generative sequence model from
experimental data that meets the requirements for using PWS.

We can factorize the joint probability of a sequence $x_{1:n}$ as


$$\mathrm{P}(x_{1:n} \mid s_{1:n}) = \prod_{i=1}^n \mathrm{P}(x_i \mid x_{1:i-1}, s_{1:n}) \,,
    \label{eq-sequence_factorization}$$ {#eq-sequence_factorization}

i.e., the stochastic dynamics are fully specified by the conditional
stepping probabilities. Note that in a physical system obeying
causality, the output $x_i$ cannot depend on future inputs. Thus, we can
simplify [@eq-sequence_factorization] to


$$\mathrm{P}(x_{1:n} \mid s_{1:n}) = \prod_{i=1}^n \mathrm{P}(x_i \mid x_{1:i-1}, s_{1:i}) \,.
    \label{eq-causal_sequence_factorization}$$ {#eq-causal_sequence_factorization}

A common approach for modeling stochastic sequences is to assume Markov
statistics, meaning each element depends only on its immediate
predecessor, simplifying the conditional to
$\mathrm{P}(x_{i} \mid x_{1:i-1}, s_{1:i}) = \mathrm{P}(x_{i} \mid x_{i-1}, s_i)$.
In the case of a stationary system, the transition probability
$\mathrm{P}(x_{i} \mid x_{i-1}, s_i)$ is the same for all $i$, such that
only one scalar distribution needs to be specified to define the
Markovian process. While this assumption significantly reduces the
complexity of the distribution space, Markov models are severely limited
in that they cannot accurately model sequences with long-range
dependencies or feedback. Yet, these non-Markovian features are often
crucial to describe physical or biological processes.

Hence, we use a more general approach to directly learn
[@eq-causal_sequence_factorization] and parameterize the probability
$\mathrm{P}(x_i \mid x_{1:i-1}, s_{1:i})$ at each time $i$ using neural
networks. These models are called *autoregressive models* and have been
used for modeling the probability distribution of sequential data in a
large variety of contexts
[@2011.Sutskever; @2013.Graves; @2014.Bayer; @2016.Oord]. To efficiently
model a sequence, we need to make two main choices: (a) which parametric
family of distributions to use for modeling each conditional
probability, and (b) which neural network architecture to use for
obtaining the parameters for the chosen family of distributions, at each
time.

#### Gaussian autoregressive model

The choice of the parametric family of distributions depends on the
nature of the data. For example, for scalar continuous data, a Gaussian
distribution might be appropriate, whereas for discrete data, a
categorical distribution is more suitable. More complex data might
require richer distributional families, such as autoregressive flows or
variational approaches, which allow for more flexible modeling of
dependencies between sequence elements. For this chapter, we assume that
the experimental data is scalar and continuous and can be sufficiently
well modeled by Gaussian conditional distributions.

Hence, we consider an autoregressive model where each conditional
distribution $\mathrm{P}(x_i \mid x_{1:i-1}, s_{1:i})$ is Gaussian. For
$i=1,\ldots,n$, the model uses a neural network to predict the mean
$\mu_i(x_{1:i-1}, s_{1:i})$ and standard deviation
$\sigma_i(x_{1:i-1}, s_{1:i})$ of the current sequence element $x_i$,
given the previous elements. Thus, conditional on the input and its
predecessors, the variable $x_i$ is normal distributed, with
$\mathrm{P}(x_i | x_{1:i-1}, s_{1:i}) = \mathcal{N}(\mu_i(x_{1:i-1}, s_{1:i}), \sigma_i(x_{1:i-1}, s_{1:i}))$.
The functions $\mu_i: \mathbb{R}^{i-1}\to \mathbb{R}$ and
$\sigma_i: \mathbb{R}^{i-1}\to \mathbb{R}^+$ are implemented as neural
networks and trained from experimental data.

Importantly, while each conditional distribution is Gaussian, the whole
sequence is not Gaussian due to the nonlinear nature of the neural
network. This means that Gaussian autoregressive models are a
generalization of regular multivariate Gaussian models. In fact, a
Gaussian autoregressive model can learn arbitrarily complex nonlinear
relationships between the individual elements of a sequence, where the
complexity is only limited by the neural network architecture. In
contrast, a Gaussian model can only describe linear correlations between
different sequence elements. Various neural network architectures can be
used to implement the nonlinear functions $\mu_i$ and $\sigma_i$, and
the choice must be made depending on the amount of training data, the
complexity of the input-output mapping, as well as computational
constraints.

#### Network architecture

The network architecture is crucial because it directly determines the
number of neural network parameters (or weights) that need to be
learned. This, in turn, affects both the flexibility of the model and
the computational efficiency of training and inference. A more flexible
architecture, with a larger number of weights, can potentially capture
more complex relationships in the data but comes with the tradeoff of
increased computational cost and the risk of overfitting.

In principle, for modeling a sequence of length $n$, learning an
autoregressive sequence model would require training $n$ separate neural
networks, one for each conditional distribution
$\mathrm{P}(x_i \mid x_{1:i-1}, s_{1:n})$, with $i=1,\ldots,n$. In
practice, shared weights can drastically reduce the number of parameters
to be learned. If the sequence is stationary or has other types of
periodic features, the neural networks corresponding to different time
steps can often share a majority, if not all, of their weights. This
drastically simplifies training and evaluation of the autoregressive
model.

![Two possible network architectures for autoregressive sequence models. In both cases, the next output $x_i$ is sampled from a Gaussian distribution with parameters $(\mu_i, \sigma_i)$ which the neural network computes from the history $s_{0:i}, x_{0:{i-1}}$.](figures/ML_autoregressive_model.svg){#fig-ML_autoregressive_model}

We discuss two neural network architectures (schematically in
[@fig-ML_autoregressive_model]) that are widely used for stochastic
sequence prediction and make use of weight-sharing to reduce
computational costs: recurrent neural networks (RNNs) and autoregressive
convolutional neural networks (CNNs). Other sequence models like
transformer models [@2017.Vaswani; @2018.Devlin] could similarly be used
but are not presented here.

##### Recurrent neural networks

Recurrent Neural Networks (RNNs) process sequential data while
maintaining a hidden state that evolves over time. At each time step, an
RNN takes the current input and the previous hidden state to produce an
output and update the hidden state. This mechanism allows the network to
store relevant information about past inputs in the hidden state,
effectively creating a form of memory. This makes the use of RNNs
attractive for generic autoregressive sequence prediction models.

Given the sequences $s_{1:n}$ and $x_{1:n}$ the RNN takes an initial
state $h_0\in\mathbb{R}^d$ and generates a sequence
$h_{1:n}=(h_1,\ldots,h_n)$ from a recursive relation


$$h_i = f_\theta(s_i, x_{i-1}, h_{i-1})
    \label{eq-recursion}$$ {#eq-recursion}

where $h_i\in\mathbb{R}^d$ for $i\in\{1,\ldots,n\}$ and an activation
function $f_\theta$. The activation function $f_\theta$ could for
instance be parameterized by a simple neural network layer

$$f_\theta(s, x, h) = \tanh(U s + V x + W h + b)$$

with parameters
$\theta = (U\in\mathbb{R}^{d\times 1}, V\in\mathbb{R}^{d\times 1}, W\in\mathbb{R}^{d\times d}, b\in\mathbb{R}^{d})$
and applying $\tanh$ elementwise. Other possible choices for $f_\theta$
include LSTM units [@1997.Hochreiter] or GRU units [@2014.Cho] which
often allow the model to better learn long-term dependencies.

From the RNN we can obtain a stochastic representation of the output
sequence $x_{1:n}$. We extend the recursive relation above by adding a
sampling step to obtain $x_i$ from $h_i$


$$\begin{aligned}
        % h_i &= f_\theta(s_i, x_{i-1}, h_{i-1}) \\
        x_i \mid h_i &\sim \mathcal{N}(\mu(h_i), \sigma(h_i))
\end{aligned}
\label{eq-recursion-2}$$ {#eq-recursion-2}

such that each $x_i$ is a normal-distributed random variable whose mean
$\mu(h_i)$ and standard deviation $\sigma(h_i)$ are computed from the
current hidden state $h_i$. In practice we use the following form for
$\mu$ and $\sigma$

$$\begin{aligned}
    \mu(h) &= W_\mu h + b_\mu \\
    \sigma(h) &= \exp (W_\sigma h + b_\sigma)
\end{aligned}$$

where the weights $W_\mu$ and $W_\sigma$ are $d$-dimensional row vectors
and the exponential function ensures that the standard deviation is
always positive. We denote the combination of all neural network
parameters by
$\mathbfit{\theta} = (\theta, W_\mu, b_mu, W_\sigma, b_\sigma)$.

The recursive
relations `\labelcref{eq-recursion,eq-recursion-2}`{=latex} fully define
the conditional probability distribution
$P(x_{1:n}|s_{1:n},\mathbfit{\theta})$ of the output sequence given the
input sequence. Since $h_i$ depends on $s_i$ and $x_{i-1}$, as well as
$h_{i-1}$, it encodes information about the entire past $s_{1:i}$ and
$x_{1:i-1}$. Therefore, the model can incorporate long-range information
for predicting the next output.

##### Convolutional neural networks

Autoregressive convolutional networks model sequential data using masked
1D-convolutions. The masking ensures that the prediction at each time
step only depends on the current and preceding elements of the sequence,
maintaining causality. Unlike RNNs, which process sequences one time
step at a time, CNNs can efficiently compute representations of the
entire sequence in parallel, leading to substantial improvements in
computational speed. This parallelism is particularly advantageous when
working with long sequences. The architecture we describe here is
inspired by MADE [@2017.Papamakarios], as well as PixelCNN [@2016.Oord].

The autoregressive CNN processes the data by applying a series of masked
convolutional layers. At time step $i$, the CNN predicts the Gaussian
parameters $\mu_i, \sigma_i$ which describe the conditional
$\mathrm{P}(x_i\mid s_{1:i}, x_{1:i-1})$. The mask is applied to each
convolutional layer and restricts connections to only inputs in the
past, or previously predicted outputs, i.e., non-causal connections are
masked out by setting their weights to zero. The output of the first
convolutional layer at time step $i$ depends on the local receptive
field $(s_{i-k+1:i}, x_{i-k:i-1})$ of the input and output sequences,
where $k$ is the kernel size, i.e.,

$$h_i = f_\theta(s_{i-k+1:i}, x_{i-k:i-1})$$

where $f_\theta$ represents the 1D convolutional operation with
learnable parameters $\theta$. The operation $f_\theta$ is composed of a
set of learned convolutional filters and a non-linear activation
function such as ReLU. Unlike for a RNN $h_i$ is not computed via a
recursive relation since $h_i$ does not depend on $h_{i-1}$. Thus, we
need a different mechanism to capture long-range dependencies.

Typically we apply multiple convolutional layers in series. This enables
the model to capture long-range dependencies beyond the kernel size $k$
in the input sequence, as the depth of the network increases the
temporal span of the receptive field. Moreover, stacking convolutional
layers with non-linear activation functions allows the model to learn
more complex representations of the data, potentially improving the
accuracy of the model.

To generate the output sequence $x_{1:n}$, we add a sampling step
similar to the RNN case. Specifically, the output $x_i$ at each time
step is sampled from a distribution parameterized by the corresponding
output from the CNN $h_i$:

$$x_i \mid h_i \sim \mathcal{N}(\mu(h_i), \sigma(h_i))$$

The resulting conditional probability distribution
$\rho_{\symbf\theta}(x_{1:n}|s_{1:n})$ is fully defined by the
convolution weights $\symbf\theta$ and the sampling step.

#### Evaluating and training the network

The autoregressive neural network described above can be viewed as
generative models that approximate the conditional distribution
$\mathrm{P}(x_{1:n}|s_{1:n})$, i.e., we can use them to draw independent
samples from
$\rho_{\symbf\theta}(x_{1:n}|s_{1:n}) \approx\mathrm{P}(x_{1:n}|s_{1:n})$
where $\mathbfit{\theta}$ represents the network weights. Generating
$x_{1:n}$ given $s_{1:n}$ is done sequentially. For $i=1,\ldots,n$, the
sampling procedure alternates between computing the parameters of the
conditional distribution, $\hat{\mu}_i = \mu_i(x_{1:i-1}, s_{1:i})$,
$\hat{\sigma}_i = \sigma_i(x_{1:i-1}, s_{1:i})$, and sampling the next
$x_i \sim \mathcal{N}(\hat{\mu}_i, \hat{\sigma}_i)$.

The conditional probability of the resulting output sequence is given by


$$\begin{aligned}
    \rho_{\symbf\theta}(x_{1:n}|s_{1:n}) &= \prod^n_{i=1} \mathrm{P}(x_i|x_{1:t-1}, s_{1:t}, \mathbfit{\theta})\\
    &= \prod^n_{i=1} \frac{1}{\sqrt{2\pi}\hat{\sigma}_i} \exp\left(-\frac{(x_i-\hat{\mu}_i)^2}{2\hat{\sigma}^2_i}\right)\,.
\end{aligned}
\label{eq-autoregressive_conditional_density}$$ {#eq-autoregressive_conditional_density}

This probability can be evaluated on the fly while generating the
sequence. Moreover, for a given pair of input and output sequences, we
can also use the model to directly evaluate
$\rho_{\symbf\theta}(x_{1:n}|s_{1:n})$ which is required for PWS. Note
that in practice, to numerically accurately compute a product with many
terms it is typically necessary to perform the computation in log space.

Note that while generating a sequence is inherently a sequential
process, the path likelihood $\rho_{\symbf\theta}(x_{1:n}|s_{1:n})$ can
be evaluated in parallel in some neural architectures like the CNN.
Specifically, for a given pair of sequences $(s_{1:n}, x_{1:n})$, the
conditional probability in [@eq-autoregressive_conditional_density] is
parallelizable, since the computations for $\hat\mu_i$ and
$\hat\sigma_i$ for $i=1,\ldots,n$ are independent of each other. This
allows for efficient training on parallel computing hardware.

To train the model, we minimize the negative log likelihood of its
predictions when evaluated on the training data. Specifically, we assume
that the training data consists of $N$ pairs of sequences
$(s^k_{1:n}, x^k_{1:n})$ for $k=1,\ldots,N$. The loss function to be
minimized is then given by the sum of the individual negative log
likelihoods for the trajectory pairs:


$$\mathcal{L}(\mathbfit{\theta}) = -\sum^N_{k=1} \ln \rho_{\symbf\theta}(x_{1:n}|s_{1:n}) \,.
    \label{eq-loss_function}$$ {#eq-loss_function}

This training objective is equivalent to minimizing an empirical
estimate of the Kullback-Leibler (KL) divergence between the
distribution of the training data and the distribution defined by the
model, thus training the model to fit the underlying data distribution
[@2006.Bishop].

There are a few practical considerations for efficiently training the
model. Training is performed in iterations and it is often beneficial to
introduce stochasticity between iterations to speed up gradient descent
and regularize the loss function to prevent overfitting
[@2010.Bottou; @2021.Feng]. For this reason, as typically done for
training neural networks, the loss function in [@eq-loss_function] is
only computed for a subset of the training data, in mini-batches of size
$M$, instead of the whole training set of size $N$. At the beginning of
each iteration, the data subset that is used is randomly selected
(without replacement) from the whole data set.

### Efficient Marginalization Using Variational Inference {#sec-ml_variational}

In the preceding section, we have shown how machine learning techniques
can be leveraged to obtain a Path Weight Sampling (PWS) estimate of the
mutual information rate directly from empirical data. By employing
machine learning algorithms to learn the underlying stochastic model of
the data, we enable accurate computation of the mutual information rate
using the PWS framework.

In this section, we employ machine learning differently, to optimize the
PWS method itself. Specifically, we address the computationally most
demanding task: the evaluation of the marginalization integral. While we
have presented alternative techniques for computing this integral in
[@sec-dpws; @sec-variants], here we leverage recent advances in machine
learning and introduce an efficient marginalization strategy based on
variational inference.

The idea of the variational marginalization procedure is to train a
second neural network, the *inference model*, that parameterizes an
importance sampling distribution over $s_{1:n}$ to enable the efficient
computation of the marginal probability $\mathrm{P}(x_{1:n})$. This
inference model, often referred to as the backward model, operates in
reverse directionality to the actual system, i.e., it generates an input
given an output. This is in contrast to the previous section, which
focused on generative models for the output $x_{1:n}$ given the input
sequence, governed by $\mathrm{P}(x_{1:n}|s_{1:n})$. Roughly, the
inference network takes an output trajectory $x_{1:n}$ and generates
input trajectories $s_{1:n}$ that could have likely produced the
corresponding output. When this network is used as an importance
sampler, we can significantly accelerate the computation of the marginal
probability and thus the mutual information. We denote the inference
model's generative distribution as $q(s_{1:n}|x_{1:n})$.

To compute the marginal probability with help of the inference model, we
write $\mathrm{P}(x_{1:n})$ as the expectation with respect to a
probability density $q(s_{1:n}|x_{1:n})$, i.e.,


$$\begin{aligned}
    \mathrm{P}(x_{1:n}) 
    &= \int \mathrm{P}(x_{1:n}|s_{1:n})\mathrm{P}(s_{1:n})\,ds_{1:n}\\
    &=\mathbb{E}_{\mathrm{P}(s_{1:n})} \left[\mathrm{P}(x_{1:n}|s_{1:n})\right]\\
    &= \mathbb{E}_{\mathrm{P}(s_{1:n})} \left[ \frac{\mathrm{P}(x_{1:n}|s_{1:n})}{q(s_{1:n}|x_{1:n})} 
 q(s_{1:n}|x_{1:n})\right]\\
    &= \mathbb{E}_{q(s_{1:n}|x_{1:n})} \left[ \frac{\mathrm{P}(s_{1:n})\mathrm{P}(x_{1:n}|s_{1:n})}{q(s_{1:n}|x_{1:n})} \right] 
\end{aligned}
    \label{eq-ml_importance_sampling}$$ {#eq-ml_importance_sampling}

where $q(s_{1:n}|x_{1:n})$ can be chosen arbitrarily in principle.
[@eq-ml_importance_sampling] is estimated using Monte Carlo sampling, by
using the inference network to generate a set of trajectories
$\{s^1_{1:n},\ldots,s^M_{1:n}\}$ from $q(s_{1:n}|x_{1:n})$ and computing
the respective importance weights $w_1,\ldots,w_M$ according to
$w_k = w(s^k_{1:n}, x_{1:n})$ where

$$w(s_{1:n}, x_{1:n}) = \frac{\mathrm{P}(s_{1:n})\mathrm{P}(x_{1:n}|s_{1:n})}{q(s_{1:n}|x_{1:n})} \,.$$

The marginal probability is then estimated by


$$\mathrm{P}(x_{1:n}) \approx \frac{1}{M} \sum^M_{k=1} w_k \,.
    \label{eq-ml_importance_sample_mc}$$ {#eq-ml_importance_sample_mc}

In this process, $q(s_{1:n}|x_{1:n})$ serves as the importance sampling
distribution. Regardless of the choice of $q(s_{1:n}|x_{1:n})$, this
estimate always converges to $\mathrm{P}(x_{1:n})$ in the limit
$M\to\infty$. However, crucially, for finite $M$ the choice of
$q(s_{1:n}|x_{1:n})$ determines the variance and thus efficiency of the
estimate.

If, as done in Direct PWS ([@sec-dpws]), we choose the "prior"
probability $\mathrm{P}(s_{1:n})$ as the importance sampling
distribution, the resulting estimate is typically highly inefficient.
This is because with that choice the importance weights are usually very
unevenly distributed, with heavy tails which significantly increases the
variance of the estimator, see also [@sec-variants]. It is well-known
that the prior is generally a poor importance sampling distribution
since it often allocates significant probability mass to regions of the
configuration space that contribute little to the likelihood
[@1976.Bennett; @1989.Geweke]. The hypothetical optimal choice for the
importance sampling distribution $q(s_{1:n}|x_{1:n})$ is the true
"posterior" distribution $\mathrm{P}(s_{1:n} | x_{1:n})$, as this makes
the importance weights constant, resulting in a theoretically zero
variance estimator. However, since the true posterior is typically
intractable, we instead aim to approximate the posterior by a tractable
distribution, to reduce the variance as much as possible.

The idea of variational inference is to train the inference model using
a loss function that minimizes the Kullback-Leibler (KL-)divergence
between the variational distribution $q(s_{1:n}|x_{1:n})$ and
$\mathrm{P}(s_{1:n} | x_{1:n})$. Since the KL-divergence is always
non-negative, and is only exactly zero if
$q(s_{1:n}|x_{1:n})=\mathrm{P}(s_{1:n} | x_{1:n})$, this criterion
optimizes the importance sampling distribution. The idea of using an
inference network to approximate the posterior was popularized with the
introduction of the variational autoencoder (VAE) by @2013.Kingma, a
powerful technique for approximating complex distributions. The training
objective used in variational inference is the Evidence Lower Bound
Objective (ELBO) which provides a lower bound on the "evidence"
$\mathrm{P}(x_{1:n})$. Maximizing this bound brings the variational
approximation closer to the true posterior. The ELBO can be derived by
applying Jensen's inequality to the last line of
[@eq-ml_importance_sampling]:


$$\ln \mathrm{P}(x_{1:n}) \geq 
\mathbb{E}_{q(s_{1:n}|x_{1:n})}  \left[ 
\ln\frac{\mathrm{P}(s_{1:n})\mathrm{P}(x_{1:n}|s_{1:n})}{q(s_{1:n}|x_{1:n})} \right] = \mathcal{L}_\text{ELBO}
\label{eq-ml_elbo}$$ {#eq-ml_elbo}

It is easy to show that maximizing the ELBO is equivalent to minimizing
the KL-divergence between the variational distribution and the true
posterior. Although the estimate in [@eq-ml_importance_sample_mc] is
always unbiased, i.e., it converges to the marginal probability
$\mathrm{P}(x_{1:n})$ as $M\to\infty$ regardless of the choice of
$q(s_{1:n}|x_{1:n})$, in practice, convergence will be slow unless the
inference network accurately approximates the posterior. Thus,
optimizing the inference network by maximizing the ELBO is crucial for
efficient marginalization.

To closely approximate the posterior, the inference network needs enough
flexibility to capture the key features of the true posterior. Efficient
marginalization in trajectory space, in particular, requires an
inference network capable of modeling high-dimensional distributions
with complex dependencies between variables. Specifically, for
efficiently marginalizing in trajectory space, we require an inference
network that can model high-dimensional distributions with complex
dependencies between variables. However, selecting an appropriate
inference network can be challenging: if the network lacks sufficient
flexibility, it may oversimplify the posterior, which may be hard to
diagnose. Various approaches for designing flexible inference networks
have been studied previously and could be applied here
[@2015.Rezende; @2016.Dinh; @2016.Kingma; @2018.VanDenBerg; @2018.Kingma; @2019.Kobyzev; @2021.Papamakarios].

In our example, we use an inference model for marginalization that
closely resembles the generative model discussed in the previous section
and uses an autoregressive sequence model for $q(s_{1:n}|x_{1:n})$. The
inference network consists of a RNN-based encoder-decoder architecture
[@2014.Sutskever] which helps in approximating the posterior
$\mathrm{P}(s_{1:n}|x_{1:n})$ by effectively using the information in
$x_{1:n}$ to guide the generation of $s_{1:n}$.

The encoder, a RNN, first processes the sequence $x_{1:n}$ in reverse to
create a latent representation $h_{1:n}$, which provides contextual
information to the decoder. This latent sequence is used by the decoder
to generate a new sequence
$\tilde{s}_{1:n} \sim q(\tilde{s}_{1:n}|x_{1:n})$ that is compatible
with $x_{1:n}$. Because the encoder processes $x_{1:n}$ in reverse, the
latent sequence $h_{1:n}$ enables the decoder to incorporate information
about all future values $x_j$ for $j\geq i$ into each $\tilde{s}_i$.
Importantly, by including future information from $x_{i:n}$ to sample
$\tilde{s}_i$, we can effectively capture the dependence structure of
the true posterior $\mathrm{P}(\tilde{s}_{1:n}|x_{1:n})$ into our
variational approximation. Thus, using an encoder is a key ingredient
for accurately approximating the posterior.

The decoder then autoregressively generates the sequence
$\tilde{s}_{1:n} \sim q(\tilde{s}_{1:n}|x_{1:n})$, using the context
sequence $h_{1:n}$ provided by the encoder. Thus, each $\tilde{s}_i$ is
generated conditioned on both $h_i$ and the previously generated
$\tilde{s}_{i-1}$. As in the forward model, $\tilde{s}_i$ is generated
probabilistically; however, rather than a Gaussian distribution, the
decoder uses a mixture of logistic distributions, inspired by the Flow++
architecture [@2019.Ho]. This encoder-decoder setup provides a flexible,
expressive model capable of accurately approximating the posterior
distribution.

Given that all parameters in our model are continuous, we optimize the
weights of the inference network using stochastic gradient variational
Bayes (SGVB) [@2013.Kingma], a widely used method for training
variational models. SGVB leverages the reparameterization trick to
estimate the gradient of the ELBO, which makes the training procedure
efficient.

## Application to a Minimal Nonlinear Model {#sec-ml_application}

We evaluate our approach using synthetic training data to train a
generative model and then using PWS to compute the mutual information
rate.

### Nonlinear Model

To generate training data for the neural network, we combine a linear
auto-regressive input, with a stochastic nonlinear output model.
Specifically, we considered an input that evolves according to AR(1)
statistics:

$$S_t = \phi S_{t-1} + \xi_t$$

where $\xi_t$ are iid random variables from a unit Gaussian
distribution, and $\phi\in[0, 1)$ is a parameter. In steady state, the
autocovariance of this process is given by

$$\langle S_{\tau} S_{\tau + t} \rangle = \frac{\phi^{|t|}}{1 - \phi^2} \,.$$

The output $X_t$ is governed by the equation


$$X_t = \sigma(\gamma S_t) + \rho X_{t-1} + \vartheta \eta_t \label{eq-nonlinear_model}$$ {#eq-nonlinear_model}

where $\eta_t$ are iid Gaussian random numbers, $\gamma$, $\rho$ and
$\vartheta$ are positive real parameters, and

$$\sigma(x) = \frac{1}{1+e^{-x}}$$

is the logistic function. The gain $\gamma$ effectively controls the
strength of the nonlinearity; see [@fig-input_output]. This process
models a response that saturates as the input grows. In fact,
$\sigma(x)$ is equivalent to the Hill function commonly used in
biochemistry to describe saturating enzyme kinetics
[@2005.Edelstein-Keshet].

![Example time series from the training set. The training set was generated using parameters $\phi=\num{0.5}, \rho=\num{0.2}$, and $\vartheta=\num{0.2}$. In the upper left panel one stochastic realization of the input process is shown. The other panels show the mean output as well as 10/90-th percentiles for the output at different values of the input gain $\gamma$. The effect of the gain on the output can be clearly seen. For the highest gain $\gamma = \num{10.0}$, we observe saturation of the output.](figures/input_output.svg){#fig-input_output}

### Training the Neural Networks

We trained our machine learning model with synthetic data generated
according to [@eq-nonlinear_model] for various values of the gain,
denoted by $\gamma$. For each value of $\gamma$, we created a distinct
training set of 1000 pairs of time series $(s_{1:50}, x_{1:50})$ and
trained one autoregressive model per training set. Once the models were
trained, we estimated the mutual information for each of them using PWS,
employing variational inference to perform the marginalization.

For the generative model, we use a recurrent neural network (RNN). Using
Gated Recurrent Unit (GRU) cells [@2014.Cho] with a hidden size of 64
for temporal processing, along with a dense layer that outputs two
values, representing the mean $\mu$ and log-variance $\ln\sigma^2$ of a
Gaussian distribution. For each time step $i$, the model receives input
signals $s_i$ and $x_{i-1}$ and predicts the next output value $x_i$ by
sampling from this Gaussian. The model is trained by iteratively
optimizing over 100 epochs over the entire training set. The training
set is split into mini-batches of size 64 which are shuffled after each
epoch. We optimize the model using the Adam optimizer [@2014.Kingma]
($b_1 = \num{0.9}, b_2 = \num{0.999}$) with weight decay regularization
[@2017.Loshchilov] of 1 × 10^−4^ and using a cosine decay learning rate
schedule [@2016.Loshchilov] that smoothly decreases the learning rate
from 1 × 10^−2^ to 1 × 10^−3^ throughout the training process.

The inference model used for marginalization is also modeled as a RNN.
This model consists of an encoder-decoder architecture for approximating
the posterior $\mathrm{P}(s_{1:n}|x_{1:n})$. The encoder first processes
the input sequence $x_{1:n}$ in reverse using a GRU cell with 64 hidden
units to create a latent sequence $h_{1:n}$. The decoder then uses
another RNN with a hidden size of 64 (using a GRU cell), to
autoregressively generate a sequence $\tilde{s}_{1:n}$ using the context
sequence $h_{1:n}$. The sequence $\tilde{s}_{1:n}$ is generated
probabilistically by sampling from a mixture of logistic distributions
with five components. The inference network is trained for 100 epochs
with mini-batches of size 64. For each $x_{1:n}$ in the training set, 16
Monte Carlo draws from the inference network
$\tilde{s}_{1:n}\sim q(\tilde{s}_{1:n}|x_{1:n})$ are used to estimate
the ELBO loss in [@eq-ml_elbo]. The loss function gradient is estimated
using SGVB [@2013.Kingma]. The model is optimized using the ADAM
optimizer with weight decay regularization (same parameters as above).
We use an initial learning rate of 5 × 10^−3^ that decays exponentially
by a factor of 0.5 as training progresses.

To compute the marginal probability $\mathrm{P}(x_{1:n})$ from our
models, we use the inference network to generate $2^{14} = \num{16384}$
samples $\tilde{s}_{1:n}$ for each sequence $x_{1:n}$. From these
samples $\tilde{s}_{1:n}$, the marginal probability is estimated using
[@eq-ml_importance_sample_mc]. We monitor the convergence of the
variational marginalization procedure by computing the effective sample
size from the importance weights [@2017.Martino]. In our case, the
effective sample size always remained above 85% of the actual sample
size, indicating that the inference network approximates the posterior
well.

![Mutual information estimates for the nonlinear 1D time-series model across a range of input gain values (see <span class="citation" data-cites="eq-nonlinear_model"></span>). The green dots represent the ML-PWS estimates (using an autoregressive RNN model for learning the stochastic dynamics), while the solid green line indicates the ground truth mutual information calculated by applying PWS directly to the nonlinear model. For comparison, the Gaussian approximation has been obtained in two diferent ways: the dotted orange line (labeled <em>Gaussian I</em>) represents Gaussian information estimates obtained from the same dataset ($N=\num{1000}$) that was used to train the machine learning model, showing finite sample size effects. The dashed orange line (labeled <em>Gaussian II</em>) represents a “reduced-bias” Gaussian approximation using an extended dataset ($N=\num{100000}$). For low gain ($\gamma \lesssim 10$), both Gaussian approximations align closely with the ground truth and ML-PWS. At high gain, however, the Gaussian approximation fails to capture nonlinear effects, and only provides a lower bound on the mutual information. Yet, ML-PWS does not suffer from this problem and correctly estimates the mutual information for the whole range of $\gamma$.](figures/MI_gain.svg){#fig-mi_gain}

### Comparison Against the True Mutual Information

The green dots in [@fig-mi_gain] display the ML-PWS estimate of the
mutual information $I(S_{1:50}, X_{1:50})$ as a function of the gain
$\gamma$, see [@eq-nonlinear_model]. As expected, for small $\gamma$,
the mutual information grows with $\gamma$ as the gain enhances the
signal-to-noise ratio. For larger values of $\gamma$, we observe a
saturation and even a decline in the information rate due to the
saturation effect of the logistic function. This behavior is indicative
of the nonlinearity of the system.

Next, we compared the mutual information estimates against various
benchmarks. First, we compute the true mutual information of the
nonlinear system using PWS directly with the model given in
[@eq-nonlinear_model]. Since this model represents the true underlying
dynamics of the training data, we consider this result as the "ground
truth" mutual information.

[@fig-mi_gain] (solid green line) shows the ground truth mutual
information. We can see that the machine learning approach matches the
ground truth very well across all values of $\gamma$. This demonstrates
that the autoregressive neural network can accurately learn the
stochastic dynamics of the nonlinear model and reliably estimate the
path likelihood, which is required for the Monte Carlo estimate of
mutual information. These results confirm that combining PWS with
machine learning is a feasible and promising approach for computing the
mutual information rate in complex nonlinear systems.

### Comparison Against the Gaussian Approximation

Second, we use the Gaussian approximation as a benchmark, which is
widely used for directly estimating mutual information rates from
time-series data. We obtain the Gaussian estimate by computing the
$2n\times 2n$ covariance matrix

$$\Sigma = \left(
    \begin{array}{cc}
        \Sigma_{ss} & \Sigma_{sx} \\
        \Sigma_{xs} & \Sigma_{xx}
    \end{array}
    \right)$$

from our dataset of trajectories $s_{1:n}, x_{1:n}$. The individual
blocks of $\Sigma$ are $n\times n$ matrices defined by
$\Sigma^{ij}_{\alpha\beta} = \langle \alpha_i \beta_j \rangle$. The
Gaussian approximation for the mutual information (in nats) is given by

$$I(S_{1:n}, X_{1:n}) = \frac{1}{2} \ln \frac{|\Sigma_{ss}| |\Sigma_{xx}|}{|\Sigma|}\,.$$

See [@sec-notes-gaussian] for more details.

To make a fair comparison of our machine learning method with the
Gaussian approximation, we use the same dataset for obtaining the
Gaussian approximation that was used for training the ML model. We refer
to this benchmark as "Gaussian I" and it corresponds to the dotted
orange line in [@fig-mi_gain]. The Gaussian approximation suffers from
two sources of systematic bias: a finite sample size bias due to
imperfect correlation function estimates from 1000 trajectory pairs, and
a bias arising from the assumption of linearity which does not hold at
large $\gamma$. Our aim was to distinguish these two sources of bias.

We created another benchmark, called "Gaussian II" (dashed orange line
in [@fig-mi_gain]) to be able to quantify the bias introduced by the
small sample size of the "Gaussian I" benchmark. Gaussian II is similar
to Gaussian I but is obtained from a significantly larger dataset of
100000 trajectory pairs $(s_{1:50}, x_{1:50})$, generated from the
nonlinear model. This larger dataset allows for very precise estimates
of the (cross-)covariance matrices required for the Gaussian
approximation, effectively eliminating the sample size bias. However, it
should be noted that this benchmark is "unfair" since it uses a much
larger dataset than the one that was used to train the autoregressive ML
model.

In [@fig-mi_gain] we compare the results obtained using PWS against the
two variants of the Gaussian approximation, and we observe that for
$\gamma \lesssim 10$ the Gaussian approximations (the regular one,
Gaussian I, and the one with reduced bias, Gaussian II) closely match
the ground truth while significantly deviations appear at larger gain.
Indeed, in the low-gain regime, the nonlinearity of the system does not
significantly impact the output, the Gaussian approximation provides a
reliable estimate of the information. In the high-gain regime, the
Gaussian approximation fails to correctly capture the nonlinear dynamics
of the system, and only yields a lower bound for the mutual information,
as expected from information theory [@mitra2001nonlinear].

[@fig-mi_gain] also clearly displays the effect of finite sample size on
the accuracy of the Gaussian approximation. Specifically, the Gaussian
approximation obtained from the smaller training dataset (Gaussian I,
displayed as dotted orange line in [@fig-mi_gain]) consistently
overestimates the mutual information as computed with the Gaussian
approximation from the larger dataset (Gaussian II, dashed orange line
in [@fig-mi_gain]). This means that at low gain, even though the system
is approximately linear, the Gaussian approximation obtained from the
training set slightly overestimates the true mutual information. This
over-estimation is purely an artifact of finite sample size bias, and is
not present in the "reduced-bias" Gaussian approximation. Strikingly
thus, our new method based on machine learning yields a better estimate
for the mutual information using the training set, even at low gain,
where the Gaussian approximation is expected to hold.

## Discussion {#sec-ml_discussion}

By combining neural networks with PWS, we introduced ML-PWS, a new
scheme to estimate the mutual information between input and output
trajectories of a system. PWS is a Monte Carlo method for calculating
mutual information between trajectories, relying on a stochastic model
that defines the probability distribution of trajectories to determine
the path action. We demonstrated how autoregressive sequence prediction
models can be trained on time-series data to learn this stochastic
model, making it possible to use PWS with such models to compute mutual
information. By applying ML-PWS to a nonlinear model of information
processing, we showed that it provides more accurate mutual information
estimates than the Gaussian approximation. While this example serves as
a proof of concept, it shows the potential of advanced machine learning
techniques to automatically derive stochastic models from experimental
data, and to make it possible to compute information-theoretic measures
for complex, high-dimensional data.

Using the mutual information rate as a measure for time series
correlation possesses a distinct advantage compared to other, simpler,
measures: it remains invariant under deterministic and lossless
transformations of the sequences [@2006.Cover]. Not only is this
property desirable on philosophical grounds, but it can also simplify
the training of machine learning models. Specifically, in some cases, it
could be beneficial to preprocess the time series data by transforming
it into a different representation (e.g. a symbolic encoding) that is
more conducive to machine learning analysis [@2003.Lin]. Such a
transformation could be applied before employing ML-PWS to compute the
mutual information rate. Additionally, this concept could be used for
model reduction, making it possible to answer the question of whether a
time series with a simplified representation still maintains the same
mutual information rate.

As our results in [@fig-mi_gain] demonstrate, ML-PWS with Gaussian
autoregressive models is significantly more general than the Gaussian
framework [@2009.Tostevin]. The range of stochastic processes
representable by neural autoregressive models is much larger than the
range of processes which can be described by a Gaussian model. Even
though in the autoregressive model the distribution of each $x_i$
conditional on $x_{1:i-1}$ and $s_{1:i}$ is Gaussian, the distribution
of the whole sequence $\mathrm{P}(x_{1:n}|s_{1:n})$ is generally not
Gaussian due to the nonlinearity of the neural network. In fact, a
Gaussian autoregressive model can be seen as a (time-discretized)
representation of a nonlinear stochastic differential equation of the
form

$$dx_t = f(s_{1:t}, x_{1:t-1})\,dt + g(s_{1:t}, x_{1:t-1})\,dW_t$$

where $f(s_{1:t}, x_{1:t-1})$ and $g(s_{1:t}, x_{1:t-1})$ are the
potentially nonlinear drift and diffusion terms that are learned by the
neural network. This representation is a generalization of the Gaussian
framework, which assumes $f$ and $g$ to be linear operators.

Nonetheless, assuming that each $x_i$ is normally distributed given its
and the signal's history, does restrict the expressive power of the
model. For instance, such a model can never represent multimodal
predictive distributions or discrete state spaces. In these cases, other
predictive distributions must be chosen.

ML-PWS shares some characteristics with the Difference-of-Entropies
(DoE) estimator for the mutual information proposed by @2018.McAllester.
Let $\mathbfit{S}$ and $\mathbfit{X}$ be (high-dimensional) random
variables and
$I(\mathbfit{S},\mathbfit{X})=H(\mathbfit{X}) - H(\mathbfit{X}|\mathbfit{S})$
the desired mutual information computed as a difference of entropies. In
both ML-PWS and the DoE method, the generative model for the conditional
probability $\mathrm{P}(\mathbfit{x}|\mathbfit{s})$ is trained by
maximizing the likelihood, an objective that, as shown in
Ref. [@2018.McAllester], results in an upper bound of the conditional
entropy $H(\mathbfit{X}|\mathbfit{S})$. However, unlike ML-PWS,
@2018.McAllester use a second generative model that represents the
marginal probability $\mathrm{P}(\mathbfit{x})$, yielding an upper bound
of the marginal entropy $H(\mathbfit{X})$. PWS instead computes the
marginal probability $\mathrm{P}(\mathbfit{x})$ by marginalizing the
joint probability
$\mathrm{P}(\mathbfit{s},\mathbfit{x})=\mathrm{P}(\mathbfit{s})\mathrm{P}(\mathbfit{x}|\mathbfit{s})$.
In this way, $\mathrm{P}(\mathbfit{x})$ can in principle be computed for
any desired accuracy. This direct marginalization in ML-PWS also enables
efficient computation of the mutual information
$I(\mathbfit{S}^\prime, \mathbfit{X}^\prime)$ between a input signal
$\mathbfit{S}^\prime$ with different statistics and the corresponding
output $\mathbfit{X}^\prime$, without needing to re-train the marginal
model. This is particularly useful if one is interested in the channel
capacity, as determined by the input distribution that maximizes the
mutual information or information rate for the system of interest.
Indeed, in systems without feedback,
$\mathrm{P}(\mathbfit{x}|\mathbfit{s})$ is a property of the system and
does not change upon changing the input. The generative model then
remains the same, such that ML-PWS can directly recompute the mutual
information for different input statistics. Determining which of these
approaches is preferable for estimating mutual information remains an
open question for future research.

Alongside ML-PWS, we introduced a new marginalization scheme for PWS,
leveraging techniques from variational inference. In PWS,
marginalization is used to compute the marginal probability of a
trajectory, $\mathrm{P}(x_{1:n})$. Our approach trains an inference
network to generate input trajectories $s_{1:n}$ approximately
distributed according to the posterior distribution
$\mathrm{P}(s_{1:n}|x_{1:n})$, enabling efficient calculation of
$\mathrm{P}(x_{1:n})$ through importance sampling. Importantly, this
marginalization technique is general and can be applied to any
generative model, regardless of whether it is based on neural networks.
This flexibility makes it a powerful marginalization scheme for any
application of PWS to a system with continuous state space. Furthermore,
since marginalization is mathematically equivalent to a free-energy
computation (see [@sec-variants]), our approach demonstrates that
variational techniques can yield efficient methods for free-energy
estimation.

In conclusion, ML-PWS---our integration of neural networks and
variational inference into the PWS framework---represents a promising
advance for estimating the mutual information of high-dimensional data,
a notoriously difficult problem. While our initial tests on a toy
example demonstrate the technique's potential, further evaluation on
more complex systems is needed. Additionally, comparing ML-PWS with
other neural methods for mutual information estimation will help clarify
its advantages and limitations. By enabling the accurate computation of
the mutual information rate, we anticipate that ML-PWS could contribute
to a deeper understanding of complex dynamical systems, with potential
applications spanning neuroscience, biology, physics, and machine
learning.

\cleardoubleevenemptypage

[^1]: This chapter is co-authored by Manuel Reinhardt, Gašper Tkačik
    (IST Austria), and Pieter Rein ten Wolde.

[^2]: See also [@sec-lna_vs_pws], where we extensively discuss the
    limitations of the Gaussian approximation for nonlinear systems.
