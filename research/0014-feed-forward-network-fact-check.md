# 0014 — Feed-forward network fact-check

- **Date:** 2026-11-14
- **Status:** Current
- **Question:** Which of the source PDF's claims about the position-wise feed-forward network (structure, GELU/Swish, GLU variants, SwiGLU, parameter share) hold up, and which papers can the transformers guide cite for them (no video)?

---

## Research summary

**Bottom line:** Nearly every claim holds. Three need fixing: SiLU credit (Hendrycks & Gimpel 2016 defined it before Elfwing 2017 and Ramachandran 2017), "FFN holds 2/3 of parameters" (true only for the 4× two-matrix layer with full multi-head attention, not for Llama 2 70B), and "attention-only is much weaker" (Dong et al. prove rank collapse under assumptions, not a performance gap).

**Recommendation:** Credit SiLU to Hendrycks & Gimpel 2016 and say Ramachandran 2017 renamed it Swish. State the 2/3 figure per layer with the layer type and config named. Phrase Dong et al. as "pure attention (no skips, no MLP) provably collapses toward rank 1; skips and MLPs counteract it". Phrase Geva et al. as a hypothesis with partial evidence.

**Key findings** (read via ar5iv and Hugging Face configs; PDFs were unreadable):

1. **Vaswani 2017 (arXiv 1706.03762): confirmed.** Eq. 2 is FFN(x)=max(0,xW1+b1)W2+b2; d_model=512, d_ff=2048; "different parameters from layer to layer".
2. **GELU/SiLU (arXiv 1606.08415): confirmed.** x·Φ(x); tanh constants 0.044715 and √(2/π); the paper also defines SiLU x·σ(x). Elfwing et al. 2017 (arXiv 1702.03118, not fetched) and Ramachandran et al. 2017 (arXiv 1710.05941, Swish with free β, found by automated search) came later. "Ramachandran proposed x·sigmoid(x)" is wrong.
3. **Dauphin 2017 (arXiv 1612.08083): confirmed.** GLU h(X) = (X*W+b) ⊗ σ(X*V+c).
4. **Shazeer 2020 (arXiv 2002.05202): confirmed.** Biases omitted; "The GEGLU and SwiGLU variants produce the best perplexities"; closing sentence "we attribute their success, as all else, to divine benevolence." The variant list is from memory.
5. **SwiGLU users:** PaLM, Llama 1 ("dimension of 2/3 4d instead of 4d as in PaLM"), Llama 2, Llama 3 confirmed. Mistral 7B's paper does not mention SwiGLU, so the guide does not claim it. Llama 2 7B: hidden 4096, intermediate 11008; 70B: hidden 8192, intermediate 28672, 8 KV heads (HF configs).
6. **Geva 2021 (arXiv 2012.14913): overstated if presented as settled.** One model, one annotator per key, value agreement weak (about 3.5% top-token match from layer 11 on). Say "evidence consistent with".
7. **Dong 2021 (arXiv 2103.03404): overstated as a general claim.** Rank collapse of pure attention under weight-norm assumptions; skips and MLPs counteract it; no direct performance claim.
8. **FFN share:** Kaplan 2020 (arXiv 2001.08361) N ≈ 12·L·d_model² gives 8/12 = 2/3 for d_ff = 4d. Computed here: original encoder layer 2.10M vs 1.05M; Llama 2 7B 135.3M vs 67.1M (67%); Llama 2 70B 704.6M vs 151.0M (82%); original decoder layer 1/2.

**Not verified:** BERT/GPT-2 using GELU (from memory, uncited in the guide), Llama 2 having no biases (only the HF config says so), critiques of Geva.

**Sources:** the arXiv pages above; https://huggingface.co/NousResearch/Llama-2-70b-hf/raw/main/config.json.
