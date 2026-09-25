import type { Metadata } from "next"
import { BlogPage } from "@/components/pages/blog-page"

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles and updates.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/blog/feed.xml",
    },
  },
}

export default function BlogIndex() {
  return <BlogPage />
}
