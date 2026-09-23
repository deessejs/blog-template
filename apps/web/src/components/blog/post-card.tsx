import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import type { Post } from "@/lib/blog/types"
import { TagList } from "./tag-list"

export function PostCard({ post }: { post: Post }) {
  const hasCover = Boolean(post.cover)
  const authors = post.authors?.length ? post.authors : post.author ? [post.author] : []

  return (
    <Card className="group h-full overflow-hidden transition-colors hover:border-foreground/30 hover:bg-muted/30 rounded-none bg-background">
      {hasCover ? (
        <Link
          href={post.url}
          className="relative block aspect-video w-full overflow-hidden bg-muted"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={post.cover!}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      ) : null}

      <CardHeader>
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}`}
                className="rounded-full border border-border/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
        <CardTitle className="text-balance text-xl tracking-tight">
          <Link
            href={post.url}
            className="transition-colors hover:text-foreground"
          >
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm text-muted-foreground">
          {post.description}
        </CardDescription>
      </CardHeader>
      <div className="px-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            by{" "}
            {authors.map((a, i) => (
              <span key={a.handle} className="font-medium text-foreground/80">
                {i > 0 ? ", " : ""}
                {a.name}
              </span>
            ))}
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              <time dateTime={post.date}>{post.date}</time>
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {post.readingTime} min read
            </span>
          </div>
        </div>
        {post.tags.length > 2 ? (
          <div className="mt-3">
            <TagList tags={post.tags.slice(2)} size="sm" />
          </div>
        ) : null}
      </div>
    </Card>
  )
}
