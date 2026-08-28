"use client";

import {
  useMemo,
  useState
} from "react";

import Link from "next/link";

type SearchPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
};

type SearchBoxProps = {
  posts: SearchPost[];
};

export default function SearchBox({
  posts,
}: SearchBoxProps) {

  const [query, setQuery] =
    useState("");

  const results = useMemo(() => {

    const q =
      query.trim().toLowerCase();

    if (!q) {
      return [];
    }

    return posts
      .filter((post) =>
        `${post.title}
        ${post.category}
        ${post.excerpt}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 5);

  }, [query, posts]);

  return (
    <div>

      <div className="search-box">

        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search articles..."
          aria-label="Search articles"
        />

        <button
          type="button"
          onClick={() =>
            setQuery(query.trim())
          }
        >
          Search
        </button>

      </div>

      {results.length > 0 && (

        <div className="search-results">

          {results.map((post) => (

            <Link
              key={post.slug}
              href={`/article/${post.slug}`}
              onClick={() =>
                setQuery("")
              }
            >

              <strong>
                {post.title}
              </strong>

              <br />

              <span className="muted">
                {post.category}
              </span>

            </Link>

          ))}

        </div>

      )}

      {query.trim() !== "" &&
        results.length === 0 && (

          <div className="search-results">

            <span
              style={{
                display: "block",
                padding: "12px 16px",
              }}
            >
              No articles found.
            </span>

          </div>

        )}

    </div>
  );
              }
