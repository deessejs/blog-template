// Re-export both server and client env for ergonomic single-import usage.
// In practice, prefer the explicit subpaths (`@workspace/env/server` or
// `@workspace/env/client`) so the bundler can tree-shake the unused half.
export { serverEnv } from "./server"
export { clientEnv } from "./client"
export type { ServerEnv, ClientEnv } from "./schema"
