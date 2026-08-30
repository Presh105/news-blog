"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArticleEditor() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("News");
  const [image, setImage] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [publishing, setPublishing] = useState(false);

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugTouched) {
      setSlug(makeSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(makeSlug(value));
  }

  function command(name: string, value?: string) {
    document.execCommand(name, false, value);
    editorRef.current?.focus();
  }

  function createLink() {
    const url = window.prompt("Enter the URL:");
    if (!url) return;
    command("createLink", url);
  }

  function insertHeading(level: "h2" | "h3") {
    command("formatBlock", level);
  }

  function insertParagraph() {
    command("formatBlock", "p");
  }

  function insertQuote() {
    command("formatBlock", "blockquote");
  }

  function insertUnorderedList() {
    command("insertUnorderedList");
  }

  function insertOrderedList() {
    command("insertOrderedList");
  }

  function cleanPastedText(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function htmlToMarkdown(html: string) {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    function convert(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || "";
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }

      const element = node as HTMLElement;
      const children = Array.from(element.childNodes).map(convert).join("");
      const tag = element.tagName.toLowerCase();

      switch (tag) {
        case "h1":
          return `# ${children.trim()}\n\n`;

        case "h2":
          return `## ${children.trim()}\n\n`;

        case "h3":
          return `### ${children.trim()}\n\n`;

        case "strong":
        case "b":
          return `**${children.trim()}**`;

        case "em":
        case "i":
          return `*${children.trim()}*`;

        case "a": {
          const href = element.getAttribute("href");
          return href ? `[${children.trim()}](${href})` : children;
        }

        case "blockquote":
          return (
            children
              .trim()
              .split("\n")
              .map((line) => `> ${line}`)
              .join("\n") + "\n\n"
          );

        case "ul":
          return (
            Array.from(element.children)
              .map((item) => `- ${convert(item).trim()}`)
              .join("\n") + "\n\n"
          );

        case "ol":
          return (
            Array.from(element.children)
              .map((item, index) => `${index + 1}. ${convert(item).trim()}`)
              .join("\n") + "\n\n"
          );

        case "li":
          return children;

        case "br":
          return "\n";

        case "p":
          return `${children.trim()}\n\n`;

        case "div":
          return `${children.trim()}\n\n`;

        default:
          return children;
      }
    }

    return Array.from(temp.childNodes)
      .map(convert)
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function resetForm() {
    setTitle("");
    setExcerpt("");
    setAuthor("");
    setCategory("News");
    setImage("");
    setSourceUrl("");
    setSlug("");
    setSlugTouched(false);

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  }

  async function publishArticle() {
    setMessage("");
    setMessageType("");

    if (!title.trim()) {
      setMessage("Please enter an article title.");
      setMessageType("error");
      return;
    }

    if (!editorRef.current || !editorRef.current.innerText.trim()) {
      setMessage("Please write or paste your article.");
      setMessageType("error");
      return;
    }

    const content = htmlToMarkdown(editorRef.current.innerHTML);

    setPublishing(true);

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          author,
          category,
          image,
          sourceUrl,
          content,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error || "Something went wrong while publishing.");
        setMessageType("error");
        setPublishing(false);
        return;
      }

      setMessage(
        `Published! Your article is being deployed and will be live at ${data.url} within a minute or two.`
      );
      setMessageType("success");
      resetForm();
      router.refresh();
    } catch {
      setMessage(
        "Could not reach the publishing service. Check your connection and try again."
      );
      setMessageType("error");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="editor">
      <div className="editor-fields">
        <label>
          Article title
          <input
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Enter your article title"
          />
        </label>

        <label>
          URL slug
          <input
            value={slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            placeholder="article-url"
          />
        </label>

        <label>
          Short description
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="Write a short description of the article"
            rows={3}
          />
        </label>

        <div className="editor-two-columns">
          <label>
            Author
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Author name"
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>News</option>
              <option>Politics</option>
              <option>Business</option>
              <option>Technology</option>
              <option>Sports</option>
              <option>Entertainment</option>
              <option>Education</option>
              <option>Opinion</option>
            </select>
          </label>
        </div>

        <label>
          Featured image URL
          <input
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="https://..."
          />
        </label>

        <label>
          Source URL
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="editor-toolbar">
        <button type="button" onClick={() => command("undo")}>
          Undo
        </button>

        <button type="button" onClick={() => command("redo")}>
          Redo
        </button>

        <span />

        <button type="button" onClick={() => command("bold")}>
          Bold
        </button>

        <button type="button" onClick={() => command("italic")}>
          Italic
        </button>

        <button type="button" onClick={() => insertHeading("h2")}>
          H2
        </button>

        <button type="button" onClick={() => insertHeading("h3")}>
          H3
        </button>

        <button type="button" onClick={insertParagraph}>
          P
        </button>

        <button type="button" onClick={insertQuote}>
          Quote
        </button>

        <button type="button" onClick={insertUnorderedList}>
          • List
        </button>

        <button type="button" onClick={insertOrderedList}>
          1. List
        </button>

        <button type="button" onClick={createLink}>
          Link
        </button>
      </div>

      <div
        ref={editorRef}
        className="wysiwyg"
        contentEditable
        suppressContentEditableWarning
        onPaste={cleanPastedText}
        data-placeholder="Paste your news article here..."
      />

      <button
        className="publish-button"
        type="button"
        onClick={publishArticle}
        disabled={publishing}
      >
        {publishing ? "Publishing..." : "Publish Article"}
      </button>

      {message && (
        <div
          className={
            messageType === "error"
              ? "editor-message editor-message-error"
              : messageType === "success"
              ? "editor-message editor-message-success"
              : "editor-message"
          }
        >
          {message}
        </div>
      )}
    </div>
  );
      }
