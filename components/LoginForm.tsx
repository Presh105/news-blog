"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/editor";
  const configError = searchParams.get("error") === "config";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.replace(from);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="container page-section login-section">
      <h1>Admin login</h1>

      {configError && (
        <div className="editor-message">
          Login isn&apos;t configured yet. Set <code>ADMIN_PASSWORD</code> and{" "}
          <code>AUTH_SECRET</code> in your environment variables, then
          redeploy.
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          className="publish-button"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {error && <div className="editor-message">{error}</div>}
      </form>
    </section>
  );
                  }
