---
name: nav
description: Sticky header with logo, primary nav links (blog, about, now, uses, colophon), search button (Cmd+K), and theme toggle. Persistent across all routes.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Nav (header)

## What

A sticky `<header>` rendered in `app/layout.tsx`, persistent across every route. Contains:

- **Logo / site name** on the left (text-only, links to home).
- **Primary nav links** in the center: `Blog`, `About`, `Now`, `Uses`, `Colophon`. Visible on desktop, collapsed into a `<Sheet>` (shadcn) trigger on mobile.
- **Search button + theme toggle** on the right: a magnifier icon that opens the Cmd+K palette, and the next-themes `ModeToggle`.

## Why

- **For the reader:** primary nav links are discoverable from any page. Search and theme toggle are one click away.
- **For the author:** one place to add a new top-level link. Sticky means the nav follows scroll, which is the modern expectation.

## Status

**Planned.** Depends on `discovery/search` (the Cmd+K palette) and `meta/about` / `meta/now` / `meta/uses` / `meta/colophon` (the linked pages). Ship together with the search feature in phase 1.

## Open questions

_None at the moment. The decisions below can be revisited after observing how the header behaves at 360px width (smallest target viewport)._

## Decisions

- **Sticky behavior:** `sticky top-0 z-40` with a subtle `backdrop-blur` + `border-b` once scrolled past 16px. Decided via small scroll listener (or `IntersectionObserver` on a sentinel). No full-height border always visible — would feel heavy on long posts.
- **Logo:** text-only (site name from `site.config.ts`), no logo image. Faster to ship and to rebrand.
- **Primary nav links:** `Blog`, `About`, `Now`, `Uses`, `Colophon`. Five items is the upper limit before visual crowding; if we add `Series` or `Tags` to the nav, drop one.
- **Search button:** visible always on desktop, hidden behind a long-press / dedicated button on mobile (Cmd+K still works via keyboard). Mobile gets search via the `<Sheet>` menu.
- **Theme toggle:** rendered via a small client component (`"use client"`) that calls `useTheme()`. Position: rightmost icon, after the search button.
- **Mobile breakpoint:** `< 768px` collapses the primary nav into a `<Sheet>` trigger. Search and theme toggle remain visible in the collapsed view.

## Implicit defaults

- **No mega-menu / dropdowns.** Each link goes to a single page. If a future nav item needs sub-items (e.g. multiple tag pages), revisit.
- **No "active link" indicator.** The current page is rarely ambiguous from context. If confusion is observed, add an `aria-current="page"` + underline.
- **No locale switcher.** Single-language blog. If i18n ships (phase 4), add a small switcher to the right of the nav.
- **Logo links to `/`.** Standard. No separate "home" link in the nav.

## References

- Related: [[footer]] (companion), `discovery/search` (the Cmd+K palette the button opens), `meta/about` / `meta/now` / `meta/uses` / `meta/colophon` (the linked pages)
- [shadcn Sheet component](https://ui.shadcn.com/docs/components/sheet) (mobile menu)