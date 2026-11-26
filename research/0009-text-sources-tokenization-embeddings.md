# 0009 — Text sources for tokenization and embedding claims

- **Date:** 2026-11-03
- **Status:** Current
- **Question:** Which papers and documentation pages (no video) can the transformers guide cite for: word/character/subword tokenization, BPE and byte-level BPE, the leading space being part of a token in GPT-2-style tokenizers, and similar words having nearby embeddings?

---

## Research summary

**Bottom line:** All four candidate sources exist and support their claims, except that the Hugging Face tokenizer_summary page never mentions the leading space. That claim needs a second source: the Hugging Face GPT-2 model docs state it explicitly.

**Recommendation:**

- (a) Word/character/subword tokenization: the Hugging Face "Tokenization algorithms" page.
- (b) BPE: Sennrich et al. (2016) for BPE in NLP, and Radford et al. (2019) §2.2 for byte-level BPE.
- (c) Leading space: the Hugging Face GPT-2 model docs (GPT2Tokenizer docstring).
- (d) Similar words close together: Mikolov et al. (2013), arXiv:1301.3781. The paper supports the king/queen offset example but not "cat"/"dog"; phrase the guide text accordingly.

**Key findings:**

1. **Hugging Face tokenizer page** (<https://huggingface.co/docs/transformers/tokenizer_summary>; read directly, confidence: high).
   - Current exact title: "Tokenization algorithms" ("Summary of the tokenizers" in older versions).
   - Sections: word-level, character-level, BPE, byte-level BPE, Unigram, SentencePiece, WordPiece. This covers (a).
   - Word-level: "Vocabulary size becomes extremely large because every unique word requires its own token… Words not in the vocabulary map to an `"<unk>"` token, so the model can't handle new words."
   - Character-level: "The vocabulary is small and every word can be represented… But sequences become much longer."
   - Subword: "Common words stay intact as single tokens, and rare or unknown words decompose into subwords."
   - Byte-level BPE: "Byte-level BPE uses 256 byte values as the base vocabulary… GPT-2 uses byte-level BPE with a vocabulary size of 50,257."
   - "BPE… is the most popular tokenization algorithm in Transformers": a statement about the library, not all of NLP.
   - Leading space: not on this page (only SentencePiece's "▁" marker).
2. **Sennrich et al.** (<https://arxiv.org/abs/1508.07909>; confidence: high). "Neural Machine Translation of Rare Words with Subword Units", Rico Sennrich, Barry Haddow, Alexandra Birch. ACL 2016; first submitted 31 Aug 2015 (latest version 10 Jun 2016). The abstract covers encoding rare words as subword units, comparing segmentation techniques including BPE; the GPT-2 paper cites it as "Sennrich et al., 2015" for BPE. Not checked: the ACL Anthology entry, and the full text.
3. **GPT-2 paper** (<https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf>; read as page images, confidence: high). "Language Models are Unsupervised Multitask Learners", Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever (OpenAI). The header gives no year or venue; 2019 is not verified from the page (it is an OpenAI technical report). §2.2 "Input Representation": BPE "is a practical middle ground between character and word level language modeling"; "a byte-level version of BPE only requires a base vocabulary of size 256"; "we prevent BPE from merging across character categories for any byte sequence. We add an exception for spaces which significantly improves the compression efficiency while adding only minimal fragmentation of words across multiple vocab tokens." It does not say a leading space is part of the token. Do not say the paper "popularized" byte-level BPE; it describes using it.
4. **Mikolov et al.** (<https://arxiv.org/abs/1301.3781>; confidence: high). "Efficient Estimation of Word Representations in Vector Space", Tomas Mikolov, Kai Chen, Greg Corrado, Jeffrey Dean (Google). Submitted 16 Jan 2013 (v3 7 Sep 2013); a preprint, venue not verified. §1.1: "not only will similar words tend to be close to each other, but that words can have multiple degrees of similarity", and vector("King") − vector("Man") + vector("Woman") "results in a vector that is closest to the vector representation of the word Queen". It does not mention "cat"/"dog". The king/queen example is attributed to Mikolov, Yih & Zweig (2013), "Linguistic Regularities in Continuous Space Word Representations", whose details were not verified.
5. **Source for the leading space** (<https://huggingface.co/docs/transformers/model_doc/gpt2>; confidence: high). The GPT2Tokenizer docstring: "This tokenizer has been trained to treat spaces like parts of the tokens (a bit like sentencepiece) so a word will be encoded differently whether it is at the beginning of the sentence (without space) or not". The Hugging Face LLM course page on BPE (<https://huggingface.co/learn/llm-course/chapter6/5>) shows `'Ġis'`-style tokens but never explains `Ġ`: weak support.

**Caveats:**

- The Hugging Face docs are versioned and live; the content above is from the v5.22.1 docs. Cite without a version, or note the access date (2026-11-03).
- The ACL Anthology entries for Sennrich et al. were not verified.
- A "cat" versus " cat" example appears in none of the sources read. It is a standard illustration, and the Hugging Face GPT-2 docstring describes the underlying behaviour.
