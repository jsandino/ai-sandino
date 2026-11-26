# Part II — Input processing

## 4. From text to token IDs

Neural networks operate on numbers, not text. The first stage of any LLM pipeline turns a string into a sequence of integers, a process called *tokenization*. A tokenizer is a deterministic function that converts raw text into a sequence of token IDs, each of which is an index into a fixed vocabulary of size $V$.

Three approaches have been used in practice ([Hugging Face, Tokenization algorithms](./14-appendix-a-further-reading.md#hugging-face-tokenization-algorithms)):

- **Word-level tokenization.** One ID per word. The vocabulary explodes (English has hundreds of thousands of inflected forms and proper nouns), and out-of-vocabulary words become an `[UNK]` token, losing all information.
- **Character-level tokenization.** One ID per Unicode codepoint. The vocabulary is small, but sequences become very long, which is expensive because attention cost scales quadratically with sequence length (Part III).
- **Subword tokenization.** The middle path, adopted by essentially every modern LLM. Common words become single tokens; rare or novel words are split into reusable subword pieces. The most common algorithm is Byte-Pair Encoding (BPE) ([Sennrich et al., 2016](./14-appendix-a-further-reading.md#sennrich-et-al-2016)), which GPT-2 ([Radford et al., 2019](./14-appendix-a-further-reading.md#radford-et-al-2019)) uses in a byte-level form. This guide treats the tokenizer as a fixed module that takes text in and emits integer IDs; the [Hugging Face documentation](./14-appendix-a-further-reading.md#hugging-face-tokenization-algorithms) covers the algorithms in full.

> **Note.** The tokenizer is conceptually separate from the transformer. It has its own training data, its own training algorithm, and its own vocabulary and merge list. The transformer only ever sees integer token IDs; it never touches raw text. For the rest of this guide, "input" means a sequence of token IDs.

### A worked example

For the sentence "The cat sat", a small BPE tokenizer might give:

::: grid
| Token (text) | Token ID |
|---|---|
| “The” | 791 |
| “ cat” | 8415 |
| “ sat” | 7731 |
:::

Each integer is an index into the vocabulary table. The leading space in “ cat” and “ sat” is part of the token, a quirk of byte-level BPE tokenizers such as GPT-2's ([Hugging Face, GPT-2 model documentation](./14-appendix-a-further-reading.md#hugging-face-gpt-2-model-documentation)). The result is a tensor of shape $(3,)$ holding the three IDs, which we arrange as a row vector and feed to the next stage.

## 5. Token embeddings as matrix lookup

A token ID is just an integer. It carries no semantic structure: "cat" being token 8415 tells the network nothing about cats. To give each token a representation the network can compute with, we associate every token ID with a learned vector of dimension $d_{\text{model}}$. The collection of all such vectors is the *embedding matrix* ([Vaswani et al., 2017](./14-appendix-a-further-reading.md#vaswani-et-al-2017)):

$$\mathbf{E} \in \mathbb{R}^{V \times d_{\text{model}}}$$

It has one row per vocabulary entry. To look up the embedding of token ID $t$, we simply take row $t$:

$$\operatorname{embedding}(t) = \mathbf{E}[t, :] \in \mathbb{R}^{1 \times d_{\text{model}}}$$

For a sequence of $n$ token IDs $t_1, \dots, t_n$, we stack the resulting row vectors into a matrix:

$$\mathbf{X} = \begin{bmatrix} \mathbf{E}[t_1, :] \\ \vdots \\ \mathbf{E}[t_n, :] \end{bmatrix} \in \mathbb{R}^{n \times d_{\text{model}}}$$

This $\mathbf{X}$ is the input to the rest of the transformer. Its shape, sequence length by hidden dimension, is the shape that flows through every block in the network until the final output stage.

### A concrete example with small numbers

Suppose $d_{\text{model}} = 4$ and $V = 6$, with the following (made-up) embedding matrix. Row $t$ is the embedding of token ID $t$, counting from 0 at the top:

$$\mathbf{E} = \begin{bmatrix}
0.10 & 0.20 & 0.30 & 0.40 \\
0.50 & 0.10 & 0.20 & 0.30 \\
0.30 & 0.40 & 0.10 & 0.20 \\
0.20 & 0.30 & 0.40 & 0.10 \\
0.40 & 0.20 & 0.10 & 0.50 \\
0.10 & 0.50 & 0.30 & 0.20
\end{bmatrix}$$

If the input sequence has token IDs $[2, 4, 1]$, we look up rows 2, 4 and 1:

$$\mathbf{X} = \begin{bmatrix} \mathbf{E}[2, :] \\ \mathbf{E}[4, :] \\ \mathbf{E}[1, :] \end{bmatrix} = \begin{bmatrix}
0.30 & 0.40 & 0.10 & 0.20 \\
0.40 & 0.20 & 0.10 & 0.50 \\
0.50 & 0.10 & 0.20 & 0.30
\end{bmatrix}$$

Each row of $\mathbf{X}$ is one token's embedding. These vectors are learnable parameters: during training, backpropagation updates the entries of $\mathbf{E}$ along with every other parameter in the network. Tokens that appear in similar contexts end up with embeddings that are close together in this $d_{\text{model}}$-dimensional space. The classic demonstration comes from word embeddings: $\operatorname{vec}(\text{“king”}) - \operatorname{vec}(\text{“man”}) + \operatorname{vec}(\text{“woman”})$ lands closest to $\operatorname{vec}(\text{“queen”})$ ([Mikolov et al., 2013](./14-appendix-a-further-reading.md#mikolov-et-al-2013)).

### Parameter count

The embedding matrix contains $V \cdot d_{\text{model}}$ parameters. For Llama 2 7B ($V \approx 32000$, $d_{\text{model}} = 4096$), that is about 131 million parameters, roughly 2% of the model's 7 billion. Larger vocabularies (Llama 3 uses $V \approx 128\text{k}$) increase this share further.

### Output embedding (the unembedding)

At the top of the network we need the reverse operation: converting a $d_{\text{model}}$-dimensional vector back into a distribution over the vocabulary. A linear projection through an *unembedding* matrix does this:

$$\mathbf{U} \in \mathbb{R}^{d_{\text{model}} \times V}$$

Part IX treats the unembedding in detail. For now, note that some architectures (the original encoder–decoder transformer, GPT-2, Gemma) *tie* the embedding and unembedding matrices: they are the same parameters, related by a transpose, $\mathbf{U} = \mathbf{E}^\top$ ([Vaswani et al., 2017](./14-appendix-a-further-reading.md#vaswani-et-al-2017); [Gemma Team, 2024](./14-appendix-a-further-reading.md#gemma-team-2024)). This halves the parameter cost of the pair. Tying is a size trade-off and not a rule: it is common but not universal ([Chowdhery et al., 2022](./14-appendix-a-further-reading.md#chowdhery-et-al-2022)), and larger models such as Mistral 7B keep the two separate ([Mistral 7B configuration](./14-appendix-a-further-reading.md#mistral-7b-configuration)).

## 6. Why positional information is required

There is a problem with the construction so far. Self-attention (Part III) without a causal mask treats its input as a set of vectors, not a sequence: it is permutation-equivariant. If you reorder the rows of $\mathbf{X}$, the rows of the output are reordered in exactly the same way: each token gets the same output vector as before, just in a different row. A model built on such attention alone would have no way to distinguish "dog bites man" from "man bites dog": both sentences would produce the same set of output vectors ([Vaswani et al., 2017](./14-appendix-a-further-reading.md#vaswani-et-al-2017)). A causal mask (Part V) breaks this symmetry, and models can pick up some position information from it implicitly ([Haviv et al., 2022](./14-appendix-a-further-reading.md#haviv-et-al-2022)), but explicit positional signals remain standard.

This is fatal for language modeling, because the order of words carries enormous information. To restore it, we need to inject a positional signal, either into the input vectors or into the attention computation itself. The positional signal must:

- Distinguish each position in the sequence from every other.
- Allow the model to recover relative offsets ("this token is 3 positions before that one").
- Generalize, ideally, to sequence lengths longer than those seen during training.
- Be efficient to compute and to apply.

Three approaches have been used widely, in roughly chronological order: sinusoidal positional encoding (the original paper), learned absolute positional embeddings (BERT and GPT-2), and Rotary Position Embeddings (used by most recent open-weights decoder LLMs). The next three sections cover all three.

## 7. Sinusoidal positional encoding

The original paper proposed a fixed (non-learned) encoding that assigns a unique $d_{\text{model}}$-dimensional vector to each position. The encoding uses sines and cosines at geometrically spaced frequencies ([Vaswani et al., 2017](./14-appendix-a-further-reading.md#vaswani-et-al-2017)):

$$\operatorname{PE}(pos, 2i) = \sin\!\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)$$

$$\operatorname{PE}(pos, 2i+1) = \cos\!\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)$$

Here $pos$ is the position in the sequence ($0, 1, 2, \dots$) and $i$ indexes the pair of dimensions, from $0$ up to $d_{\text{model}}/2 - 1$. Even-indexed dimensions use the sine and odd-indexed dimensions use the cosine. The wavelengths form a geometric progression from $2\pi$ to $10000 \cdot 2\pi$.

The resulting matrix $\mathbf{PE} \in \mathbb{R}^{n \times d_{\text{model}}}$ is added to the token embeddings:

$$\mathbf{X}_{\text{input}} = \mathbf{X} + \mathbf{PE}$$

Note that $\mathbf{PE}$ depends only on position, not on the token. The same row of $\mathbf{PE}$ is added to whatever token happens to be at position 0, the next row to whatever token is at position 1, and so on.

### Why sines and cosines?

The choice has two attractive properties. First, the values lie in $[-1, 1]$ and have a regular structure that the model can latch onto. Second, and more importantly, the encoding for any position can be written as a linear function of the encoding at any other position. Specifically, for any fixed offset $k$ there is a linear transformation $\mathbf{T}_k$ such that

$$\mathbf{PE}_{pos+k} = \mathbf{T}_k \, \mathbf{PE}_{pos}$$

This is the trigonometric identity $\sin(a+b) = \sin a \cos b + \cos a \sin b$ in disguise, and it is the property [Vaswani et al. (2017)](./14-appendix-a-further-reading.md#vaswani-et-al-2017) expected to help the model attend by relative position. It means the model can in principle learn to do so by learning to apply $\mathbf{T}_k$ internally, even though the encoding is fundamentally absolute.

### Visualizing the encoding

Each column of $\mathbf{PE}$ is a sinusoid in $pos$. The leftmost columns (small $i$) oscillate quickly with position; the rightmost (large $i$) oscillate slowly, with wavelengths of tens of thousands of positions. If you plot the rows of $\mathbf{PE}$ for positions 0 through 100, you see a pattern of bands at different frequencies, like the keys of a piano going from high notes (left) to low notes (right). Each position has a unique "fingerprint" across all $d_{\text{model}}$ frequencies ([Alammar, 2018](./14-appendix-a-further-reading.md#alammar-2018)).

### Concrete numbers

Take $d_{\text{model}} = 4$ and positions 0, 1 and 2. The first two columns use $i = 0$, whose divisor is $10000^{0} = 1$, and the last two use $i = 1$, whose divisor is $10000^{2/4} = 100$. Each row of $\mathbf{PE}$ is therefore

$$\bigl[\, \sin(pos),\ \cos(pos),\ \sin(pos/100),\ \cos(pos/100) \,\bigr]$$

and the three rows are

$$\mathbf{PE} = \begin{bmatrix}
0.00 & 1.00 & 0.00 & 1.00 \\
0.84 & 0.54 & 0.01 & 1.00 \\
0.91 & -0.42 & 0.02 & 1.00
\end{bmatrix}$$

The first two columns vary rapidly with position: with divisor 1, the sine and cosine have period $2\pi \approx 6.28$. The last two columns barely change, because their divisor is 100, so it takes $2\pi \cdot 100 \approx 628$ positions to complete one cycle. With a realistic $d_{\text{model}}$ the slowest pair's divisor approaches 10000, which is where the very long wavelengths come from.

![Sine and cosine curves for divisor 1 and divisor 100, with one cycle marked as 6.28 positions and 628 positions](figures/positional-encoding.pdf)

*Figure: The same pair of curves at the two frequencies in the table. Sine and cosine repeat every $2\pi$ in their input, so a divisor $d$ gives a cycle of $2\pi \cdot d$ positions: about 6.28 for the first two columns, about 628 for the last two.*

### Limitations

Sinusoidal encoding is elegant but has two practical weaknesses. First, the signal is added once, at the very bottom of the network, so later layers can only recover it from the residual stream. Second, although it can in principle extrapolate to longer sequences, in practice it extrapolates poorly ([Press et al., 2021](./14-appendix-a-further-reading.md#press-et-al-2021)). These weaknesses motivated the alternatives below.

## 8. Learned absolute positional embeddings

GPT-2 and BERT replaced the fixed sinusoidal encoding with a second lookup table: a matrix $\mathbf{PE} \in \mathbb{R}^{n_{\max} \times d_{\text{model}}}$ of learned parameters, one row per position, updated by backpropagation like any other parameter ([Devlin et al., 2019](./14-appendix-a-further-reading.md#devlin-et-al-2019) for BERT; [Hugging Face, GPT-2 model documentation](./14-appendix-a-further-reading.md#hugging-face-gpt-2-model-documentation) for GPT-2):

$$\mathbf{X}_{\text{input}} = \mathbf{X} + \mathbf{PE}[0{:}n, :]$$

This is simpler than the sinusoidal scheme and works comparably well: the original paper found nearly identical results with the two ([Vaswani et al., 2017](./14-appendix-a-further-reading.md#vaswani-et-al-2017)). Its key limitation is rigidity: the model can only handle sequences up to length $n_{\max}$, the number of rows in $\mathbf{PE}$. There is no row for position $n_{\max} + 1$, so the model cannot process sequences longer than it was trained on without retraining or re-initializing those positional embeddings.

For models that need long-context support, learned absolute embeddings are a poor fit, which is one reason modern open-weights models have moved to the rotary encoding described next. For a survey of positional encodings, see [Weng (2023)](./14-appendix-a-further-reading.md#weng-2023).

## 9. Rotary Position Embeddings (RoPE)

RoPE, introduced by [Su et al. (2021)](./14-appendix-a-further-reading.md#su-et-al-2021), takes a fundamentally different approach: instead of adding a position vector to the token embedding, it rotates the query and key vectors inside the attention mechanism by an angle proportional to position. Most recent open-weights decoder LLMs use it, including LLaMA ([Touvron et al., 2023](./14-appendix-a-further-reading.md#touvron-et-al-2023)), Mistral ([Mistral 7B configuration](./14-appendix-a-further-reading.md#mistral-7b-configuration)), Qwen ([Qwen Team, 2024](./14-appendix-a-further-reading.md#qwen-team-2024)), Gemma ([Gemma Team, 2024](./14-appendix-a-further-reading.md#gemma-team-2024)) and DeepSeek ([DeepSeek-AI, 2024](./14-appendix-a-further-reading.md#deepseek-ai-2024), in a decoupled form).

### The 2D intuition

In this section, to match the RoPE paper, vectors are written as columns. Consider just two dimensions of a vector at a time. A 2D vector can be rotated by an angle $\theta$ using the standard rotation matrix:

$$R(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$$

RoPE gives every position its own rotation. If the query vector at position $m$ is $\mathbf{q}$ and the key vector at position $n$ is $\mathbf{k}$, RoPE turns them by the angles $m\theta$ and $n\theta$ respectively, where $\theta$ is a fixed angle, so each step along the sequence turns a vector by another $\theta$:

$$\mathbf{q}'_m = R(m\theta)\,\mathbf{q}, \qquad \mathbf{k}'_n = R(n\theta)\,\mathbf{k}$$

### A concrete example

Attention scores a query against a key with their dot product, so that is the number to watch. To keep the arithmetic exact, take a large angle, $\theta = 90^\circ$ per position (real models use much smaller ones), so that position 1 turns a vector by $90^\circ$, position 2 by $180^\circ$ and position 3 by $270^\circ$. Let $\mathbf{q} = (2, 1)$ and $\mathbf{k} = (1, 2)$ be the query and key vectors of two neighbouring words, where $(x, y)$ is shorthand for the column vector with entries $x$ and $y$. A turn of $90^\circ$ sends $(x, y)$ to $(-y, x)$; a turn of $180^\circ$ flips both signs; and a turn of $270^\circ$ sends $(x, y)$ to $(y, -x)$.

Say the two words sit at positions 1 and 2. Then

$$\mathbf{q}'_1 = R(90^\circ)\,\mathbf{q} = (-1, 2), \qquad \mathbf{k}'_2 = R(180^\circ)\,\mathbf{k} = (-1, -2),$$

$$\mathbf{q}'_1 \cdot \mathbf{k}'_2 = (-1)(-1) + (2)(-2) = -3.$$

Now add one more word in front of them, so that the same two words sit at positions 2 and 3. Their query and key vectors are unchanged; only the rotations differ:

$$\mathbf{q}'_2 = R(180^\circ)\,\mathbf{q} = (-2, -1), \qquad \mathbf{k}'_3 = R(270^\circ)\,\mathbf{k} = (2, -1),$$

$$\mathbf{q}'_2 \cdot \mathbf{k}'_3 = (-2)(2) + (-1)(-1) = -3.$$

Both rotated vectors changed, but the attention score is $-3$ both times. The two words are still one position apart, and that distance is all the score sees.

![Two panels showing a query and a key rotated by 90 degrees per position, at positions 1 and 2 and then at positions 2 and 3, with a dot product of minus 3 in both](figures/rope-rotation.pdf)

*Figure: The same query and key (dashed), rotated for positions 1 and 2 and then for positions 2 and 3. With $\theta = 90^\circ$ per position, position $m$ turns a vector by $m \cdot 90^\circ$: $90^\circ$, $180^\circ$ and $270^\circ$ for positions 1, 2 and 3. All four rotated vectors differ, but each pair is one position apart, and the dot product is $-3$ in both.*

### Why only the distance matters

Turning the query by $m\theta$ and the key by $n\theta$ gives the same dot product as leaving the query alone and turning only the key by the difference, $(n-m)\theta$:

$$\mathbf{q}'_m \cdot \mathbf{k}'_n = \mathbf{q}^\top R\bigl((n-m)\theta\bigr)\,\mathbf{k}$$

In the example, turning $\mathbf{k}$ by $90^\circ$ gives $(-2, 1)$, whose dot product with $\mathbf{q} = (2, 1)$ is $-4 + 1 = -3$, matching both pairs. So the score depends on the relative position $n - m$, not on the absolute positions $m$ and $n$ ([Biderman et al., 2021](./14-appendix-a-further-reading.md#biderman-et-al-2021)). This is exactly the property we want: attention should care about how far apart two tokens are, not where they sit in the absolute sequence.

### Extending to $d_k$ dimensions

For a head dimension of $d_k$, RoPE pairs up the dimensions $(0, 1), (2, 3), (4, 5)$ and so on, and applies a separate 2D rotation to each pair, with a different frequency for each pair ([Su et al., 2021](./14-appendix-a-further-reading.md#su-et-al-2021)):

$$\theta_i = 10000^{-2i/d_k}, \qquad i = 0, 1, \dots, d_k/2 - 1$$

The full rotation matrix at position $m$, applied to a $d_k$-dimensional vector, is block-diagonal, with each $2 \times 2$ block being $R(m\theta_i)$:

$$\mathbf{R}_m = \operatorname{blockdiag}\bigl(R(m\theta_0),\ R(m\theta_1),\ \dots,\ R(m\theta_{d_k/2-1})\bigr)$$

Just as in sinusoidal encoding, the lowest-index pair rotates fastest ($\theta_0 = 1$ radian per position) and the highest-index pair rotates slowest ($\theta_{d_k/2-1} \approx 10000^{-1}$ radians per position).

### Where RoPE is applied

Unlike the sinusoidal and learned encodings, RoPE adds nothing to the input: the matrix that enters the first block is just the token embeddings $\mathbf{X}$, which is why a RoPE model's embedding module does no positional encoding. Position enters inside every attention layer, to $\mathbf{Q}$ and $\mathbf{K}$ after their linear projections but before the dot product. The value matrix $\mathbf{V}$ is not rotated. Schematically:

```python
Q = X @ W_Q                      # ordinary projection
K = X @ W_K                      # ordinary projection
V = X @ W_V                      # ordinary projection

Q_rot = apply_rope(Q)            # rotate each row by its position's angle
K_rot = apply_rope(K)            # rotate each row by its position's angle

scores = Q_rot @ K_rot.T / sqrt(d_k)
weights = softmax(scores)
output = weights @ V             # V is NOT rotated
```

Everything else in attention is unchanged: the scaling, the softmax, the causal mask and the weighted sum over $\mathbf{V}$. Because $\mathbf{V}$ is not rotated, the output is an ordinary weighted sum of values, and position affects only which values get which weights.

### Where the angles come from

Attention does not have to work out the rotation angles; two fixed things determine them. The first is each token's position index, $m = 0, 1, 2, \dots$, its place in the sequence, which the model's code supplies alongside the token IDs. The second is the frequency $\theta_i = 10000^{-2i/d_k}$ of each pair, which depends only on the head dimension $d_k$ and a chosen base (10000 in [Mistral 7B's configuration](./14-appendix-a-further-reading.md#mistral-7b-configuration)). The angle for pair $i$ of the token at position $m$ is $m\theta_i$. The cosine and sine values are computed once, not learned, and every layer reuses them. Nothing about position is carried from layer to layer; each layer applies the rotation afresh.

### Efficient implementation

In practice we don't construct the block-diagonal rotation matrix; we apply each 2D rotation directly. For a query vector $\mathbf{q}$ at position $m$, the standard implementation ([Su et al., 2021](./14-appendix-a-further-reading.md#su-et-al-2021)) is

$$q'_{2i} = q_{2i}\cos(m\theta_i) - q_{2i+1}\sin(m\theta_i)$$

$$q'_{2i+1} = q_{2i}\sin(m\theta_i) + q_{2i+1}\cos(m\theta_i)$$

Computed in vectorized form, this is two element-wise multiplies and one add, which is very cheap, because the $\cos(m\theta_i)$ and $\sin(m\theta_i)$ values come straight from that precomputed table.

### Why RoPE is so widely used

- **Relative position is encoded naturally.** As shown above, the attention score depends only on the offset $n - m$. The model never has to learn how to turn absolute positions into relative distances.
- **Context can be extended.** With learned absolute embeddings, positions beyond the training length simply don't exist. With RoPE, the rotation angle for position $n_{\text{train}} + k$ is still well defined, but a model trained with RoPE extrapolates only modestly beyond its training length on its own ([Press et al., 2021](./14-appendix-a-further-reading.md#press-et-al-2021)). Methods that change how positions map to rotations extend the context window of a trained model: position interpolation ([Chen et al., 2023](./14-appendix-a-further-reading.md#chen-et-al-2023)) rescales positions to fit the original range, and YaRN ([Peng et al., 2023](./14-appendix-a-further-reading.md#peng-et-al-2023)) builds on NTK-aware scaling of the RoPE frequencies.
- **It is applied at every layer, not just at the input.** Sinusoidal and learned positional embeddings are added to $\mathbf{X}$ before the first layer. RoPE acts inside every attention layer's $\mathbf{Q}$ and $\mathbf{K}$, so positional information is freshly injected at every layer.
- **It adds no trainable parameters.** The rotation angles are fixed functions of position and dimension.
