"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function StoryShareButton({
  title,
  text,
  url,
  label = "Ulashish",
  copiedLabel = "Havola nusxalandi",
  className,
}: {
  title: string;
  text?: string;
  url?: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        console.error("Clipboard copy failed:", e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={className}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        borderRadius: "11px",
        backgroundColor: "#ffffff",
        color: copied ? "#047857" : "#182037",
        border: `1px solid ${copied ? "#10b981" : "#e3e6ef"}`,
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        minHeight: "46px",
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
        transition: "all 0.15s ease",
      }}
    >
      {copied ? (
        <>
          <Check size={16} color="#059669" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Share2 size={16} color="#1A247E" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
