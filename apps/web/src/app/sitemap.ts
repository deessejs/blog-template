import type { MetadataRoute } from "next"
import { APP_URL } from "@workspace/ui/lib/config"
import { allPosts } from "content-collections"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  const blogPosts: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${APP_URL}${post.url}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: "monthly" as const,
    priority: post.tags.length > 0 ? 0.7 : 0.6,
  }))

  // Collect all unique tags from posts
  const tagPages: MetadataRoute.Sitemap = Array.from(
    new Set(allPosts.flatMap((p) => p.tags))
  ).map((tag) => ({
    url: `${APP_URL}/blog/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }))

  return [
    ...staticPages,
    ...blogPosts,
    ...tagPages,
  ]
}
