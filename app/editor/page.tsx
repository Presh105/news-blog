import ArticleEditor from "@/components/ArticleEditor";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Article Editor",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditorPage() {
  return (
    <section className="editor-page">
      <div className="container editor-container">

        <div className="editor-heading editor-heading-row">
          <div>
            <p className="eyebrow">PUBLISH</p>

            <h1>Write an article</h1>

            <p>
              Paste your news story, format it, then generate
              the Markdown file for GitHub.
            </p>
          </div>

          <LogoutButton />
        </div>

        <ArticleEditor />

      </div>
    </section>
  );
}
