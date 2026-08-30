export default function Footer() {

  return (

    <footer className="site-footer">

      <div className="container footer-inner">

        <span>
          © {new Date().getFullYear()}
          {" "}The Daily Brief
        </span>

        <div className="footer-links">

          <a href="/privacy">
            Privacy
          </a>

          <a href="/terms">
            Terms
          </a>

          <a href="/disclaimer">
            Disclaimer
          </a>

          <a href="/contact">
            Contact
          </a>

        </div>

      </div>

    </footer>
  );
}
