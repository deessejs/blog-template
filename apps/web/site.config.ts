/**
 * Site-wide identity configuration.
 *
 * Single source of truth for site name, description, base URL, author info,
 * social links, and repo URL. Consumed by every feature that needs to know
 * "who is publishing this" or "where is this published" — footer, RSS feed,
 * OG images, JSON-LD, sitemap, canonical URLs, about page.
 *
 * Architecture decision: docs/architecture/2026-07-29-site-config-design.md
 *
 * To customize for a real deployment:
 *   1. Replace the placeholder values below.
 *   2. Set NEXT_PUBLIC_SITE_URL in the deployment environment (overrides baseUrl).
 *
 * Validation runs at module load — bad config fails the dev server boot and
 * `next build` immediately, with a precise Zod error message.
 */

import { z } from "zod"

const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "")

const siteConfigSchema = z.object({
  /** Schema version. Bump on breaking changes per docs/architecture/site-config-design.md. */
  schemaVersion: z.literal(1),

  /** Display name of the site. Shown in footer, feed, OG site_name, JSON-LD. */
  name: z.string().trim().min(1).max(80),

  /** One-sentence description. Used in feed, OG previews, meta description, JSON-LD. */
  description: z.string().trim().min(1).max(280),

  /** Canonical site URL. Overridable via NEXT_PUBLIC_SITE_URL env var. */
  baseUrl: z
    .string()
    .url()
    .transform(stripTrailingSlash)
    .refine(
      (u) => u.startsWith("https://") || u.startsWith("http://localhost"),
      { message: "baseUrl must be https:// (or http://localhost in dev)" }
    ),

  /** BCP 47 locale for <html lang>, Intl.DateTimeFormat, RSS pubDate. */
  locale: z
    .string()
    .regex(/^[a-z]{2,3}(-[A-Z]{2})?$/, {
      message: "locale must be a BCP 47 tag (e.g. 'en', 'en-US', 'fr', 'pt-BR')",
    })
    .default("en-US"),

  author: z.object({
    name: z.string().trim().min(1).max(80),
    url: z.string().url().optional(),
    email: z
      .string()
      .email()
      .optional()
      .refine(
        (e) => !e || !/noreply|no-reply|donotreply/i.test(e),
        {
          message:
            "Author email looks like a noreply address — confirm this is intentional (used in JSON-LD Person.email)",
        }
      ),
    avatar: z.string().url().optional(),
    bio: z.string().max(280).optional(),
  }),

  /** Public social profiles. Rendered on about page and JSON-LD Person.sameAs. */
  social: z
    .array(
      z.object({
        platform: z.string().min(1).max(32),
        url: z.string().url(),
      })
    )
    .default([]),

  /** Public source repository URL. Used by footer "view source" link. */
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

// Env var override: only baseUrl is overridable per the ADR.
// Production warning if baseUrl is non-https at startup.
if (typeof process !== "undefined" && process.env) {
  const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envBaseUrl) {
    const validated = z.string().url().parse(envBaseUrl)
    const normalized = stripTrailingSlash(validated)
    if (
      process.env.NODE_ENV === "production" &&
      !normalized.startsWith("https://") &&
      !normalized.startsWith("http://localhost")
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `[site.config] NEXT_PUBLIC_SITE_URL is not https:// in production: "${normalized}". ` +
          `This will cause mixed-content warnings and OG image absolute URLs to break.`
      )
    }
    // Type cast is safe — we've validated and normalized.
    ;(SITE_CONFIG as { baseUrl: string }).baseUrl = normalized
  }
}