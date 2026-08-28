"use client";

import { useState } from "react";

export default function ShareButton({
  url,
  title,
}: {
  url: string;
  title: string;
}) {

  const [copied, setCopied] =
    useState(false);

  async function share() {

    try {

      if (navigator.share) {

        await navigator.share({
          title,
          url,
        });

        return;
      }

      await navigator.clipboard
        .writeText(url);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);

    } catch {
      // User cancelled sharing.
    }
  }

  return (

    <button
      className="share-button"
      type="button"
      onClick={share}
    >

      {copied
        ? "Link copied"
        : "Share article"}

    </button>
  );
      }
