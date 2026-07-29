---
name: posts
description: The blog listing page (/blog) and individual post pages (/blog/[slug]) — the two routes every reader visits.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Posts

## What

Two Next.js App Router routes that consume the Velite output:

- `app/blog/page.tsx` — chronological listing of all non-draft posts.
- `app/blog/[slug]/page.tsx` — single post, with `generateStaticParams` + `generateMetadata`.

## Why

- **For the reader:** the listing is the entry point to the corpus; the post page is where the actual writing lives. Both must load fast and read well.
- **For the author:** `generateStaticParams` produces fully static HTML at build time → zero runtime cost, trivial CDN deployment.

## Status

**Planned.** Async-`params` and MDX-runtime patterns are documented in the content-collections learning.

## Open questions

_None at the moment. The three decisions captured below can be revisited after the first 20 posts are published._

## Decisions

- **Pagination:** deferred until >20 posts. When it triggers, implement as static page-numbered routes (`/blog/page/2`) for SEO friendliness, not infinite scroll.
- **Cover on listing card:** rendered when present, replaced by a monogram fallback (first letter of the title on a tinted background) when absent. Visual rhythm preserved without forcing every post to have a cover.
- **Reading time on card:** shown, format `5 min read`, in `text-muted-foreground text-xs`. Free via `s.metadata()`, low visual cost.

## Implicit defaults

- **404 / 500 / loading pages:** custom `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`. Each is a small RSC that links back to home and to `/blog`. No illustrations, no apologetic copy — just a clear "this isn't here, here's where to go next" message.
- **Cover image aspect ratios:** post hero renders at 16:9 (`aspect-video`); listing card thumbnail renders at 16:9 with object-cover. Both use the same source image — no separate crops needed.
- **Listing card layout:** horizontal on desktop (cover left, text right), vertical on mobile (cover top, text below). Compact (~120 px tall on mobile).
- **Slug normalization:** lowercase kebab-case. `My First Post` → `my-first-post`. Applied via Velite `transform`.
- **Drafts in dev:** visible during `velite --watch`, filtered out at build time. Single helper `lib/posts.ts` exports a `published` array that filters `draft === false`. All consumers go through it.

## References

- [2026-07-29 — Content collections on Next.js 16](../../../learnings/2026-07-29-content-collections-nextjs-16.md) (section 7 — the actual routes)
- [Next.js 16 — generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js 16 — generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
