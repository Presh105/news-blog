// Lightweight signed-session helper.
//
// Uses the Web Crypto API (available in both the Node.js and Edge runtimes,
// including Next.js Middleware) rather than Node's `crypto` module, since
// Middleware cannot run Node-only APIs.
//
// A session token is: base64url(payloadJson) + "." + base64url(HMAC signature)
// The payload only ever contains an expiry timestamp - no secrets travel in
// the cookie itself, only a value that proves the server issued it.

const encoder = new TextEncoder();

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToBase64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of arr) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function stringToBase64url(value: string) {
  return bytesToBase64url(encoder.encode(value));
}

function base64urlToBytes(value: string) {
  const padLength = (4 - (value.length % 4)) % 4;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function createSessionToken(
  secret: string,
  expiresInSeconds: number = SESSION_MAX_AGE_SECONDS
): Promise<string> {
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });

  const payloadB64 = stringToBase64url(payload);

  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const signatureB64 = bytesToBase64url(signature);

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string
): Promise<boolean> {
  if (!token) return false;

  const [payloadB64, signatureB64] = token.split(".");
  if (!payloadB64 || !signatureB64) return false;

  const key = await getKey(secret);
  const expectedSignature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );
  const expectedSignatureB64 = bytesToBase64url(expectedSignature);

  if (expectedSignatureB64 !== signatureB64) {
    return false;
  }

  try {
    const payloadJson = new TextDecoder().decode(base64urlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson) as { exp?: number };

    if (typeof payload.exp !== "number") return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
    }
