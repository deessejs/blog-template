---
name: uses
description: /uses page — what hardware, software, and services the author relies on. Evergreen content with rare updates.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# Uses

## What

A `/uses` page rendered from `apps/web/content/pages/uses.mdx`. Lists the author's setup: hardware (laptop, monitor, keyboard, peripherals), software (editor, terminal, apps), and services (hosting, email, domain registrar). Each item is a short paragraph with optional links.

Follows the [uses.tech](https://uses.tech/) convention — a lightweight page that says "here's what I use, here are affiliate-free links if you want to investigate."

## Why

- **For the reader:** a question every reader has at some point, especially tech readers. Pre-empting it on the blog is a small win.
- **For the author:** evergreen content that ages well. Rarely needs updating, ranks decently in search ("X uses what for Y").
- **For SEO:** attracts a different kind of visitor than posts — folks searching for setup comparisons. Complements the post corpus.

## Status

**Planned.** Will be shipped alongside `about`, `now`, and `colophon`.

## Open questions

_None at the moment. The decisions below are stable; revisit only if the page grows past 50 items and needs pagination or filtering._

## Decisions

- **Source:** MDX file at `apps/web/content/pages/uses.mdx`, same Velite collection as [[about]].
- **Structure:** sections via `<h2>` headings — typical categories are `Hardware`, `Software`, `Services`, `Books`. Each item is a `<h3>` for the name and a short paragraph for context/why. Optional `<a>` link to the product page.
- **No affiliate links.** Explicit policy: every link is plain, no `rel="sponsored"`, no Amazon associates, no Skimlinks. Reasons documented in the page footer (or just trusted by the audience).
- **Update cadence:** rarely. The page is evergreen by design — items that change often aren't worth listing.
- **Route:** static `/uses`.

## References

- [uses.tech — the /uses page convention](https://uses.tech/)
- Related: `meta/about`, `meta/colophon`