# 0016 — Model size table check

- **Date:** 2026-11-17
- **Status:** Current
- **Question:** Are the layer, width, head and parameter numbers in the source PDF's table of model sizes (original Transformer, BERT, GPT-2, GPT-3, Llama 2 and 3) correct, and can the transformers guide cite them (no video)?

---

## Research summary

**Bottom line:** Every architecture number is confirmed. Only wording needs care: GPT-2's paper counts (117M, 345M, 762M, 1542M) were later called wrong by OpenAI, and "width grows faster than depth" is a description of some families, not a law.

**Recommendation:** Use the numbers as given. Write GPT-2 small as 124M and say the paper's 117M was a miscount. Say Llama 3 70B's vocabulary is 128,000 in the paper and 128,256 in the Hugging Face config. Cite Kaplan et al. for "loss depends very weakly on depth versus width at a fixed parameter count" instead of claiming width grows faster.

**Key findings** (tables read from page images, so spot-check any verbatim quote):

1. **Original Transformer** (arXiv 1706.03762, Table 3): base 6 layers, d_model 512, d_ff 2048, 8 heads, 65M; big 6, 1024, 4096, 16, 213M. N is the layer count of each of the encoder and decoder.
2. **BERT** (arXiv 1810.04805, §3): base L=12, H=768, A=12, 110M; large 24, 1024, 16, 340M; feed-forward size 4H.
3. **GPT-2:** HF configs give 12/768/12 and 48/1600/25; d_ff is the library default 4 × n_embd. The paper's Table 2 lists 117M, 345M, 762M, 1542M; the OpenAI repository says those counts were wrong (https://github.com/openai/gpt-2). The Hugging Face card says 124M for small.
4. **GPT-3** (arXiv 2005.14165, Table 2.1): 96 layers, d_model 12288, 96 heads, 175.0B; d_ff = 4 × d_model by the text, so 49152 (derived, not printed).
5. **Llama:** 2 7B is 32/4096/32/11008, untied; 2 70B is 80/8192/64 (8 KV)/28672; Llama 3 70B (arXiv 2407.21783, Table 3) is the same shape. Exact Llama 2 7B count recomputed as 6,738,415,616 (matches Hugging Face). Configs read from the NousResearch mirrors, as the official repositories are gated.
6. **Width versus depth** (Kaplan et al., arXiv 2001.08361): "depends very weakly on other architectural hyperparameters such as depth vs. width"; N ≈ 12·n_layer·d_model². Llama 3 8B to 405B grows about 3.9× in depth and 4× in width.

**Not verified:** GPT-2 medium, large and XL corrected counts (secondary sources only); the Llama 2 70B total was not recomputed.
