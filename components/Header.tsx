import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">

      <div className="container header-inner">

        <Link
          href="/"
          className="logo"
        >
          The Daily Brief
        </Link>

        <nav className="nav">

          <Link href="/">
            Home
          </Link>

          <Link href="/articles">
            Articles
          </Link>

        </nav>

      </div>

    </header>
  );
    }
