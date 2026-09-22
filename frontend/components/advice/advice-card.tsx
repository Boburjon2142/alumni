import React from "react";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import type { Advice } from "@/types/alumni";
import { getCategoryLabel, type Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

export function AdviceCard({ advice, locale }: { advice: Advice; locale: Locale }) {
  const content =
    (locale === "ru" && advice.content_ru) ||
    (locale === "en" && advice.content_en) ||
    advice.content_uz;
  const alumnus = advice.alumnus;
  const initials = alumnus.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const avatarSrc = `/images/faxriylar/${alumnus.slug}.png` || alumnus.image_url || alumnus.avatar;

  const viewProfileText =
    locale === "en"
      ? "Alumni Profile"
      : locale === "ru"
      ? "Профиль выпускника"
      : "Bitiruvchi profili";

  return (
    <article className="advice-card">
      {/* 1. TOP PROMINENT AUTHOR INFO & PHOTO */}
      <div className="advice-card-author-header">
        <Link href={`/alumni/${alumnus.slug}`} className="advice-author-profile-link">
          <div className="advice-author-avatar-box">
            <RemoteImage
              className="advice-author-photo"
              src={avatarSrc}
              slug={alumnus.slug}
              alt={`${alumnus.full_name} portreti`}
              fallback={initials}
              sizes="56px"
            />
          </div>
          <div className="advice-author-meta">
            <h4 className="advice-author-name">{alumnus.full_name}</h4>
            <p className="advice-author-role">
              {alumnus.position || alumnus.faculty || "Qarshi davlat universiteti bitiruvchisi"}
              {alumnus.graduation_year && ` · ${alumnus.graduation_year}-yil`}
            </p>
          </div>
        </Link>
      </div>

      {/* 2. QUOTE BODY WITH CATEGORY BADGE */}
      <div className="advice-card-quote-box">
        <div className="advice-quote-top-row">
          <div className="advice-quote-icon-badge" aria-hidden="true">
            <Quote size={16} className="advice-quote-icon" />
          </div>
          {advice.category && (
            <span className="advice-card-category">{getCategoryLabel(advice.category, locale)}</span>
          )}
        </div>
        <blockquote className="advice-card-content">
          "{content}"
        </blockquote>
      </div>

      {/* 3. CARD FOOTER LINK */}
      <div className="advice-card-footer">
        <Link href={`/alumni/${alumnus.slug}`} className="advice-card-profile-cta">
          <span>{viewProfileText}</span>
          <ArrowRight size={14} className="advice-cta-arrow" />
        </Link>
      </div>
    </article>
  );
}
