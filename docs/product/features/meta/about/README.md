---
name: about
description: /about — the author bio, contact, and social links. Lives next to the home page as the place readers go when they want to know who writes this.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# About

## What

A single route `/about` rendered from a dedicated MDX file in `apps/web/content/pages/about.mdx`. Same content pipeline as posts (Velite validates frontmatter, rehype-pretty-code handles code blocks, shadcn/typeset styles prose). Frontmatter fields: `title`, `description`, optional `updated` for "last updated" display.

The page surfaces: a longer bio (the home bio is the elevator pitch; this is the full story), photo or avatar (optional), contact email, social profile links, and the things the author cares about.

## Why

- **For the reader:** establishes trust. Anonymous writing can be compelling but a known author is more likely to be remembered, followed, and subscribed to.
- **For the author:** a single place to update when context changes (new job, new project, new contact). Better than scattering this info across the home page and footer.

## Status

**Planned.** Will be created together with `meta/now`, `meta/uses`, and `meta/colophon` once the core blog is live.

## Open questions

_None at the moment. The decisions below are stable; revisit only if the author needs structured sections (e.g. CV-style)._

## Decisions

- **Source:** MDX file at `apps/web/content/pages/about.mdx`. Lives in the Velite content pipeline (a new `pages` collection, sibling to `posts`). Uses the same `typeset` styling, rehype-pretty-code for code blocks, and frontmatter validation as posts.
- **Frontmatter fields:** `title`, `description`, optional `updated` (ISO date), optional `photo` (path to an image in the content folder).
- **Route:** static `/about`, generated from `app/about/page.tsx`.
- **Content shape:** durable context — who the author is, why they write, what topics they cover, how to reach them. The dynamic "what am I working on right now" lives in [[now]], not here.
- **Photo handling:** optional. When present, displayed at the top of the page with `next/image priority`. When absent, the page is text-only — no avatar placeholder.
- **Social links:** rendered from the `site.config.ts` `social` array, not hardcoded in the MDX body. Keeps links DRY across pages.
- **Privacy stance:** documented on the /about page as a short paragraph. Even without analytics, the blog's RSS feed generates a request to `/feed.xml` on each reader check, which logs the user agent and IP at the hosting layer (Vercel). The stance: no analytics, no tracking, no cookies. Readers who care can self-host a feed reader that doesn't make outbound requests. Privacy policy page is not generated unless a reader explicitly asks for it.
- **Contact:** the contact email is rendered from `site.config.ts` (`contactEmail` field). The author can use a dedicated alias (e.g. `hello@domain.com`) or their personal one. Plain `<a href="mailto:...">` link, no contact form.

## References

- Related: `meta/colophon` (how the site is built), `meta/now` (current focus), `meta/uses` (gear/tools)