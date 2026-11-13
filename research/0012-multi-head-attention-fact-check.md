# 0012 — Multi-head attention fact-check

- **Date:** 2026-11-10
- **Status:** Current
- **Question:** Which of the source PDF's claims about multi-head attention (head specialization, Llama and Mistral head counts, MQA and GQA) hold up, and which papers and text pages can the transformers guide cite for them (no video)?

---

## Research summary

**Bottom line:** All five claim groups check out, with one caveat. For Voita 2019 and Clark 2019 the "previous-token" evidence is positional heads (attention at offset −1 or +1) in an NMT encoder and in BERT, not a named "previous-token head". The Olsson paper is the one that names previous-token and induction heads.

**Recommendation:**

- Cite Clark 2019 for "some heads attend to the previous or next token".
- Cite Voita 2019 for "a few specialized heads (positional, syntactic, rare-token) matter most and the rest can be pruned".
- Cite Olsson 2022 for "induction heads", and say the evidence is causal in small attention-only models and correlational in large ones.
- Avoid "all heads specialize": Clark 2019 says heads often just attend to [SEP] or the whole sentence.
- Cite Llama 2 head counts to the Hugging Face configs, not the paper (its Table 1 has no layer, width or head counts).

**Key findings** (quotes come from ar5iv/arXiv renderings read through a summarising tool, which truncates quotes; re-check verbatim wording against the papers):

1. **Head specialization.**
   - Voita, Talbot, Moiseev, Sennrich & Titov, "Analyzing Multi-Head Self-Attention: Specialized Heads Do the Heavy Lifting, the Rest Can Be Pruned", ACL 2019, arXiv:1905.09418 (high on title and ID). NMT Transformer encoder only. Important heads are positional (≥ 90% of maximum attention at a fixed offset, usually −1 or +1), syntactic, or rare-word. "Pruning 38 out of 48 encoder heads results in a drop of only 0.15 BLEU" (English–Russian WMT). It shows no induction or copying heads.
   - Clark, Khandelwal, Levy & Manning, "What Does BERT Look At? An Analysis of BERT's Attention", BlackBoxNLP 2019, arXiv:1906.04341 (high). Four heads put well over 50% of their attention on the previous token and five on the next token; over half of BERT's attention in layers 6–10 goes to [SEP]; "there is no single attention head that does well at syntax 'overall'". BERT is an encoder.
   - Olsson et al., "In-context Learning and Induction Heads", Transformer Circuits Thread, 2022, arXiv:2209.11895 (high). An induction head finds an earlier instance of the current token, attends to the token that followed it, and boosts that token ([A][B] … [A] → [B]); a previous-token head is the first half of that circuit. Evidence is causal (ablation) in small attention-only models and correlational in larger ones; the authors call it "circumstantial" for large models. The paper does not claim entity-copying heads as such.
2. **Llama 2** (arXiv:2307.09288). "Bigger models — 34B and 70B — use Grouped-Query Attention (GQA)." The paper's Table 1 gives no layer, width or head counts. From the Hugging Face configs (NousResearch mirrors; Meta's repo is gated; high for 13B and 70B, medium-high for 7B): 7B has 32 layers, d_model 4096, 32 query heads and 32 KV heads; 13B has 40 layers, 5120, 40 and 40; 70B has 80 layers, 8192, 64 and 8. The 34B was announced but not released.
3. **Llama 3 and Mistral.** Llama 3 (arXiv:2407.21783): "We use grouped query attention (GQA) with 8 key-value heads"; Table 3: 8B has 32 layers, d_model 4096, 32 query heads, 8 KV heads; 70B has 80, 8192, 64, 8; 405B has 126, 16384, 128, 8 (table read through a summariser: medium-high). Mistral 7B (arXiv:2310.06825, Table 1 and the HF config): 32 query heads, 8 KV heads, head_dim 128 (high).
4. **MQA and GQA.** Shazeer, "Fast Transformer Decoding: One Write-Head is All You Need", arXiv:1911.02150 (high): incremental decoding is slow because of memory bandwidth for the keys and values; sharing them across heads makes decoding much faster at a minor quality loss ("seems to be slightly worse than the baseline"). Ainslie et al., "GQA", EMNLP 2023, arXiv:2305.13245 (high on abstract): MQA "drastically speeds up decoder inference"; it "can lead to quality degradation and training instability" (a claim of the GQA paper, not of Shazeer's); "uptrained GQA achieves quality close to multi-head attention with comparable speed to MQA".
5. **Vaswani et al. 2017, section 3.2.2.** "With a single attention head, averaging inhibits this." was confirmed verbatim; the first sentence matches from memory but was returned truncated after "subspaces". W^O has shape (h·d_v) × d_model; W_i^Q and W_i^K are d_model × d_k.

**Caveats:**

- The fetch tool could not parse PDFs and truncates quotes: re-check any verbatim quote.
- The Llama 2 numbers come from configs, not the paper; cite them as such.
- The microsecond and perplexity figures from Shazeer's tables and the GQA table were read through a summariser (medium); prefer the abstracts.
