import Link from "next/link";
import type { Post } from "@/lib/posts";

type Props = {
  posts: Post[];
  title?: string;
};

export default function RelatedArticles({
  posts,
  title = "You may also like",
}: Props) {

  if (posts.length === 0) {
    return null;
  }

  return (

    <section className="related-section">

      <div className="related-heading">

        <p className="eyebrow">
          KEEP READING
        </p>

        <h2>
          {title}
        </h2>

      </div>

      <div className="related-grid">

        {posts.map((post) => (

          <Link
            key={post.slug}
            href={`/article/${post.slug}`}
            className="related-card"
          >

            {post.image && (

              <img
                src={post.image}
                alt=""
              />

            )}

            <div>

              <span className="category">
                {post.category}
              </span>

              <h3>
                {post.title}
              </h3>

              <p>
                {post.excerpt}
              </p>

            </div>

          </Link>

        ))}

      </div>

    </section>
  );
            }
