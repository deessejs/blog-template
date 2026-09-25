import { allPosts } from "content-collections"

export type SearchItem = {
  title: string
  description: string
  url: string
  type: "post"
}

export const searchData: SearchItem[] = allPosts.map((post) => ({
  title: post.title,
  description: post.description,
  url: post.url,
  type: "post" as const,
}))
