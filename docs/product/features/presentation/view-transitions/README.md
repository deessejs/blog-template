---
name: view-transitions
description: React 19.2 <ViewTransition> for smooth navigations between posts (and home ↔ post), with reduced-motion fallback. Leverages the browser's native View Transition API.
status: planned
phase: 3
created: 2026-07-29
updated: 2026-07-29
---

# View transitions

## What

React 19.2 ships `<ViewTransition>` as a stable component. Wrapping the page content in `app/blog/[slug]/page.tsx` (and optionally the home) makes navigations animate: the post title can crossfade into the listing card, the cover image can morph, etc. The browser's native View Transition API handles the heavy lifting — no animation library, no JS animation frames.

A `prefers-reduced-motion` query disables the transitions for users who've opted out at the OS level.

## Why

- **For the reader:** a subtle, smooth feel that signals "this site is fast and cared for". View transitions make Next.js navigation feel closer to a native app without the cost.
- **For the author:** one component wrap, no animation code to write.
- **For the platform:** View Transition API is supported in Chromium and Safari since 2024. Firefox shipped it in late 2025. No polyfill needed for the audience a personal blog targets.

## Status

**Planned.** Waits for `>20 posts` to be worth the visual polish, and is low-priority until the rest of phase 1 ships.

## Open questions

_None at the moment. The decisions below are stable; revisit only if browser support regresses or a real perf issue surfaces._

## Decisions

- **Scope:** applied to every cross-page navigation. Post → post, listing → post, home → post. Cost is negligible: the browser does the heavy lifting in a compositor thread.
- **Reduced motion:** respected via a `useEffect` in the root layout that unsets the wrapper class when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. No animation, instant navigation.
- **Browser support fallback:** if the View Transition API is unavailable (very old browsers), Next 16 falls back to instant navigation automatically. No polyfill, no opt-in needed.
- **No layout animations:** crossfade only. Layout-shared animations (e.g. morphing the listing card into the post header) are tempting but expensive to author and brittle — out of scope.

## References

- [React 19.2 — `<ViewTransition>` reference](https://react.dev/reference/react/ViewTransition)
- [Next.js 16.2 — `transitionTypes` prop on `next/link`](https://nextjs.org/blog/next-16-2#transitiontypes-prop-for-nextlink)
- [MDN — View Transition API browser support](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)