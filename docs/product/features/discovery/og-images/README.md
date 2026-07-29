---
name: og-images
description: Per-post Open Graph images generated at build time via next/og — the visual that shows up when a post is shared on social media or Slack.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# OG images

## What

`next/og` (now 2-20× faster in Next.js 16.2) generates a 1200×630 PNG per post at the route `app/blog/[slug]/opengraph-image.tsx`. The image uses Geist Sans + Geist Mono (already loaded by `next/font`) and includes the post title, site name, and author byline. The output is served from `/_next/` and referenced from `generateMetadata` via the conventional `openGraph.images` field.

## Why

- **For the reader (and anyone they share with):** posts shared on Twitter, LinkedIn, Slack, etc. show a properly branded card instead of a broken image or the default Next.js icon.
- **For the author:** automated — no manual image creation per post. Title is pulled from frontmatter.

## Status

**Planned.** Implementation is ~40 lines once `next/og` is wired up.

## Open questions

_None at the moment. The decisions below are stable; revisit if a real visual-identity problem surfaces (e.g. social card click-through is too low)._

## Decisions

- **Visual content:** title (post), site name, author byline. No avatar or logo — keeps the image clean and rendering fast. Background uses the `--background` token from `base-nova` so light/dark mode aligns with the site's actual palette.
- **Font subsetting:** pass `subsets: ['latin']` and reuse the font binary already loaded by `next/font/google` in the root layout. Avoids a second network fetch and keeps `ImageResponse` under ~200ms per image.
- **Cache strategy:** `export const dynamic = 'force-static'` on the route handler. OG images are computed once at build and never invalidated at runtime.
- **Twitter card format:** not separately generated. The 1200×630 OG image renders correctly on Twitter at the 2:1 crop. Adding a separate Twitter-only format would double the work for no measurable gain.

## References

- [Next.js 16.2 — ImageResponse 2-20× faster](https://nextjs.org/blog/next-16-2#faster-imageresponse)
- [Next.js — opengraph-image.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Vercel — `next/og`](https://vercel.com/docs/functions/edge-functions/og-image-generation)
