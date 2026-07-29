---
name: now
description: /now page following the indie-web "nownownow.com" convention — a short page listing what the author is focused on right now. Updated quarterly at most.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# Now

## What

A `/now` page rendered from `apps/web/content/pages/now.mdx`. Short — typically a bullet list of what the author is currently working on, learning, reading, or thinking about. Updated quarterly, with a "last updated" date prominently displayed at the top.

Follows the [nownownow.com](https://nownownow.com/about) convention: a `/now` page is the author's commitment to share what they're focused on **right now**, in contrast to an `about` page which is more durable.

## Why

- **For the reader:** signals that the blog is alive. A "last updated 6 months ago" `/now` is a quiet but loud way of saying "the author is still here."
- **For the author:** forces periodic self-reflection. Useful for catching drift from the topics you actually care about.

## Status

**Planned.** Will be shipped alongside `about`, `uses`, and `colophon`.

## Open questions

_None at the moment. The decisions below are stable; revisit if the page goes more than 6 months without an update (probably means the convention is broken)._

## Decisions

- **Source:** MDX file at `apps/web/content/pages/now.mdx`, same Velite collection as [[about]].
- **Update cadence:** quarterly. The page displays the `updated` frontmatter date prominently at the top; if it's more than 6 months stale, the layout adds a subtle "this might be out of date" hint.
- **Content shape:** free-form MDX. Typical structure: a short intro paragraph, then bullet lists ("Working on", "Learning", "Reading", "Thinking about"). No rigid schema — the convention is the freedom.
- **WIP / draft signal:** a `wip: boolean` frontmatter field. When true, the page renders normally but the title gets a small "WIP" badge so readers know it's a working draft, not a stable statement.
- **Route:** static `/now`.

## References

- [nownownow.com — the /now page convention](https://nownownow.com/about)
- Related: `meta/about` (durable context), `meta/uses` (evergreen gear)