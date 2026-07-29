---
name: index
description: Index of all feature folders in the b-t blog template — categories, phase roadmap, and current status.
status: in-progress
created: 2026-07-29
updated: 2026-07-29
---

# Features — index

This directory documents **what the blog template does**, organized by capability. Each subfolder is one feature with a short README describing its purpose, status, and open questions.

## Categories

| Category | Scope | Examples |
| --- | --- | --- |
| `content/` | How posts are written, validated, and listed | content layer, post listing, tags, drafts, series |
| `presentation/` | How posts are rendered and styled | typography, code blocks, images, tables, view transitions |
| `discovery/` | How readers find and share posts | SEO, OG images, feed/RSS, JSON-LD, search |
| `meta/` | Pages about the author + engagement | about, now, uses, colophon, newsletter, analytics, comments |

## Phase roadmap

Phases map to the publishing journey. Each phase is ship-able on its own.

| Phase | Trigger | What ships |
| --- | --- | --- |
| **1** | First real post | Listing, post page, typeset typography, Shiki code blocks, SEO basics, OG images, RSS, **search (Cmd+K)** |
| **2** | 5+ posts | Tags, tables, JSON-LD |
| **3** | 20+ posts | View transitions, related posts, pagination, series, author pages (about/now/uses/colophon) |
| **4** | Triggered by demand | Newsletter, analytics, comments, drafts preview workflow, link blog, bookmarks, i18n |

## Status legend

- `planned` — decided, not yet implemented
- `in-progress` — partially implemented
- `shipped` — live in the current build
- `skipped` — explicitly decided against

## How to use this folder

1. Before implementing a feature, read its README to confirm scope and known constraints.
2. When you make a non-obvious decision, capture it as a `docs/learnings/` entry and link it from `## References` in the feature README.
3. When you ship a feature, change `status: planned` → `status: in-progress` → `status: shipped`.

## Conventions

Each feature README follows the template documented in [`content/posts`](./content/posts) (first one shipped). YAML frontmatter is required; sections are optional but `## What` and `## Why` are non-negotiable.
