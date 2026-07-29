---
name: search
description: Full-text search across posts via Pagefind (post-build static index, ~50 KB, zero JS at idle) — wired in phase 1 with a header Cmd+K palette.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Search

## What

[Pagefind](https://pagefind.app/) is a static search index built at the end of `next build`. It crawls the generated HTML, extracts text content per page, and emits a static index (a few MB across all chunks) served from `/pagefind/`. A small client-side script (~50 KB gzipped) lazily loads the chunks that match the user's query and renders results inline.

Triggered only on `/search` (or via a header button); not loaded on every page.

## Why

- **For the reader:** fast, typo-tolerant full-text search across every post. Works offline once the index is cached. No external service, no tracking.
- **For the author:** zero maintenance. Pagefind re-indexes on every build; new posts are searchable automatically.
- **For the deploy:** the index is static. No server-side search backend, no Algolia bill, no env vars.

## Status

**Planned.** The trigger condition (≥20 posts) hasn't been hit yet. Worth wiring up before that to avoid a "I can't find anything" experience as the corpus grows.

## Open questions

_None at the moment. The decisions below can be revisited after the first 20 searches are observed in production analytics (Plausible/Umami event or simple search-result-count log)._

## Decisions

- **Trigger:** shipped in phase 1, not deferred to >20 posts. Reasoning: search is cheap to wire (Pagefind is a build-time static index) and its absence is felt immediately by readers who remember a topic but not which post covered it. Better to be ready before the need is acute.
- **Engine:** Pagefind. Static index, post-build, no JS at idle, ~50 KB gzipped when the palette opens. Orama considered and rejected: heavier runtime, no win for a static blog.
- **UI placement:** header button + Cmd+K / Ctrl+K palette. No dedicated `/search` route. The button shows on every page; clicking it (or pressing the shortcut) opens an inline overlay with an input + results list.
- **Index fields:** title, description, tags, and full body text. Pagefind tokenises the rendered HTML automatically, so MDX bodies are indexed without extra config.
- **Keyboard shortcut:** Cmd+K on macOS, Ctrl+K on Windows/Linux. Convention shared with Linear, GitHub, Raycast, Algolia DocSearch — readers expect it.
- **Result destination:** clicking a result navigates to the post. No "preview on hover" — keeps the palette simple.
- **No-results handling:** show a calm message ("No posts match. Try different terms.") rather than a suggestion UI. Avoid feature creep.

## References

- [Pagefind documentation](https://pagefind.app/)
- [Pagefind UI](https://pagefind.app/docs/ui/) (default UI; can be replaced with a shadcn-themed component)
- Alternative considered: [Orama](https://oramasearch.com/) — client-side, smaller index, but heavier runtime. Defer.