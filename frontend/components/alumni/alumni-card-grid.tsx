"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Alumni, AlumniPreview } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { getAlumniPreview } from "@/lib/api";
import { RemoteImage } from "@/components/ui/remote-image";
import { AlumniQuickProfile } from "./alumni-quick-profile";

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
    setProfile(null);
    const controller = new AbortController();
    getAlumniPreview(nextSlug, controller.signal)
      .then(setProfile)
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
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
    setSlug(item.slug);
  };

  const close = (open: boolean) => {
    if (!open) setSlug(null);
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
              type="button"
              className="alumni-card alumni-card-minimal alumni-card-fullphoto"
              onClick={(event) => openProfile(item, event)}
              key={item.id}
              aria-label={ariaLabel}
            >
              <div className="card-photo-container">
                <RemoteImage
                  className="alumni-card-image-full"
                  src={item.avatar || item.image_url}
                  alt={item.image_alt || `${item.full_name} portreti`}
                  fallback={initials}
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1180px) 33vw, 25vw"
                />
                <div className="card-photo-gradient" />
                <div className="card-photo-content">
                  <span className="minimal-card-name">{item.full_name}</span>
                  {item.position && (
                    <span className="minimal-card-role">{item.position}</span>
                  )}
                  <span className="minimal-card-hint" aria-hidden="true">
                    {hint} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <AlumniQuickProfile
        open={!!slug}
        onOpenChange={close}
        profile={profile}
        loading={loading}
        error={error}
        onRetry={() => slug && load(slug)}
        locale={locale}
        returnFocus={() => triggerRef.current?.focus()}
      />
    </>
  );
}
