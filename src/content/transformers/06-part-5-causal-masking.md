# Part V — Causal masking

## 22. The autoregressive constraint

Decoder-only language models such as GPT generate text one token at a time. At each step they look at all the tokens so far and predict the next one; the model's own output at step $t$ becomes part of its input at step $t+1$. This is called *autoregressive* generation.

During training we do not generate token by token. We feed the model a whole sequence at once and ask it to predict every next token in parallel, which is what makes transformers train so much faster than recurrent networks (Part I). The targets are the inputs shifted by one position: the target at position $i$ is the token at position $i+1$, which matches the paper's remark that the output embeddings are "offset by one position" ([Vaswani et al., 2017](./14-appendix-a-further-reading.md#vaswani-et-al-2017)). For the sentence "The cat sat on":

::: grid
| Position $i$ | Input token | Target (the next token) |
|---|---|---|
| 0 | The | cat |
| 1 | cat | sat |
| 2 | sat | on |
:::

But there is a catch. If attention may look at every position, then position 1, which must predict "sat", can attend to position 2, whose input is exactly "sat". The model could then reach zero loss by copying the answer from the input without learning anything about language. To prevent this, the prediction at position $i$ must depend only on positions $0, 1, \dots, i$. By convention a position may attend to itself: the token at position $i$ is part of the context from which the model predicts token $i+1$.

The mechanism is the *causal mask* (also called a look-ahead mask). It is applied to the attention scores before the softmax: in the paper's words, it works by "masking out (setting to −∞) all values in the input of the softmax which correspond to illegal connections". After the softmax those positions have weight exactly zero, so each query attends only to the current and earlier positions.

## 23. Implementing the mask

The mask $\mathbf{M}$ is an $n \times n$ matrix with a simple structure:

$$M_{ij} = \begin{cases} 0 & \text{if } j \le i \text{ (allowed)} \\ -\infty & \text{if } j > i \text{ (forbidden)} \end{cases}$$

For $n = 5$, with rows $i$ (queries) and columns $j$ (keys):

$$\mathbf{M} = \begin{bmatrix}
0 & -\infty & -\infty & -\infty & -\infty \\
0 & 0 & -\infty & -\infty & -\infty \\
0 & 0 & 0 & -\infty & -\infty \\
0 & 0 & 0 & 0 & -\infty \\
0 & 0 & 0 & 0 & 0
\end{bmatrix}$$

The mask is added to the scaled scores before the softmax:

$$\mathbf{A} = \operatorname{softmax}\!\left(\frac{\mathbf{Q}\mathbf{K}^\top}{\sqrt{d_k}} + \mathbf{M}\right)$$

Adding 0 leaves an allowed score unchanged. Adding $-\infty$ to a forbidden score makes its exponential $\exp(-\infty) = 0$, so that position gets exactly zero weight, and the softmax renormalizes over the allowed positions as if the forbidden ones did not exist.

> **Note.** In practice implementations often use a very large negative number, such as $-10^9$ or the most negative value of the data type, instead of a literal $-\infty$. The reason is rows that are masked *entirely*: a softmax over a row of $-\infty$ is $0/0$, which is not a number (NaN). A causal mask never masks a whole row, because the diagonal is always allowed, but other masks (for example, one that hides padding tokens) can. Libraries usually take the mask as a boolean: in PyTorch's `scaled_dot_product_attention`, `True` marks a position that takes part in attention, a float mask is added to the scores as above, and `is_causal=True` builds the lower-triangular mask itself ([PyTorch documentation](./14-appendix-a-further-reading.md#pytorch-scaled-dot-product-attention-documentation)).

### A worked example with the mask

Return to the three-token example of Part III. The scaled scores were

$$\frac{\mathbf{Q}\mathbf{K}^\top}{\sqrt{d_k}} \approx \begin{bmatrix}
0.225 & 0.306 & 0.242 \\
0.393 & 0.468 & 0.300 \\
0.335 & 0.398 & 0.237
\end{bmatrix}$$

and after adding the causal mask they become

$$\begin{bmatrix}
0.225 & -\infty & -\infty \\
0.393 & 0.468 & -\infty \\
0.335 & 0.398 & 0.237
\end{bmatrix}$$

The softmax along each row then gives

$$\mathbf{A} \approx \begin{bmatrix}
1.000 & 0.000 & 0.000 \\
0.481 & 0.519 & 0.000 \\
0.336 & 0.359 & 0.305
\end{bmatrix}$$

Row 0 attends only to position 0 (itself); row 1 attends to positions 0 and 1; row 2 attends to all three. Compare row 1 with the unmasked weights of Part III, $[0.334,\ 0.361,\ 0.305]$: the weight that went to position 2 has been redistributed over the two allowed positions, in the same proportion as before (the ratio of the first two weights is still about 0.93). Row 2 is identical to the unmasked case, because position 2 was already allowed to attend to everything. With the one-hot $\mathbf{V}$ of Part III, the output $\mathbf{A}\mathbf{V}$ is again just $\mathbf{A}$, so the first output row is exactly $\mathbf{V}[0]$: token 0 sees only itself.

### Computational cost

The mask does not change the asymptotic cost of attention: a straightforward implementation still computes the full $n \times n$ score matrix and then masks half of it. Optimized kernels avoid that work. FlashAttention-2 skips the blocks of the score matrix that lie entirely above the diagonal, which for long sequences is about half of all blocks, and its authors report a speedup of around 1.7–1.8× compared with attention without the causal mask ([Dao, 2023](./14-appendix-a-further-reading.md#dao-2023)). The abstraction stays the same; only the underlying kernel changes.

## 24. Self-attention, cross-attention and masked self-attention

The original encoder–decoder transformer (Part X) uses three attention variants, and telling them apart helps even for decoder-only models. All three use the same scaled dot-product mechanism. They differ in two things: where $\mathbf{Q}$, $\mathbf{K}$ and $\mathbf{V}$ come from, and whether a mask is applied.

::: grid
| Variant | What it does |
|---|---|
| **Self-attention** | $\mathbf{Q}$, $\mathbf{K}$ and $\mathbf{V}$ all come from the same input $\mathbf{X}$, with no mask, so every position can draw on every other. Used when the whole input is available: encoders (BERT, the encoder side of T5). |
| **Masked (causal) self-attention** | The same, with the causal mask: each position attends only to itself and earlier positions. This is the case this guide has described so far. Used in decoder-only models (GPT, Llama) and in the decoder of the original transformer. |
| **Cross-attention** | $\mathbf{Q}$ comes from the decoder, but $\mathbf{K}$ and $\mathbf{V}$ come from the encoder's output, with no mask: the decoder may look at any position of the encoder's output. Used in encoder–decoder models (the original transformer, T5); Part X treats it in detail. |
:::
