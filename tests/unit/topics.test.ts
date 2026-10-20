// Topic data and the live ⇔ page rule (docs/briefs/shell.md, piece 5).
// The fixtures show the check fails in both directions, so a passing run
// on the real site means something.

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { topics } from '../../src/data/topics';
import { checkTopicPages, pageSlugs } from './lib/topic-pages';

const PAGES_DIR = join(import.meta.dirname, '../../src/pages');

test('topics.ts lists all five topics with unique slugs', () => {
  expect(topics.map((t) => t.slug)).toEqual([
    'harness-engineering',
    'rag-in-production',
    'llm-gateway',
    'transformer-architecture',
    'agents-with-adk',
  ]);
});

test('every live topic has a page and no coming-soon topic does', () => {
  const problems = checkTopicPages(topics, pageSlugs(PAGES_DIR));
  expect(problems, problems.join('\n\n')).toEqual([]);
});

describe('the live ⇔ page check (fixtures)', () => {
  test('fails for a live topic with no page', () => {
    const problems = checkTopicPages(
      [{ slug: 'rag-in-production', status: 'live' }],
      ['index', '404'],
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('LIVE TOPIC WITHOUT A PAGE');
    expect(problems[0]).toContain('src/pages/rag-in-production.astro');
  });

  test('fails for a coming-soon topic that has a page', () => {
    const problems = checkTopicPages(
      [{ slug: 'llm-gateway', status: 'coming-soon' }],
      ['index', 'llm-gateway'],
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('COMING-SOON TOPIC WITH A PAGE');
    expect(problems[0]).toContain('set the topic\'s status to "live"');
  });

  test('passes when status and pages agree', () => {
    expect(
      checkTopicPages(
        [
          { slug: 'harness-engineering', status: 'live' },
          { slug: 'llm-gateway', status: 'coming-soon' },
        ],
        ['index', 'harness-engineering'],
      ),
    ).toEqual([]);
  });

  test('finds pages as files and as directories with an index', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pages-'));
    writeFileSync(join(dir, 'index.astro'), '');
    writeFileSync(join(dir, 'harness-engineering.astro'), '');
    mkdirSync(join(dir, 'llm-gateway'));
    writeFileSync(join(dir, 'llm-gateway', 'index.astro'), '');
    mkdirSync(join(dir, 'empty'));
    writeFileSync(join(dir, 'notes.txt'), '');
    expect(pageSlugs(dir).sort()).toEqual([
      'harness-engineering',
      'index',
      'llm-gateway',
    ]);
  });
});
