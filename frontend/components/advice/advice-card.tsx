"use client";

import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import type { Advice } from "@/types/alumni";
import { getCategoryLabel, type Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

export function AdviceCard({ advice, locale }: { advice: Advice; locale: Locale }) {
  const content =
    (locale === "ru" && advice.content_ru) ||
    (locale === "en" && advice.content_en) ||
    advice.content_uz;
  const alumnus = advice.alumnus;
  const initials = alumnus.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <article className="advice-card">
      <div className="advice-card-header">
        <MessageSquareQuote className="advice-card-icon" aria-hidden="true" />
        {advice.category && (
          <span className="advice-card-category">{getCategoryLabel(advice.category, locale)}</span>
        )}
      </div>

      <blockquote className="advice-card-content">
        "{content}"
      </blockquote>

      <div className="advice-card-author">
        <Link href={`/alumni/${alumnus.slug}`} className="advice-author-link">
          <RemoteImage
            className="advice-author-photo"
            src={alumnus.image_url || alumnus.avatar || `/images/faxriylar/${alumnus.slug}.png`}
            slug={alumnus.slug}
            alt={`${alumnus.full_name} portreti`}
            fallback={initials}
            sizes="48px"
          />
          <div className="advice-author-info">
            <strong className="advice-author-name">{alumnus.full_name}</strong>
            <span className="advice-author-role">
              {alumnus.position || alumnus.faculty || (locale === "ru" ? "Выпускник КарГУ" : locale === "en" ? "KarSU Alumnus" : "QarshiDU bitiruvchisi")}
              {alumnus.current_company && ` · ${alumnus.current_company}`}
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}
