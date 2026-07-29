---
name: shadcn-typeset-vs-base-nova
description: How shadcn/typeset coexists with the shadcn base-nova preset — shared OKLCH tokens, font-sans/--font-mono, dark mode, and the small risk surface where the two can disagree.
created: 2026-07-29
updated: 2026-07-29
---

# shadcn/typeset × base-nova — coexistence checklist

> **Status:** Decision (recommended: ship as designed, but verify the four edge cases below on first deploy).
> **Context:** The `b-t` blog template uses shadcn's `base-nova` preset (set in `apps/web/components.json` and `packages/ui/components.json`) and adds `shadcn/typeset` for prose styling. The two were released to work together but weren't built as one system.

## TL;DR

`base-nova` and `typeset` were both shipped by shadcn in 2026 and they share the same design language (OKLCH, neutral palette, Geist family). The `typeset.css` file references your theme tokens (`--color-foreground`, `--color-muted-foreground`, `--color-border`, `--font-sans`, `--font-mono`, `--radius`) — all of which `base-nova` already defines. **They don't conflict by design.** The four risks below are the only places where they can disagree in practice, and each is easy to check in 10 minutes.

## What `base-nova` gives us today

From `packages/ui/src/styles/globals.css`:

- OKLCH palette: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, plus `--sidebar-*` and `--chart-1..5`.
- Two dark/light variants via `@custom-variant dark (&:is(.dark *))`.
- A typography token block: `--font-sans: var(--font-sans)`, `--font-mono: var(--font-mono)`, `--font-heading: var(--font-sans)`.
- Radius scale (`--radius-sm` → `--radius-4xl`) computed from `--radius`.
- Tailwind v4 `@theme inline` mapping so utilities like `bg-background`, `text-foreground`, `border-border`, `rounded-md` resolve.

## What `typeset` adds

From the shadcn/typeset builder, the file imports look like:

```css
@layer components {
  .typeset {
    --typeset-font-body: inherit;
    --typeset-font-heading: var(--font-heading);
    --typeset-font-mono: var(--font-mono);

    --typeset-size: 1em;
    --typeset-leading: 1.75;
    --typeset-flow: 1.25em;

    /* ... and rules for h1-h6, p, ul, ol, blockquote, table, hr, pre, code, etc. */
  }
}
```

Three things to notice:
1. **`--typeset-font-heading: var(--font-heading)`** — `base-nova` already sets `--font-heading: var(--font-sans)`. The chain resolves correctly.
2. **`--typeset-font-mono: var(--font-mono)`** — `base-nova` provides this from `next/font/google` in `apps/web/app/layout.tsx`. Resolves.
3. **No color tokens defined inside `.typeset`.** Typeset doesn't override colors — it uses whatever your surrounding context provides. With `base-nova`, headings inside a `.typeset` block will be `text-foreground` by default because the `:where()` selectors have zero specificity and the base `body { @apply bg-background text-foreground }` rule wins.

## The four risk surfaces

### 1. Import order

```css
/* packages/ui/src/styles/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "./typeset.css";   /* <-- MUST be after tailwind + shadcn */
```

Why: Typeset uses `@layer components` and `:where()`. The cascade-layer ordering puts `typeset`'s rules in `@components`, Tailwind utilities in `@utilities`. **Later layer wins on conflict.** If `typeset.css` is imported before Tailwind, the layer order inverts and Tailwind utilities can't override Typeset's element styles without `!important`.

The current globals.css imports `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css` in that order. Adding `./typeset.css` last preserves the correct order.

### 2. Font variables

The `b-t` layout sets Geist on `<html>`:

```tsx
<html className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}>
```

`font-sans` and `font-mono` are Tailwind utility classes. They set `--font-sans` and `--font-mono` (via the Geist variable) on the `<html>` element, which cascades down.

**Risk:** Typeset's `--typeset-font-heading: var(--font-heading)` resolves to `var(--font-sans)`, which is set on `<html>` → it works. But if a future contributor moves the font variables onto `<body>` instead of `<html>`, the cascade still works because `var()` falls through `html` → `body`. So this is robust as long as variables are set on a container that's an ancestor of every `.typeset` block.

**Verify:** open DevTools on a blog post, look at a `<h2>` inside `<article class="typeset typeset-blog">`, confirm `font-family` is Geist Sans and not a fallback serif.

### 3. Dark mode

`base-nova` defines dark tokens via:

```css
@custom-variant dark (&:is(.dark *));
```

