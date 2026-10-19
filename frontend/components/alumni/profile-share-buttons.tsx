"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface ProfileShareButtonsProps {
  fullName: string;
  position?: string;
  faculty?: string;
  graduationYear?: number | null;
  slug: string;
  locale?: string;
}

export function ProfileShareButtons({
  slug,
  locale = "uz",
}: ProfileShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getProfileUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://alumni.qarshidu.uz";
    if (slug) {
      return `${origin}/alumni/${slug}`;
    }
    return `${origin}/alumni`;
  };

  const handleCopyLink = async () => {
    try {
      const url = getProfileUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const copyLabel = copied
    ? locale === "ru"
      ? "Скопировано!"
      : locale === "en"
      ? "Copied!"
      : "Nusxalandi!"
    : locale === "ru"
    ? "Копировать ссылку"
    : locale === "en"
    ? "Copy link"
    : "Havolani nusxalash";

  return (
    <div className="profile-share-group" role="group" aria-label="Profilni ulashish">
      <button
        type="button"
        onClick={handleCopyLink}
        className={`share-btn share-btn-copy ${copied ? "copied" : ""}`}
        title={copyLabel}
      >
        {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
        <span>{copyLabel}</span>
      </button>
    </div>
  );
}
