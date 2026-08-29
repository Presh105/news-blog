import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
  getAllPosts,
  getPostBySlug,
} from "@/lib/posts";

import ShareButton
  from "@/components/ShareButton";

import RelatedArticles
  from "@/components/RelatedArticles";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {

  return getAllPosts().map(
    (post) => ({
      slug: post.slug,
    })
  );
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { slug } =
    await params;

  const post =
    getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://your-domain.com";

  const canonical =
    `${siteUrl}/article/${post.slug}`;

  return {

    title: post.title,

    description:
      post.excerpt,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {

      title: post.title,

      description:
        post.excerpt,

      url: canonical,

      type: "article",

      publishedTime:
        post.date,

      authors: [
        post.author,
      ],

      images:
        post.image
          ? [post.image]
          : undefined,
    },

    twitter: {

      card:
        "summary_large_image",

      title:
        post.title,

      description:
        post.excerpt,

      images:
        post.image
          ? [post.image]
          : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: Props) {

  const { slug } =
    await params;

  const post =
    getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts =
    getAllPosts();

  const relatedPosts =
    allPosts
      .filter(
        (item) =>
          item.slug !== post.slug
      )
      .sort((a, b) => {

        if (
          a.category ===
          post.category
        ) return -1;

        if (
          b.category ===
          post.category
        ) return 1;

        return 0;
      })
      .slice(0, 6);

  const middlePosts =
    relatedPosts.slice(0, 2);

  const endingPosts =
    relatedPosts.slice(2, 6);

  const paragraphs =
    post.contentHtml
      .split("</p>");

  const middlePoint =
    Math.max(
      1,
      Math.floor(
        paragraphs.length / 2
      )
    );

  const firstHalf =
    paragraphs
      .slice(
        0,
        middlePoint
      )
      .join("</p>");

  const secondHalf =
    paragraphs
      .slice(
        middlePoint
      )
      .join("</p>");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://your-domain.com";

  const articleUrl =
    `${siteUrl}/article/${post.slug}`;

  const structuredData = {

    "@context":
      "https://schema.org",

    "@type":
      "NewsArticle",

    headline:
      post.title,

    description:
      post.excerpt,

    image:
      post.image
        ? [post.image]
        : [],

    datePublished:
      post.date,

    dateModified:
      post.date,

    author: {

      "@type":
        "Person",

      name:
        post.author,
    },

    publisher: {

      "@type":
        "Organization",

      name:
        "The Daily Brief",
    },

    mainEntityOfPage: {

      "@type":
        "WebPage",

      "@id":
        articleUrl,
    },
  };

  return (

    <article className="article-page">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      <div className="container article-container">

        <Link
          href="/articles"
          className="back-link"
        >
          ← All articles
        </Link>

        <header className="article-header">

          <span className="category">
            {post.category}
          </span>

          <h1>
            {post.title}
          </h1>

          <p className="article-excerpt">
            {post.excerpt}
          </p>

          <div className="article-meta">

            <span>
              By {post.author}
            </span>

            <span>•</span>

            <time dateTime={post.date}>
              {formatDate(post.date)}
            </time>

            <span>•</span>

            <span>
              {post.readTime} min read
            </span>

          </div>

          <ShareButton
            url={articleUrl}
            title={post.title}
          />

        </header>

        {post.image && (

          <img
            className="article-cover"
            src={post.image}
            alt={post.title}
          />

        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{
            __html:
              firstHalf +
              (
                firstHalf.endsWith("</p>")
                  ? ""
                  : "</p>"
              ),
          }}
        />

        {middlePosts.length > 0 && (

          <RelatedArticles
            posts={middlePosts}
            title="Read this next"
          />

        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{
            __html:
              secondHalf,
          }}
        />

        {post.sourceUrl && (

          <div className="source-box">

            <strong>
              Source / Further reading
            </strong>

            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {post.sourceUrl}
            </a>

          </div>

        )}

        <div className="article-footer-share">

          <ShareButton
            url={articleUrl}
            title={post.title}
          />

        </div>

        {endingPosts.length > 0 && (

          <RelatedArticles
            posts={endingPosts}
            title="More articles"
          />

        )}

      </div>

    </article>
  );
}

function formatDate(
  date: string
) {

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "long",
    }
  ).format(
    new Date(date)
  );
        }
