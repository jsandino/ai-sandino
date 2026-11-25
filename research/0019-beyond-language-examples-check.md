# 0019 — Beyond language: examples check

- **Date:** 2026-11-25
- **Status:** Current
- **Question:** Can the transformers guide say that the transformer block is not specific to language, with the Vision Transformer, Whisper and a protein language model as examples, and what wording is safe (no video)?

---

## Research summary

**Bottom line:** The idea is accurate with one qualification: the blocks are essentially standard, not identical, so say "essentially the same blocks" and "only the ends change" about how input becomes vectors and what the output head predicts.

**Recommendation:** Use ESM-2 as the protein example. Do not call AlphaFold 2 a transformer: its paper describes a new "Evoformer" block over alignments and pair representations. Write "log-Mel spectrogram" without the channel count, because Whisper large-v3 uses 128 Mel bins where earlier models use 80.

**Key findings:**

1. **Vision Transformer** (Dosovitskiy et al., arXiv 2010.11929): "a standard Transformer directly to images, with the fewest possible modifications"; patches are flattened and mapped by a trainable linear projection; "Image patches are treated the same way as tokens (words) in an NLP application". 16 × 16 is the patch size of the "/16" variants; the paper also uses /14 and /32. Position embeddings are standard learnable 1D ones; a learnable class token is prepended; LayerNorm is applied before every block. Large-scale pretraining is needed to beat comparable convolutional networks.
2. **Whisper** (arXiv 2212.04356): an encoder–decoder Transformer for speech recognition, speech translation and language identification, trained on 680,000 hours of labelled audio. Input is a log-Mel spectrogram (80 channels in the paper, 128 in large-v3); the encoder starts with convolution layers and uses sinusoidal positions (not verified from the paper text).
3. **Proteins.**
   - ESM-1b (Rives et al. 2021, PNAS): a deep Transformer taking amino-acid character sequences as input, trained with masked language modelling on 250 million sequences; representations encode secondary and tertiary structure.
   - ESM-2 (Lin et al., bioRxiv 2022.07.20.500902, Science 2023): models from 8 million to 15 billion parameters; "BERT style encoder only transformer architecture"; masked language modelling; RoPE positions. The preprint's current title is "Evolutionary-scale prediction of atomic level protein structure with a language model" (its first version had a different title).
   - AlphaFold 2 (Jumper et al. 2021) uses attention-based modules, takes multiple sequence alignments and pair representations as input, and its paper does not call the model a transformer.
4. **Exceptions to "same blocks":** ViT: pre-norm with learned 1D positions and a class token; Whisper: a convolutional stem and cross-attention; ESM-2: encoder-only with RoPE. Only the input and output ends are specific to the data.

**Not verified:** the Whisper stem details and the 80-channel figure (PDF text was garbled); ESM-1b's position embedding; Science and Nature publisher pages were not reachable (bioRxiv and PMC used instead).

## Sources

- https://arxiv.org/abs/2010.11929, https://arxiv.org/abs/2212.04356
- https://pmc.ncbi.nlm.nih.gov/articles/PMC8053943/
- https://www.biorxiv.org/content/10.1101/2022.07.20.500902v3
- https://github.com/facebookresearch/esm, https://huggingface.co/docs/transformers/model_doc/esm
- https://pmc.ncbi.nlm.nih.gov/articles/PMC8371605/
- Earlier note: [0018](0018-encoder-decoder-fact-check.md)
