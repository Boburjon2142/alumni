"use client";

import { useState } from "react";
import { Check, Copy, Send, Share2 } from "lucide-react";

interface ProfileShareButtonsProps {
  fullName: string;
  position?: string;
  faculty?: string;
  graduationYear?: number | null;
  slug: string;
  locale?: string;
}

export function ProfileShareButtons({
  fullName,
  position,
  faculty,
  graduationYear,
  slug,
  locale = "uz",
}: ProfileShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getProfileUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return `https://alumni.qarshidu.uz/alumni/${slug}`;
  };

  const getShareText = () => {
    const yearStr = graduationYear ? ` (${graduationYear}-yil)` : "";
    const roleStr = position ? ` — ${position}` : "";
    
    if (locale === "ru") {
      return `🎓 ${fullName}${yearStr}${roleStr}\nКаршинский государственный университет — Профиль выпускника`;
    }
    if (locale === "en") {
      return `🎓 ${fullName}${yearStr}${roleStr}\nKarshi State University — Alumni Profile`;
    }
    return `🎓 ${fullName}${yearStr}${roleStr}\nQarshi davlat universiteti — Bitiruvchi profili:`;
  };

  const handleTelegramShare = () => {
    const url = getProfileUrl();
    const text = getShareText();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
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

  const telegramLabel =
    locale === "ru"
      ? "Поделиться в Telegram"
      : locale === "en"
      ? "Share to Telegram"
      : "Telegramda ulashish";

  return (
    <div className="profile-share-group" role="group" aria-label="Profilni ulashish">
      <button
        type="button"
        onClick={handleTelegramShare}
        className="share-btn share-btn-telegram"
        title={telegramLabel}
      >
        <Send size={15} />
        <span>{telegramLabel}</span>
      </button>

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
