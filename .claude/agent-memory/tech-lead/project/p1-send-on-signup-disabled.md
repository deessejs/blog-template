---
name: p1-send-on-signup-disabled
description: RESOLVED 2026-07-28 code side — `sendOnSignUp: true` in packages/auth/src/auth.ts:38; proxy gates unverified users.
metadata:
  type: project
---

# RESOLVED 2026-07-28 (code side)

Verified by audit on 2026-07-28:

- `packages/auth/src/auth.ts:38` sets `emailVerification.sendOnSignUp: true` (and `sendOnSignIn: true`).
- `apps/app/proxy.ts:58-60` redirects unverified users on protected prefixes (`/home`, `/settings`) to `/verify-email`.

The temp bypass introduced by `f42933e` is fully reverted in code.

Related: [[packages-auth]].
