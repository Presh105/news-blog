import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function ArticleCard({
  post,
}: {
  post: Post;
}) {

  return (

    <article className="article-card">

      {post.image && (

        <Link href={`/article/${post.slug}`}>

          <img
            className="card-image"
            src={post.image}
            alt={post.title}
          />

        </Link>

      )}

      <div className="card-body">

        <span className="category">
          {post.category}
        </span>

        <h2 className="card-title">

          <Link
            href={`/article/${post.slug}`}
          >
            {post.title}
          </Link>

        </h2>

        <p className="card-excerpt">
          {post.excerpt}
        </p>

        <div className="card-meta">

          By {post.author}
          {" • "}
          {formatDate(post.date)}

        </div>

      </div>

    </article>
  );
}

function formatDate(date: string) {

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(date));

}
