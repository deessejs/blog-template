---
name: code-blocks
description: Shiki + rehype-pretty-code via Velite — dual-theme (light/dark) syntax highlighting with line highlighting and diff support, built before Turbopack sees anything.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Code blocks

## What

`rehype-pretty-code` + Shiki run as a Velite rehype plugin. Dual themes (`github-light` / `github-dark`) keyed off the `.dark` class. `@shikijs/transformers` adds `// [!code highlight]` and `// [!code ++]` / `// [!code --]` annotations. The `onVisitLine` hook prevents empty lines from collapsing and breaking the vertical rhythm.

## Why

- **For the reader:** VS Code-grade highlighting that follows dark mode without a flash. Line highlighting draws attention exactly where the prose references it.
- **For the author:** no per-block theme configuration — write the code, the highlighting works. Diff and highlight annotations travel with the snippet.

## Status

**Decided.** Trimming, empty-line fix, and Turbopack-safety all verified.

## Open questions

_None at the moment. The decisions below can be revisited once the first three posts have shipped._

## Decisions

- **`<CodeBlock>` React component:** not added in phase 1. Wait for a concrete use case outside MDX (live demo page, server-component highlight, etc.). Adding now would be speculative.
- **Shiki `langs` whitelist:** 15 entries as a starting list — `ts`, `tsx`, `js`, `jsx`, `json`, `bash`, `shell`, `css`, `html`, `md`, `mdx`, `yaml`, `diff`, `plaintext`. Grow on demand when a post introduces a new language; the build fails loudly via `s.mdx()` if an unknown language sneaks in.
- **Copy button:** not in phase 1. The cost (a transformer + a small client-side handler) isn't justified until at least one post needs readers to grab a snippet.

## References

- [2026-07-29 — Trimming the Shiki bundle](../../../learnings/2026-07-29-shiki-language-trimming.md)
- [2026-07-29 — Preserving empty lines in rehype-pretty-code](../../../learnings/2026-07-29-rehype-pretty-code-empty-lines.md)
- [2026-07-29 — Content collections on Next.js 16](../../../learnings/2026-07-29-content-collections-nextjs-16.md) (section 8 — Velite wiring)
- [Rehype Pretty Code — Options](https://rehype-pretty.pages.dev/)
