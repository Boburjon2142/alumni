"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Alumni, AlumniPreview } from "@/types/alumni";
import { getRecognitionTitle, type Locale } from "@/lib/i18n";
import { getAlumniPreview } from "@/lib/api";
import { RemoteImage } from "@/components/ui/remote-image";
import { AlumniQuickProfile } from "./alumni-quick-profile";
import { RecognitionIcon } from "./recognition-icon";

export function AlumniCardGrid({ alumni, locale }: { alumni: Alumni[]; locale: Locale }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [profile, setProfile] = useState<AlumniPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const hint = locale === "ru" ? "Просмотр профиля" : locale === "en" ? "View Profile" : "Profilni ko‘rish";

  const load = (nextSlug: string) => {
    setLoading(true);
    setError(false);
    const controller = new AbortController();
    getAlumniPreview(nextSlug, controller.signal)
      .then((fullData) => {
        setProfile((prev) => (prev ? { ...prev, ...fullData } : (fullData as AlumniPreview)));
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          // If no initial profile exists, flag error
          setProfile((prev) => {
            if (!prev) setError(true);
            return prev;
          });
        }
      })
      .finally(() => setLoading(false));
    return controller;
  };

  useEffect(() => {
    if (!slug) return;
    const controller = load(slug);
    return () => controller.abort();
  }, [slug]);

  const openProfile = (item: Alumni, event: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    setProfile(item as any);
    setSlug(item.slug);
  };

  const close = (open: boolean) => {
    if (!open) {
      setSlug(null);
      setProfile(null);
    }
  };

  return (
    <>
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
            <button
              key={item.id}
              type="button"
              className="minimal-alumni-card"
              onClick={(e) => openProfile(item, e)}
              aria-haspopup="dialog"
              aria-label={ariaLabel}
            >
              <div className="card-photo-container">
                <RemoteImage
                  className="alumni-card-image-full"
                  src={item.image_url || item.avatar || `/images/faxriylar/${item.slug}.png`}
                  alt={item.image_alt || `${item.full_name} portreti`}
                  fallback={initials}
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1180px) 33vw, 25vw"
                />
                {item.recognitions && item.recognitions.length > 0 && (() => {
                  const titleName = getRecognitionTitle(
                    item.recognitions[0].slug,
                    locale,
                    item.recognitions[0].name
                  );
                  return (
                    <div
                      className="card-recognition-emblem"
                      title={titleName}
                      aria-label={titleName}
                    >
                      <RecognitionIcon
                        icon={item.recognitions[0].icon}
                        size={13}
                        className="emblem-icon"
                      />
                      <span className="emblem-text">{titleName}</span>
                    </div>
                  );
                })()}
                <div className="card-photo-gradient" />
                <div className="card-photo-content">
                  <span className="minimal-card-name">{item.full_name}</span>
                  {item.position && (
                    <span className="minimal-card-role">{item.position}</span>
                  )}
                  <span className="minimal-card-cta">
                    {hint} <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <AlumniQuickProfile
        open={Boolean(slug)}
        onOpenChange={close}
        profile={profile}
        loading={loading && !profile}
        error={error && !profile}
        onRetry={() => slug && load(slug)}
        locale={locale}
        returnFocus={() => triggerRef.current?.focus()}
      />
    </>
  );
}
