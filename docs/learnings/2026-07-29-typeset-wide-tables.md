---
name: typeset-wide-tables
description: How to handle wide Markdown tables inside shadcn/typeset: the .typeset-scroll wrapper, a 40-line rehype plugin that auto-wraps every table in a horizontally-scrollable div, and why the plugin beats per-table MDX markup.
created: 2026-07-29
updated: 2026-07-29
---

# Wide tables in shadcn/typeset — auto-wrap with a rehype plugin

> **Status:** Decision (recommended: a 40-line custom rehype plugin, applied globally in the Velite config).
> **Context:** Velite + `rehype-pretty-code` + shadcn/typeset in the `b-t` blog template. Wide Markdown tables would overflow on mobile without explicit handling.

## TL;DR

`shadcn/typeset` styles `<table>` elements directly, but wide tables overflow on small viewports and there's no automatic horizontal scroll. The official recommendation is to wrap them in a `.typeset-scroll` div. Doing it per-table in MDX is fragile — one forgotten wrapper and the layout breaks. The robust fix is a tiny rehype plugin that auto-wraps every `<table>` in the generated AST. About 40 lines including types and an idempotency check. Add it to Velite's `rehypePlugins` once and forget about it.

## Why the typeset docs leave this to you

From the [typeset documentation](https://ui.shadcn.com/docs/typeset#responsive-table):

> Tables stay real tables and wrap to fit. To scroll a wide one horizontally instead, wrap it in `typeset-scroll`:
>
> ```tsx
> <div className="typeset-scroll">
>   <table>...</table>
> </div>
> ```
>
> Do this in your renderer's table component or a small rehype plugin. It works for any wide block, not just tables.

Two design choices to make: **who wraps** (render-time vs build-time) and **how** (per-element vs automatic).

| Approach | Pros | Cons |
| --- | --- | --- |
| **Per-table MDX** (`<div className="typeset-scroll"><table>…</table></div>`) | Explicit, no plugin | Easy to forget on the 9th post of a series; mixes concerns |
| **Render-time in a `<MDXTable>` component** | One place to style | Still requires MDX author to use the component, not raw `<table>` |
| **Build-time rehype plugin** | Automatic, no author effort, content stays portable Markdown | One more thing to maintain; need to verify idempotency |

**Decision: build-time rehype plugin.** Markdown should stay portable Markdown. Authors shouldn't have to think about layout — that's the framework's job. The plugin is short enough that the maintenance burden is near zero.

## The plugin

`apps/web/lib/rehype-wrap-tables.ts` (or wherever Velite configs live):

```ts
import type { Element, Parents, Root } from "hast"
import { visit } from "unist-util-visit"

const TABLE_WRAPPER_CLASS = "typeset-scroll"

/**
 * Check if the parent already wraps a table — makes the plugin idempotent
 * when unist-util-visit descends into the wrapper we just inserted.
 */
function isAlreadyWrapped(parent: Parents): boolean {
  if (parent.type !== "element") return false
  const className = parent.properties?.className
  if (!Array.isArray(className)) return false
  return className.includes(TABLE_WRAPPER_CLASS)
}

export function rehypeWrapTables() {
  return (tree: Root): void => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return
      if (isAlreadyWrapped(parent)) return

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: [TABLE_WRAPPER_CLASS] },
        children: [node],
      }

      // Replace the table node with the wrapper in the parent's children array.
      parent.children[index] = wrapper
    })
  }
}
```

Wire it into Velite:

```ts
// apps/web/velite.config.ts
import { rehypeWrapTables } from "./lib/rehype-wrap-tables"
// ... existing imports

export default defineConfig({
  // ...
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, prettyCodeOptions],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      rehypeWrapTables,  // <-- add last so it sees the final tree
    ],
  },
})
```

**Order matters:** place it after other table-touching plugins so it sees the final tree. `rehype-pretty-code` doesn't touch tables, but future plugins might.

## The CSS

Typeset doesn't style `.typeset-scroll` — you need to add the rules yourself. Match `typeset`'s aesthetic (rounded corners, muted border) and add `overflow-x: auto`:

```css
/* packages/ui/src/styles/typeset.css or globals.css */

.typeset-scroll {
  @apply my-[var(--typeset-flow)] overflow-x-auto rounded-lg border border-border;
  /* Optional: thin scrollbars that match the theme on Windows/Linux */
  scrollbar-width: thin;
  scrollbar-color: var(--muted-foreground) transparent;
}

/* Inner table needs an explicit width or it'll collapse to content size */
.typeset-scroll > table {
  @apply w-full table-auto border-collapse text-[0.9375em];
}

.typeset-scroll > thead {
  @apply bg-muted/50;
}

.typeset-scroll > th {
  @apply px-3 py-2 text-left font-semibold border-b border-border;
}

.typeset-scroll > td {
  @apply px-3 py-2 border-b border-border;
}

.typeset-scroll > tbody tr:last-child td {
  @apply border-b-0;
}
```

The wrapper picks up `var(--typeset-flow)` so the spacing above/below the table matches the rest of the prose rhythm. The `border-border` and `bg-muted/50` reuse `base-nova` tokens.

## Optional: scroll-fade for visual cue

The [firxworx guide](https://firxworx.com/blog/astro-responsive-tables-markdown-rehype/) shows how to add a CSS-mask-based scroll fade so users see a "more content this way" hint when the table overflows. It's a nice touch but adds ~25 lines of CSS and uses scroll-driven animations (Firefox requires a flag as of 2026). **Defer until we have actual wide tables in production.** Most blog tables (5-7 columns of text) fit on phones without overflow.

## Edge cases

- **Tables inside MDX components that already wrap them** (rare): the `isAlreadyWrapped` check prevents double-wrapping. If a future component uses a different wrapper class, update the check or accept the double-wrap.
- **Tables inside `<details>`**: still wrapped. The `<details>` element itself isn't styled by Typeset, but the table inside will scroll correctly when expanded.
- **`<table>` inside `<table>`** (nested tables, very rare): only the outer table gets wrapped, the inner stays as-is. Acceptable.
- **Generated tables** (e.g. `<ReactAriaTable>` components): these don't go through MDX rehype, so the plugin doesn't touch them. Style them in the component itself if needed.

## Testing it

Add a test post with a deliberately wide table:

```md
| Tool | Purpose | Trigger | Owner | Status | Notes |
|------|---------|---------|-------|--------|-------|
| ...  | ...     | ...     | ...   | ...    | ...   |
```

Run `velite build`, then in the browser:
1. ✅ On desktop, table renders inline (no scrollbar unless columns exceed viewport).
2. ✅ On mobile (or a narrow desktop window), scrollbar appears; horizontal scroll works.
3. ✅ Page zoom up to 200% doesn't break layout.
4. ✅ Dark mode: border + muted background use the right OKLCH tokens.

## The decision for `b-t`

Add the plugin + CSS before the first real post goes live. The 40 lines of plugin code and ~15 lines of CSS are a small cost for tables that Just Work forever. Skip the scroll-fade until we have actual data showing we need the visual cue.

## Open questions / next time

- Should we also auto-wrap `<pre>` (not just `<table>`) inside `.typeset-scroll` for very wide code blocks that exceed the viewport? `rehype-pretty-code` already adds `overflow-x: auto` on `<pre>` via its own grid layout, so probably no. Verify on first post.
- Will `unist-util-visit` play nicely with Velite's MDX compilation pipeline? It works in every other rehype-using tool I've seen; defer verification to the first build.

## References

- [shadcn/typeset — Responsive Table section](https://ui.shadcn.com/docs/typeset#responsive-table)
- [Responsive tables in Astro with a custom rehype plugin — firxworx](https://firxworx.com/blog/astro-responsive-tables-markdown-rehype/) (the 40-line pattern this doc is based on)
- [`unist-util-visit` documentation](https://github.com/syntax-tree/unist-util-visit)
- [`@benjamincharity/rehype-enhanced-tables`](https://github.com/benjamincharity/rehype-enhanced-tables) (a more featureful alternative if we need sticky headers, sort UI, etc.)
- [Velite rehype plugins guide](https://velite.js.org/guide/code-highlighting) (for where to wire the plugin)
