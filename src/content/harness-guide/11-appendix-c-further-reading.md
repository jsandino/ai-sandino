# Appendix C — Further reading

This guide distils material from several sources. The list below identifies the most useful ones for readers who want to go deeper on any of the primitives.

Annotations describe what each source specifically contributes — not a general summary, but what it adds beyond what this guide covers.

---

## Primary sources

**[OpenAI — "Harness Engineering: Leveraging Codex in an Agent-First World"](https://openai.com/index/harness-engineering/)**
The post that named the discipline. Covers the AGENTS.md-as-table-of-contents pattern, the argument for mechanical enforcement over prose rules, and the insight that error messages should double as remediation instructions. The guide you are reading expands on these ideas; the original post is the most concise statement of them.

**[Geoffrey Huntley — "Everything is a Ralph Loop"](https://ghuntley.com/loop/)**
The practitioner's account of running single-agent autonomous loops in production. The most useful contribution is the framing that every agent failure is a harness bug, not a model failure — and the discipline of fixing the harness rather than patching around the agent. Also the clearest articulation of why full autonomy is the wrong default for most projects.

**[Michael Nygard — "Documenting Architecture Decisions"](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)**
The original ADR proposal from 2011. Short — about 500 words. Establishes the format (context, decision, consequences) and the immutability principle. Worth reading in full; everything written about ADRs since traces back to this post.

---

## Context architecture

**[Simon Willison — "Context Engineering"](https://simonwillison.net/2025/Jun/27/context-engineering/)**
Willison's post on the discipline of carefully constructing LLM context windows — what goes in, what stays out, and why it matters more than prompt wording. Directly relevant to the progressive disclosure argument in Part II.

**[awesome-harness-engineering — community resource list](https://github.com/ai-boost/awesome-harness-engineering)**
A community-maintained index of harness engineering resources: tools, patterns, case studies, and practitioner accounts. Useful for staying current as the field evolves; the guide you are reading reflects the state of the discipline as of mid-2026, and the field is moving quickly.

---

## Mechanical constraints

**[pre-commit documentation](https://pre-commit.com)**
The authoritative reference for hook configuration, supported languages, and the hook lifecycle. The guide covers the essential configuration; the pre-commit docs cover edge cases, multi-language hooks, and CI integration in more depth.

**[Ruff documentation](https://docs.astral.sh/ruff/)**
The full rule reference, configuration options, and migration guides from Black, flake8, and isort. When the minimal configuration in Appendix A is not enough, the Ruff docs are the right next stop.

**[Charlie Marsh — "Python tooling could be much, much faster"](https://notes.crmarsh.com/python-tooling-could-be-much-much-faster)**
The essay that motivated Ruff's creation. The core argument: when linting happens in under a second, developers add it to commit hooks and run it constantly; when it takes 20 seconds, they skip it. Speed is a correctness property, not a comfort one.

---

## Agent capabilities and skills

**[Anthropic — Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)**
The authoritative reference for Claude Code's skill system, CLAUDE.md format, sub-agent invocation, and tool configuration. The guide's treatment of skills reflects the Claude Code implementation; other agent systems implement the same concept differently.

---

## Feedback loops

**[The Twelve-Factor App](https://12factor.net)**
Not directly about agent harnesses, but the discipline of designing systems that are auditable, reproducible, and observable transfers directly. The sections on configuration, logging, and process isolation are particularly relevant to autonomous loop design.

**[Andrej Karpathy — "Software 2.0"](https://karpathy.medium.com/software-2-0-a64152b37c35)**
The essay that introduced the framing of neural networks as a new kind of software. Relevant background for understanding why harness engineering matters: if models are a new kind of software component, they need the same infrastructure discipline as any other component — versioning, testing, observability, and constraints.

---

## Operating discipline and cost management

**[Anthropic — API pricing and rate limits](https://platform.claude.com/docs/en/about-claude/pricing)**
Current per-token rates, rate limits, and model tier comparisons. The guide's cost discussion reflects mid-2026 pricing; consult the current docs before making budget decisions, as pricing changes frequently.

**[Martin Fowler — "Patterns of Enterprise Application Architecture"](https://martinfowler.com/books/eaa.html)**
Not about AI agents — about software architecture patterns that have proven durable across decades. The system-of-record / system-of-engagement distinction (Part II), the argument for mechanical enforcement over convention (Part III), and the role of feedback loops in system health (Part V) all have antecedents in Fowler's taxonomy. Useful for practitioners who want to understand why these patterns are durable, not just how to apply them.

---

## For practitioners building harnesses at scale

**[Accelerate — Forsgren, Humble, Kim](https://itrevolution.com/product/accelerate/)**
Research-backed analysis of what distinguishes high-performing software delivery teams. The finding most relevant to harness engineering: the practices that most strongly predict delivery performance are automated testing, trunk-based development, and working in small batches — all of which map directly to the mechanical constraint and feedback loop primitives in this guide.

**[The DevOps Handbook — Kim, Humble, Debois, Willis](https://itrevolution.com/product/the-devops-handbook-second-edition/)**
The practitioner's companion to Accelerate. The chapters on feedback loops, continuous integration, and blameless postmortems translate directly to the harness engineering context. Particularly relevant to Section 19 (designing loops you can watch) and Section 23 (when to add a check vs. accept a failure).
