---
name: colophon
description: /colophon page — how this site is built. Stack, fonts, hosting, and the inspirations behind it. Transparent meta-content for the dev community.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# Colophon

## What

A `/colophon` page that describes how the blog is built and why. Sections:
- **Stack:** Next.js, Velite, shadcn/ui, the typography/code/syndication choices — with links to the relevant `docs/product/features/` folders.
- **Type:** the fonts in use, where they come from, why they were picked.
- **Hosting:** where the site deploys to, the cost tier.
- **Inspirations:** other blogs or projects that shaped the design.

Static MDX page (same content pipeline as posts), with a "last updated" date pulled from the page's frontmatter `updated` field.

## Why

- **For the reader (dev community):** the meta-content is a feature. A personal blog that documents its own construction is more interesting than a black box.
- **For the author:** forces periodic reflection on the stack. If the colophon is out of date, the blog's architecture has drifted from what's documented.

## Status

**Planned.** Will be shipped alongside `about`, `now`, and `uses`.

## Open questions

_None at the moment. The decisions below are stable; revisit when stack migrations happen (so the page stays honest)._

## Decisions

- **Source:** MDX file at `apps/web/content/pages/colophon.mdx`, same Velite collection as [[about]]. Hand-authored, not auto-generated — drift from actual code is acceptable in exchange for narrative quality. The page tells the story of why the stack was picked, not just what it is.
- **Sections:** Stack (with links to relevant `docs/product/features/` and `docs/learnings/` entries), Type (fonts, where from, why), Hosting (provider, cost tier), Inspirations (3-5 other blogs or projects that shaped the design).
- **Update cadence:** when the stack changes meaningfully. Add a "Last updated" line at the top.
- **Self-referential honesty:** the page itself acknowledges that documenting a personal blog's stack is mildly navel-gazing — and that's the point. The meta-content is the feature.
- **Route:** static `/colophon`.
- **Content license:** CC BY 4.0. Attribution chain lives in the [[footer]]; the colophon explains the choice (open by default, no NC clause because reuse-for-good should be allowed without asking).
- **Hosting:** Vercel Hobby tier (free for personal projects). Reason: zero infra to maintain, Next.js is first-class, custom domains + HTTPS are automatic. Trade-off: dependency on a third party. Mitigated by the static nature of the output — `next build` produces a fully static site that can be hosted anywhere; the Vercel lock-in is operational, not technical.
- **Domain strategy:** apex domain (`example.com`), no `www` redirect. HTTPS-only via HSTS preload (configured in `next.config.ts` headers).
- **Security headers:** set in `next.config.ts` via `headers()`. CSP allows inline styles (needed by Tailwind v4 + Next inline scripts) but restricts scripts to self + the analytics provider (when added). HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin.
- **CI pipeline:** GitHub Actions. Workflow at `.github/workflows/ci.yml` runs `pnpm lint && pnpm typecheck && pnpm build` on every PR. No deploy-from-CI (Vercel handles deploys on push to main).
- **Pre-commit hooks:** none in phase 1. The CI catches what would have been caught by pre-commit; for a solo author, the friction cost isn't justified. Revisit when collaborators join.

## References

- Related: `meta/about`, `meta/uses`, plus all the `docs/product/features/` and `docs/learnings/` entries it links to