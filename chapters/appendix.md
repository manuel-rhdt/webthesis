---
bibliography: references.bib
csl: american-physics-society.csl
license: CC-BY-4.0
link-citations: true
reference-section-title: References
title: "Appendix: Notes on Gaussian Approximation"
---

Mathematically, computing the mutual information between trajectories in
the Gaussian framework is relatively simple. From Shannon's formula for
the entropy of a multivariate Gaussian distribution it follows that the
MI is given by

::: {#eq-mi}
$$I(S, X) = \frac{1}{2} \ln \left(
    \frac{|\Sigma_{ss}|\,|\Sigma_{xx}|}{|Z|}
    \right)\quad \mathrm{[nats]}\,.$$
:::

See @2009.Tostevin [@2010.Tostevin] for details. This is a
straightforward formula involving the logarithm of determinants of
symmetric matrices.

However, computationally evaluating this formula correctly and
efficiently requires some thought. The matrices $\Sigma_{ss}$ and
$\Sigma_{xx}$ have dimensions $N\times N$, and the matrix $Z$ has
dimensions $2N \times 2N$ where $N$ is the trajectory length. Thus, for
long trajectories, the involved matrices can become very large.
Computing the determinant of a large matrix is computationally
non-trivial and possibly numerically unstable. Note that the generic
algorithm to compute the determinant of a matrix of dimensions
$N \times N$ scales with order $N^3$. Thus, doubling the size of the
matrix makes the computation of the determinant take approximately 8
times as long. Moreover, the determinant of a large matrix may be very
close to zero or very close to infinity. Representing such numbers in
the computer using floating point representations can lead to
significant numerical accuracy issues. In practice this further limits
the maximal size of covariance matrices that one can use.

Fortunately, we can leverage the special structure of the Gaussian
covariance matrices to simplify the computation of determinants
significantly. Generally, all involved matrices are symmetric and
positive definite. Using a clever trick we can speed up the computation
of the determinant of a symmetric matrix. But even then, we still have a
scaling of $n^3$ with matrix size. Using one additional assumption we
can do much better. If the system under consideration is in steady
state, the matrices have Toeplitz structure. We will see that this
structure allows us to construct a $n \log n$ scaling algorithm that
approximates the determinant very well for large $n$. Lastly, to deal
with numerical accuracy issues, we will discuss how to compute the
log-determinant of a matrix directly. This will be dramatically more
accurate than first computing the determinant and then taking the
logarithm.

## Structure of Covariance Matrices in the Gaussian Framework

We consider a Gaussian system with stochastic input $\mathbfit{s}$ and
output $\mathbfit{x}$. Both, input and output, are vectors representing
trajectories $s(t)$ and $x(t)$ sampled at discrete times
$t_0,\ldots,t_{d-1}$. Hence, $d \in \mathbb{N}$ is the dimensionality of
the vector space of $\mathbfit{s}$ and $\mathbfit{x}$. The joint
probability density of $\mathbfit{s}$ and $\mathbfit{x}$ is given by

$$\mathrm{P}(\mathbfit{s}, \mathbfit{x}) = \frac{1}{(2\pi |Z|)^{d}} \exp\left[
    -\frac{1}{2}
    \left(
    \begin{array}{cc}
        \mathbfit{s} & \mathbfit{x} 
    \end{array}
    \right)
    Z^{-1}
    \left(
    \begin{array}{c}
        \mathbfit{s} \\
        \mathbfit{x}
    \end{array}
    \right)
    \right]$$

which is the PDF of a $2d$-dimensional multivariate Gaussian
distribution. $Z$ is a $2d \times 2d$ matrix with block form

$$Z = \left(
    \begin{array}{cc}
        \Sigma_{ss} & \Sigma_{sx} \\
        \Sigma_{xs} & \Sigma_{xx}
    \end{array}
    \right)\,.$$

The individual block entries of $Z$ correspond to the (cross-)covariance
matrices of input and output. Specifically, $\Sigma_{\alpha\beta}$ is a
$d\times d$ matrix with entries

$$\Sigma^{ij}_{\alpha\beta} = \langle \alpha(t_i) \beta(t_j) \rangle \,.$$

We can make a few observations concerning the form of these matrices. It
follows immediately from the definition that both $\Sigma_{ss}$ and
$\Sigma_{xx}$ are positive definite, symmetric matrices. $\Sigma_{sx}$
and $\Sigma_{xs}$ are generally not symmetric, but they are transposes
of each other, i.e., $\Sigma^T_{sx} = \Sigma_{xs}$. It follows from
these two observations that $Z$ itself is symmetric. Furthermore, we
usually deal with systems in steady state, in which case the matrices
have even more structure. When a system is in steady state, the
correlation functions are (time-)translation invariant. That means that
the correlation of observations at $t_i$ and $t_j$ only depends on the
difference $t_j-t_i$, i.e., we can find functions $C_{\alpha\beta}(t)$
such that
$C_{\alpha\beta}(t_j-t_i) = \langle \alpha(t_i) \beta(t_j) \rangle$. It
follows that the matrix element $\Sigma^{ij}_{\alpha\beta}$ only depends
on the difference $j-i$. We can thus write the matrix elements as
$\Sigma^{ij}_{\alpha\beta} = c^{j-i}_{\alpha\beta}$ where
$c^{i}_{\alpha\beta} = C_{\alpha\beta}(t_i-t_0)$ are the components of a
vector $\mathbfit{c}$ that fully specifies the matrix. A matrix with
this structure is called *Toeplitz* matrix. We can use this structure to
simplify the computation of determinants significantly, as described
below. But before we explain how to compute determinants efficiently, we
discuss one further issue regarding the matrix $Z$ itself.

Note that unlike the matrices $\Sigma_{\alpha\beta}$, $Z$ itself does
not have Toeplitz structure in general. This means the method described
below is not directly applicable for the computation of $|Z|$. Yet, it
seems we need to find $|Z|$ for computing the MI using
@eq-mi. It
turns out that this is not necessary. One can make use of the fact that
$Z$ is composed of Toeplitz blocks to avoid computing its determinant.
At the end of the following section we show how to adapt the formula
described in Ref. [@2006.Kamiyabu] for computing the mutual information
rate to derive an efficient approximation of it in terms of the discrete
Fourier transform.

## Efficient Evaluation of Determinants

For a symmetric positive definite matrix
$\Sigma\in\mathbb{R}^{d\times d}$ the determinant can be computed faster
than for a general matrix. We exploit the fact that such a matrix can
always be decomposed as

$$\Sigma = L L^T$$

where $L\in\mathbb{R}^{d\times d}$ is a lower triangular matrix with
positive diagonal entries. This factorization is called *Cholesky
decomposition* and there are efficient algorithms for computing the
Cholesky decomposition in many numerical linear algebra packages.

Now we make use of two basic properties of the determinant. First, the
determinant of a product of matrices is equal to the product of the
individual matrices' determinants. Second, the determinant of the
transpose is equal to the determinant of the original matrix. Combining
these two facts, we see that $|\Sigma|=|L| |L^T| = |L|^2$. Now, we
remember that $L$ is a lower triangular matrix. It is easily checked
that the determinant of a lower triangular matrix is given by the
product of its diagonal entries $\ell_0,\ldots,\ell_{d-1}$ where
$\ell_k = L^{kk}$. Thus, we find two important identities for symmetric
positive definite matrices:

$$\begin{aligned}
    |\Sigma| &= \prod^{d-1}_{i=0} \ell^2_i\,, \\
    \ln |\Sigma| &= 2 \sum^{d-1}_{i=0} \ln\ell_i\,.
\end{aligned}$$

The second form is especially useful for large matrices. There,
computing the log-determinant is numerically preferable to computing the
determinant itself.

We can also exploit the structure of symmetric Toeplitz matrices to
further simplify the computation of the determinant. However, here we
won't obtain an exact result but only an asymptotic approximation. This
will nonetheless be very useful for large matrices where even the
Cholesky factorization can be difficult to obtain.

We will investigate the asymptotic behavior of eigenvalues of Toeplitz
matrices. First, we recall the defining property of Toeplitz matrices.
Let $T\in\mathbb{R}^{d\times d}$ be a Toeplitz matrix. Then we can write
$T^{ij} = t^{|j-i|}$ where $\mathbfit{t}\in\mathbb{R}^d$ is a vector
that fully specifies the matrix. We will now try to understand what
happens in the asymptotic limit that the vector $\mathbfit{t}$ is very
high dimensional. Thus, suppose we have an infinite sequence of real
numbers $(t_k \mid k=\ldots,-2,-1,0,1,2,\ldots)$. From this sequence we
can construct a sequence of Toeplitz matrices
$T_n\in\mathbb{R}^{n\times n}$ for $n=1,2,\ldots$ as follows. For any
$n\in\mathbb{N}$, we define the matrix elements of $T_n$ as

$$T^{ij}_n = t_{i-j}\quad\text{for } i,j=0,1,\ldots,n-1 \,.$$

The definition of $T_n$ will thus only need $2n-1$ elements
$t_{-(n-1)},\ldots,t_0,\ldots,t_{n-1}$ from the sequence. Note that for
a symmetric Toeplitz sequence $t_k = t_{-k}$.

Under some light conditions there exists a continuous $2\pi$-periodic
function $f(\lambda)$ that is defined through the discrete-time Fourier
transform

::: {#eq:fourier-series}
$$f(\omega) = \sum^\infty_{k=-\infty} t_k e^{-i\omega k} \,.
    \label{eq:fourier-series}$$
:::

Conversely, the $t_k$ can be recovered from $f$ using inverse transform

$$t_k = \frac{1}{2\pi} \int^{2\pi}_0 d\omega\ f(\omega) e^{i\omega k} \,.$$

Thus the sequence $(t_k)$ determines the function $f$ and vice versa.
Moreover, this means that the entire sequence of Toeplitz matrices is
completely specified by the continuous function $f$.

Now we are ready to state one of the most important theorems about
Toeplitz matrices: *Szegő's theorem*. Let $\tau_{n,1},\ldots,\tau_{n,n}$
be the eigenvalues of the matrix $T_n$. Szegő's theorem states that

$$\lim_{n\to\infty} \frac{1}{n}\sum^{n-1}_{i=1} F(\tau_{n,i}) = \frac{1}{2\pi} \int^{2\pi}_0 d\omega\ F(f(\omega))$$

for any continuous function $F$. This result is very useful to find the
asymptotic determinant. In particular, note that the determinant is the
product of eigenvalues, and hence
$\ln |T_n| = \sum^{n-1}_{i=1}\ln \tau_{n,i}$. Thus, it is not hard to
show that

$$\lim_{n\to\infty} \ln \frac{|T_n|}{|T_{n-1}|} = \frac{1}{2\pi} \int^{2\pi}_0 d\omega\ \ln f(\omega)$$

which we can leverage to compute information rates. In particular, this
formula can be used for analytical computation of entropy rates of
Gaussian processes [@2009.Tostevin].

We will instead use this theorem to find a an approximate way to compute
the determinant of a large Toeplitz matrix. We can approximate the
integral by a Riemann sum

$$\lim_{n\to\infty} \frac{\ln |T_n|}{n} \approx \frac{1}{N}\sum^{N-1}_{m=0} \ln f\left( \omega_m \right)$$

where $\omega_m = 2\pi m/N$ for some large $N$. Now, inserting
@eq-fourier-series we find

::: {#eq:logdet-toeplitz}
$$\lim_{n\to\infty} \frac{\ln |T_n|}{n}  \approx \frac{1}{N} \sum^{N-1}_{m=0} \ln \sum^{\infty}_{k=-\infty} t_k 
    \exp\left(-\frac{i 2\pi k m}{N} \right)\,.
    \label{eq:logdet-toeplitz}$$
:::

In practice we cannot perform the infinite sum over $k$. Thus, we must
truncate the series. We truncate the series such that $t_k=0$ for
$|k|>N/2$. Then, the sum over $k$ becomes the discrete Fourier transform
(DFT). We recall that the DFT of the sequence $t_k$ for
$k=-\lfloor N/2 \rfloor,\ldots,0,\ldots,\lfloor N/2 \rfloor$ is another
sequence $(\lambda_m)$, defined by

$$\lambda_m = \sum^{\lfloor N/2 \rfloor}_{k=-\lfloor N/2 \rfloor} t_k \exp\left( -\frac{i 2\pi k m}{N} \right)$$

for $m=0,\ldots,N-1$. Hence, we have derived the approximation

$$\lim_{n\to\infty} \frac{\ln |T_n|}{n}  \approx \frac{1}{N} \sum^{N-1}_{m=0} 
    \ln \lambda_m\,.$$

The DFT coefficients $\lambda_m$ represent the inner sum in
@eq:logdet-toeplitz, when truncated to
$k=-\lfloor N/2 \rfloor,\ldots,0,\ldots,\lfloor N/2 \rfloor$. In
principle we want to choose $N$ as large as possible. However, given a
matrix $T_n$ we only know the values $t_{-n},\ldots,t_0,\ldots,t_n$.
Thus, the maximum value of $N$ that we can use is $N=2n$.

This means, our approximation for the log-determinant of $T_n$ for large
$n$ can be written as

$$\ln |T_n| \approx \frac{1}{2} \sum^{2n-1}_{m=0} \ln \lambda_{m} \,.$$

It is easy to verify that this formula converges to
@eq:logdet-toeplitz as $n\to\infty$. This formula is also
very efficient to evaluate on modern computers. The sequence
$\lambda_0,\ldots,\lambda_{2n-1}$ can be easily computed via the FFT
algorithm from the sequence of $t_k$. Efficient implementations of the
FFT algorithm are widely available.

Finally, we discuss how to evaluate the mutual information *rate*,
defined as $R(S, X) = \lim_{n\to\infty} I(S[t_0:t_n],X[t_0:t_n])/n$,
using Szegő's theorem. @2006.Kamiyabu used Szegő's theorem to derive the
formula

$$R(S, X) = -\frac{1}{2} \int^{2\pi}_0 d\omega\ \ln\left( 1 - \frac{|f_{sx}(\omega)|^2}{f_{ss}(\omega) f_{xx}(\omega)} \right)$$

where the functions
$f_{\alpha\beta}(\omega) = \sum^\infty_{k=-\infty} t_{\alpha\beta,k} e^{-i\omega k}$
represent the discrete-time Fourier transforms of the covariances of the
matrices $\Sigma_{\alpha\beta}$ in the limit $n\to\infty$. As above, we
are going to approximate this formula using the discrete Fourier
transform. We define DFT sequences for the matrices
$\Sigma_{\alpha\beta}$ as
$\lambda_{\alpha\beta,m} = \sum^n_{k=-n} t_{\alpha\beta,m} \exp(-i \omega_m k)$
for $\omega_m = 2\pi m / N$. This results in the estimate for the mutual
information rate

$$R(S, X) \approx
    -\frac{1}{2} \sum^{2n-1}_{m=0} \ln
    \left( 
    1 - \frac{|\lambda_{sx,m}|^2}{\lambda_{ss,m} \lambda_{xx,m}}
    \right) \,.$$

More information about asymptotics and other results for Toeplitz
matrices can be found in the review of @2005.Gray.
