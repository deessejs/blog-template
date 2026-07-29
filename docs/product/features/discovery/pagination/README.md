---
name: pagination
description: Static, SEO-friendly pagination of the blog listing (/blog, /blog/page/2, /blog/page/3...) — triggered when the post count exceeds one page.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# Pagination

## What

When the blog listing (`app/blog/page.tsx`) accumulates more posts than fit on one page, the listing is split into static routes: `/blog` (page 1), `/blog/page/2`, `/blog/page/3`, etc. Each route is fully static (HTML generated at build time), with `generateStaticParams` enumerating them.

## Why

- **For the reader:** no infinite scroll → predictable loading, easy to share a specific page, works without JS.
- **For SEO:** every page is a unique URL with its own `<title>` and metadata. Infinite-scroll variants cannibalise themselves in Google's index (only the first scroll-depth gets crawled properly).
- **For performance:** static pages load in <50ms. No virtual scrolling, no observer APIs, no client-side state.

## Status

**Planned.** Triggers at >20 posts (decided in [[posts]]).

## Open questions

_None at the moment. The decisions below can be revisited only if the post publication rate forces a different cadence._

## Decisions

- **Trigger:** activates when the listing exceeds 20 non-draft posts.
- **Page size:** 20 posts per page. The trigger threshold equals the page size, so the first page is always full and the second page appears only when genuinely needed.
- **URL pattern:** `/blog/page/N` (where `/blog` is page 1, `/blog/page/2` is page 2, etc.). Static, SEO-friendly, conventional. Query params (`/blog?page=2`) were rejected for canonicalisation risk.
- **Implementation:** `app/blog/page.tsx` reads `params.page` (Next 16 async params); `app/blog/page/[page]/page.tsx` (or equivalent catch-all) handles `/blog/page/N`. `generateStaticParams` enumerates pages at build time.
- **UI:** simple Prev / Next + `Page 2 of 5` indicator. No numbered pager for now (kills the visual real estate; revisit if the corpus grows past 50 pages).

## References

- [Next.js — `generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- Related: [[posts]] (the source list)