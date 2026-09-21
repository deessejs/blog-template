# `apps/web`

Public marketing and landing page for the SaaS template.

## Purpose

`apps/web` is the public-facing entry point — what anonymous visitors see before they sign up. It includes the landing page, blog, cookie policy, privacy, and terms pages.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4** via `@workspace/ui/postcss.config`
- **shadcn/ui** components from `@workspace/ui`
- **content-collections** for blog MDX content
- **Zustand** for client-side state (cookie consent)
- **Fuse.js** for client-side search
- **next-themes** for dark mode
- Shared config from `@workspace/ui/lib/config` (`APP_NAME`, `APP_CONFIG`)

## Setup

No additional env vars required. Shared app config is read from `NEXT_PUBLIC_APP_*` variables:

```env
NEXT_PUBLIC_APP_NAME="SaaS Template"
NEXT_PUBLIC_APP_DESCRIPTION="..."
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Structure

```
apps/web/
├── src/
│   ├── app/                  # Next.js routes
│   │   ├── blog/             # Blog: list, post, author, tag, feed
│   │   ├── cookies/          # Cookie policy
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms of service
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── sitemap.ts        # Dynamic sitemap
│   │   └── robots.ts         # Robots.txt
│   ├── components/
│   │   ├── blog/             # PostCard, SearchDialog, ToC, etc.
│   │   ├── footers/          # AppFooter
│   │   ├── headers/          # SiteHeader
│   │   ├── providers/        # ThemeProvider
│   │   ├── cookie-consent.tsx
│   │   └── cookie-script.tsx
│   ├── lib/
│   │   └── blog/             # Blog helpers: posts, search, feed
│   └── stores/
│       └── cookies/          # Zustand cookie consent store
├── content/
│   ├── authors/              # Author MDX files (handle, name, bio)
│   └── posts/                # Blog post MDX files
├── content-collections.ts    # content-collections config (root)
├── next.config.ts
└── README.md
```

## Adding content

### Blog posts

Create a new `.mdx` file in `content/posts/`:

```mdx
---
title: "My Post Title"
description: "A short description for SEO and cards."
date: 2026-07-03
tags: [getting-started, tutorial]
author: your-handle
cover: https://images.unsplash.com/photo-xxx # optional
---

Your content here. Supports full MDX with code syntax highlighting.
```

### Authors

Create `content/authors/<handle>.md`:

```md
---
handle: your-handle
name: Your Name
avatar: https://... # optional
bio: Short bio shown on the author page.
---

Optional additional content.
```

## Key conventions

- **`@/*` path alias** maps to `src/*` (configured in `tsconfig.json`).
- **Cookie consent** uses Zustand with `skipHydration` — rehydrate once via `useEffect` in `CookieConsent`.
- **Images** use `next/image` with `remotePatterns` configured for Unsplash. Add your image host to `next.config.ts`.
- **RSS feed** at `/blog/feed.xml`.

## Relationship to other apps

This app is one of two in the monorepo, each deployed independently:

- **`apps/web`** (this app) — public, anonymous. Marketing, blog, legal pages.
- **`apps/app`** — authenticated app. `/login`, `/signup`, dashboard, settings. Has its own `(protected)` / `(unprotected)` route groups for auth.

Links to `/login`, `/signup` in the header point to `apps/app`. No other cross-app navigation.

Both apps share `@workspace/ui` for components and styling, and `@workspace/ui/lib/config` for `APP_CONFIG`.
