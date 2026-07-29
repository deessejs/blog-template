---
name: typography
description: shadcn/typeset integration with the base-nova preset — the prose styling system that turns rendered HTML into readable long-form content.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Typography

## What

shadcn/typeset, copied from the [typeset builder](https://ui.shadcn.com/typeset), imported in `packages/ui/src/styles/globals.css` after Tailwind. A `.typeset-blog` preset tunes `--typeset-size`, `--typeset-leading`, `--typeset-flow` for long-form reading, and uses the Geist Sans / Mono variables already exposed by `base-nova`.

## Why

- **For the reader:** every prose element (h2, p, ul, blockquote, table) gets consistent rhythm without manual styling. Container-relative sizing means mobile gets a readability bump automatically.
- **For the author:** zero styling work per post. The MDX body just renders inside `<article className="typeset typeset-blog">` and everything works.

## Status

**Decided.** Coexistence with `base-nova` is verified risk-free per the dedicated learning doc.

## Open questions

_None at the moment. The three decisions below can be revisited after the first post is shipped._

## Decisions

- **`.typeset-chat` preset:** not added now. Wait for a concrete chat or streaming feature that would use it. Avoid speculative presets.
- **Dark-mode leading bump:** `.dark .typeset-blog { --typeset-leading: 1.85; }` (up from 1.75 in light mode). Per the typeset docs' recommendation for darker surfaces.
- **Reading width:** `max-w-3xl` (~48rem) on `app/blog/[slug]/page.tsx`, applied as a Tailwind class on the `<article className="typeset typeset-blog">` wrapper. The Typeset stylesheet deliberately doesn't set `max-width` — the layout owns it.

## Implicit defaults

- **Font loading:** `display: 'swap'` on both Geist Sans and Geist Mono via `next/font/google`. Reasoning: `swap` keeps text visible during font load (no FOIT) at the cost of a brief layout shift. `optional` is even safer but worse for SEO on first paint.
- **Theme persistence:** `next-themes` with `attribute="class"`, default `system`. Storage: `localStorage` (default). No cookie needed since theme preference is non-essential — server-rendered HTML falls back to system, client hydrates and updates if localStorage has a value.
- **Theme FOUC:** handled by `suppressHydrationWarning` on `<html>` in `app/layout.tsx` (already in place). Prevents the React warning when `next-themes` mutates the class attribute before hydration.
- **Lighthouse budget target:** 95+ on Performance / Accessibility / Best Practices / SEO for the home, listing, and post pages. First Load JS target: under 150 KB gzipped. No automated budget enforcement in CI (Phase 1) — manual Lighthouse runs on first deploy, then scheduled monthly.
- **No `@tailwindcss/typography` dependency.** Using shadcn/typeset instead (already declared). Saves ~10 KB of CSS and removes a plugin.
- **No dark-mode toggle in the README itself.** The toggle lives in [[nav]] as a small icon.

## References

- [2026-07-29 — shadcn/typeset × base-nova](../../../learnings/2026-07-29-shadcn-typeset-vs-base-nova.md) — coexistence checklist
- [shadcn/typeset documentation](https://ui.shadcn.com/docs/typeset)
- [shadcn/typeset changelog (July 2026)](https://ui.shadcn.com/docs/changelog/2026-07-typeset)
