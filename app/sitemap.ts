import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://your-domain.vercel.app";

  return [

    {
      url: base,
      lastModified: new Date(),
    },

    {
      url: `${base}/articles`,
      lastModified: new Date(),
    },

    ...getAllPosts().map((post) => ({

      url:
        `${base}/article/${post.slug}`,

      lastModified:
        new Date(post.date),

    })),

  ];
}
