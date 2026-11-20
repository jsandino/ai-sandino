# Part IX — Output processing

**How does the model turn its final vectors into a prediction?** After the last block, every token is a vector of $d_{\text{model}}$ numbers that means nothing to us yet. What we need, for each position, is one probability per vocabulary token: the model's estimate of the token that comes next. Three operations produce it: a final normalization, a linear projection that scores every token, and a softmax that turns the scores into probabilities.

## 36. From vectors to logits

The vectors leaving the last block have $d_{\text{model}}$ numbers each, while the answer needs one score per vocabulary token, so the model normalizes them once more and then projects. With $\mathbf{X}_L$ the output of the last block, the normalization is

$$\mathbf{Z} = \operatorname{RMSNorm}(\mathbf{X}_L)$$

A pre-norm stack (Part VII) normalizes only the inputs of its sub-layers, never the residual stream itself, and the scale of the stream can grow with depth. The final normalization hands the projection vectors of controlled scale; GPT-2 added exactly this layer after its last block ([Radford et al., 2019](./14-appendix-a-further-reading.md#radford-et-al-2019)). The *unembedding* matrix $\mathbf{U}$ then scores every token:

$$\text{logits} = \mathbf{Z}\,\mathbf{U}, \qquad \mathbf{U} \in \mathbb{R}^{d_{\text{model}} \times V}$$

The result has shape $n \times V$. Entry $(i, v)$ is the raw score, the *logit*, of token $v$ as the continuation after position $i$. It is the dot product of row $i$ of $\mathbf{Z}$ with column $v$ of $\mathbf{U}$, so a high score means the final vector points toward that token's column. If $\mathbf{U}$ is tied to the embedding matrix (Part II), that column is the token's own embedding; if not, it is learned separately. The computation is the same either way, and Llama's output projection has no bias. The matrix holds $d_{\text{model}} \cdot V$ parameters: 131M in Llama 2 7B (Part VIII).

To see the two matrices at work, reuse the toy numbers of Part II: $d_{\text{model}} = 4$, $V = 6$ and the input token IDs $[2, 4, 1]$. Pretend the blocks left $\mathbf{X}$ unchanged (a real stack would of course transform it), so the final RMSNorm acts on $\mathbf{X}$ directly, with $\gamma = 1$ and rounded to two decimals:

$$\mathbf{Z} \approx \begin{bmatrix}
1.10 & 1.46 & 0.37 & 0.73 \\
1.18 & 0.59 & 0.29 & 1.47 \\
1.60 & 0.32 & 0.64 & 0.96
\end{bmatrix}$$

Tie the unembedding to the embedding matrix, $\mathbf{U} = \mathbf{E}^\top$, so no new numbers are needed. It has $d_{\text{model}} = 4$ rows and $V = 6$ columns, and column $v$ is the embedding of token $v$:

$$\mathbf{U} = \begin{bmatrix}
0.10 & 0.50 & 0.30 & 0.20 & 0.40 & 0.10 \\
0.20 & 0.10 & 0.40 & 0.30 & 0.20 & 0.50 \\
0.30 & 0.20 & 0.10 & 0.40 & 0.10 & 0.30 \\
0.40 & 0.30 & 0.20 & 0.10 & 0.50 & 0.20
\end{bmatrix}$$

The product has one row per input position and one column per vocabulary token:

$$\mathbf{Z}\,\mathbf{U} \approx \begin{bmatrix}
0.80 & 0.99 & 1.10 & 0.88 & 1.13 & 1.10 \\
0.91 & 1.15 & 0.91 & 0.68 & 1.35 & 0.79 \\
0.80 & 1.25 & 0.86 & 0.77 & 1.25 & 0.70
\end{bmatrix}$$

The first entry is row 0 of $\mathbf{Z}$ times column 0 of $\mathbf{U}$: $1.10 \cdot 0.10 + 1.46 \cdot 0.20 + 0.37 \cdot 0.30 + 0.73 \cdot 0.40 \approx 0.80$. Row $i$ holds the six logits for position $i$; the next section turns each row into probabilities.

## 37. Softmax over the vocabulary

Logits can be negative and do not sum to 1, so they are not yet probabilities. Softmax (Part I), applied to each row along the vocabulary axis, converts them:

$$p_{i,v} = \frac{\exp(\text{logits}_{i,v})}{\sum_{v'} \exp(\text{logits}_{i,v'})}$$

Row $i$ is the model's distribution over the next token given the tokens up to position $i$; the causal mask (Part V) guarantees that position $i$ saw nothing later. This is the softmax of attention, except that the sum runs over $V$ entries (roughly 32,000 in Llama 2 up to 256,000 in Gemma) and there is no $1/\sqrt{d_k}$ scaling. After "the cat sat on the", a toy vocabulary of four candidates gives:

::: grid
| Token | Logit | $\exp(\text{logit})$ | Probability |
|---|---|---|---|
| mat | 2.0 | 7.39 | 0.61 |
| floor | 1.0 | 2.72 | 0.22 |
| rug | 0.5 | 1.65 | 0.14 |
| moon | −1.0 | 0.37 | 0.03 |
| Sum | | 12.12 | 1.00 |
:::

Softmax preserves order, so the most likely token is the one with the highest logit. In code, the largest logit is subtracted from every logit before exponentiating. Part I showed that this changes nothing, and it matters because $e^{100} \approx 2.7 \times 10^{43}$ is beyond the range of 32-bit floating point (about $3.4 \times 10^{38}$): a logit of 100 would overflow, while after the subtraction the largest exponent is 0. Choosing the next token from the distribution (greedy decoding, temperature, top-$p$) is inference, not architecture, and is outside this guide.

Applying softmax to each row of $\mathbf{Z}\,\mathbf{U}$ from the previous section gives one distribution per position, each row summing to 1. The toy logits were close together, so the probabilities are nearly uniform:

$$\mathbf{P} \approx \begin{bmatrix}
0.14 & 0.16 & 0.18 & 0.15 & 0.19 & 0.18 \\
0.15 & 0.20 & 0.15 & 0.12 & 0.24 & 0.14 \\
0.14 & 0.22 & 0.15 & 0.14 & 0.22 & 0.13
\end{bmatrix}$$

## 38. Training and inference

Training needs one number that says how good the predictions are, so the weights can be improved. The text supplies the answers itself: in "the cat sat on the mat", each token is the right next token for the position before it. Every position therefore gets a prediction and a right answer in one pass, which is valid because row $i$ has seen only tokens up to $i$ (the causal mask).

For each position, the loss takes the probability $p$ the model gave to the right token and charges a penalty of $-\ln p$. A probability of 1 costs $-\ln 1 = 0$, and the penalty grows without bound as $p$ falls: if the true next token is "mat" (0.61) the penalty is $\approx 0.50$, and if it is "moon" (0.03) it is $\approx 3.5$. Averaged over the $n - 1$ positions that have a next token, this is the *cross-entropy* loss ([Hugging Face](./14-appendix-a-further-reading.md#hugging-face-llama-docs)). Frameworks compute it from the logits directly, applying log-softmax inside ([PyTorch](./14-appendix-a-further-reading.md#pytorch-cross-entropy-loss)), so training code rarely forms the probabilities at all.

At inference only the last row is needed: it is the prediction for the next token. The chosen token is appended to the sequence and the model runs again. Implementations can skip the other rows' logits to save memory, as the `logits_to_keep` option does in Hugging Face's Llama code ([documentation](./14-appendix-a-further-reading.md#hugging-face-llama-docs)).
