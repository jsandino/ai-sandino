# Notation and conventions

::: spread
::: relaxed
We follow the conventions of the original paper and most modern references, with minor clarifications where they reduce ambiguity.
:::

::: relaxed
## Dimensions and shapes

::: grid
| Symbol | Meaning | Typical value |
|---|---|---|
| $d_{\text{model}}$ | Hidden dimension of the residual stream | 512–8192 |
| $d_k$ | Dimension of query and key vectors, per head | $d_{\text{model}} / h$ |
| $d_v$ | Dimension of value vectors, per head | $d_{\text{model}} / h$ |
| $d_{\text{ff}}$ | Inner dimension of the feed-forward network | $\approx 4 \cdot d_{\text{model}}$ |
| $h$ | Number of attention heads | 8–128 |
| $n$ | Sequence length (number of tokens) | 1–128k |
| $V$ | Vocabulary size | ≈ 32k–256k |
| $L$ | Number of transformer layers (blocks) | 6–120 |
| $B$ | Batch size | 1–thousands |
:::
:::

::: relaxed
## Matrix conventions

- Lowercase bold for vectors: $\mathbf{x}$, $\mathbf{q}$. By default, vectors are row vectors of shape $(1, d)$.
- Uppercase bold for matrices: $\mathbf{X}$, $\mathbf{Q}$, $\mathbf{K}$, $\mathbf{V}$.
- An input sequence is a matrix with one token per row, so $\mathbf{X} \in \mathbb{R}^{n \times d_{\text{model}}}$. This is the convention used by Alammar, Raschka and PyTorch.
- $\mathbf{X}\mathbf{W}$ is matrix multiplication; $\mathbf{X} \odot \mathbf{Y}$ is the element-wise (Hadamard) product.
- $\mathbf{X}^\top$ is the transpose. $\mathbf{X}^{-1}$ would be the inverse, but a transformer never inverts a matrix.
- $\operatorname{softmax}(\mathbf{z})_i = \dfrac{\exp(z_i)}{\sum_j \exp(z_j)}$, applied along a stated axis: in attention, always the last one.
:::

::: relaxed
## Indices

- $i$ usually indexes a query position: a row of $\mathbf{Q}$, and a row of the output.
- $j$ usually indexes a key and value position: a row of $\mathbf{K}$ and of $\mathbf{V}$.
- $\ell$ indexes a layer; a superscript $(\ell)$ means "at layer $\ell$".
- A superscript $(i)$, or $\text{head}_i$, indexes the attention heads within multi-head attention.
:::
:::
