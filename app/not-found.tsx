import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container not-found">

      <p className="eyebrow">
        404
      </p>

      <h1>
        Article not found
      </h1>

      <p>
        The article you requested does not
        exist or has been removed.
      </p>

      <Link
        className="button"
        href="/"
      >
        Return home
      </Link>

    </section>
  );
}
