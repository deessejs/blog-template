import type { Metadata } from "next"
import { allPosts } from "content-collections"
import { BlogPostPage } from "@/components/pages/blog-post-page"
import { getPostBySlug } from "@/lib/blog/posts"

type Params = { slug: string }

export function generateStaticParams(): Array<Params> {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Blog`,
    description: post.description,
    authors: post.author ? [{ name: post.author.name }] : [],
    alternates: { canonical: post.url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: post.author ? [post.author.name] : [],
      tags: post.tags,
      url: post.url,
    },
  }
}

export default async function PostRoute(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params
  return <BlogPostPage slug={slug} />
}
