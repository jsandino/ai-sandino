# 0011 — Positional-encoding fact-check

- **Date:** 2026-11-04
- **Status:** Current
- **Question:** Which of the source PDF's claims about sinusoidal, learned and rotary (RoPE) positional encodings hold up, and which papers and text pages can the transformers guide cite for them (no video)?

---

## Research summary

**Bottom line:** The recalled claims check out, but three need care. (1) Press et al. group RoPE with sinusoidal as methods that degrade past the training length, although RoPE extrapolates a little further. (2) The Mistral 7B paper never mentions RoPE; use its Hugging Face config instead. (3) "Most open-weights models use RoPE" is fair for 2023–26 decoder LLMs but is a generalisation with no survey behind it.

**Recommendation:** Cite the arXiv abstract URLs below. Soften "most" to "most recent open-weights decoder LLMs, e.g. LLaMA, Mistral, Qwen, DeepSeek, Gemma"; name BLOOM and MPT (ALiBi) and BERT, GPT-2 and OPT (learned) as the exceptions. For permutation equivariance, say "this follows from the structure of attention", and cite Lee et al. only as a source that states that a self-attention block is equivariant.

**Key findings** (quotes come from ar5iv renderings read through a summarising tool; re-check verbatim wording against the PDFs):

1. **Vaswani et al. 2017** (<https://ar5iv.labs.arxiv.org/html/1706.03762>; high). Authors: Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin. §3.5: "The wavelengths form a geometric progression from 2π to 10000⋅2π." The authors "hypothesized it would allow the model to easily learn to attend by relative positions" (for any fixed offset k, PE_{pos+k} is a linear function of PE_pos). They "found that the two versions produced nearly identical results" for learned versus sinusoidal (Table 3, row E). Formula confirmed.
2. **Press, Smith & Lewis, "Train Short, Test Long" (ALiBi)**, ICLR 2022, arXiv:2108.12409 (<https://arxiv.org/abs/2108.12409>; high on quotes). Sinusoidal: "have very weak extrapolation abilities"; it "cannot extrapolate to more than a few dozen tokens beyond" the training length. RoPE: "improves perplexity with up to k=200 (k=100) more tokens than it saw during training", at a cost in speed; Figure 1: "current position methods (sinusoidal, rotary, and T5) show degraded perplexity". Write "extrapolates only modestly", not "cannot extrapolate".
3. **RoPE context extension** (high). Chen, Wong, Chen & Tian, "Extending Context Window of Large Language Models via Positional Interpolation", arXiv:2306.15595 (27 Jun 2023): direct extrapolation "may lead to catastrophically high attention scores"; the fix is to "directly down-scale the position indices so that the maximum position index matches the previous context window limit", plus about 1000 steps of fine-tuning. Peng, Quesnelle, Fan & Shippole, "YaRN: Efficient Context Window Extension of Large Language Models", arXiv:2309.00071 (31 Aug 2023): direct extrapolation "does not perform well"; NTK-aware scaling changes the RoPE base ("scaling high frequencies less and low frequencies more") and was introduced in a Reddit post that YaRN cites (not fetched); YaRN adds NTK-by-parts and an attention temperature.
4. **RoFormer** (Su, Lu, Pan, Murtadha, Wen & Liu), arXiv:2104.09864; Neurocomputing 568 (2024), article 127063 (medium-high; the ScienceDirect page returned 403). §3.2.2 defines θ_i = 10000^{-2(i-1)/d}, i = 1..d/2 (the paper is inconsistent on indexing elsewhere). "RoPE naturally incorporates relative position information through rotation matrix product." It argues the inner product decays with relative distance, by a bound, not a proof.
5. **Text pages.** Alammar, *The Illustrated Transformer* (<https://jalammar.github.io/illustrated-transformer/>, 27 Jun 2018) describes the sine and cosine positional encoding; it has no RoPE. Weng's *The Transformer Family* (7 Apr 2020) is superseded by *The Transformer Family Version 2.0* (<https://lilianweng.github.io/posts/2023-01-27-the-transformer-family-v2/>, 27 Jan 2023), whose positional-encoding section covers sinusoidal, learned, relative and rotary encodings. EleutherAI's *Rotary Embeddings: A Relative Revolution* (<https://blog.eleuther.ai/rotary-embeddings/>, 20 Apr 2021; Biderman, Black, Foster, Gao, Hallahan, He, Wang & Wang) derives a rotation whose query-key dot product depends only on the relative offset; it does not mention NTK, YaRN or interpolation.
6. **Implicit position and equivariance.** Haviv, Ram, Press, Izsak & Levy, "Transformer Language Models without Positional Encodings Still Learn Positional Information", Findings of EMNLP 2022, arXiv:2203.16634 (<https://aclanthology.org/2022.findings-emnlp.99/>; high): causal LMs without explicit positional encoding stay competitive and learn an implicit notion of absolute position; the authors conjecture causal attention lets a token infer how many tokens precede it. Lee et al., "Set Transformer", arXiv:1810.00825, states that a self-attention block is permutation equivariant. No source was found stating equivariance in exactly these words for plain multi-head self-attention without a causal mask; it follows from the definition. With a causal mask the model is not equivariant.
7. **Which models use which scheme.**
   - BERT: learned absolute position embeddings (Devlin et al., arXiv:1810.04805, §3; high).
   - GPT-2: learned absolute (HF config `n_positions` = 1024; HF docs: "GPT-2 uses absolute position embeddings"; high).
   - LLaMA: "We remove the absolute positional embeddings, and instead, add rotary positional embeddings (RoPE)" (arXiv:2302.13971, §2.2; high).
   - Mistral 7B: the paper never mentions RoPE; the HF config has `rope_theta` = 10000 (<https://huggingface.co/mistralai/Mistral-7B-v0.1/raw/main/config.json>; high).
   - Qwen2.5 (arXiv:2412.15115): "Rotary Positional Embeddings (RoPE, Su et al. 2024)" (high).
   - DeepSeek-V2 (arXiv:2405.04434) and V3 (arXiv:2412.19437): decoupled RoPE keys in multi-head latent attention, with YaRN in V3; RoPE is applied only to a small decoupled slice (high).
   - Gemma (arXiv:2403.08295): "we use rotary positional embeddings in each layer" (high; the HF config returned 401).
   - Not RoPE: BLOOM (ALiBi, arXiv:2211.05100; high) and MPT-7B (ALiBi, per Databricks' 5 May 2023 blog; high); OPT's learned positions and Falcon's scheme were not verified; GPT-NeoX-20B uses RoPE on 25% of dimensions (arXiv:2204.06745).
   - "Most open-weights models use RoPE" is plausible for modern decoder LLMs, but no survey quantifies "most".

**Caveats:**

- Not verified: Vaswani's NeurIPS venue (from memory), YaRN's ICLR 2024 venue, BERT's NAACL 2019 venue, the GPT-2 paper text, OPT and Falcon positional schemes, the Gemma config and the Reddit NTK post itself. Newer models (Llama 4, Gemma 2/3 and others) were not checked.
- Quotes may be paraphrased by the summarising tool; check verbatim wording against the PDFs before quoting, especially Vaswani's linear-function sentence and the Press et al. section quotes.
