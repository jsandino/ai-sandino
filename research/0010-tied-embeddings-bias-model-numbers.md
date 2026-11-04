# 0010 — Tied embeddings, bias terms and model numbers: fact-check

- **Date:** 2026-11-03
- **Status:** Current
- **Question:** Is the transformers guide's claim that most newer open-weights models leave the embedding and unembedding matrices untied accurate? Does the LLaMA paper support the claim that bias terms are omitted and that this slightly improves performance? Are the guide's small numbers (Llama 3 8B has 32 layers, GPT-3 has 96, Llama 2 7B's vocabulary and size, Llama 3's vocabulary) right?

---

## Research summary

**Bottom line:** "In Llama, Mistral and most newer open-weights models the two are untied" is only half right. The big Llama, Mistral and Qwen2.5-7B+ models are untied, but Llama 3.2 1B/3B, Gemma 1 and 2, and Qwen2.5 0.5B/1.5B/3B are tied. The bias claim is mis-cited: the LLaMA paper never mentions removing biases, PaLM does, and Vaswani et al. (2017) used biases.

**Recommendation:**

- Tying: "Tying is a size trade-off, not a trend. The original Transformer, GPT-2 and Gemma tie the two matrices. Llama 2, Llama 3 8B, Mistral 7B and the larger Qwen2.5 models leave them separate, and small models such as Llama 3.2 1B/3B and Qwen2.5 0.5B tie them to save parameters." Drop "most newer open-weights models".
- Bias: re-cite to PaLM (Chowdhery et al. 2022, §2 "No Biases") and remove the LLaMA citation. Suggested wording: "Many modern LLMs drop the bias terms from linear layers (PaLM reports this increased training stability at large scale), although the original Transformer's FFN used biases b1 and b2." Drop "slightly improves performance in practice" unless sourced: PaLM claims stability, not accuracy.
- Numbers: all four hold. Use "about 6.7B" for Llama 2 7B, and say "about 128k (128,256 in the model config)" for Llama 3.

**Key findings:**

*Item 1, tying* (configs read from Hugging Face raw `config.json` files; mirrors noted):

- Vaswani et al. 2017, §3.4: "In our model, we share the same weight matrix between the two embedding layers and the pre-softmax linear transformation". The embeddings are also scaled by sqrt(d_model) (<https://ar5iv.labs.arxiv.org/html/1706.03762>; high).

| Model | Tied? | Evidence | Source |
|---|---|---|---|
| GPT-2 small | Tied (medium) | `tie_word_embeddings` absent from the config; relies on the library default and well-known GPT-2 behaviour | <https://huggingface.co/openai-community/gpt2/raw/main/config.json> |
| Llama 2 7B | Untied (high) | `false` | NousResearch mirror of `Llama-2-7b-hf`; HF LlamaConfig docs list default `False` |
| Llama 3 8B | Untied (high) | `false` | NousResearch mirror of `Meta-Llama-3-8B` |
| Llama 3.2 1B, 3B | Tied (high) | `true` | unsloth mirrors |
| Mistral 7B v0.1 | Untied (high) | `false` | <https://huggingface.co/mistralai/Mistral-7B-v0.1/raw/main/config.json> |
| Gemma 2B and 7B | Tied (high) | Paper: "we also share embeddings across our inputs and outputs to reduce model size"; HF GemmaConfig default `True` | <https://ar5iv.labs.arxiv.org/html/2403.08295>, <https://huggingface.co/docs/transformers/model_doc/gemma> |
| Gemma 2 (2B, 9B, 27B) | Tied (high) | Gemma 2 paper Table 1, row "Tied embedding" | <https://arxiv.org/html/2408.00118> |
| Qwen2.5 0.5B | Tied (high) | `true` | <https://huggingface.co/Qwen/Qwen2.5-0.5B/raw/main/config.json> |
| Qwen2.5 7B | Untied (high) | `false` | <https://huggingface.co/Qwen/Qwen2.5-7B/raw/main/config.json> |
| Qwen2.5 1.5B, 3B | Tied (high) | Qwen2.5 report Table 1 "Tie Embedding" | <https://arxiv.org/html/2412.15115> |
| Qwen2.5 14B, 32B, 72B | Untied (high) | Same Table 1 | <https://arxiv.org/html/2412.15115> |

- Verdict (high): not accurate as stated. Tying is common in small and mid-size models and untying in larger ones. The likely reason (inference, not a source claim): at small sizes the 128k–256k-entry embedding is a large share of the parameters.

*Item 2, bias terms:*

- LLaMA (Touvron et al. 2023): no statement about removing biases. "Bias" appears only in §5 "Bias, Toxicity and Misinformation"; §2.2 covers pre-normalization, SwiGLU and RoPE (high; <https://ar5iv.labs.arxiv.org/html/2302.13971>).
- PaLM, §2 "Model Architecture", paragraph "No Biases": "No biases were used in any of the dense kernels or layer norms", with the authors finding this increased training stability for large models (medium-high; the second half was paraphrased by the fetch tool, so check the exact wording against the PDF before quoting; <https://ar5iv.labs.arxiv.org/html/2204.02311>). The same section says "We share the input and output embedding matrices, which is done frequently (but not universally) in past work."
- Vaswani et al. 2017, eq. (2), §3.3: FFN(x) = max(0, xW1 + b1)W2 + b2, so the original FFN used biases (high).
- HF configs: Llama `attention_bias=False` and `mlp_bias=False` by default. Qwen2 attention uses QKV biases, not verified here; do not state it.

*Item 3, numbers* (all high):

- Llama 3 8B: 32 layers, model dimension 4096 (Llama 3 paper Table 3, <https://arxiv.org/html/2407.21783>; HF config).
- GPT-3 Table 2.1 (<https://ar5iv.labs.arxiv.org/html/2005.14165>): 125M 12 layers; 350M 24; 760M 24; 1.3B 24; 2.7B 32; 6.7B 32; 13B 40; 175B 96.
- Llama 2 7B: vocabulary 32000, hidden size 4096, 32 layers (HF config); the Llama 2 paper §2.2: "The total vocabulary size is 32k tokens."
- Llama 3 vocabulary: the paper says "100K tokens from the tiktoken tokenizer with 28K additional tokens"; the 8B config has `vocab_size` 128256. Say "about 128k (128,256 in the model config)". The 128000 + 256 split is an inference.

**Caveats:**

- PDFs did not parse; ar5iv and arXiv HTML renderings were read through a summarising fetch tool, so quoted text is only as reliable as the rendering. Re-check the PaLM "No Biases" sentence and the Gemma sentence against the PDFs before using exact quotes.
- Official `meta-llama` repos are gated, so the Llama configs come from ungated mirrors, assumed to match. The Gemma and GPT-2 configs omit `tie_word_embeddings`; the Gemma verdict rests on the paper plus the HF default, and Gemma 2 on paper Table 1 (no config fetched).
- "6.7B" parameters for Llama 2 7B is inferred: the LLaMA-1 paper Table 2 gives 6.7B for the same architecture, the Llama 2 paper says only "7B".
- Not verified: Llama 3.1/3.3, Phi, OLMo, DeepSeek, Mistral beyond 7B v0.1.
