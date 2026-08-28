"use client";

import {
  useMemo,
  useState
} from "react";

import Link from "next/link";

import { getSearchIndex }
  from "@/lib/search-index";

export default function SearchBox() {

  const [query, setQuery] =
    useState("");

  const posts = getSearchIndex();

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
          onChange={(e) =>
            setQuery(e.target.value)
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

    </div>
  );
}
