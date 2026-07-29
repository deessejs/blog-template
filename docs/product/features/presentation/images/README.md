---
name: images
description: Cover images for posts and in-body images, served through next/image with proper sizing, AVIF/WebP, and lazy loading.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Images

## What

Two image surfaces:

- **Cover images** — one per post, declared via frontmatter (`cover: s.image().optional()`), displayed as a 16:9 hero on the post page and as a thumbnail on listing cards.
- **In-body images** — embedded in MDX via standard `![alt](src)` or `<Image>` from `next/image`.

Both flow through `next/image`, which handles responsive `srcset`, AVIF/WebP negotiation, and lazy loading.

## Why

- **For the reader:** fast image loads, no layout shift, crisp on retina displays.
- **For the author:** write `cover: ./covers/my-post.jpg` next to the post file, the schema validates it exists, the build fails otherwise.

## Status

**Planned.** Schema field already in the Velite config. `next/image` defaults work out of the box.

## Open questions

_None at the moment. The three decisions below can be revisited if/when captions become a regular feature._

## Decisions

- **Cover storage:** `apps/web/content/posts/<slug>/cover.jpg` — next to the post file itself. Travels with the post if content is ever lifted out of `apps/web`. Single flat alternative (`apps/web/public/covers/`) was considered and rejected: harder to keep paired with the post, harder to relocate.
- **Captions:** `<figcaption>` is already styled by Typeset. No additional work needed. Revisit if a post needs a non-default caption style.
- **LCP priority:** yes. The post hero's cover image gets `priority` on `next/image` so it preloads. The listing card thumbnails do not (they're below the fold on most viewports).

## References

- [2026-07-29 — Content collections on Next.js 16](../../../learnings/2026-07-29-content-collections-nextjs-16.md) (Velite schema)
- [Next.js — Image component](https://nextjs.org/docs/app/api-reference/components/image)
