// Server-side GitHub helper.
//
// Talks to the GitHub REST "Contents" API to create files directly in the
// repo. The token is read from process.env.GITHUB_TOKEN and never sent to
// the browser - this file only ever runs on the server (API routes).

const GITHUB_API = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "Presh105";
  const repo = process.env.GITHUB_REPO || "news-blog";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    throw new Error("GITHUB_TOKEN is not set.");
  }

  return { token, owner, repo, branch };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/**
 * Returns the current sha of a file in the repo, or null if it doesn't
 * exist. Used to detect slug collisions before publishing.
 */
export async function getFileSha(path: string): Promise<string | null> {
  const { token, owner, repo, branch } = getConfig();

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(
    path
  )}?ref=${branch}`;

  const response = await fetch(url, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub error checking file (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { sha?: string };
  return typeof data.sha === "string" ? data.sha : null;
}

/**
 * Creates (or updates, if a sha is passed) a file in the repo via a single
 * commit to the configured branch.
 */
export async function commitFile(options: {
  path: string;
  content: string;
  message: string;
  sha?: string;
}): Promise<void> {
  const { token, owner, repo, branch } = getConfig();

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(
    options.path
  )}`;

  const body: Record<string, unknown> = {
    message: options.message,
    content: Buffer.from(options.content, "utf8").toString("base64"),
    branch,
  };

  if (options.sha) {
    body.sha = options.sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`GitHub commit failed (${response.status}): ${errBody}`);
  }
  }
