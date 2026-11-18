# 0015 — Residuals and normalization fact-check

- **Date:** 2026-11-17
- **Status:** Current
- **Question:** Which of the source PDF's claims about residual connections, LayerNorm, RMSNorm and Pre-LN versus Post-LN hold up, and which papers can the transformers guide cite for them (no video)?

---

## Research summary

**Bottom line:** Most claims hold. Four need fixing: Pre-LN does *not* keep the residual stream's variance bounded (it grows with depth), "every modern open LLM uses pre-norm" is overstated (Gemma 2, OLMo 2), the claim that the residual-stream view explains tied embeddings has no support, and "training GPT-3 without residuals would be essentially impossible" has no source.

**Recommendation:** Say Pre-LN stabilises gradients at initialization but the stream's variance and norm grow with depth. Write "most use pre-norm, with variants such as Gemma 2 and OLMo 2". Drop the tied-embeddings sentence (see [0010](0010-tied-embeddings-bias-model-numbers.md)). Say deep stacks without residuals are "much harder" to train. Put ε inside the square root in RMSNorm, as implementations do. Count Llama 2 7B's norm parameters as RMSNorm: (2 × 32 + 1) × 4096 = 266,240.

**Key findings** (read via ar5iv, arXiv abstracts and Hugging Face source; quotes should be re-checked against the PDFs):

1. **He et al. 2015 (arXiv 1512.03385):** layers reformulated as learning residual functions; "easier to optimize". Vaswani 2017 gives no rationale for residuals; it notes d_model = 512 "to facilitate these residual connections".
2. **He et al. 2016 (arXiv 1603.05027):** Eq. 5, the identity term; "the gradient of a layer does not vanish even when the weights are arbitrarily small". It addresses vanishing, not exploding, gradients.
3. **Elhage et al. 2021:** layers read from and write to the residual stream. Nothing about tied embeddings.
4. **Ba et al. 2016 (arXiv 1607.06450):** formula confirmed; reasons against batch norm: dependence on mini-batch size, awkward for RNNs, unusable online. PyTorch: ε = 1e-5, biased variance.
5. **Zhang & Sennrich 2019 (arXiv 1910.07467):** no ε and no bias in the paper's RMSNorm; "7%~64%" is the abstract's range (about 7–9% for the Transformer; the high end is an RNN-based model); hypothesis is re-scaling invariance matters, re-centering does not. HF `LlamaRMSNorm` puts ε (1e-6) inside the root, weight only.
6. **Xiong et al. 2020 (arXiv 2002.04745):** Post-LN gradients near the output are large at initialization; Pre-LN gradients are well behaved, which motivates removing warmup.
7. **Sun et al. 2025 (arXiv 2502.05795), Takase et al. 2022 (arXiv 2206.00330):** Pre-LN output variance grows with depth; deep layers contribute little.
8. **Exceptions to pre-norm:** Gemma 2 normalizes input and output of each sub-layer (arXiv 2408.00118); OLMo 2 normalizes attention and MLP outputs (arXiv 2501.00656).
9. **Llama:** HF code has `input_layernorm`, `post_attention_layernorm` per layer and a final norm; Llama 1 states it uses RMSNorm (arXiv 2302.13971).

**Not verified:** exact quote boundaries (PDFs unreadable by the fetch tool); which of Mistral 7B, Qwen, DeepSeek use RMSNorm and which models use LayerNorm (the guide names only Llama, Gemma 2 and OLMo 2); the authors of arXiv 2502.05795 as "Sun et al." (from memory); Command R parallel blocks (not cited).
