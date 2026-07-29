---
name: series
description: Multi-part posts grouped under a single series name, with cross-post navigation and a /blog/series/[name] landing page listing all parts in order.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# Series

## What

A "series" groups posts that should be read in a specific order. Declared per post in frontmatter (`series: s.string().optional()` — one series per post). Velite computes a `part` index per series post based on its position in the chronological ordering of posts in that series.

Renders as:
- **In-post:** a small "Part 3 of 5 — Building a Static Site Generator" header at the top, with prev/next links.
- **Standalone route:** `/blog/series/[name]` lists all parts in order with a one-line description each.

## Why

- **For the reader:** signals "this is part of a larger work" and gives them a path through the series without re-deriving it themselves.
- **For the author:** makes multi-post deep dives (which a personal blog can really benefit from) feel like one coherent body of work rather than scattered posts.

## Status

**Planned.** Will only matter once at least one series exists (3+ posts on the same topic).

## Open questions

_None at the moment. The decisions below are stable; revisit only if a real multi-series-overlap need emerges._

## Decisions

- **Frontmatter field:** `series: s.string().optional()`. One series per post. Chosen over `string[]` because the in-post "Part X of Y" UI assumes a single current series — supporting multiple would force a selection UI for which series to surface, adding complexity for a case that almost never happens.
- **Cross-linking in-post:** a small banner at the top of the body shows "Part 3 of 5 — <series name>" with prev/next links. Banner is part of the `<article>` and inherits `typeset` styling. Hidden if the post isn't in a series.
- **Series landing page:** `/blog/series/[name]` lists all parts in chronological order (oldest first, since that's the reading order). Static via `generateStaticParams` enumerating every distinct series.
- **Computed `part` index:** added via Velite `transform` after schema validation — sorts posts in the same series by date and assigns `part: number`. Saves the author from manually numbering.
- **Last updated on series page:** shown next to each part so readers can see which installments are recent vs older.

## References

- Related: [[tags]] (separate mechanism; a post can be in one series and many tags)