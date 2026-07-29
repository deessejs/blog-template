---
name: rehype-pretty-code-empty-lines
description: Why some Shiki themes collapse empty lines inside rehype-pretty-code, the onVisitLine workaround, and the cleaner alternatives (theme choice, white-space CSS) for keeping line height consistent inside shadcn/typeset.
created: 2026-07-29
updated: 2026-07-29
---

# Preserving empty lines in rehype-pretty-code (and why it matters with shadcn/typeset)

> **Status:** Decision (recommended: the `onVisitLine` workaround, applied once, never touched again).
> **Context:** Velite + `rehype-pretty-code` rendering MDX code blocks inside `<article class="typeset typeset-blog">` in the `b-t` blog template.

## TL;DR

`rehype-pretty-code` emits each line of a code block as a `<span data-line>` containing a single text node. When the line is **empty**, the span has no text content and collapses to `height: 0`. Result: the code block loses its vertical rhythm and the line numbers / highlighting get out of sync with the actual lines.

The fix is a one-liner in `onVisitLine` that replaces empty-line text with a single space:

```ts
onVisitLine(node) {
  if (node.children.length === 0) {
    node.children = [{ type: "text", value: " " }]
  }
}
```

This is a known, documented workaround. Add it once and forget about it.

## Why it happens

In standard HTML, a `<span>` with no content is zero-height — browsers don't reserve space for empty inline elements unless they contain a non-breaking space or explicit min-height. Shiki's tokenizer emits spans for *every* line (including blank ones between functions, before/after control flow, etc.) for layout stability, but it doesn't fill empty lines with anything.

For *most* uses, this is invisible because:
- The code block has `line-height: 1.5` set on `<code>`.
- Each non-empty `<span data-line>` has actual text → it gets the full line-height.
- Empty spans collapse → the next non-empty span sits where the empty one should have been.

The problem shows up when:
1. **Line numbers** are rendered with CSS counters (`counter-increment: line` on `[data-line]::before`). Empty lines still need to count, but they have no rendered height → the counter for line 5 might appear directly under line 4 with no gap.
2. **Line highlighting** with `[data-highlighted-line]` background-color. The highlighted line needs its full height to show the highlight band. An empty highlighted line is invisible.
3. **Vertical rhythm** in shadcn/typeset. Typeset assumes every block element has content and `--typeset-flow` between them. A collapsed code line breaks the visual cadence.

## The fix, in three lines

`rehype-pretty-code` exposes an `onVisitLine` hook that lets you mutate each line element before it's serialized. Replace empty `children` arrays with a single space text node:

```ts
// apps/web/velite.config.ts
import rehypePrettyCode from "rehype-pretty-code"

const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  defaultLang: "plaintext",
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }]
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className = ["line--highlighted"]
  },
}
```

The single space (`U+0020`) gives the span one character of content; combined with `line-height: 1.5`, it produces exactly one line of vertical space. The space is invisible (no `white-space: pre` artifact because the parent's `white-space: pre` makes the space count as a visible character only if it has neighbors — and here it's the *only* character, so it's effectively a zero-width filler that the line-height renders around).

## Alternatives considered (and rejected)

### A. CSS-only: `min-height` on `[data-line]`

```css
.typeset [data-rehype-pretty-code-figure] [data-line] {
  min-height: 1lh; /* modern CSS, ~Tailwind 4 / 2026 */
}
```

- ✅ No JS, no plugin option.
- ✅ Works regardless of which line is empty.
- ❌ Requires `1lh` (line-height unit) support — available in all modern browsers as of 2026 but worth checking the audience.
- ❌ Doesn't address the **highlighted-line collapse** (an empty `[data-highlighted-line]` still won't show its background unless we also give it min-height).
- ❌ Doesn't help with `counter-increment` if the line has no `::before` content to render.

This is a good **complementary** measure but doesn't replace the `onVisitLine` fix.

### B. Strip trailing whitespace per-line in the source

Some teams add a CI step that fails if a code block contains trailing whitespace on empty lines. Doesn't help — the lines are already empty after the markdown parser.

### C. Use a different theme

Some themes' default line-height behavior in the rendered HTML is different. Tested: no, all Shiki themes produce the same empty-span output. The issue is in the plugin, not the theme.

### D. Use Shiki's `transformerCompactLine` or similar

There's no Shiki transformer that handles this. Transformers operate on token spans, not on the line wrapper.

## Edge cases and gotchas

- **Don't use `&nbsp;` (`U+00A0`).** It's a non-breaking space, which renders as a visible character in some fonts at certain zoom levels and can cause copy-paste to include non-breaking spaces. Stick with the regular space.
- **The empty span still gets `counter-increment` from CSS** (`counter-increment: line` on `::before`). That's correct — empty lines should count toward line numbers.
- **If you use `showLineNumbers`**, the `::before` content (`counter(line)`) renders even on empty lines, which is what you want.
- **If you use `bypassInlineCode: true`**, this fix doesn't affect inline code (which doesn't have lines). Safe.

## The decision for `b-t`

Keep the `onVisitLine` workaround in the Velite config. Add a complementary CSS rule that sets `min-height: 1lh` on `[data-line]` as a belt-and-suspenders measure for future content (e.g. code pasted from sources that don't go through rehype-pretty-code, like live-rendered `<Code>` server components). Document it once in the global CSS so the next person doesn't reintroduce the bug while "cleaning up" the plugin options.

## Open questions / next time

- Could a small custom rehype plugin emit `<br>` inside empty spans instead of a space, for better screen-reader semantics? Probably not worth it — `data-line` is already a structural marker, and screen readers don't read individual code lines.
- If we ever switch to `@shikijs/rehype` directly (drop `rehype-pretty-code`), the line structure changes (no `data-line` wrapper, just inline spans). Need to verify the same workaround applies, or accept that the typeset rhythm may break.

## References

- [Rehype Pretty Code — Options (incl. `onVisitLine`)](https://rehype-pretty.pages.dev/#visitor-hooks)
- [Rehype Pretty Code Issue #184 — Preserve Whitespace](https://github.com/rehype-pretty/rehype-pretty-code/issues/184)
- [Bunny Honey Club — production MDX blog setup](https://blog.bunnyhoneyclub.com/posts/building-a-production-mdx-blog-with-nextjs-16-and-velite) (uses a near-identical pattern)
- [shadcn/typeset — `--typeset-flow` rhythm control](https://ui.shadcn.com/docs/typeset)
