---
name: newsletter
description: Email signup for new posts — explicitly skipped in phase 1. Revisit when a reader asks for it.
status: skipped
phase: 4
created: 2026-07-29
updated: 2026-07-29
---

# Newsletter

## What

A single email signup form, rendered inline at the end of each post and in the site footer. Submissions go to a third-party email service via a thin abstraction. Provider choice lives in `apps/web/site.config.ts` so swapping providers is a one-line config change.

## Why

- **For the reader:** the most direct, durable channel. Email lists survive platform changes, algorithm shifts, and RSS reader shutdowns.
- **For the author:** you own the list. No algorithm in between. The signal-to-noise ratio is incomparable to social media.

## Status

**Planned.** Triggers when the blog has enough readership that the list is worth maintaining.

## Open questions

- When (and whether) to ship. Current trigger: first reader asks "where do I subscribe?" via email or contact form.

## Decisions

- **Status:** explicitly skipped for now. Reasoning: the blog's audience is overwhelmingly technical, and technical readers overwhelmingly prefer RSS over email. The RSS feed already exists ([[feed]]) and covers the channel. Email adds cost (provider, GDPR, double opt-in) without a clear pull from the audience.
- **Re-evaluation trigger:** if a non-technical reader base emerges, or if the author runs a course/product that justifies a list, revisit. Buttondown would be the default pick when shipping.
- **Pre-built scaffolding:** none. Adding a newsletter later means introducing `lib/newsletter.ts` (provider abstraction), a `<NewsletterForm>` component, and the relevant Velite schema additions. No debt accrued by skipping now.

## References

## References

- Buttondown (likely future provider), Resend Audiences, ConvertKit, Mailchimp — to be evaluated when shipping
- Related: `meta/about` (often where the signup is justified in copy), `discovery/feed` (complementary channel)