---
name: content-collections-nextjs-16
description: Why Velite + shadcn/typeset + Shiki is the chosen content + typography + code-highlighting stack for a Next.js 16 MDX blog, the traps that block the obvious setup, and the integration recipe that survives Turbopack.
created: 2026-07-29
updated: 2026-07-29
---

# Content collections on Next.js 16 — what I learned the hard way

> **Status:** Decision (recommended path: Velite + shadcn/typeset + `@shikijs/rehype`)
> **Context:** Setting up a personal blog template (`b-t`) on the shadcn/ui monorepo stack (Next 16.2.6, React 19.2, Tailwind 4, shadcn `base-nova` over Base UI, Turbopack as default bundler).

## TL;DR

For an MDX-first blog on Next.js 16, **Velite** is the right content layer in 2026. Pair it with **shadcn/typeset** for prose typography and **`@shikijs/rehype`** for code highlighting. Three non-obvious traps block the obvious setup and are worth knowing before writing the first line of config:

1. **Velite's official `next.config.ts` snippet is broken with Turbopack.** `process.argv.indexOf('dev')` returns `-1` because Next 16's `start-server.js` doesn't pass `dev` through argv. Use `process.env.NODE_ENV` instead.
2. **`params` is async in Next 16.** Forgetting `await params` in `app/blog/[slug]/page.tsx` doesn't produce a type error you'll notice — it produces a silent 404.
3. **Custom JS plugins in `next.config.ts` don't work under Turbopack** (it's written in Rust, no JS function crossing the boundary). This is *only* a problem for `@next/mdx` users — **Velite's rehype plugins run in plain Node, outside Turbopack**, so we get full Shiki config without needing a custom loader package.

## The constraints Next 16 imposes on a blog

