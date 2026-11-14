# 0013 — Causal masking fact-check

- **Date:** 2026-11-13
- **Status:** Current
- **Question:** Which of the source PDF's claims about causal masking hold up (the −∞ mask, the finite-number note, the saving from skipping masked work, the shift-by-one training convention), and which papers and documentation pages can the transformers guide cite for them (no video)?

---

## Research summary

**Bottom line:** The mask mechanism and the PyTorch mask semantics are confirmed. Two source claims need rewording: the saving from skipping masked work is stated by FlashAttention-2 as a fraction of blocks and a speedup, not as "half the compute and memory", and the NaN risk of −∞ comes from rows that are *entirely* masked, which a causal mask never produces.

**Recommendation:**

- Quote Vaswani §3.2.3 directly; paraphrase the end of the §3.1 sentence about the output embeddings being offset by one position.
- Cite FlashAttention-2 (not FlashAttention) for skipping blocks above the diagonal, and say "about half the blocks" and "around 1.7–1.8× faster than attention without the causal mask".
- Cite the PyTorch `scaled_dot_product_attention` docs for the mask semantics. Do not cite the PyTorch forum for the NaN behaviour; state it as softmax arithmetic (all −∞ gives 0/0).
- State the shift-by-one convention in general terms, supported by Vaswani's "offset by one position".

**Key findings** (quotes come from ar5iv renderings read through a summarising tool, which returns fragments; re-check wording against the papers):

1. **Vaswani et al. 2017** (arXiv:1706.03762; ar5iv rendering). §3.2.3, verbatim: "masking out (setting to −∞) all values in the input of the softmax which correspond to illegal connections" (high). §3.1: "This masking, combined with fact that the output embeddings are offset by one position" (verbatim fragment, high); the sentence goes on to say that predictions for position i can depend only on the known outputs at positions less than i (from memory, medium; the paper's own typo "combined with fact").
2. **FlashAttention-2** (Dao, 2023, arXiv:2307.08691; high on the idea, medium on quote boundaries). For blocks where all column indices exceed the row indices, "we can skip the computation of that block"; these are "approximately half of the blocks for large sequence length"; skipping them "leads to around 1.7-1.8" speedup compared with attention without the causal mask; the mask need only be applied to one block per row. The causal-mask section says nothing about memory (the paper elsewhere says O(N) additional memory).
3. **FlashAttention** (Dao et al. 2022, arXiv:2205.14135). It does not discuss causal-block skipping in the text read; it describes a general mask that "sets some entries of the input to −∞" and skips zero blocks only for block-sparse attention. Attribute causal-block skipping to FlashAttention-2.
4. **PyTorch `scaled_dot_product_attention`** (docs v2.3, <https://docs.pytorch.org/docs/2.3/generated/torch.nn.functional.scaled_dot_product_attention.html>; high). A boolean `attn_mask`: "True indicates that the element should take part in attention". A float mask is "added to the attention score". `is_causal`: "assumes upper left causal attention masking". The pseudo-code fills masked positions with −∞. The page says nothing about NaN or fully masked rows.
5. **NaN.** The softmax of a row of all −∞ is 0/0 = NaN (the PyTorch forum shows `torch.full((5,), float("-inf")).softmax(dim=0)` returning NaN; low on current library behaviour). A causal mask always allows the diagonal, so it never masks a whole row; padding masks combined with it can.
6. **Shift-by-one convention.** In nanoGPT's `train.py`, `x = data[i:i+block_size]` and `y = data[i+1:i+1+block_size]`, so the target at position i is the token at i+1 (high; code). That position i may attend to itself follows from the lower-triangular mask. The Annotated Transformer and the GPT-2 paper did not load and were not verified.

**Caveats:**

- The fetch tool returns short fragments; check any quote against the primary source before printing it.
- The PyTorch docs read were v2.3; the NaN behaviour may differ in newer versions.
