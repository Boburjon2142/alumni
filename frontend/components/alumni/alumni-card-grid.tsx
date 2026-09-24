"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Alumni } from "@/types/alumni";
import { getRecognitionTitle, type Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";
import { RecognitionIcon } from "./recognition-icon";

export function AlumniCardGrid({ alumni, locale }: { alumni: Alumni[]; locale: Locale }) {
  const hint = locale === "ru" ? "Подробнее" : locale === "en" ? "Details" : "Batafsil";

  return (
    <div className="cards-grid directory-grid">
      {alumni.map((item) => {
        const initials = item.full_name
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("");
        const ariaLabel =
          locale === "ru"
            ? `Посмотреть профиль ${item.full_name}`
            : locale === "en"
            ? `View profile of ${item.full_name}`
            : `${item.full_name} profilini ko‘rish`;

        return (
          <Link
            key={item.id}
            href={`/alumni/${item.slug}`}
            className="minimal-alumni-card alumni-card-2col"
            aria-label={ariaLabel}
          >
            <div className="alumni-card-media">
              <RemoteImage
                className="alumni-card-image-full"
                src={item.avatar || item.image_url || (item.slug ? `/images/faxriylar/${item.slug}.webp` : undefined)}
                slug={item.slug}
                alt={item.image_alt || `${item.full_name} portreti`}
                fallback={initials}
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 300px"
              />
              <div className="alumni-card-media-gradient" />
            </div>

            <div className="alumni-card-info">
              <div className="alumni-card-header-row">
                {item.recognitions && item.recognitions.length > 0 ? (() => {
                  const titleName = getRecognitionTitle(
                    item.recognitions[0].slug,
                    locale,
                    item.recognitions[0].name
                  );
                  return (
                    <span className="alumni-card-badge" title={titleName}>
                      <RecognitionIcon
                        icon={item.recognitions[0].icon}
                        size={13}
                        className="emblem-icon"
                      />
                      <span>{titleName}</span>
                    </span>
                  );
                })() : <span />}

                {item.graduation_year ? (
                  <span className="alumni-card-year">{item.graduation_year}-yil</span>
                ) : null}
              </div>

              <div className="alumni-card-main">
                <h3 className="minimal-card-name alumni-card-name">{item.full_name}</h3>
                {item.position && (
                  <p className="minimal-card-role alumni-card-role">{item.position}</p>
                )}
                {item.faculty && (
                  <span className="alumni-card-faculty">{item.faculty}</span>
                )}
              </div>

              <div className="alumni-card-footer">
                <span className="minimal-card-cta alumni-card-cta">
                  {hint} <ArrowRight aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
