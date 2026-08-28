export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="container footer-inner">

        <span>
          © {new Date().getFullYear()}
          {" "}The Daily Brief
        </span>

        <span>
          News, analysis and original stories.
        </span>

      </div>

    </footer>
  );
}
