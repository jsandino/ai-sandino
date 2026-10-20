// The single source of facts about topics (docs/architecture.md#topic-data-one-source).
// Taking a topic live is one change: set its status to "live" in the same PR
// that adds src/pages/<slug>.astro. tests/unit/topics.test.ts enforces
// live ⇔ page exists.

export type Topic = {
  slug: string; // URL path, e.g. "harness-engineering"
  title: string;
  blurb: string; // one or two sentences
  status: 'live' | 'coming-soon';
  pdf?: string; // e.g. "/harness-guide.pdf"
  github?: string; // project repo URL
};

export const topics: Topic[] = [
  {
    slug: 'harness-engineering',
    title: 'Harness Engineering with Code Agents',
    blurb: 'Placeholder blurb: Harness Engineering with Code Agents.',
    status: 'coming-soon',
  },
  {
    slug: 'rag-in-production',
    title: 'RAG in production',
    blurb: 'Placeholder blurb: RAG in production.',
    status: 'coming-soon',
  },
  {
    slug: 'llm-gateway',
    title: 'LLM gateways: managing token quotas',
    blurb: 'Placeholder blurb: LLM gateways: managing token quotas.',
    status: 'coming-soon',
  },
  {
    slug: 'transformer-architecture',
    title: 'The Transformer architecture: a deep dive',
    blurb: 'Placeholder blurb: The Transformer architecture: a deep dive.',
    status: 'coming-soon',
  },
  {
    slug: 'agents-with-adk',
    title: "Building an autonomous agent with Google's ADK",
    blurb: "Placeholder blurb: Building an autonomous agent with Google's ADK.",
    status: 'coming-soon',
  },
];
