# 0017 — Output processing fact-check

- **Date:** 2026-11-19
- **Status:** Current
- **Question:** Are the claims in the source PDF's chapter on output processing (final normalization, unembedding, logits, softmax, training versus inference) correct, and can the transformers guide cite them (no video)?

---

## Research summary

**Bottom line:** One claim in the source is false and one needs softening. The source says training uses "only the prediction at the last relevant position"; every position is trained. It also says Llama "and most modern open-weights models" use independent embedding and unembedding matrices; small models tie them and large ones often do not. The rest (softmax with the loss, vocabulary sizes, final norm, shapes) is true with small caveats.

**Recommendation:** Write that every position predicts its next token and the loss averages over all of them, and that inference needs only the last row. Do not generalise about tying; Part II already names which models tie. Say the loss function takes logits and applies log-softmax internally. State the vocabulary range as roughly 32,000 (Llama 2) to 256,000 (Gemma), not "30,000–250,000". Do not claim a source gives a reason for the final norm beyond what it says.

**Key findings:**

1. **Weight tying.**
   - Vaswani et al. 2017, §3.4: the same weight matrix is shared between the two embedding layers and the pre-softmax linear transformation.
   - Press and Wolf (arXiv 1608.05859) and Inan et al. (arXiv 1611.01462) report tying lowers perplexity and removes parameters; not verified for modern large models.
   - `tie_word_embeddings`: Llama 2 7B false (library default; official repository gated), Llama 3 8B false, Llama 3.2 1B and 3B true, Qwen2.5-0.5B true, Qwen2.5-7B false, Mistral 7B false; Gemma 1 and 2 tie (papers). GPT-2's config omits the key, and no primary source states the tying.
   - "Small models tie, large ones often do not" is usable; the reason (the embedding is a large share of a small model) is an inference, not a source claim.
2. **Training versus inference.** The Hugging Face `LlamaForCausalLM` documentation describes `labels` as shifted internally so that `labels[..., 1:]` are used to predict `logits[..., :-1, :]`, with logits of shape (batch, sequence, vocabulary): every position gets a loss. For generation, `logits_to_keep` notes that only the last token's logits are needed. "Averaged over positions" is the default cross-entropy reduction, confirmed only indirectly.
3. **Softmax and the loss.** PyTorch `CrossEntropyLoss` takes unnormalized logits and, for class-index targets, is equivalent to LogSoftmax followed by NLLLoss. The `log_softmax` page calls softmax followed by log "slower and numerically unstable" without saying why. No PyTorch page states "subtract the max"; the algebra is in Part I and the log-sum-exp form is on Wikipedia.
4. **Vocabulary sizes.** GPT-2 50,257; Llama 2 32,000; Llama 3 128,256 (config; about 128K in the paper); Gemma 256,000 in the configs (256,128 in the Gemma 1 paper's Table 1); the original Transformer about 37,000 shared BPE tokens (WMT 2014 English–German).
5. **Final normalization.**
   - GPT-2 §2.3: "an additional layer normalization was added after the final self-attention block" (read from the PDF).
   - Xiong et al. 2020 describe the Pre-LN Transformer as using a final layer normalization before prediction, and show the input scale to it grows with depth. That is a statement about gradients, not a stated reason for the head, so the guide only says the stream's scale can grow with depth (Part VII).
   - Llama 2's paper does not mention a final norm; the Hugging Face implementation applies one at the end of `LlamaModel.forward`.
6. **Shapes.** Hugging Face `LlamaForCausalLM` uses `nn.Linear(hidden_size, vocab_size, bias=False)`, so logits = Z U with U of shape d_model × V after transposition and no bias.

**Not verified:** the Llama 3.2 1B value was not re-read from a file; official Meta and Google configs are gated (values from mirrors and papers); "averaged over positions" is the default reduction, not read from the loss code.

## Sources

- https://arxiv.org/abs/1706.03762, https://arxiv.org/abs/1608.05859, https://arxiv.org/abs/1611.01462
- https://huggingface.co/docs/transformers/model_doc/llama2
- https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html
- https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.log_softmax.html
- https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- https://arxiv.org/abs/2002.04745, https://arxiv.org/abs/2307.09288
- Earlier notes: [0010](0010-tied-embeddings-bias-model-numbers.md), [0016](0016-model-size-table-check.md)
