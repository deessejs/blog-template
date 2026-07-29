---
name: footer
description: Minimal footer with copyright, RSS link, and a "view source" link to the GitHub repo. Persistent across all routes, sits below the page content.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Footer

## What

A minimal `<footer>` rendered in `app/layout.tsx`, persistent across every route. Three elements:

- **Copyright line** — `© <year> <author>. Licensed under CC BY 4.0.`
- **RSS link** — anchor to `/feed.xml` with a small RSS icon.
- **"View source" link** — anchor to the public GitHub repo (configured in `site.config.ts`).

Centered, low visual weight, single row on desktop, stacked on mobile.

## Why

- **For the reader:** discover the syndication channel (RSS) and the project's open-source nature (source link) without scrolling through nav.
- **For the author:** the license attribution is legally required for CC BY; this is the cheapest place to put it.

## Status

**Planned.** Depends on `site.config.ts` (author, repo URL) and `discovery/feed` (the RSS feed). Ship together with the rest of the chrome in phase 1.

## Open questions

_None at the moment._

## Decisions

- **Copyright attribution:** `© <currentYear> <author.name>. Licensed under CC BY 4.0.` Year computed at render time. Author from `site.config.ts`. License is fixed (CC BY 4.0) — captured in [[colophon]] but the footer is where it's actually enforced.
- **RSS link:** anchor with an inline lucide `Rss` icon, opens `/feed.xml` directly. No feed preview, no auto-discovery meta tag in the HTML (it's there by Next convention since the route exists at `/feed.xml`).
- **"View source" link:** anchor to `site.config.repoUrl`, opens in a new tab (`target="_blank" rel="noopener noreferrer"`).
- **Layout:** single row, centered, `text-sm text-muted-foreground`. On `< 480px`, stacks vertically.
- **No "built with" badge.** No "Powered by Next.js" or "Built with shadcn". The footer is the blog's, not the framework's.

## Implicit defaults

- **No analytics script in the footer.** Analytics (Plausible/Umami) is a phase 4 capability; if it ships, the script lives in `app/layout.tsx`, not the footer.
- **No "subscribe to newsletter" CTA.** Newsletter is `skipped` for now; if it ships, the signup lives in-post and in the footer copy.
- **No social icons row.** Social links live on [[about]] and in the JSON-LD `Person.sameAs`. Footer would be redundant.

## References

- Related: [[nav]] (companion), `site.config.ts` (author, repoUrl), `discovery/feed` (the /feed.xml route), [[colophon]] (full license context)