# The Transformer Architecture

*Every component of the transformer, with the matrices shown.*

---

## What this guide is

A self-contained, mathematically rigorous walk-through of every component of the transformer architecture as introduced by Vaswani et al. (2017) and refined in modern large language models: tokens, embeddings, attention, multi-head attention, feed-forward networks, normalization and residual connections.

The aim is complete understanding — not just what each operation does, but exactly how the matrices flow, where each parameter lives, and why the design works. Every operation inside a transformer is a matrix operation, so each one gets its precise mathematical description, a worked numerical example, and the intuition alongside the math.

## What this guide is not

- A guide to training or optimizing models
- A survey of model families
- A tutorial for any one framework
- A mathematics text — it treats matrices concretely, and where a formal definition would obscure rather than clarify, it prefers the operational view

## How to use it

Read the parts in order. Each one assumes the one before it and adds one new piece of the architecture. Start with the one-page notation and conventions: every symbol the guide uses is defined there, and it is the page to come back to.

By the end of Part VIII you should be able to draw the full transformer block from memory and explain the role of every matrix. Part XI walks through a complete forward pass with numbers small enough to verify by hand. Part XII gives a reference implementation in PyTorch-style pseudocode and notes the practical pitfalls.

## Prerequisites

Comfort with matrix multiplication, vector dot products, the softmax function, and the basic concepts of training neural networks (parameters, gradients, backpropagation). Calculus is helpful but largely implicit. Linear algebra is the working language of this guide; Part I reviews the operations that recur most often.
