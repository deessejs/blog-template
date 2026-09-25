import { allAuthors, allPosts } from "content-collections"

export type Author = (typeof allAuthors)[number]
export type Post = (typeof allPosts)[number]

export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  for (const post of allPosts) {
    for (const tag of post.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}
