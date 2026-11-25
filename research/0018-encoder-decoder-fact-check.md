# 0018 — Encoder–decoder and decoder-only fact-check

- **Date:** 2026-11-20
- **Status:** Current
- **Question:** Are the claims in the source PDF's chapter on encoder–decoder versus decoder-only models (the original design, cross-attention, the three families, and why decoder-only became dominant) correct, and can the transformers guide cite them (no video)?

---

## Research summary

**Bottom line:** The architecture facts are all confirmed. The history is overclaimed: "after GPT-3, decoder-only displaced both" and "encoder-only models with masked language modelling scaled less well" have no primary source, and the controlled comparisons are mixed.

**Recommendation:** Keep the architecture facts as written. Say decoder-only models became the dominant architecture for general-purpose language models, not that they displaced the other two. Do not state that encoder-only models scaled less well. Say "can be prompted to do many tasks", not "all tasks". Present the comparisons as mixed, with their scale and setting.

**Key findings:**

1. **Original Transformer** (Vaswani et al. 2017, §3.1, §3.2.3, Figure 1; read from the PDF): the encoder has 6 identical layers of self-attention and a position-wise feed-forward network; the decoder has 6 layers with a third sub-layer that "performs multi-head attention over the output of the encoder stack"; in encoder–decoder attention "the queries come from the previous decoder layer, and the memory keys and values come from the output of the encoder", so every decoder position attends over all input positions; decoder self-attention is masked. The paper never masks cross-attention (true by implication, not by an explicit sentence). One arrow from the top of the encoder feeds the decoder, so each layer uses the same final encoder output (a reading of the figure and text).
2. **Shapes and decoding.** The rectangular score matrix (n_tgt × n_src) follows from the paper's equation; the paper does not state the dimensions. Hugging Face documents that the decoder reuses the encoder output and that cross-attention keys and values are cached (the T5 documentation and the KV-cache guide); the implementation code was not read.
3. **Families.** Encoder–decoder: T5 (arXiv 1910.10683), BART (arXiv 1910.13461), Whisper (arXiv 2212.04356, "We chose an encoder-decoder Transformer"; audio in, text out). Encoder-only: BERT (arXiv 1810.04805, "a multi-layer bidirectional Transformer encoder"), RoBERTa, DeBERTa. Decoder-only: GPT-2, GPT-3 ("autoregressive", same architecture as GPT-2), Llama. T5Gemma (Google, 2025) converts decoder-only models to encoder–decoder, so the family is still in use.
4. **History and dominance.**
   - GPT-3 shows many tasks from a prompt with no fine-tuning, but it only matches a fine-tuned BERT-large on some benchmarks, so "strong on all tasks" is wrong. T5 already treats every task as text-to-text, so the single-objective argument is not unique to decoder-only models.
   - Wang et al. 2022 (arXiv 2204.05832, models above 5B parameters): causal decoder-only models trained with language modelling gave the best zero-shot results after unsupervised pretraining; non-causal models trained with masked language modelling and then multitask fine-tuned did best overall.
   - T5 found its encoder–decoder with a denoising objective best on its tasks; UL2 (arXiv 2205.05131) found encoder–decoders competitive but with about twice the parameters.
   - No source measures "encoder-only scaled less well". Encoder-only models cannot generate text, which is a different reason for less scaling effort.
   - "Simpler architecture" is true as a structural fact (no cross-attention sub-layer) but is an opinion as a cause of dominance.
5. **Training objectives.** BERT masks 15% of WordPiece tokens; T5 drops spans and replaces each with a sentinel token; BART reconstructs text corrupted by noising functions; GPT predicts the next token.
6. **Attention variants.** BERT: bidirectional, no mask; T5 and BART: bidirectional encoder, causal decoder with cross-attention; GPT-style: causal self-attention only.

**Not verified:** Llama 2 text, Flan-T5, mT5, NLLB, the PaLM claim that scale narrows the gap, the exact cross-attention caching code, and padding masks in cross-attention (documented only through the Hugging Face `attention_mask`). Paper quotes other than Vaswani and Wang et al. came through summarising fetches.

## Sources

- https://arxiv.org/abs/1706.03762, https://arxiv.org/abs/2204.05832, https://arxiv.org/abs/2207.10551, https://arxiv.org/abs/2205.05131
- https://arxiv.org/abs/1910.10683, https://arxiv.org/abs/1910.13461, https://arxiv.org/abs/2212.04356, https://arxiv.org/abs/1810.04805
- https://arxiv.org/abs/2005.14165, https://arxiv.org/abs/2510.26622
- https://developers.googleblog.com/en/t5gemma/
- https://huggingface.co/docs/transformers/en/kv_cache, https://huggingface.co/docs/transformers/en/model_doc/t5
