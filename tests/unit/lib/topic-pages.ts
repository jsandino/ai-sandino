// Live ⇔ page rule (docs/architecture.md#topic-data-one-source): a topic
// marked "live" must have a page at src/pages/<slug>, and a "coming-soon"
// topic must not. Kept pure so tests can feed it fixtures.

import { readdirSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import type { Topic } from '../../../src/data/topics';

const PAGE_EXTENSIONS = new Set(['.astro', '.md', '.mdx', '.html']);

/** Route slugs of the top-level pages in a src/pages directory. */
export function pageSlugs(pagesDir: string): string[] {
  return readdirSync(pagesDir).flatMap((name) => {
    const path = join(pagesDir, name);
    if (statSync(path).isDirectory()) {
      const hasIndex = readdirSync(path).some(
        (f) => parse(f).name === 'index' && PAGE_EXTENSIONS.has(parse(f).ext),
      );
      return hasIndex ? [name] : [];
    }
    const { name: base, ext } = parse(name);
    return PAGE_EXTENSIONS.has(ext) ? [base] : [];
  });
}

/** One remediation message per topic that breaks the rule; [] if none. */
export function checkTopicPages(
  topics: Pick<Topic, 'slug' | 'status'>[],
  slugs: string[],
): string[] {
  const pages = new Set(slugs);
  return topics.flatMap((t) => {
    if (t.status === 'live' && !pages.has(t.slug)) {
      return [
        `LIVE TOPIC WITHOUT A PAGE: "${t.slug}"
  Rule: a topic marked "live" in src/data/topics.ts must have a page, or
        the landing graph links to a 404.
  Fix:  add src/pages/${t.slug}.astro in this PR, or set the topic's
        status back to "coming-soon".`,
      ];
    }
    if (t.status === 'coming-soon' && pages.has(t.slug)) {
      return [
        `COMING-SOON TOPIC WITH A PAGE: "${t.slug}"
  Rule: a page for a "coming-soon" topic is unreachable from the landing
        graph, so a finished page stays hidden.
  Fix:  if the page is ready, set the topic's status to "live" in
        src/data/topics.ts in this PR; if not, remove src/pages/${t.slug}.*
        until it is.`,
      ];
    }
    return [];
  });
}
