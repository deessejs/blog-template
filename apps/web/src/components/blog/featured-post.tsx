import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/lib/blog/types"

export function FeaturedPost({ post }: { post: Post }) {
  return (
    <div className="mb-12 overflow-hidden rounded-none border border-border/40">
      <Link href={post.url} className="block">
        {post.cover ? (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={post.cover}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        ) : null}
        <div className="p-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <time dateTime={post.date}>{post.date}</time>
            <span aria-hidden>·</span>
            <span>{post.readingTime} min read</span>
            {post.tags.length > 0 && (
              <>
                <span aria-hidden>·</span>
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {post.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{post.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            by {post.authors[0]?.name ?? post.author?.name}
          </p>
        </div>
      </Link>
    </div>
  )
}