These are the breaking changes that actually touch blog code, from the [Next.js 16 release notes](https://nextjs.org/blog/next-16) and the [upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16):

| Change | What it means for a blog |
| --- | --- |
| `params` / `searchParams` are `Promise<...>` | Every `[slug]` route and every `generateMetadata` must `await params`. |
| `cookies()` / `headers()` / `draftMode()` are async | Theme preference, draft-mode cookies, anything gated on request headers must be awaited. |
| Turbopack is the default bundler | Anything relying on a Webpack plugin (e.g. `VeliteWebpackPlugin`) does not run anymore. |
| `next lint` is removed | Use ESLint directly. (Already the case here.) |
| `revalidateTag(tag, profile)` requires a `cacheLife` profile | Use `'max'` for long-lived content like blog posts. |
| Node ≥ 20.9 | OK — repo already requires `>= 20`. |
| Parallel routes require explicit `default.js` | Irrelevant for a blog but worth knowing. |
| 16.2 (March 2026): faster startup, faster `ImageResponse`, error causes | Pure wins for an OG-image-heavy blog. |

## The options I compared

### `@next/mdx` (official)

Viable but ends up being a half-built content layer.

- ✅ Zero third-party dep. Plugin wraps `next.config.ts` cleanly.
- ✅ Turbopack supported, but **only with plugin names as strings** — functions don't survive the Rust/JS boundary.
- ❌ **No frontmatter YAML.** Need `remark-frontmatter` + `gray-matter` and roll your own parser.
- ❌ **No typed collections.** To list all posts you `fs.readdir` + dynamic `import(`@/content/${slug}.mdx`)`.
- ❌ No validation, no TOC, no reading time, no excerpt.

Verdict: works for a one-page "about" site. For a blog, you reinvent Velite poorly.

### Velite

- ✅ Zod-validated frontmatter — the build fails if `cover` or `date` is missing. This is the killer feature for a blog.
- ✅ Computed fields out of the box: `s.metadata()` (reading time, word count), `s.excerpt({ length })`, `s.toc()`.
- ✅ `s.mdx()` compiles the body to a JS module string — evaluated at render time with `new Function(code)(runtime)`. No bundler coupling. Works server-side.
- ✅ Framework-agnostic output (JSON + JS modules in `.velite/`).
- ⚠️ `VeliteWebpackPlugin` is dead with Turbopack. The docs' `process.argv` snippet doesn't work either (see below).
- ⚠️ Smaller community than Contentlayer had. Docs are improving but not exhaustive.

Verdict: **recommended.** The validation guarantee and the TOC/excerpt/reading-time ergonomics are worth the integration cost.

### Fumadocs

- ✅ Excellent MDX + search (Orama) + sidebar tree if you need a **documentation site**.
- ✅ Clean Next plugin (`createMDX`).
- ❌ Optimized for docs, not blog: `DocsLayout`, `DocsPage`, page tree — a blog wants `PostCard` grids, prominent dates, tags, RSS.
- ❌ Ships its own CSS (`fumadocs-ui/css/neutral.css` + `preset.css`) that collides with shadcn's `base-nova` neutral palette (both define `--background`, `--foreground`, `--primary` in OKLCH with different values).
- ❌ Coupled to Next — no escape hatch.

Verdict: not the right tool. If we ever need a `/docs` section of the blog, we can revisit, but a blog's home page should not live inside Fumadocs' `DocsLayout`.

### Headless CMS (Sanity, TinaCMS, Contentful)

Out of scope for a static MDX-first personal blog. Worth noting for later: TinaCMS sits nicely on top of git-based MDX if I ever want a visual editor.

## Typography: shadcn/typeset vs Tailwind Typography

Once Velite produces the HTML, the question is what styles it. Two real options in 2026.

### `@tailwindcss/typography` (`.prose`)

The long-standing default. Add the plugin, drop `prose` on a wrapper, get sensible typography defaults.

- ✅ Battle-tested. Huge community. Tracks Tailwind releases.
- ✅ Familiar to anyone who has shipped a Tailwind blog.
- ❌ Fixed `rem` scale (`prose-sm` → `prose-2xl`). Doesn't resize with the container.
- ❌ `prose-invert` is a *second* palette you have to maintain.
- ❌ Override API uses `prose-a:`, `prose-headings:` modifiers — fine but you fight specificity.
- ❌ No streaming-stable layout contract (no `:last-child`, `:has()`, `:empty` ban).

### shadcn/typeset (`.typeset`)

Released by shadcn on **2026-07-10** (two weeks before this doc). Not a plugin, not a CLI install — **one CSS file you copy into your project and own**.

- ✅ Container-relative sizing (`1em`, follows the wrapper). Bumps up on small screens automatically.
- ✅ **Uses our existing theme tokens** (`--color-foreground`, `--color-muted-foreground`, `--color-border`, `--radius`). Dark mode is automatic — we already define these in `packages/ui/src/styles/globals.css` for the shadcn `base-nova` preset.
- ✅ Plain Tailwind utilities win without `!important` (cascade-layer trick: Typeset lives in `@components`, Tailwind in `@utilities`, later layer wins).
- ✅ Streaming-stable: no `:last-child`/`:has()`/`:empty` in layout rules, `margin-block-start` only — new blocks don't reflow earlier ones.
- ✅ Zero-specificity `:where()` selectors + `.not-typeset` escape hatch (borrowed from `.not-prose`).
- ✅ Three controls to tune: `--typeset-size`, `--typeset-leading`, `--typeset-flow`.
- ⚠️ `margin-trim` is Safari-only (16.4+). No-op in Chrome/Firefox. Not load-bearing for us.
- ⚠️ Wide tables wrap to fit by default; horizontal scroll needs a `.typeset-scroll` wrapper (small rehype plugin).

**Comparison table (paraphrased from the official docs):**

| | `@tailwindcss/typography` (`.prose`) | shadcn/typeset (`.typeset`) |
| --- | --- | --- |
| Sizing | Fixed `rem` scale, `.prose-sm` to `.prose-2xl` | Relative to the container, any size |
| Dark mode | `.prose-invert`, a second palette | Our tokens flip, nothing to add |
| Overrides | `prose-a:`, `prose-headings:` modifier API | Plain utilities and CSS win |
| Streaming | No append-stability contract | Designed for stable appends |
| Distribution | npm plugin, generated CSS | One CSS file we own |
| Theme coupling | Generic | Reuses `--font-sans`, `--font-mono`, OKLCH palette from `base-nova` |

**Verdict: shadcn/typeset.** It's a near-perfect fit because:
- We already have the OKLCH token set shadcn/typeset expects (`base-nova`).
- We don't need `@tailwindcss/typography` as a dependency → smaller install.
- The file lives in our repo, in `packages/ui/src/styles/`, so any future shadcn add-on (chat, docs, etc.) can reuse it.
- Matches the shadcn philosophy: "own the source, skip the abstraction."

**Integration cost:** copy `typeset.css` from the builder on `ui.shadcn.com/typeset`, drop it next to `globals.css`, add `@import "./typeset.css";` after the Tailwind import, wrap the MDX render with `<article className="typeset typeset-blog">`.

## Code highlighting: Shiki via `@shikijs/rehype`

Three production options with Velite:

| Option | Notes |
| --- | --- |
| `@shikijs/rehype` | Native Shiki, full theme + transformer support. Recommended. |
| `rehype-pretty-code` | Wraps Shiki, emits `data-rehype-pretty-code-figure` / `data-line` / `data-highlighted-line` attributes that play well with custom CSS. Used by Bunny Honey Club. Slightly more markup to style. |
| `rehype-highlight` (lowlight) | Lighter, but no theming fidelity. Skip. |

**Verdict: `rehype-pretty-code`.** Reasons:
- Battle-tested styling contract (`data-line`, `data-highlighted-line`, `data-line-numbers`).
- Plays nicely with both shadcn/typeset (no conflict with prose styles) and a future code-block component if we want one (`<CodeBlock>` with copy button).
- Diff and highlight annotations (`// [!code ++]`, `// [!code highlight]`) work via `@shikijs/transformers`.
- The Velite docs explicitly recommend it as the "well-documented path."

### Why Shiki works for us under Turbopack

This was the second hidden gotcha worth capturing. Will Sather [documents the issue](https://www.sather.ws/writing/shiki-code-blocks-turbopack) for `@next/mdx`: Turbopack is written in Rust, so custom JS function options passed via `next.config.ts` (`remarkPlugins: [remarkGfm]`, Shiki transformers, etc.) **don't cross the boundary**. His fix is to wrap MDX in a separate `loader/` package with its own `package.json` and call it via `turbopack.rules`.

**We don't have this problem** because Velite runs in plain Node.js — *before* Turbopack is even involved — via the `predev`/`prebuild` npm scripts. Shiki, rehype-pretty-code, transformers, copy-button plugin, custom themes: all of them execute in Node during `velite build`, and the output is a `.velite/` directory of static data + JS modules that Next then imports. Turbopack never sees the rehype plugin chain.

This is one of the under-appreciated reasons Velite is the right choice here — it sidesteps the bundler-coupling trap entirely.

## The two traps that cost me the most time

### Trap 1 — `process.argv` doesn't see `dev` under Turbopack

The Velite docs ship this snippet for `next.config.ts`:

```ts
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
}
```

It looks correct. It doesn't work on Next 16. With Turbopack as the default bundler, `next dev` is invoked via `next/dist/server/lib/start-server.js` internally — and that wrapper does **not** include `'dev'` in `process.argv`. Both `isDev` and `isBuild` come out `false`, the gate short-circuits, Velite never starts, edits to `.mdx` files do nothing, no error message.

**Fix:** use `process.env.NODE_ENV` instead. It's set by Next.js itself, regardless of how the server is launched.

```ts
const isDev = process.env.NODE_ENV === 'development'
const isBuild = process.env.NODE_ENV === 'production'
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
}
```

`NODE_ENV` is reliable across both webpack and Turbopack. Confirmed working with this fix.

Reference: [Luke Manning's "Setting Up Velite with Next.js 16"](https://lukemanning.ie/blog/setting-up-velite-nextjs-revised).

### Trap 2 — async `params` 404s silently

Next 15 made `params` async. Next 16 keeps the change. The blog route handler looks innocent:

```ts
export default function PostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug)
  // ...
}
```

TypeScript *does* complain about the type (`params: Promise<{ slug: string }>` is the expected signature). If you ignore the type error or `as`-cast your way past it, **the route silently 404s** — Next expects an async handler to await the params promise, and without `await` the handler effectively never runs to the body.

**Fix:** type `params` as `Promise<{ slug: string }>` and `await` it:

```ts
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) notFound()
  // ...
}
```

`generateMetadata` has the same shape and needs the same treatment.

Reference: same Luke Manning post, plus the [Next 16 breaking changes list](https://nextjs.org/docs/app/guides/upgrading/version-16#version-16).

## The integration recipe that works

### 1. Install

```bash
# apps/web
npm install velite
npm install -D shiki rehype-pretty-code rehype-slug rehype-autolink-headings remark-gfm
```

### 2. Velite config

`apps/web/velite.config.ts`:

```ts
import { defineConfig, defineCollection, s } from "velite"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import remarkGfm from "remark-gfm"

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(280),
      date: s.isodate(),
      updated: s.isodate().optional(),
      tags: s.array(s.string()).default([]),
      cover: s.image().optional(),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      excerpt: s.excerpt({ length: 240 }),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      slug: data.slug.replace(/^posts\//, ""),
      permalink: `/blog/${data.slug.replace(/^posts\//, "")}`,
    })),
})

export default defineConfig({
  root: "content",
  output: { data: ".velite", clean: true },
  collections: { posts },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: "github-dark", keepBackground: false }],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
})
```

Important: with Turbopack, plugins must be **referenced by string** or by `await import(...)` inside the config — pure functions passed as options don't survive the boundary. If you hit `Cannot find module 'remark-gfm'`, that's why.

### 3. tsconfig alias

`apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@workspace/ui/*": ["../../packages/ui/src/*"],
      "#site/content": ["./.velite"]
    }
  }
}
```

The `#site/content` alias is Velite's convention. It maps to `.velite/index.js` and gives every consumer full TypeScript types for free.

### 4. Next config wiring

`apps/web/next.config.ts`:

```ts
import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"
const isBuild = process.env.NODE_ENV === "production"
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = "1"
  import("velite").then((m) => m.build({ watch: isDev, clean: !isDev }))
}

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
```

### 5. npm scripts

`apps/web/package.json`:

```json
{
  "scripts": {
    "predev": "velite --watch &",
    "dev": "next dev",
    "prebuild": "velite build",
    "build": "next build"
  }
}
```

In practice, run Velite and Next in two terminals — Velite errors are easier to read when they're not interleaved with Next's. The `predev`/`prebuild` integration is there for CI.

### 6. The MDX runtime

The compiled `body` field is a string of JavaScript. To turn it into a React component, evaluate it against the JSX runtime:

```ts
// apps/web/lib/mdx.tsx
import * as runtime from "react/jsx-runtime"

type MDXModule = { default: React.ComponentType<{ components?: object }> }

const cache = new Map<string, React.ComponentType<{ components?: object }>>()

export function getMDXComponent(code: string) {
  let C = cache.get(code)
  if (!C) {
    C = (new Function(code)({ ...runtime }) as MDXModule).default
    cache.set(code, C)
  }
  return C
}
```

This is the canonical Velite pattern and it is load-bearing: the `new Function` call evaluates the module string, `{ ...runtime }` provides the JSX runtime the module was compiled against, the `Map` keeps component identity stable across renders so React doesn't unmount the tree on every render.

Reference: [Bunny Honey Club's "Building a production MDX blog with Next.js 16 and Velite"](https://blog.bunnyhoneyclub.com/posts/building-a-production-mdx-blog-with-nextjs-16-and-velite) — this is the cleanest implementation I found.

### 7. The actual routes

```tsx
// app/blog/page.tsx
import { posts } from "#site/content"
import { PostCard } from "@/components/post-card"

export default function BlogIndex() {
  const published = posts.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl">Posts</h1>
      <ul className="mt-8 grid gap-6">
        {published.map((p) => <PostCard key={p.slug} post={p} />)}
      </ul>
    </div>
  )
}
```

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation"
import { posts } from "#site/content"
import { getMDXComponent } from "@/lib/mdx"
import { Callout } from "@workspace/ui/components/callout" // future
import type { Metadata } from "next"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) notFound()

  const MDX = getMDXComponent(post.body)
  return (
    // typeset + a `typeset-blog` preset we tune for long-form reading
    <article className="typeset typeset-blog mx-auto max-w-3xl px-6 py-16">
      <header className="not-typeset mb-12">
        <h1 className="font-heading text-4xl">{post.title}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{post.description}</p>
        <time dateTime={post.date} className="text-muted-foreground text-sm">
          {new Date(post.date).toLocaleDateString("en", { dateStyle: "long" })}
        </time>
      </header>
      {/* code blocks (rehype-pretty-code + Shiki) inherit .typeset's font-mono and rhythm */}
      <MDX components={{ Callout /* , Stat, Pullquote, FAQ, Takeaways */ }} />
    </article>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export function generateStaticParams() {
  return posts
    .filter((p) => !p.draft)
    .map((p) => ({ slug: p.slug }))
}
```

### 8. Wire shadcn/typeset + rehype-pretty-code into Velite

Velite config (`apps/web/velite.config.ts`), updated to add Shiki + typeset-friendly code blocks:

```ts
import { defineConfig, defineCollection, s } from "velite"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from "rehype-pretty-code"
import remarkGfm from "remark-gfm"

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(280),
      date: s.isodate(),
      updated: s.isodate().optional(),
      tags: s.array(s.string()).default([]),
      cover: s.image().optional(),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      excerpt: s.excerpt({ length: 240 }),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      slug: data.slug.replace(/^posts\//, ""),
      permalink: `/blog/${data.slug.replace(/^posts\//, "")}`,
    })),
})

const prettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  defaultLang: "plaintext",
  onVisitLine(node) {
    // Prevent empty lines from collapsing the line-height in shadcn/typeset.
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }]
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className = ["line--highlighted"]
  },
}

export default defineConfig({
  root: "content",
  output: { data: ".velite", clean: true },
  collections: { posts },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, prettyCodeOptions],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
})
```

CSS in `packages/ui/src/styles/typeset.css` (copied from the shadcn typeset builder, tuned for our `--font-sans` / `--font-mono` from `globals.css`), imported in `globals.css`:

```css
/* packages/ui/src/styles/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "./typeset.css";   /* <-- add this line */

@custom-variant dark (&:is(.dark *));
/* ...rest unchanged... */

@layer base {
  /* ...existing rules... */
}
```

Preset class for blog long-form reading (in the same file or a `presets.css`):

```css
.typeset-blog {
  --typeset-font-body: var(--font-sans);
  --typeset-font-heading: var(--font-sans);
  --typeset-font-mono: var(--font-mono);
  --typeset-size: 1em;
  --typeset-leading: 1.75;
  --typeset-flow: 1.5em;
}

/* Dark mode: loosen leading slightly, per the typeset docs' recommendation */
.dark .typeset-blog {
  --typeset-leading: 1.85;
}

