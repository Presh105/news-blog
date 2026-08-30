import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { commitFile, getFileSha } from "@/lib/github";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function escapeYamlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildMarkdown(fields: {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  sourceUrl: string;
  content: string;
}): string {
  const lines = ["---"];

  lines.push(`title: "${escapeYamlString(fields.title)}"`);
  lines.push(`excerpt: "${escapeYamlString(fields.excerpt)}"`);
  lines.push(`date: "${fields.date}"`);
  lines.push(`author: "${escapeYamlString(fields.author)}"`);
  lines.push(`category: "${escapeYamlString(fields.category)}"`);

  if (fields.image) {
    lines.push(`image: "${escapeYamlString(fields.image)}"`);
  }

  if (fields.sourceUrl) {
    lines.push(`sourceUrl: "${escapeYamlString(fields.sourceUrl)}"`);
  }

  lines.push("---");
  lines.push("");
  lines.push(fields.content.trim());
  lines.push("");

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  // Require a valid session - this route is not covered by proxy.ts's
  // matcher (which only guards page routes), so it checks auth itself.
  const secret = process.env.AUTH_SECRET;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = secret
    ? await verifySessionToken(sessionToken, secret)
    : false;

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "You must be logged in to publish." },
      { status: 401 }
    );
  }

  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Publishing isn't configured yet. Set GITHUB_TOKEN in your environment variables.",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!title) {
    return NextResponse.json(
      { error: "Article title is required." },
      { status: 400 }
    );
  }

  if (!content) {
    return NextResponse.json(
      { error: "Article content is required." },
      { status: 400 }
    );
  }

  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const author =
    typeof body.author === "string" && body.author.trim()
      ? body.author.trim()
      : "Editor";
  const category =
    typeof body.category === "string" && body.category.trim()
      ? body.category.trim()
      : "News";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const sourceUrl =
    typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";

  const requestedSlug = typeof body.slug === "string" ? body.slug.trim() : "";
  const slug = slugify(requestedSlug || title);

  if (!slug) {
    return NextResponse.json(
      { error: "Could not generate a valid slug from the title." },
      { status: 400 }
    );
  }

  const filePath = `content/posts/${slug}.md`;

  try {
    const existingSha = await getFileSha(filePath);

    if (existingSha) {
      return NextResponse.json(
        {
          error: `An article with the slug "${slug}" already exists. Change the title or slug and try again.`,
        },
        { status: 409 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not reach GitHub to check for an existing article. Check GITHUB_TOKEN and try again.",
      },
      { status: 502 }
    );
  }

  const date = new Date().toISOString().slice(0, 10);

  const markdown = buildMarkdown({
    title,
    excerpt,
    date,
    author,
    category,
    image,
    sourceUrl,
    content,
  });

  try {
    await commitFile({
      path: filePath,
      content: markdown,
      message: `Publish article: ${title}`,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error committing to GitHub.";

    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    slug,
    url: `/article/${slug}`,
  });
  }
