---
name: feed
description: RSS 2.0 feed at /feed.xml generated from the Velite post collection — syndication for readers using NetNewsWire, Feedly, or any other reader.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Feed (RSS)

## What

`app/feed.xml/route.ts` — a Next.js Route Handler that builds an RSS 2.0 feed from `#site/content` (the Velite output). Served at `/feed.xml`, discovered via `<link rel="alternate" type="application/rss+xml">` in the root layout.

The feed includes the last 20 non-draft posts with title, link, pubDate, description (excerpt), and the author name.

## Why

- **For the reader:** a personal blog without an RSS feed is incomplete. Loyal readers expect to subscribe via their reader of choice (NetNewsWire, Feedly, Reeder, etc.).
- **For the author:** RSS is the original push channel. No algorithm, no tracking, no email deliverability issues. Posts land in the reader immediately.

## Status

**Planned.** No implementation yet.

## Open questions

_None at the moment. The feed shape is stable; revisit only if a reader's behavior forces a format change._

## Decisions

- **Format:** RSS 2.0. Maximum compatibility with older readers (NetNewsWire, Reeder, Feedbin). Atom 1.0 is technically cleaner but offers no functional advantage for a personal blog.
- **Content payload:** `<description>` carries the excerpt (via Velite's `s.excerpt({ length: 240 })`); `<content:encoded>` carries the full HTML of the post. Readers that support `<content:encoded>` show full content; older ones fall back to the excerpt. Best of both worlds.
- **Post count:** the 20 most recent non-draft posts.
- **JSON Feed (`/feed.json`):** not generated in phase 1. Add later if a reader we use explicitly asks for it.

## References

- [RSS 2.0 specification](https://cyber.harvard.edu/rss/rss.html)
- [JSON Feed](https://www.jsonfeed.org/) (deferred alternative)
- [Next.js — Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
