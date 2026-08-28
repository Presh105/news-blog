import {
  getAllPosts
} from "@/lib/posts";

export function getSearchIndex() {

  return getAllPosts().map(
    (post) => ({

      slug: post.slug,

      title: post.title,

      excerpt: post.excerpt,

      category: post.category,

    })
  );
}