/* rehype-pretty-code surface styling — kept minimal because Typeset already
   sets the rhythm; we only need to make the code block visually distinct. */
.typeset [data-rehype-pretty-code-figure] pre {
  @apply rounded-lg border border-border bg-muted/40 p-0 text-sm;
}
.typeset [data-rehype-pretty-code-figure] code {
  @apply grid overflow-auto py-4;
}
.typeset [data-rehype-pretty-code-figure] code [data-line] {
  @apply border-l-2 border-l-transparent px-4;
}
.typeset [data-rehype-pretty-code-figure] .line--highlighted {
  @apply border-l-foreground/40 bg-muted;
}
.typeset [data-rehype-pretty-code-figure] [data-highlighted-chars] {
  @apply rounded bg-foreground/10;
}
```

That's the whole stack. `velite build` produces `apps/web/.velite/` with the body as a JS module string, the runtime evaluates it inside `<article className="typeset typeset-blog">`, and shadcn/typeset handles every other element (h2/h3, ul, table, blockquote, hr, etc.).

## Decisions captured

- **Content layer:** Velite.
- **MDX engine:** Velite's built-in MDX pipeline. No Fumadocs.
- **Code highlighting:** `rehype-pretty-code` + Shiki, run as a Velite rehype plugin (so Turbopack never sees them). Dual themes `github-light` / `github-dark` keyed off the existing `.dark` class.
- **Typography / prose:** shadcn/typeset (`.typeset` + a `.typeset-blog` preset), not `@tailwindcss/typography`. The file lives at `packages/ui/src/styles/typeset.css` and is owned by us.
- **Content location:** `apps/web/content/posts/**/*.mdx`. Lives with the app, no cross-app consumption needed yet.
- **Search:** out of scope for now. If the corpus grows past ~50 posts, Pagefind or Orama. Don't add it preemptively.
- **Comments:** not decided. Giscus is the likely candidate when needed (git-based, no tracking).
- **RSS:** `app/feed.xml/route.ts` generated from the same `#site/content` import. Defer until there are at least three posts.
- **OG images:** `next/og` with `ImageResponse` (now 2-20× faster in 16.2). Defer.

