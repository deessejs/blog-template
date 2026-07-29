---
name: tags
description: Post taxonomy (tags as arrays in frontmatter) plus /blog/tags/[tag] pages that list every post carrying each tag.
status: planned
phase: 2
created: 2026-07-29
updated: 2026-07-29
---

# Tags

## What

Tags are a flat taxonomy declared per post in frontmatter (`tags: s.array(s.string())`). Two surfaces:

- A tags cloud on the home page (top 6-8 tags, decided in [[home]]).
- A `/blog/tags/[tag]` route per tag, listing every non-draft post carrying it (newest first).

Tags also drive the "related posts" feature (phase 3): posts sharing ≥1 tag with the current post.

## Why

- **For the reader:** a way to follow a topic across posts without subscribing to the whole blog. Tags are how readers with specific interests (e.g. "show me everything about TypeScript") navigate.
- **For the author:** structural — surfaces which topics the blog actually covers. A tag with 0 posts is a signal that the topic was attempted and abandoned.
- **For SEO:** internal linking. Every tag page links to every post carrying it, building topic clusters that Google rewards.

## Status

**Planned.** Schema field already exists in the Velite config (`tags: s.array(s.string()).default([])`).

## Open questions

_None at the moment. The decisions below can be revisited once the first posts with tags are written._

## Decisions

- **Tag limit per post:** no limit. Schema stays `s.array(s.string()).default([])` without `.max(N)`. Reasoning: the author values flexibility over forced prioritization. Risk accepted: tags with low post counts dilute SEO clusters — mitigated by excluding single-post tags from the home cloud.
- **Tag normalization:** lowercase kebab-case (e.g. `machine-learning`, not `Machine Learning`). The schema coerces at validation time so author can write either form; the slug used in URLs is always normalized.
- **Taxonomy curation:** auto-extracted from frontmatter. No closed list. Adding a new tag is just writing a new string in a post's `tags` array.
- **Tag page design (`/blog/tags/[tag]`):** simple chronological list of all non-draft posts carrying the tag, newest first. No grouping by year. Pagination triggers if a single tag accumulates >20 posts.
- **Tags cloud on home:** top 6-8 tags by post count. Tags with only 1 post are excluded — they'd be visual noise.
- **Tags display on post page:** rendered as shadcn `Badge` chips at the end of the article, each linking to its `/blog/tags/[tag]` page.
- **Draft handling:** drafts do not contribute to tag counts and do not appear on tag pages.

## References

- [2026-07-29 — Content collections on Next.js 16](../../../learnings/2026-07-29-content-collections-nextjs-16.md) (Velite schema)
- Related: [[home]] (uses top tags on the home page), `discovery/search` (search facets), `discovery/related-posts` (tag-overlap recommendations, phase 3)