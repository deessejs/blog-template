---
name: json-ld
description: JSON-LD structured data per post (Article schema) and on the root layout (Person + WebSite schemas) for Google rich snippets and topic-cluster recognition.
status: planned
phase: 2
created: 2026-07-29
updated: 2026-07-29
---

# JSON-LD

## What

Structured data in JSON-LD format, embedded as a `<script type="application/ld+json">` tag on:

- `app/layout.tsx` — `Person` schema (the author, with name, url, sameAs links to social profiles) and `WebSite` schema (name, url, description). One per page load.
- `app/blog/[slug]/page.tsx` — `Article` schema (headline, datePublished, dateModified, author, image, description). One per post.
- `app/blog/tags/[tag]/page.tsx` — `CollectionPage` schema listing the posts. From phase 2.

The data is built server-side from frontmatter and the site config, then stringified once per request.

## Why

- **For the reader (and Google):** enables rich snippets — search results can show the author byline, publish date, and a thumbnail. Click-through rates for posts with rich snippets are typically 20-30% higher.
- **For SEO:** builds the topic-cluster graph that Google's Knowledge Graph uses. The `Person` schema ties every post to one author entity; the `WebSite` schema ties the blog to its domain.
- **For the author:** zero per-post work after the helper is built. Frontmatter feeds the schema automatically.

## Status

**Planned.** Depends on a site config (author name, social URLs, etc.) — see `meta/about` and `meta/colophon` in phase 3 for the source.

## Open questions

_None at the moment. The decisions below can be revisited once the first post is published and tested with the Google Rich Results Test._

## Decisions

- **Schemas included:** `Article` (per post page), `Person` (root layout, single instance per site), `WebSite` (root layout, single instance per site). `BreadcrumbList` excluded — for a flat blog hierarchy (home → blog → post) the gain is marginal and the markup adds complexity.
- **Why these three:** `Article` is the only schema that visibly changes Google SERP rendering (rich snippet with title, date, thumbnail). `Person` feeds Google's Knowledge Graph and ties every post to one author entity. `WebSite` enables the sitelinks search box once `search` is live (phase 1).
- **Where:** root layout emits `Person` and `WebSite` once; post pages add `Article` on top. Tag pages (phase 2) would add `CollectionPage` later — not in phase 1.
- **Date modified:** uses the post's `updated` frontmatter field when present, falls back to `date`. Drives the `dateModified` property in the `Article` schema.
- **Author data source:** `Person` reads from a `site.config.ts` file (author name, URL, `sameAs` array of social profiles). Lives in `apps/web/site.config.ts` until `meta/colophon` is shipped — then it can move into `packages/site-config/` if other apps need it.
- **Validation:** Google Rich Results Test after first deploy. If a schema fails validation, capture the fix in a `docs/learnings/` entry.
- **Format:** JSON-LD in `<script type="application/ld+json">`. Google's recommended format for new structured data.

## References

- [Schema.org — Article](https://schema.org/Article)
- [Schema.org — Person](https://schema.org/Person)
- [Schema.org — WebSite](https://schema.org/WebSite)
- [Google Search Central — Structured Data guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google Rich Results Test](https://search.google.com/test/rich-results) (validation tool)