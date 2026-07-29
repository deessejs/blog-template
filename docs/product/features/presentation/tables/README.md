---
name: tables
description: rehype-wrap-tables plugin + .typeset-scroll wrapper so wide Markdown tables stay scrollable on mobile without overflowing the prose rhythm.
status: planned
phase: 2
created: 2026-07-29
updated: 2026-07-29
---

# Tables

## What

A small custom rehype plugin (`rehypeWrapTables`, ~40 lines) registered in `velite.config.ts` that wraps every `<table>` emitted by the MDX pipeline in a `<div class="typeset-scroll">`. The wrapper class is styled in `packages/ui/src/styles/globals.css` to provide horizontal scroll, rounded corners, and theme-aware borders.

The plugin is idempotent (a `<table>` already wrapped is detected and skipped) and runs after `rehype-pretty-code` so it sees the final AST.

## Why

- **For the reader:** wide comparison tables (e.g. "10 tools × 8 attributes") don't overflow on phones or zoomed-in desktops — the wrapper provides a scrollbar instead.
- **For the author:** zero per-table work. Write `| col | col |` in Markdown and the wrapper is automatic. No special MDX component to remember.
- **For consistency:** the wrapper uses `--typeset-flow` for its vertical margins, so the table's spacing above and below matches the rest of the prose rhythm defined by `typeset-blog`.

## Status

**Decided** in `2026-07-29-typeset-wide-tables.md`. Implementation deferred to phase 2 — phase 1 posts don't yet include wide tables.

## Open questions

_None at the moment. The decisions below are stable; revisit if a real UX problem surfaces (e.g. readers missing the scroll affordance)._

## Decisions

- **Plugin location:** `apps/web/lib/rehype-wrap-tables.ts`. Lives with the only consumer (the `web` app's Velite config). Not shared via `packages/` — premature abstraction for a single consumer.
- **Scroll-fade effect:** skipped. CSS scroll-driven animations are Firefox-flagged in 2026, so the affordance is unreliable. Revisit when the baseline is universal.
- **Striped rows:** no. Solid background via the `--card` token, borders between rows. Aligns with the base-nova visual restraint.
- **Sticky headers (`<thead>` on vertical scroll):** no. Adds complexity for marginal benefit on tables short enough to fit on one screen.
- **Scope:** every `<table>` produced by the MDX pipeline is wrapped, including tables embedded in HTML via `dangerouslySetInnerHTML` if/when we add that pattern.

## References

- [2026-07-29 — Wide tables in shadcn/typeset](../../../learnings/2026-07-29-typeset-wide-tables.md) — primary decision doc
- [shadcn/typeset — Responsive Table section](https://ui.shadcn.com/docs/typeset#responsive-table)
- [firxworx — Responsive tables in Astro with a custom rehype plugin](https://firxworx.com/blog/astro-responsive-tables-markdown-rehype/) (the 40-line pattern this is based on)