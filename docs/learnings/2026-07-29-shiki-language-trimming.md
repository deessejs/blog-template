---
name: shiki-language-trimming
description: How to keep the Shiki syntax-highlighter's bundle small inside a Velite + rehype-pretty-code pipeline: bundle presets, fine-grained langs/themes, and the getHighlighter hook that gets you out of the default 6.4 MB.
created: 2026-07-29
updated: 2026-07-29
---

# Trimming the Shiki bundle — what to ship and what to leave out

> **Status:** Decision (recommended: explicit `langs` + `themes` via `getHighlighter`, not `shiki/bundle/full`).
> **Context:** Velite + `rehype-pretty-code` running as a build-time rehype plugin in the `b-t` blog template.

## TL;DR

By default, Shiki's `shiki` entry point **bundles every supported language and theme as async chunks** — the full bundle is **6.4 MB minified / 1.2 MB gzipped**. For a personal blog with maybe ten languages actually used, that's a 50-100× waste. The fix is a one-line `getHighlighter` option in `rehype-pretty-code` that whitelists exactly the langs you want.

```ts
import { createHighlighter } from "shiki"

const prettyCodeOptions = {
  getHighlighter: (options) =>
    createHighlighter({
      ...options,
      langs: ["ts", "tsx", "js", "jsx", "bash", "json", "css", "html", "md", "mdx"],
      themes: ["github-light", "github-dark"],
    }),
}
```

That takes the highlighter from "everything" to "what you use" with no functional change.

## What Shiki actually ships

Three bundle presets, increasing in scope ([source](https://shiki.style/guide/bundles)):

| Entry | Min | Gzip | Notes |
| --- | --- | --- | --- |
| `shiki/bundle/web` | 3.8 MB | 695 KB | All themes + web-stack langs (HTML, CSS, JS, TS, JSON, Markdown, Vue, JSX, Svelte…). The reasonable default for web docs. |
| `shiki/bundle/full` | 6.4 MB | 1.2 MB | Every theme and every language. Same as the main `shiki` entry. |
| Fine-grained (custom) | ~10-50 KB | ~3-10 KB | You import each theme/language as a module. Bundlers only ship what you actually use. |

**The critical thing:** even when you don't *use* a language, it still gets parsed as an async chunk when something near it loads. For Node.js builds (which is our case — Velite runs in Node, not in a browser), this means **dev startup pays the parse cost the first time a code block is highlighted**, not the bundle size. Still: trimming langs makes the cold-start noticeably faster.

## The recommended path: `getHighlighter` on `rehype-pretty-code`

`rehype-pretty-code` accepts a `getHighlighter` option that returns a fully-configured Shiki highlighter ([docs](https://rehype-pretty.pages.dev/)). This is the cleanest seam — it lets you pass *any* Shiki config (`langs`, `themes`, `engine`, custom grammars) without monkey-patching the plugin.

### Minimal config for a TypeScript-heavy blog

```ts
// apps/web/velite.config.ts
import { createHighlighter } from "shiki"
import rehypePrettyCode from "rehype-pretty-code"

const prettyCodeOptions = {
  getHighlighter: (options: Parameters<typeof createHighlighter>[0]) =>
    createHighlighter({
      ...options,
      langs: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "bash",
        "shell",
        "css",
        "html",
        "md",
        "mdx",
        "yaml",
        "diff",
        "plaintext",
      ],
      themes: ["github-light", "github-dark"],
    }),
}
```

That's the entire change. Add the option to the `rehypePlugins` entry in Velite, restart the Velite watcher, and the first `velite build` will only load those grammars.

### If you want the smallest possible bundle

If you also want to keep Shiki's theme/language modules out of the dev-time Node heap, use the **fine-grained bundle** ([shiki docs](https://shiki.style/guide/bundles#fine-grained-bundle)):

```ts
import { createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"

import ts from "@shikijs/langs/typescript"
import tsx from "@shikijs/langs/tsx"
import js from "@shikijs/langs/javascript"
import bash from "@shikijs/langs/bash"
// ... only the langs you'll use

import githubLight from "@shikijs/themes/github-light"
import githubDark from "@shikijs/themes/github-dark"

const prettyCodeOptions = {
  getHighlighter: () =>
    createHighlighterCore({
      langs: [ts, tsx, js, bash /*, ... */],
      themes: [githubLight, githubDark],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    }),
}
```

Cost: a few extra npm packages (`@shikijs/langs`, `@shikijs/themes`), no shorthand theme names (must use the imported module object). Benefit: only the language files you import end up in the dependency graph.

**Recommendation: skip this** unless you've measured a real cold-start problem. The `langs: ["ts", ...]` form is one line shorter, uses Shiki's shorthand names, and the difference at blog scale is invisible.

## How `rehype-pretty-code` consumes the highlighter

The plugin calls `getHighlighter(options)` once per build with the merged options (theme, etc.). Whatever highlighter you return is used for every code block on every page. There is no per-code-block language resolution — if a code block references a language **not in your `langs` array**, Shiki falls back to `plaintext` silently and your syntax highlighting is lost.

**Operational rule:** when you add a new post that uses a language not in the list (say, `rust` or `python`), add it to `langs` before merging. A `pre.code lang-rust` block rendering as monochrome is the only failure signal. Consider adding a Vitest snapshot test that asserts every `code` element has a colored token to catch this early.

## What about JSX transformers and the `transformers` option?

These are independent of the language list. `@shikijs/transformers` (diff, highlight, focus, error-level) work on whatever the highlighter produces — they don't change which languages are loaded. So you can keep `transformers: [transformerNotationDiff(), transformerNotationHighlight()]` and still benefit from a trimmed lang list.

## The decision for `b-t`

Start with the minimal `langs` array above (15 entries covering TS/JS, web stack, shell, data formats). Add more on demand. Don't move to the fine-grained bundle unless profiling shows a real cost — the maintenance burden (imports per language, no shorthand names) isn't worth it at this scale.

If we ever add OG-image generation that needs to highlight code, **reuse this same `getHighlighter`** so we don't ship a second Shiki instance. `satori` + `shiki` is the standard pairing and it accepts the same highlighter object directly.

## Open questions / next time

- Is there a way to validate at Velite build time that every fenced code block's language is in the allowed list? Probably yes via a small custom rehype plugin that throws on unknown langs — would catch the silent fallback to `plaintext` before publishing.
- Does Shiki's WASM engine (`shiki/wasm`) outperform the Oniguruma JS engine for build-time only workloads? On Node it almost certainly doesn't matter; both are fast enough for blogs. Worth measuring only if `velite build` becomes a bottleneck.

## References

- [Shiki Bundles guide](https://shiki.style/guide/bundles)
- [Shiki Best Performance Practices](https://shiki.style/guide/best-performance)
- [Rehype Pretty Code — Options (incl. `getHighlighter`)](https://rehype-pretty.pages.dev/)
- [Rehype Pretty Code — Custom Highlighter example](https://rehype-pretty.pages.dev/#custom-highlighter)
- [GitHub: `rehype-pretty-code` Issue #234 — Using custom Shiki bundle](https://github.com/rehype-pretty/rehype-pretty-code/issues/234)
