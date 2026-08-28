import ArticleCard from "@/components/ArticleCard";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "All Articles",
};

export default function ArticlesPage() {
  const posts = getAllPosts();

  return (
    <section className="container section page-section">

      <div className="section-heading">

        <div>

          <p className="eyebrow">
            ARCHIVE
          </p>

          <h1>
            All articles
          </h1>

        </div>

        <p className="muted">
          {posts.length} article
          {posts.length === 1 ? "" : "s"}
        </p>

      </div>

      <div className="article-grid">

        {posts.map((post) => (
          <ArticleCard
            key={post.slug}
            post={post}
          />
        ))}

      </div>

    </section>
  );
}
