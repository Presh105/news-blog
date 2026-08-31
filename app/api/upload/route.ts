import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { commitBinaryFile } from "@/lib/github";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ~2MB of actual binary data (base64 is roughly 1.37x the original size).
const MAX_BASE64_LENGTH = 2_800_000;

function sanitizeBaseName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return cleaned || "image";
}

export async function POST(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = secret
    ? await verifySessionToken(sessionToken, secret)
    : false;

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "You must be logged in to upload images." },
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

  const contentType =
    typeof body.contentType === "string" ? body.contentType : "";
  const base64 = typeof body.base64 === "string" ? body.base64 : "";
  const filename = typeof body.filename === "string" ? body.filename : "image";

  const extension = ALLOWED_TYPES[contentType];

  if (!extension) {
    return NextResponse.json(
      { error: "Unsupported image type. Please use a JPEG, PNG, or WEBP image." },
      { status: 400 }
    );
  }

  if (!base64) {
    return NextResponse.json(
      { error: "No image data received." },
      { status: 400 }
    );
  }

  if (base64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json(
      {
        error:
          "Image is too large even after compression. Try a smaller or simpler image.",
      },
      { status: 400 }
    );
  }

  const baseName = sanitizeBaseName(filename);
  const uniqueName = `${Date.now()}-${baseName}.${extension}`;
  const filePath = `public/uploads/${uniqueName}`;

  try {
    await commitBinaryFile({
      path: filePath,
      base64Content: base64,
      message: `Upload image: ${uniqueName}`,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error uploading image.";

    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    url: `/uploads/${uniqueName}`,
  });
                               }
