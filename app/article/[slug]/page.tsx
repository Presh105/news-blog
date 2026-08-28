import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";

type Props = {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,

    description: post.excerpt,

    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image
        ? [post.image]
        : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: Props) {

  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://your-domain.vercel.app";

  const articleUrl =
    `${siteUrl}/article/${post.slug}`;

  return (

    <article className="article-page">

      <div className="container article-container">

        <Link
          href="/articles"
          className="back-link"
        >
          ← All articles
        </Link>

        <div className="article-header">

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

        </div>

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
            __html: post.contentHtml,
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

      </div>

    </article>
  );
}

function formatDate(date: string) {

  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(new Date(date));

}
