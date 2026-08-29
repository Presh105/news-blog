import ArticleEditor from "@/components/ArticleEditor";

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

        <div className="editor-heading">
          <p className="eyebrow">PUBLISH</p>

          <h1>Write an article</h1>

          <p>
            Paste your news story, format it, then generate
            the Markdown file for GitHub.
          </p>
        </div>

        <ArticleEditor />

      </div>
    </section>
  );
}
