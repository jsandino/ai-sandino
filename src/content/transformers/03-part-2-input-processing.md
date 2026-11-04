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
