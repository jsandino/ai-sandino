# 0008 — Karpathy's "Let's build the GPT Tokenizer": citation check

- **Date:** 2026-11-03
- **Status:** Current
- **Question:** Is Karpathy's "Let's build the GPT Tokenizer" (2024, YouTube) a real work, correctly cited, and what is needed to cite it completely? Does it cover what the transformers guide cites it for, and is there a better primary source?

---

## Research summary

**Bottom line:** The video is real and 2024 is correct (published 20 Feb 2024). The canonical URL is <https://www.youtube.com/watch?v=zduSFxRajkE>. The channel name, exact upload date and exact runtime could not be read from the YouTube page directly; those come from secondary sources.

**Recommendation:**

- Cite it as: Karpathy, A. (2024). "Let's build the GPT Tokenizer." YouTube. <https://www.youtube.com/watch?v=zduSFxRajkE>
- Optionally add the companion code: <https://github.com/karpathy/minbpe>
- The guide's claim that BPE was "introduced for tokenization by GPT-2" is inaccurate. Sennrich et al. (2015/2016) introduced BPE for subword tokenization in NMT; GPT-2 popularized byte-level BPE for LLMs.
- Add Sennrich et al. and the GPT-2 paper as the primary sources for the BPE claims. Keep Karpathy as the pedagogical source.

**Key findings:**

1. **Existence.** The video exists, titled "Let's build the GPT Tokenizer" (source: the YouTube page above, confidence: high). The URL is linked from the minbpe README (<https://github.com/karpathy/minbpe>, confidence: high).
2. **Channel.** Not confirmed from the YouTube page (the fetch returned only the title). It is attributed to Andrej Karpathy by Simon Willison's post (<https://simonwillison.net/2024/Feb/20/lets-build-the-gpt-tokenizer>) and by the minbpe README (confidence: medium).
3. **Date.** Published 20 Feb 2024 (source: Simon Willison's post above, confidence: medium-high; a secondary source). Search results describe it as lecture 8 of "Neural Networks: Zero to Hero" (confidence: medium).
4. **Length.** Simon Willison says "2 hour"; aggregators say about 2h13m. Not verified (confidence: low-medium).
5. **Companion repo.** <https://github.com/karpathy/minbpe> is a minimal byte-level BPE implementation: `minbpe/base.py`, `basic.py` (BasicTokenizer), `regex.py` (RegexTokenizer, with special tokens) and `gpt4.py` (GPT4Tokenizer, reproducing tiktoken's GPT-4 tokenizer), plus `train.py`, `tests/`, `exercise.md` and `lecture.md` (a text version of the lecture). MIT-licensed (the license is from search summaries, confidence: medium).
6. **Coverage of the guide's claims.**
   - BPE for LLM tokenization: covered (confidence: high).
   - Leading space as part of a token: the repo's `lecture.md` says whitespace is tokenized like any other character and gives " is" as an example of a token with a leading space. The fetched excerpt was truncated before the GPT-2 regex split pattern, so the video's own coverage could not be checked against a transcript (confidence: medium).
   - Subword versus character level: covered (it contrasts a 65-symbol character vocabulary with chunk/subword tokenization). Word-level tokenization is not discussed in the excerpt read, so the video should not be cited for a word-level comparison (confidence: medium).
7. **Better primary sources.**
   - Sennrich, Haddow and Birch, "Neural Machine Translation of Rare Words with Subword Units", arXiv:1508.07909 (<https://arxiv.org/abs/1508.07909>); submitted 31 Aug 2015, ACL 2016. The original BPE-for-NMT paper (confidence: high).
   - Radford et al., "Language Models are Unsupervised Multitask Learners" (GPT-2), <https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf>. The URL resolves to a PDF, but its text could not be extracted, so the title, authors and the byte-level BPE wording were not verified here. The `lecture.md` excerpt credits this paper with popularizing byte-level BPE (confidence: medium).

**Caveats:**

- Not verified from a primary source: the YouTube channel name, the exact upload date and the exact runtime. Open the video page once to confirm them.
- The video's coverage of the leading-space and regex-split behaviour was not checked against a transcript.
- The GPT-2 paper's text was not checked.
- `lecture.md` was only partly readable (the fetch was truncated).
