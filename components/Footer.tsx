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
.footer-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-links a {
  color: var(--muted);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--text);
}

.legal-page {
  max-width: 800px;
  min-height: 70vh;
}

.legal-page h1 {
  font-size: 48px;
  line-height: 1.05;
  letter-spacing: -2px;
  margin-bottom: 30px;
}

.legal-page h2 {
  margin-top: 38px;
  font-size: 25px;
}

.legal-page p {
  color: #444;
  font-size: 17px;
  line-height: 1.8;
}