## Open questions / next time

- Does `shiki` pull in all language grammars by default? If so, **trim the language set** in the Velite config (Shiki accepts a `langs` array) to keep `.velite/` small and dev startup fast. Defer until we see a real slowdown.
- The `rehype-pretty-code` `onVisitLine` workaround (replace empty lines with a space) is only needed because some themes collapse empty lines in a way that fights Typeset's vertical rhythm. Verify visually on the first three real posts.
- Wide tables will need a `.typeset-scroll` wrapper. Decide whether to add a small rehype plugin or just mark `<table>` elements explicitly in MDX.
- Confirm shadcn/typeset doesn't double-style elements that already exist in the shadcn `base-nova` preset (e.g. `--font-sans`, `--radius`). The two are designed to coexist but worth a quick visual diff before shipping.

## Open questions / next time

- How does `rehype-pretty-code`'s Shiki bundle behave under Turbopack? Need to verify on first build — Shiki pulls in a lot of languages by default; trim to a small set early to keep dev startup fast.
- Can the `theme-provider.tsx` hotkey (`d` for dark mode) coexist with browser shortcuts like `Ctrl+D` (bookmark)? Yes — the current implementation already ignores modifier keys. Confirmed in code.
- `lucide-react@1.27` is unusually high for that package. Need to verify tree-shaking still works at build time before relying on it across many components.

