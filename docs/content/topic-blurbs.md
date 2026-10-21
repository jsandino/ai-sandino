# Topic blurbs

Copy for each topic's card on the landing page (`docs/briefs/landing.md`).
`src/data/topics.ts` is where it is used.

- While a topic is `coming-soon`, `topics.ts` shows its **teaser**.
- The PR that takes a topic live switches it to the **full blurb**, citing
  this file (the topic's brief names it as the source).
- Editing copy here is a normal docs change. The full blurbs are drafts until
  their topic goes live; revise them then if the page turned out different.

| Topic (`slug`) | Teaser (while coming soon) | Full blurb (once live) |
|---|---|---|
| Harness Engineering with Code Agents (`harness-engineering`) | Uses the full blurb from the start. | Build the environment around a coding agent (context, constraints, capabilities and feedback loops) so it ships reliable software, not plausible guesses. |
| RAG in production (`rag-in-production`) | Retrieval-augmented generation, beyond the demo. | Take retrieval-augmented generation past the demo: chunking, retrieval quality, evaluation and the failure modes that only show up at scale. |
| LLM gateways: managing token quotas (`llm-gateway`) | Keeping model costs and quotas under control. | Put a gateway between your apps and your models to control cost, enforce quotas and keep traffic flowing when a provider says no. |
| The Transformer architecture: a deep dive (`transformer-architecture`) | Inside the model behind it all. | Open up the model behind it all: attention, embeddings and the layers that turn tokens into predictions, explained visually. |
| Building an autonomous agent with Google's ADK (`agents-with-adk`) | An agent that plans and acts on its own, built with Google's ADK. | Design an agent that plans and acts on its own with Google's Agent Development Kit, and keep it safe, observable and useful. |
