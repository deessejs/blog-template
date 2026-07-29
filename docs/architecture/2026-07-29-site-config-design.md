---
name: site-config-design
description: Architecture decision for apps/web/site.config.ts — shape, validation, env var precedence, failure modes, operational concerns, test strategy, HMR semantics, versioning, and explicit non-goals for the single source of truth for site-wide identity.
status: draft
created: 2026-07-29
updated: 2026-07-29
---

# site.config.ts — design

> **Scope:** `apps/web/site.config.ts` — the single source of truth for site-wide identity, consumed by every feature that needs to know "who is publishing this" or "where is this published".

## Context

Multiple Phase 1 features need shared identity data: footer copyright, feed metadata, OG image content, JSON-LD `Person` and `WebSite`, sitemap base URL, canonical URLs, social links, contact email. Today each of these would be hardcoded in the consumer; tomorrow they drift. The fix is a single typed config file consumed by everything.

The challenge is keeping it small enough to be obvious, typed enough to catch typos, and overridable enough for the one field that actually differs per environment (`baseUrl`).

## Decision

Create `apps/web/site.config.ts` as a plain TypeScript module, validated at module load with Zod, exported as a single `SITE_CONFIG` constant with an inferred `SiteConfig` type. The schema carries a `SCHEMA_VERSION` field for forward compatibility. Only `baseUrl` is overridable via env var (`NEXT_PUBLIC_SITE_URL`); everything else is baked at build time.

## The shape

```ts
// apps/web/site.config.ts
import { z } from "zod"

const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "")

const siteConfigSchema = z.object({
  schemaVersion: z.literal(1),

  name: z.string().trim().min(1).max(80),                // Unicode code points, not bytes
  description: z.string().trim().min(1).max(280),
  baseUrl: z.string().url().transform(stripTrailingSlash)
    .refine((u) => u.startsWith("https://") || u.startsWith("http://localhost"), {
      message: "baseUrl must be https:// (or http://localhost in dev)",
    }),
  locale: z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/).default("en-US"),

  author: z.object({
    name: z.string().trim().min(1).max(80),
    url: z.string().url().optional(),
    email: z.string().email().optional().refine(
      (e) => !e || !/noreply|no-reply|donotreply/i.test(e),
      { message: "Author email looks like a noreply address — confirm this is intentional" },
    ),
    avatar: z.string().url().optional(),
    bio: z.string().max(280).optional(),
  }),

  social: z.array(z.object({
    platform: z.string().min(1).max(32),
    url: z.string().url(),
  })).default([]),

  repoUrl: z.string().url().optional(),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

export const SITE_CONFIG: SiteConfig = siteConfigSchema.parse({
  schemaVersion: 1,
  name: "Your blog name",
  description: "What the blog is about, in one sentence.",
  baseUrl: "https://example.com",
  locale: "en-US",
  author: {
    name: "Your Name",
    url: "https://example.com",
    email: "hello@example.com",
  },
  social: [],
  repoUrl: "https://github.com/your-username/your-blog",
})
```

Note: I collapsed `language` and `locale` into a single `locale` field. They're almost always the same for a personal blog; if i18n ships later, it adds `post.language` per-post, not a new top-level field.

## Validation semantics — what "max(280)" actually means

Lengths are measured in **Unicode code points** (what `String.prototype.length` returns), not bytes, not grapheme clusters. For our purposes:

- `name`: 80 code points. `"Geist"` is 5. `"日本からの手紙"` is 7. Plenty of headroom.
- `description`: 280 code points. Aligns with Twitter's original limit, comfortably fits OG previews.
- `bio`: 280 code points. Same rationale.
- `platform`: 32 code points. `"Mastodon"` fits; `"are.na"` fits; long custom names don't.

URL validation uses Zod's built-in `z.string().url()` which delegates to WHATWG URL parsing. Edge cases:
- `https://example.com` ✓
- `https://example.com/path?query=1` ✓
- `https://example.com/path with spaces` ✗ (rejected)
- `mailto:hello@example.com` is NOT a URL per WHATWG. Email uses `z.string().email()` separately.

Trailing slashes on `baseUrl` are stripped by the `.transform()`. This is non-negotiable — having `https://example.com` and `https://example.com/` as different canonicals is a Google duplicate-content footgun.

## Per-field rationale

| Field | Required | Consumers | Failure mode if wrong |
| --- | --- | --- | --- |
| `schemaVersion` | yes | This file's consumers + future migration tooling | Schema version mismatch → consumers throw on read |
| `name` | yes | footer, feed, JSON-LD, OG site_name | Empty string → build fails (good) |
| `description` | yes | feed, JSON-LD, OG default, `<meta description>` | Truncated in OG preview if > 280 |
| `baseUrl` | yes | sitemap, canonical URLs, OG image absolute URLs, feed self-link | Wrong URL → all absolute links 404 |
| `locale` | no (default `en-US`) | `<html lang>`, `Intl.DateTimeFormat`, RSS pubDate | Invalid BCP 47 → HTML lang attribute invalid |
| `author.name` | yes | footer copyright, JSON-LD, feed author, about page | Empty → copyright looks weird |
| `author.url` | no | JSON-LD Person.url, about page link | None — optional |
| `author.email` | no | about page, JSON-LD Person.email | Noreply patterns trigger a warning (not error) |
| `author.avatar` | no | JSON-LD Person.image | None — optional |
| `author.bio` | no | about page, JSON-LD Person.description | None — optional |
| `social[]` | no | JSON-LD Person.sameAs, about page links | Empty array → no sameAs (acceptable, just less SEO juice) |
| `repoUrl` | no | footer view-source link | Private repo → 404 in footer |

