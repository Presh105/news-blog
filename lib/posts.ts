import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { remark }
  from "remark";

import html
  from "remark-html";

export type Post = {

  slug: string;

  title: string;

  excerpt: string;

  date: string;

  author: string;

  category: string;

  image?: string;

  sourceUrl?: string;

  readTime: number;

  contentHtml: string;

};

const postsDirectory =
  path.join(
    process.cwd(),
    "content/posts"
  );

function getMarkdownFiles() {

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((file) =>
      file.endsWith(".md")
    );
}

export function getAllPosts(): Post[] {

  return getMarkdownFiles()

    .map((filename) =>
      getPostBySlug(
        filename.replace(/\.md$/, "")
      )
    )

    .filter(
      (post): post is Post =>
        Boolean(post)
    )

    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
}

export function getPostBySlug(
  slug: string
): Post | null {

  const filePath =
    path.join(
      postsDirectory,
      `${slug}.md`
    );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw =
    fs.readFileSync(
      filePath,
      "utf8"
    );

  const {
    data,
    content
  } = matter(raw);

  const processed =
    remark()
      .use(html)
      .processSync(content);

  const contentHtml =
    processed.toString();

  const plainText =
    content.replace(
      /[#>*_`[\]()!-]/g,
      " "
    );

  const wordCount =
    plainText
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

  return {

    slug,

    title:
      String(data.title || slug),

    excerpt:
      String(data.excerpt || ""),

    date:
      String(
        data.date ||
        new Date().toISOString()
      ),

    author:
      String(
        data.author || "Editor"
      ),

    category:
      String(
        data.category || "News"
      ),

    image:
      data.image
        ? String(data.image)
        : undefined,

    sourceUrl:
      data.sourceUrl
        ? String(data.sourceUrl)
        : undefined,

    readTime:
      Math.max(
        1,
        Math.ceil(
          wordCount / 220
        )
      ),

    contentHtml,

  };
        }
