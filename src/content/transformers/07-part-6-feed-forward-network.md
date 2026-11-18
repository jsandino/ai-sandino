# Part VI — The feed-forward network

**Why does a transformer block need a feed-forward network?**

Attention *mixes*: each token's output is a weighted average of other tokens' vectors, so it can bring information together but can only blend what is already there. The feed-forward network *transforms*: a non-linear function, applied to each token separately, that turns the blended vector into new features. Attention gathers; the FFN processes. Each layer needs both.

## 25. Structure: expand, activate, compress

After the multi-head attention sub-layer, each transformer block has a second sub-layer: a position-wise feed-forward network (FFN). It is applied independently to every position in the sequence, with the same weights at every position. The structure is simple, two linear layers with a non-linearity between them ([Vaswani et al., 2017](./14-appendix-a-further-reading.md#vaswani-et-al-2017)):

$$\operatorname{FFN}(\mathbf{x}) = \max(0,\ \mathbf{x}\mathbf{W}_1 + \mathbf{b}_1)\,\mathbf{W}_2 + \mathbf{b}_2$$

where $\mathbf{x} \in \mathbb{R}^{1 \times d_{\text{model}}}$ is one token's representation. The shapes are:

::: grid
| Tensor | Shape | Role |
|---|---|---|
| $\mathbf{W}_1$ | $d_{\text{model}} \times d_{\text{ff}}$ | expand |
| $\mathbf{b}_1$ | $d_{\text{ff}}$ | bias for the expansion (many modern models omit it) |
| $\mathbf{W}_2$ | $d_{\text{ff}} \times d_{\text{model}}$ | compress |
| $\mathbf{b}_2$ | $d_{\text{model}}$ | bias for the compression (also often omitted) |
:::

The inner dimension $d_{\text{ff}}$ is typically $4\, d_{\text{model}}$. The original paper uses $d_{\text{model}} = 512$ and $d_{\text{ff}} = 2048$, exactly a 4× expansion. The FFN projects each $d_{\text{model}}$-dimensional vector up to a much larger dimension, applies a non-linear activation, and projects back down: the *expand, activate, compress* pattern.

![A feed-forward network with four input units, eight hidden units and four output units, every input connected to every hidden unit and every hidden unit to every output, with the weight matrices W1 and W2 and the activation marked](figures/ffn-network.pdf)

The figure shows one token. Its $d_{\text{model}}$ numbers enter on the left, each hidden unit takes a weighted sum of all of them (the weights are one column of $\mathbf{W}_1$), the activation is applied to each hidden unit separately, and each output unit takes a weighted sum of the hidden values (a column of $\mathbf{W}_2$). For a whole sequence the same computation runs on every row of the input matrix. With $n = 3$ and $d_{\text{model}} = 4$ as in Part III, the shapes are $(3 \times 4)\,(4 \times 8) = 3 \times 8$, then the activation on each of the 24 entries, then $(3 \times 8)\,(8 \times 4) = 3 \times 4$: the output has the same shape as the input, so it can be added back to it.

Two properties are worth stating plainly:

- **Position-wise.** The same $\mathbf{W}_1$ and $\mathbf{W}_2$ are applied to every position independently. No information flows between positions inside the FFN; that is attention's job. The FFN does local processing on each token's already attention-mixed representation.
- **Shared across positions, different across layers.** The paper says the FFN uses "different parameters from layer to layer". Layer 1's FFN and layer 2's FFN have different $\mathbf{W}_1$ and $\mathbf{W}_2$, so a model with $L$ layers has $L$ distinct FFNs.

### Why expand and compress?

One interpretation is that the FFN works like a key–value memory: each hidden unit detects an input pattern (a key) and the matching row of $\mathbf{W}_2$ writes a vector (a value). [Geva et al. (2021)](./14-appendix-a-further-reading.md#geva-et-al-2021) found evidence consistent with this in one language model, but it is partial, so treat it as a hypothesis. That the FFN matters is better established: [Dong et al. (2021)](./14-appendix-a-further-reading.md#dong-et-al-2021) show that, under assumptions on the weights, a stack of pure self-attention layers collapses to a rank-1 matrix, and that skip connections and FFNs counteract this.

## 26. Activation functions: ReLU, GELU, Swish

The non-linearity between $\mathbf{W}_1$ and $\mathbf{W}_2$ is essential. To see why, take the smallest possible case: one number in, one number out, and a function we want the network to learn, the absolute value $|x|$. Feed in $x = -2, -1, 1, 2$; the targets are $2, 1, 1, 2$.

*Without an activation*, the network computes $x\,\mathbf{W}_1\mathbf{W}_2$. Whatever the weights, $\mathbf{W}_1\mathbf{W}_2$ is a single number $a$, so the output is $a \cdot x$. That can never work here: $x = -1$ and $x = 1$ must both give 1, but $a \cdot (-1) = -(a \cdot 1)$. Stacking more linear layers changes nothing, because a product of matrices is still one matrix. Two linear layers are exactly as powerful as one.

*With ReLU* and two hidden units, take $\mathbf{W}_1 = \begin{bmatrix} 1 & -1 \end{bmatrix}$ and $\mathbf{W}_2 = \begin{bmatrix} 1 \\ 1 \end{bmatrix}$:

::: grid
| $x$ | Hidden before ReLU | Hidden after ReLU | Output | Target |
|---|---|---|---|---|
| −2 | $(-2,\ 2)$ | $(0,\ 2)$ | 2 | 2 |
| −1 | $(-1,\ 1)$ | $(0,\ 1)$ | 1 | 1 |
| 1 | $(1,\ -1)$ | $(1,\ 0)$ | 1 | 1 |
| 2 | $(2,\ -2)$ | $(2,\ 0)$ | 2 | 2 |
:::

For every input, one of the two hidden units is switched off by ReLU and the other passes its value through, so the output is $\operatorname{ReLU}(x) + \operatorname{ReLU}(-x) = |x|$ exactly. Each hidden unit contributes one "bend" to the function, and the more hidden units there are, the more bends the network can make. This is the real job of the wide hidden layer in Section 25: it supplies many such units, and the activation is what lets them behave differently from a plain linear map.

The original transformer used ReLU; most modern models use one of the smoother functions below.

**ReLU** (Rectified Linear Unit):

$$\operatorname{ReLU}(x) = \max(0, x)$$

It is zero for negative inputs and the identity for positive ones, and it is very cheap to compute. Its drawback is that the derivative is exactly zero for every negative input, so a unit that is negative for all inputs gets no gradient and stops learning. This is the "dying ReLU" problem.

**GELU** (Gaussian Error Linear Unit), introduced by [Hendrycks and Gimpel (2016)](./14-appendix-a-further-reading.md#hendrycks-and-gimpel-2016) and used in BERT and GPT-2. It multiplies the input by the probability that a standard normal variable is less than it:

$$\operatorname{GELU}(x) = x\,\Phi(x) \approx 0.5\,x\left(1 + \tanh\!\left[\sqrt{2/\pi}\left(x + 0.044715\,x^3\right)\right]\right)$$

Here $\Phi$ is the standard normal cumulative distribution function. The tanh form is a fast approximation of the exact one. GELU is smooth everywhere, and it lets small negative values through instead of zeroing them.

**Swish** (also called SiLU) is $x$ times the sigmoid $\sigma$:

$$\operatorname{Swish}(x) = x\,\sigma(x) = \frac{x}{1 + e^{-x}}$$

The same function was defined in the GELU paper, where it is called SiLU. [Ramachandran et al. (2017)](./14-appendix-a-further-reading.md#ramachandran-et-al-2017) later found it through automated search and named it Swish; they also generalised it with a scaling parameter, and the version above is the case where that parameter is 1. Like GELU it is smooth and self-gating, and it dips slightly below zero before rising. The two behave very similarly:

::: grid
| $x$ | ReLU | GELU | Swish |
|---|---|---|---|
| −3 | 0 | −0.004 | −0.142 |
| −2 | 0 | −0.045 | −0.238 |
| −1 | 0 | −0.159 | −0.269 |
| 0 | 0 | 0 | 0 |
| 1 | 1 | 0.841 | 0.731 |
| 2 | 2 | 1.955 | 1.762 |
| 3 | 3 | 2.996 | 2.858 |
:::

## 27. Gated linear units and SwiGLU

Most recent open models (Llama, PaLM) replace the plain FFN of Section 25 with a variant that adds a *gate*. The idea is simple. Instead of one projection followed by an activation, use two projections of the same input: one carries the content, the other decides how much of each content dimension to let through. The two are multiplied element by element, written $\odot$ (the Hadamard product). This is the Gated Linear Unit of [Dauphin et al. (2017)](./14-appendix-a-further-reading.md#dauphin-et-al-2017):

$$\operatorname{GLU}(\mathbf{x}) = \sigma(\mathbf{x}\mathbf{W}) \odot (\mathbf{x}\mathbf{V})$$

Here is the gate at work on three dimensions. Suppose the content is $\mathbf{x}\mathbf{V} = (4,\ -2,\ 6)$ and the sigmoid gate gives $\sigma(\mathbf{x}\mathbf{W}) = (1,\ 0.1,\ 0.5)$. Multiplying element by element gives $(4,\ -0.2,\ 3)$: the first dimension passes in full, the second is almost switched off, and the third is halved. The gate lets the network decide, for each token and each hidden dimension, how much to keep.

[Shazeer (2020)](./14-appendix-a-further-reading.md#shazeer-2020) tried other functions in place of the sigmoid in the transformer FFN (ReLU, GELU, Swish, or none at all). GEGLU and SwiGLU gave the best perplexities, and the gated variants did better than the plain ReLU or GELU FFN on most tasks. SwiGLU, the Swish-gated version, is used by PaLM ([Chowdhery et al., 2022](./14-appendix-a-further-reading.md#chowdhery-et-al-2022)) and by Llama ([Touvron et al., 2023](./14-appendix-a-further-reading.md#touvron-et-al-2023-llama-2)):

$$\operatorname{FFN}_{\text{SwiGLU}}(\mathbf{x}) = \big(\operatorname{Swish}(\mathbf{x}\mathbf{W}_1) \odot (\mathbf{x}\mathbf{W}_3)\big)\,\mathbf{W}_2$$

Compared with the plain FFN there is one extra matrix, $\mathbf{W}_3$ (the content projection), and these implementations omit the biases. Three matrices cost more than two, so to keep the parameter count the same as a standard FFN the inner dimension is reduced by a factor of 2/3:

$$d_{\text{ff}}^{\text{SwiGLU}} = \tfrac{2}{3} \cdot 4\, d_{\text{model}} = \tfrac{8}{3}\, d_{\text{model}}$$

In Llama 2 7B, $d_{\text{model}} = 4096$ and $d_{\text{ff}} = 11008$ ([published configuration](./14-appendix-a-further-reading.md#llama-2-configurations)). The formula gives $\tfrac{8}{3} \cdot 4096 \approx 10923$; the actual value is the next multiple of 256 ($43 \times 256 = 11008$), which suits hardware.

> **Note.** Shazeer ends his paper with a candid sentence: "We offer no explanation as to why these architectures seem to work; we attribute their success, as all else, to divine benevolence." The mechanism by which gated variants beat a plain FFN is still not well understood. Empirically, SwiGLU is a common choice in recent open models.

## 28. Where most of the parameters live

It surprises many people that the FFN, not attention, holds most of a layer's parameters. Count the weights (ignoring biases). For a standard FFN with $d_{\text{ff}} = 4\, d_{\text{model}}$:

$$\text{parameters per FFN} = 2\, d_{\text{model}}\, d_{\text{ff}} = 8\, d_{\text{model}}^2$$

Attention has $4\, d_{\text{model}}^2$ (Part IV), so the FFN has twice as many. For SwiGLU the count is the same by design:

$$3 \cdot d_{\text{model}} \cdot \tfrac{8}{3}\, d_{\text{model}} = 8\, d_{\text{model}}^2$$

So in a layer with standard multi-head attention and $d_{\text{ff}} = 4\, d_{\text{model}}$ (or its SwiGLU equivalent), about $8/12 = 2/3$ of the weights are in the FFN and $1/3$ in attention. Counting real models gives the figures below: the FFN and attention columns are parameters in one layer. Multiplying them by the number of layers and adding the embedding matrices recovers the models' headline sizes: for Llama 2 7B, $32 \times (135.3\text{M} + 67.1\text{M}) \approx 6.48\text{B}$, plus about 0.26B for the input embedding and the output projection (32,000 × 4096 each), gives about 6.7B.

::: grid
| Model | Layers | FFN | Attention | FFN share |
|---|---|---|---|---|
| Original Transformer, base (encoder layer) | 6 | 2.10M | 1.05M | 67% |
| Llama 2 7B (SwiGLU, standard MHA) | 32 | 135.3M | 67.1M | 67% |
| Llama 2 70B (SwiGLU, GQA) | 80 | 704.6M | 151.0M | 82% |
:::

The 2/3 figure is therefore not a law. It holds for the layer design above, but Llama 2 70B uses grouped-query attention (Part IV) and a wider $d_{\text{ff}} = 28672$ (more than $\tfrac{8}{3} \cdot 8192 \approx 21845$), and its FFN holds about 82% of each layer's weights. Either way the FFN is the largest part of a layer, which is why changes to it matter so much. In a mixture-of-experts model, for example, each token uses only a subset of the FFN "experts", which cuts the compute per token without shrinking the total parameter count.
