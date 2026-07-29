---
name: home
description: The landing page (app/page.tsx) — the author's pitch + 3-5 most recent posts. Distinct from the full blog listing.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Home

## What

`app/page.tsx` — the first page any visitor sees. Not a duplicate of `/blog`. Should answer "who is this person and why should I read them" in under five seconds, then link to the full archive.

## Why

- **For the reader:** sets expectations. A personal blog that opens with a wall of post titles feels like an RSS reader, not a home.
- **For the author:** this is the page that converts visitors to subscribers. It must show personality, not just content.

## Status

**Planned.** Current implementation is the shadcn scaffold ("Project ready!"). To be replaced.

## Open questions

_None at the moment. The hero design is captured below; revisit only after a real content gap appears._

## Decisions

- **Hero style:** short paragraph bio (2-3 sentences) that names what the blog covers and why it exists. Followed by a tags cloud (top 6-8 tags) for SEO + scannability, then 5 recent posts, then a clear "Read all posts" CTA. No avatar — keeps the page fast and lets the writing carry the page.
- **Recent posts count:** 5. Three is conventional but too few for a returning visitor; five gives more entry points without overwhelming the page.
- **Bio location:** inline on home (not behind `/about`). The home page is the bio.
- **Tags cloud on home:** yes. Drives SEO on the topics the blog covers, gives first-time visitors a sense of scope, and gives the `/blog/tags/[tag]` pages (phase 2) their first inbound links from the home.

## References

- (none yet — implementation decision pending)
