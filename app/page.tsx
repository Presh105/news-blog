import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import SearchBox from "@/components/SearchBox";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  const searchPosts = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
  }));

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">

          <p className="eyebrow">
            NEWS • ANALYSIS • STORIES
          </p>

          <h1>
            What matters, clearly.
          </h1>

          <p className="hero-text">
            A simple home for original news articles,
            reporting and commentary.
          </p>

          <SearchBox posts={searchPosts} />

        </div>
      </section>

      <section className="container section">

        <div className="section-heading">

          <div>
            <p className="eyebrow">
              LATEST
            </p>

            <h2>
              Latest articles
            </h2>
          </div>

          <Link
            className="text-link"
            href="/articles"
          >
            View all →
          </Link>

        </div>

        {posts.length === 0 ? (

          <div className="empty">

            <h3>
              No articles yet
            </h3>

            <p>
              Add a Markdown file inside{" "}
              <code>content/posts</code>{" "}
              and deploy.
            </p>

          </div>

        ) : (

          <div className="article-grid">

            {posts.map((post) => (
              <ArticleCard
                key={post.slug}
                post={post}
              />
            ))}

          </div>

        )}

      </section>
    </>
  );
    }
