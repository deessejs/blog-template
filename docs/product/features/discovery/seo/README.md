---
name: seo
description: Per-post metadata, sitemap.xml, robots.txt, canonical URLs — the minimum viable discoverability layer.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# SEO

## What

The boring-but-mandatory stuff:

- **Per-post `<title>` and `<meta description>`** via `generateMetadata` in `app/blog/[slug]/page.tsx`.
- **`sitemap.xml`** at `/sitemap.xml` listing all non-draft posts + static pages. Built via `app/sitemap.ts`.
- **`robots.txt`** at `/robots.txt` allowing all crawlers, pointing to the sitemap. Built via `app/robots.ts`.
- **Canonical URLs** on every post to handle the eventual case of multiple deploy targets (Vercel preview URLs, custom domain).

## Why

- **For the reader (mostly future readers):** search engines can actually find and rank the posts. Without this, the blog is write-only.
- **For the author:** canonical URLs prevent SEO dilution when preview deploys get indexed accidentally.

## Status

**Planned.** No implementation yet. Will be implemented alongside the post page.

## Open questions

_None at the moment. The three decisions below are stable; revisit only if deployment topology changes (multiple domains, sub-paths, etc.)._

## Decisions

- **Site URL config:** `NEXT_PUBLIC_SITE_URL` is **optional**. When set, used as the canonical base for `sitemap.xml`, `<link rel="canonical">`, OG image URLs, and the RSS feed. When unset, fallback to `http://localhost:3000` for local dev. A warning is logged in production builds if the var is missing — not an error, just a heads-up. `.env.example` documents the var with a one-line explanation.
- **Tag pages in sitemap:** included from phase 2 onward, when `/blog/tags/[tag]` routes exist. Not generated before then to avoid 404 entries in the sitemap.
- **`robots` policy:** `index, follow` by default on all shipped content. `noindex` is applied to draft previews if/when they're served from a public URL (preview deploys on Vercel). Currently: no draft previews are publicly served.

## References

- [Next.js — generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js — sitemap.ts](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js — robots.ts](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