## Env var precedence

Only `baseUrl` is overridable, via `NEXT_PUBLIC_SITE_URL`:

```ts
// At the bottom of site.config.ts, after the .parse():
const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL
if (envBaseUrl) {
  const validated = z.string().url().parse(envBaseUrl)
  SITE_CONFIG.baseUrl = stripTrailingSlash(validated)
}
```

**Why only `baseUrl`:** every other field is identity, not deployment. The author name is the author name in dev, preview, and prod. Allowing env override of `author.name` would mean you could ship a site to staging that looks like a different person. The temptation is real and the answer is no.

**What if the user sets `NEXT_PUBLIC_SITE_URL=http://staging.example.com` in prod by accident?** Production OG images would point to staging, Google indexes both URLs. Mitigation: log a warning at startup if `NODE_ENV === 'production'` and the resolved `baseUrl` doesn't start with `https://` and isn't the canonical prod domain. Document this in `docs/architecture/site-config-design.md` operations section. (The CI smoke test below also catches it.)

## Failure modes — what we explicitly defend against

| # | Scenario | Likelihood | Mitigation |
| --- | --- | --- | --- |
| 1 | Author renames mid-project | Medium | Document as a one-time migration: edit config, rebuild, accept that Google Knowledge Graph takes weeks to reflect change. No tooling needed. |
| 2 | `repoUrl` becomes private (rename, org move) | Medium | Footer link 404. Periodic link audit (manual). If critical, make `repoUrl` required and validate with HEAD request — but that's expensive. Keep optional. |
| 3 | `NEXT_PUBLIC_SITE_URL` wrong in prod | High | Startup warning if `NODE_ENV=production` and baseUrl is non-https. CI smoke test compares resolved baseUrl to expected canonical. |
| 4 | `email` is a `noreply@` address | Medium | Warning (not error) at parse time. JSON-LD with a noreply email gives Google confusing signals — the warning forces a conscious decision. |
| 5 | `bio` contains HTML or script tags | Low | React escapes on render. No XSS risk. Documented. |
| 6 | Social platform instance shuts down (Mastodon diaspora implosion) | High over time | Link audit. No automated mitigation — broken external links are the price of decentralized identity. |
| 7 | `baseUrl` scheme is `http://` in prod | Low | Schema rejects unless it's `http://localhost`. |
| 8 | Trailing slash on `baseUrl` | High (forgetfulness) | Schema transform strips it. |
| 9 | `locale` is invalid BCP 47 | Low | Regex enforces format. |
| 10 | Schema version drift after Zod upgrade | Low | `SCHEMA_VERSION` pinned. When upgrading, increment and add a migration note. |

## Operational concerns

**Forks of the template.** Every fork ships with placeholder values (`example.com`, `Your Name`). Document a "find/replace these before deploy" checklist in the colophon or a separate `docs/architecture/fork-checklist.md`. The Zod schema catches incomplete values — a fork that ships without filling them fails at startup.