## References

- [Next.js 16 release notes](https://nextjs.org/blog/next-16)
- [Next.js 16.2 release notes](https://nextjs.org/blog/next-16-2)
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js MDX guide (16.2.12)](https://nextjs.org/docs/app/guides/mdx)
- [Velite + Next.js integration guide](https://velite.js.org/guide/with-nextjs)
- [Velite code highlighting guide](https://velite.js.org/guide/code-highlighting)
- [Velite Review 2026 — MakerStack](https://makerstack.co/reviews/velite-review/)
- [Fumadocs manual install for Next.js](https://www.fumadocs.dev/docs/manual-installation/next)
- [Fumadocs Review 2026 — MakerStack](https://makerstack.co/reviews/fumadocs-review/)
- [Building a production MDX blog with Next.js 16 and Velite — Bunny Honey Club](https://blog.bunnyhoneyclub.com/posts/building-a-production-mdx-blog-with-nextjs-16-and-velite)
- [Setting Up Velite with Next.js 16 — Luke Manning](https://lukemanning.ie/blog/setting-up-velite-nextjs-revised)
- [shadcn/typeset documentation](https://ui.shadcn.com/docs/typeset)
- [shadcn/typeset vs Tailwind Typography — Dennis Morello](https://morello.dev/blog/shadcn-typeset-vs-tailwind-prose)
- [Shiki Code Blocks with Turbopack — Will Sather](https://www.sather.ws/writing/shiki-code-blocks-turbopack) (and why Velite sidesteps the problem entirely)
- [Rehype Pretty Code](https://rehype-pretty.pages.dev/)
