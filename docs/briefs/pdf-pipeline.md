# Brief — Generic PDF pipeline (guide structure)

- **Status:** Done
- **Roadmap:** [phase 002](../roadmap/phase-002.md), step 9
- **Source:** [ADR 0016](../decisions/0016-guide-format-and-generic-pdf-pipeline.md)
  (the guide format); ADR 0002 (committed PDF, pre-commit rebuild);
  `src/content/harness-guide/cover.md` (cover values); `scripts/build-pdf.sh`
  (PDF properties, fonts, page geometry)

## Purpose

Make the PDF pipeline build any guide that follows ADR 0016's structure, and
move the harness guide onto that structure, with its PDF unchanged apart from
the contents page. A new guide then needs only a folder.

This brief covers **structure only**. ADR 0016's content conventions (the
`::: spread` block, named diagram colours, and the check that guide content
has no raw LaTeX, `style` or `fill:`) are step 10, gated.

## Required pieces

1. **Guides:** every folder in `src/content/` with a `metadata.yml` is a
   guide. Its chapters are its files matching `[0-9][0-9]-*.md`, in name
   order. Its PDF is `public/<folder>.pdf`.
2. **`make pdf`** builds every guide; **`make pdf GUIDE=<folder>`** builds
   one. An unknown `GUIDE`, or a guide missing `metadata.yml`'s `title` or
   `author`, fails with a remediation-grade message (Rule / Found / Fix).
   Intermediates go under `build/<folder>/`.
3. **`metadata.yml`:** `title`, `subtitle`, `author` (required: `title`,
   `author`), `coauthor` and `date` (optional, `YYYY-MM-DD`). No YAML parser
   is added: pandoc reads the file (`--metadata-file`) and renders it through
   templates.
4. **Cover:** one template in the pipeline (for example
   `scripts/pdf/cover.tex`), made from today's `cover.md` with its five
   values replaced by `metadata.yml` fields: title, subtitle, author,
   `Co-authored with <coauthor>` (omitted when there is no `coauthor`), and
   `Last modified: <date>` written as "September 7, 2026". The PDF must not
   gain a second title block: pandoc's `title`/`author` metadata trigger
   `\maketitle` in the main conversion, so keep them out of it.
5. **PDF properties:** `/Title` is `<title> - <subtitle>` (or just the title)
   and `/Author` the author, as `build-pdf.sh` sets them today.
6. **Date:** `metadata.yml`'s `date` if set. Otherwise today when the
   guide's folder has staged or uncommitted changes, or else the date of the
   last commit that touched the folder. The build prints which date it used
   and why.
7. **Page breaks:** the pipeline starts every chapter, and the contents, on
   a new page (today's `\newpage` block). The cover keeps its own break and
   page-counter reset.
8. **Contents:** the pipeline places LaTeX's `\tableofcontents` after the
   first chapter (the introduction). A Node filter
   (`scripts/pdf/contents-filter.mjs`, run with pandoc's `--filter`) marks
   every heading it must not list with the classes `unnumbered` and
   `unlisted` (pandoc only honours `unlisted` together with `unnumbered`).
   Listed: each `#` heading after the contents; each `##` heading after it
   whose first word is a number and a full stop (`3.`). Not listed:
   everything before the contents; `##` headings numbered like `A.2` or not
   numbered; every `###` and deeper. The filter exports its logic for unit
   tests and runs as a script when executed.
9. **Unchanged per-file steps:** Mermaid pre-rendering, the cross-file link
   rewrite and the glyph substitutions in `render-diagrams.sh` keep working,
   per guide. Fonts, page geometry and `colorlinks` stay as they are, shared
   by every guide.
10. **Pre-commit hook:** `scripts/precommit-build-pdf.sh` rebuilds and
    stages the PDF of each guide that has staged source files (and only
    those), with today's skip rule when the PDF is already staged and
    newer. Messages name the guide. The hook already triggers on
    `src/content/**` (step 8).
11. **`make pdf-check`** (`scripts/check-pdf-fresh.sh`) checks every guide:
    fail if a commit touching `src/content/<folder>/` comes after the last
    commit that changed `public/<folder>.pdf`.
12. **Migrate the harness guide.** This brief is Javier's explicit
    permission for exactly these edits under `src/content/harness-guide/`,
    and no others:
    - add `metadata.yml`: `title: Harness Engineering`,
      `subtitle: A Practical Guide`, `author: Javier Sandino`,
      `coauthor: Claude Sonnet 4.6`, `date: 2026-09-07` (all from today's
      `cover.md`; the date override keeps the cover unchanged);
    - delete `cover.md`, `pagebreak.md` and `01-contents.md`.

    Also delete `scripts/guide-files.sh`.
13. **Docs, in the same commits as the code they describe:**
    - new `docs/guide-format.md`: the structure above, for anyone writing or
      importing a guide (ADR 0016's content conventions are added in step
      10, when they exist);
    - `docs/README.md`: a routing-table row for it;
    - `docs/architecture.md`: the PDF pipeline section;
    - `docs/development.md`: `make pdf [GUIDE=…]`, `make pdf-check`, and
      the PDF hook table;
    - any other doc or comment that names `guide-files.sh`, `cover.md`,
      `pagebreak.md` or `01-contents.md` as current.

## Acceptance criteria

1. [ ] `make pdf` builds `public/harness-guide.pdf`; `make pdf
       GUIDE=harness-guide` builds only it; `make pdf GUIDE=nope` fails with
       a remediation-grade message → check: `make pdf` (output in the PR)
2. [ ] The new PDF has 54 pages, like the previous one, and the same
       `/Title` and `/Author`; its text matches the previous PDF's on every
       page except the contents page → human review (the PR shows `pdfinfo`
       for both and a `pdftotext` diff with the contents page excluded)
3. [ ] The contents is one page, right after the introduction, listing
       Heuristics, Parts I–VI with sections 1–24, and Appendices A, B and C
       with no sections → human review (an image of the page in the PR)
4. [ ] The cover looks the same as before → human review (images of both
       in the PR)
5. [ ] The contents filter's rules are unit-tested: headings before the
       contents unlisted; `#` after it listed; `3.` listed; `A.2`,
       unnumbered `##` and `###` unlisted; existing classes kept → check:
       `make test-unit`
6. [ ] The date rule works: the override is used when set; without it, the
       last commit's date, or today with uncommitted guide changes → human
       review (the build's output for each case in the PR)
7. [ ] Committing the migration rebuilds and stages
       `public/harness-guide.pdf` through the hook, without `--no-verify`
       → human review (the run's commit log)
8. [ ] `make pdf-check` passes → check: CI (`pdf` job)
9. [ ] Under `src/content/harness-guide/`, only the edits in piece 12 →
       human review (`git diff --stat` in the PR)
10. [ ] Every other check passes → check: CI
11. [ ] The docs in piece 13 describe the new pipeline and nothing still
        names the removed files as current → human review

## Out of scope

The `::: spread` block, diagram colour names and their print palette, the
content check, any change to chapter text or diagrams (step 10); building
PDFs in CI; rendering guides on the web.
