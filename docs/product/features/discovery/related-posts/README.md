---
name: related-posts
description: "Recommended next reads" rendered at the end of every post, ranked by tag overlap with the current post. Keeps readers on the blog when they finish an article.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# Related posts

## What

At the bottom of every post (`app/blog/[slug]/page.tsx`), a small "Continue reading" section shows 3 posts ranked by tag overlap with the current one. Computed at build time via Velite (purely static), no runtime cost.

Algorithm: score = number of shared tags; ties broken by recency. Posts with zero score are excluded. If fewer than 3 posts match, fall back to the 3 most recent posts.

## Why

- **For the reader:** reduces "I read the post, now what?" friction. A reader who just finished a TypeScript post is far more likely to read another TypeScript post than to navigate to the home.
- **For the author:** boosts internal page views (the metric that matters for ads and sponsors, not that we have either). More importantly, surfaces older posts that would otherwise get buried.

## Status

**Planned.** Triggers when there are enough posts to make the recommendations meaningful (≥10).

## Open questions

_None at the moment. The decisions below are stable; revisit if the recommendation quality is observed to be poor (low click-through, high bounce on related cards)._

## Decisions

- **Algorithm:** tag overlap, score = number of shared tags, ties broken by recency. No cosine similarity or ML-based ranking — overkill for a personal blog.
- **Count:** 3 posts.
- **Format:** 3 compact cards (title + date + 1-line excerpt via `s.excerpt()`), reusing the `PostCard` component from [[posts]].
- **Fallback:** if fewer than 3 posts share at least one tag, fill the remaining slots with the most recent non-current posts. Never show fewer than 3 (unless the corpus itself has <3 posts, which is the trigger condition for shipping this feature).
- **Where:** rendered below the post body, above the footer. A `Continue reading` heading (or similar — wording TBD) separates the section.

## References

- Related: [[tags]] (the input to the algorithm)