import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { FeaturedPost } from "@/components/blog/featured-post"
import { PostCard } from "@/components/blog/post-card"
import { SearchDialog } from "@/components/blog/search-dialog"
import { getAllPosts } from "@/lib/blog/posts"
import { getAllTags } from "@/lib/blog/types"

export function BlogPage() {
  const posts = getAllPosts()
  const tags = getAllTags()
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <header className="mb-8">
        <h1 className="text-balance text-4xl font-bold tracking-tighter sm:text-5xl">
          Blog
        </h1>
        <p className="mt-2 text-pretty text-lg text-muted-foreground">
          Articles and updates. Subscribe via{" "}
          <a
            href="/blog/feed.xml"
            className="underline underline-offset-4 hover:text-foreground"
          >
            RSS
          </a>
          .
        </p>
      </header>

      {tags.length > 0 && (
        <nav
          aria-label="Filter by tag"
          className="mb-8 flex flex-wrap items-center justify-between gap-2 border-y border-border/40 py-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Topics
            </span>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}`}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer transition-colors hover:bg-foreground hover:text-background"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
          <SearchDialog />
        </nav>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No posts yet
          </p>
          <p className="mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Subscribe to the{" "}
            <a
              href="/blog/feed.xml"
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              RSS feed
            </a>{" "}
            to be notified when we publish.
          </p>
        </div>
      ) : (
        <>
          {featured ? <FeaturedPost post={featured} /> : null}

          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