…and a `:root` / `.dark` token block. Typeset **does not** override colors, so dark mode is automatic — when `<html class="dark">` is applied by `next-themes`, all `--color-*` tokens flip and Typeset's contents inherit them.

**Risk:** the `next-themes` provider (`apps/web/components/theme-provider.tsx`) applies the `class` attribute on `<html>` via `attribute="class"`. The `ThemeHotkey` listener toggles between `dark` and `light`. **All good.** No conflict.

But: Typeset's `--typeset-leading` is set to `1.75` by default. The docs explicitly recommend bumping it in dark mode for readability:

```css
.dark .typeset-blog {
  --typeset-leading: 1.85;
}
```

This is a **deliberate** difference from light mode, not a conflict. Add it to the preset class.

### 4. Element collisions

Typeset styles a fixed list of elements: `h1`-`h6`, `p`, `ul`, `ol`, `li`, `blockquote`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `hr`, `pre`, `code`, `a`, `img`, `figure`, `figcaption`, `kbd`, `mark`, `abbr`, `details`, `summary`, `sub`, `sup`, `math`, `mi`, `mo`, `mn`, `ms`, `mtext`, `mspace`. It does not style shadcn-specific primitives like `Button`, `Card`, `Badge`, `Separator`, etc.

`base-nova` components live in `packages/ui/src/components/*.tsx`. They emit their own classes (e.g. `bg-card text-card-foreground rounded-xl border`). None of them match Typeset's element selectors (they're `<div>`/`<button>` with utility classes, not bare elements). **No collision expected.**

**But:** if you ever use `<button>` raw inside `.typeset` content (e.g. a `<button>` in MDX), Typeset doesn't style it — but neither does the shadcn reset. It'll render with browser defaults. **Mitigation:** either wrap with `not-typeset`, or import `Button` from `@workspace/ui/components/button` and pass it via the MDX `components` prop.

## Verification checklist (10 min, ship gate)

1. ✅ Open a blog post with `class="dark"` on `<html>`. Confirm headings use Geist Sans, dark-mode OKLCH tokens apply, code blocks render with github-dark colors.
2. ✅ Toggle theme via the `d` hotkey. Confirm no flash of unstyled content (FOUC) — `suppressHydrationWarning` on `<html>` is already set, `next-themes` `attribute="class"` is in place.
3. ✅ Add a `<table>` in MDX. Confirm it renders with `base-nova` border tokens and Typeset's row spacing. If it overflows on mobile, see the wide-tables learning.
4. ✅ Add an inline `<Button>` via MDX `components`. Confirm it inherits the shadcn button styles (not Typeset's bare-element defaults).

## What I'd change in `globals.css` for the cleanest setup

Right now `packages/ui/src/styles/globals.css` defines `--font-sans: var(--font-sans)` inside `@theme inline`. That's a self-reference — the variable resolves via `next/font` to the actual Geist family. When we add `typeset.css`, this chain becomes:

- `<html class="font-sans">` sets `--font-sans: var(--font-geist-sans)` (Tailwind v4 utility binding).
- `@theme inline { --font-sans: var(--font-sans); }` re-exposes it (no-op).
- `.typeset { --typeset-font-heading: var(--font-heading); }` (in typeset.css).
- `@theme inline { --font-heading: var(--font-sans); }` (in globals.css) resolves `--font-heading` to the same value.

The cycle looks redundant but is intentional and works. No change needed.

## The decision for `b-t`

Ship the integration as planned. Run the four-point verification on the first real post. The combination is well-supported; the risks are minor and verifiable.

## Open questions / next time

- Does `shadcn/typeset` ship with rules for `details > summary` that conflict with our MDX `<details>` blocks? It does have a `details` rule. We don't use native `<details>` currently — defer.
- If we ever wrap Typeset in a `prefers-reduced-motion` aware component, the streaming-stable layout promise becomes load-bearing. Test with `prefers-reduced-motion: reduce` set to ensure no transition flicker.

## References

- [shadcn/typeset documentation](https://ui.shadcn.com/docs/typeset)
- [shadcn/typeset changelog (July 2026)](https://ui.shadcn.com/docs/changelog/2026-07-typeset)
- [shadcn/ui theming docs](https://ui.shadcn.com/docs/theming)
- [shadcn-ui/ui PR #10393 — Geist font variable mismatch in Nova preset](https://github.com/shadcn-ui/ui/pull/10393) (related fix history)
- [Tailwind CSS v4 `@theme inline` documentation](https://tailwindcss.com/docs/theme#namespace-theme)
