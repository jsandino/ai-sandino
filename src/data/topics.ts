// The single source of facts about topics (docs/architecture.md#topic-data-one-source).
// Taking a topic live is one change: set its status to "live" in the same PR
// that adds src/pages/<slug>.astro, and switch its blurb to the full one in
// docs/content/topic-blurbs.md. tests/unit/topics.test.ts enforces
// live ⇔ page exists and blurb ⇔ topic-blurbs.md.

export type Topic = {
  slug: string; // URL path, e.g. "harness-engineering"
  title: string;
  label: string; // short name on the landing graph node (docs/design/landing-hero.html)
  blurb: string; // teaser or full blurb, from docs/content/topic-blurbs.md
  status: 'live' | 'coming-soon';
  related?: string[]; // slugs joined by a graph cross-link; each pair listed once
  pdf?: string; // e.g. "/harness-guide.pdf"
  github?: string; // project repo URL
};

export const topics: Topic[] = [
  {
    slug: 'harness-engineering',
    title: 'Harness Engineering with Code Agents',
    label: 'Harness Engineering',
    blurb:
      'Build the environment around a coding agent (context, constraints, capabilities and feedback loops) so it ships reliable software, not plausible guesses.',
    status: 'live',
    pdf: '/harness-guide.pdf',
    github: 'https://github.com/jsandino/ai-sandino#practical-ai-engineering',
  },
  {
    slug: 'rag-in-production',
    title: 'RAG in production',
    label: 'RAG in production',
    blurb: 'Retrieval-augmented generation, beyond the demo.',
    status: 'coming-soon',
    related: ['llm-gateway'],
  },
  {
    slug: 'llm-gateway',
    title: 'LLM gateways: managing token quotas',
    label: 'LLM gateways',
    blurb: 'Keeping model costs and quotas under control.',
    status: 'coming-soon',
    related: ['agents-with-adk'],
  },
  {
    slug: 'transformer-architecture',
    title: 'The Transformer architecture: a deep dive',
    label: 'Transformers',
    blurb: 'Inside the model behind it all.',
    status: 'coming-soon',
    related: ['rag-in-production'],
  },
  {
    slug: 'agents-with-adk',
    title: "Building an autonomous agent with Google's ADK",
    label: 'Agents with ADK',
    blurb: "An agent that plans and acts on its own, built with Google's ADK.",
    status: 'coming-soon',
    related: ['harness-engineering'],
  },
];