**Moving to `packages/site-config/`** when a second app (admin, newsletter) needs the same data. Trigger: a second `apps/*` exists that needs author/site data. Move path:
1. Move `site.config.ts` to `packages/site-config/src/index.ts`.
2. Export `SITE_CONFIG` and `SiteConfig` from the package.
3. Add `packages/site-config` to workspace deps in the consuming apps.
4. Each app can override `baseUrl` via its own env var (each package's `index.ts` reads its own `process.env.NEXT_PUBLIC_SITE_URL`).

**Multi-author.** Not now. If it happens later: schema becomes `{ authors: Record<string, Author> }`, posts get `authorId: string` frontmatter, consumers read `authors[post.authorId]`. The current `author` field is the single-author shape and that's the explicit scope.

**Repo privacy.** If `repoUrl` becomes private (e.g. author moves to a private org), set it to `undefined` in the config. Footer omits the link automatically (it guards on `repoUrl` being present). No build error.

**Link rot.** Social URLs to defunct platforms. Manual audit. Consider a `docs/learnings/2026-XX-audit-links.md` periodic check, but no automated tooling — false positives would be worse than no tool.

## Test strategy

Four levels, increasing scope:

**1. Schema unit tests** (`site.config.test.ts`)
- Each invalid input throws with the right message: malformed URL, missing required field, locale regex violation, length boundary (0 chars, 280+1 chars), `noreply` email pattern.
- Snapshot of the *current* valid config to detect unintended drift.

**2. Consumer unit tests**
- Footer renders correctly with edge-case `author.name` values (special chars, very long, single char).
- Feed renders correctly when `social` is empty vs full.
- JSON-LD produces valid JSON with each locale value.

**3. Build integration test** (`.github/workflows/ci.yml`)
- On every PR: `next build` runs. If config is invalid, build fails. No special test needed — the Zod throw at module load is the test.

**4. E2E artifact checks** (post-deploy, manual for now)
- Curl `/sitemap.xml`, assert every `<loc>` starts with `baseUrl`.
- Curl `/feed.xml`, assert `<atom:link href="...">` self-link equals `baseUrl + /feed.xml`.
- View source of `/`, assert JSON-LD `WebSite.url` equals `baseUrl`.

L4 is manual for phase 1. Automate when the project has CI secrets for a staging URL.

## HMR + restart semantics

| Change | What happens in dev | What happens in prod |
| --- | --- | --- |
| Edit `SITE_CONFIG.name` | HMR triggers re-render of every component reading it | Rebuild required |
| Edit `NEXT_PUBLIC_SITE_URL` | **No effect** — env var read at module load, not HMR | Restart required |
| Edit Zod schema | Restart required (parse is at module load) | N/A |
| Edit `process.env.NEXT_PUBLIC_SITE_URL` in `.env.local` | Restart `next dev` | N/A |

The third row is the gotcha: if you add a new field to the schema without restarting, the old config doesn't have it and Zod will throw a confusing error on the next HMR cycle that triggers a re-import. Document this in the developer setup section of the colophon.

## Versioning

`SCHEMA_VERSION` starts at `1`. Increment when:

- **Major (bump required → old configs fail):** required field added, field type changed, field renamed.
- **Minor (bump optional → old configs still work):** optional field added, validation tightened.

Don't bump for: comments, internal refactor, file location move.

When incrementing, add a migration note in a `## v1 → v2` section at the top of the doc. Don't write a migration script unless there are >5 forks in the wild.

## What we explicitly chose NOT to do

| Alternative | Why rejected |
| --- | --- |
| Per-environment config files (`site.config.prod.ts`, `site.config.staging.ts`) | Premature; only `baseUrl` differs and env var handles that. |
| Config-driven UI (config controls site appearance, layout, theme) | Out of scope — config is identity, not styling. shadcn + tailwind handle presentation. |
| Validation as a separate CI job | Redundant — `next build` runs in CI and Zod throws on bad config. Adding a separate job is theatre. |
| Multi-author from day one | Single-author is the project scope. Adding `authors` now is speculative complexity. |
| Runtime config from a CMS | Defeats the git-based content principle. If the author needs a CMS later, that's a different project. |
| Per-page metadata override | Each post declaring its own site info. Conflicts with "single source of truth". If a post truly needs custom JSON-LD, that's a feature, not a config pattern. |
| `.yaml` / `.toml` config | No tooling benefit. Adds a parser dep. |
| Loading the config from `localStorage` / cookies at runtime | Identity doesn't change per user. Build-time is correct. |
| Exposing the config to MDX authors via a `<SiteAuthor />` component | Speculative. Add when an MDX post actually needs it. |

## Scope — what this config is and isn't

**This config is for:** identity, attribution, syndication, and SEO metadata. The 12 fields above.

**This config is NOT for:**
- Theme / colors / typography tokens (those live in `packages/ui/src/styles/`).
- Navigation links (those live in `presentation/nav/README.md` decisions, rendered from a constant in the nav component).
- Per-post metadata (that's Velite frontmatter).
- Analytics provider config (phase 4).
- Build-time feature flags (use `process.env` directly when needed).

If a new field doesn't fit "identity, attribution, syndication, or SEO metadata", it doesn't belong here.

## Implementation checklist

When we leave "no code" mode:

- [ ] Create `apps/web/site.config.ts` with the shape above (collapse `language` into `locale`, add `schemaVersion`, refine email, transform baseUrl).
- [ ] Add `apps/web/site.config.test.ts` with schema unit tests.
- [ ] Update each consumer (footer, feed, og-images, json-ld, seo, about) to import `SITE_CONFIG` from `@/site.config`.
- [ ] Add `.env.example` with `NEXT_PUBLIC_SITE_URL` documented.
- [ ] Add production warning if baseUrl is non-https.
- [ ] Add `.github/workflows/ci.yml` for `pnpm lint && pnpm typecheck && pnpm build`.
- [ ] Smoke-test HMR + env var precedence.
- [ ] Manual e2e: curl `/sitemap.xml` and `/feed.xml`, verify baseUrl.

## References

- [Zod documentation](https://zod.dev/)
- [WHATWG URL Living Standard](https://url.spec.whatwg.org/)
- [BCP 47 language tags (RFC 5646)](https://datatracker.ietf.org/doc/html/rfc5646)
- [Next.js — `process.env` and `NEXT_PUBLIC_*`](https://nextjs.org/docs/app/api-reference/environment-variables)
- [Schema.org — Person](https://schema.org/Person)
- [Schema.org — WebSite](https://schema.org/WebSite)
- All consumer feature READMEs linked from the consumer map