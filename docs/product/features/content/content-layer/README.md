---
name: content-layer
description: Velite config, Zod schema, MDX transformers, and runtime evaluation — the engine that turns Markdown into typed posts.
status: planned
phase: 1
created: 2026-07-29
updated: 2026-07-29
---

# Content layer

## What

Velite is the build-time content pipeline. It scans `apps/web/content/posts/**/*.mdx`, validates frontmatter with Zod, computes reading-time/TOC/excerpt fields, compiles MDX bodies to JS module strings, and emits `.velite/` for app import.

## Why

- **For the author:** frontmatter validation makes the build fail loudly when a post is missing `cover` or has a typo in `tags` — catches errors before publishing, not after.
- **For the reader:** computed TOC, excerpt, and reading time are rendered server-side with no runtime cost.

## Status

**Decided.** Implementation deferred until phase 1 begins. See the integration recipe in [`2026-07-29-content-collections-nextjs-16.md`](../../../learnings/2026-07-29-content-collections-nextjs-16.md) (sections 2-7) for the full wiring.

## Open questions

- Define the `accent` / `pillar` taxonomy if we want visual variety in post headers. Deferred until at least one post would actually benefit from it.

## Decisions

- **Content location:** `apps/web/content/posts/`. Lives next to the consuming app. If a future `apps/admin` or `apps/newsletter` ever needs the same data, we'll lift it to `content/` at the monorepo root then.
- **MDX compilation:** `s.mdx()` runtime evaluation. Velite emits the body as a JS module string, evaluated in `apps/web/lib/mdx.tsx` via `new Function(code)({ ...runtime })` and cached in a `Map<string, Component>`. Trade-off: a tiny first-render cost vs. a fully flexible build pipeline. Reasoning: we want the option to add transformers or swap components without rebuilding Velite.
- **`accent` / `pillar` taxonomy:** deferred. The schema does not declare these fields; adding them later is non-breaking (optional in Zod).
- **MDX components whitelist:** all `@workspace/ui/components/*` are exposed to authors via the `components` prop on the runtime MDX evaluator. Maximum authoring flexibility. Cost: a wider surface of possible bugs (a `Button` inside a `Tabs` inside a `Card` could break in subtle ways). Trade-off accepted because the template is single-author — bugs are caught at draft time.
- **`pages` collection (sibling of `posts`):** declared in `velite.config.ts` to support [[about]], [[now]], [[uses]], [[colophon]]. Schema: `title: s.string()`, `description: s.string().max(280)`, `updated: s.isodate().optional()`, `photo: s.image().optional()`, `wip: s.boolean().default(false)`. Slug computed from filename via `s.path()`.
- **Slug normalization:** all slugs are lowercase kebab-case, regardless of how they're written in frontmatter or filenames. `Machine Learning` → `machine-learning`. Special characters stripped. Normalization applied via a `transform` on each collection.
- **Computed `permalink`:** added on `posts` and `pages` collections via transform. `posts`: `/blog/<slug>`. `pages`: `/<slug>` (where slug is `about` / `now` / `uses` / `colophon`).
- **Date validation:** `updated` field on posts (when present) must be `>= date`. Enforced in Zod via `.refine()`. Catches "updated last week but dated last year" mistakes.
- **Drafts visibility in dev:** drafts are visible during `velite --watch` so the author can preview them. Filtered out at build time. The filter lives in a single helper, `lib/posts.ts`, imported by the listing and tag pages.

## References

- [2026-07-29 — Content collections on Next.js 16](../../../learnings/2026-07-29-content-collections-nextjs-16.md) — primary decision doc
- [Velite docs — Integration with Next.js](https://velite.js.org/guide/with-nextjs)
- [Velite docs — Code highlighting](https://velite.js.org/guide/code-highlighting)
