"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Play, Sparkles, Volume2, X } from "lucide-react";
import type { Interview } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeWatchUrl } from "@/lib/video";

export function InterviewCard({
  interview,
  locale,
}: {
  interview: Interview;
  locale: Locale;
}) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const title =
    (locale === "en" && interview.title_en) ||
    (locale === "ru" && interview.title_ru) ||
    interview.title_uz;

  const alumnus = interview.alumnus;
  const initials = alumnus.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const watchText =
    locale === "en"
      ? "Watch Video"
      : locale === "ru"
      ? "Смотреть видео"
      : "Videoni ko‘rish";

  const featuredBadge =
    locale === "en"
      ? "Featured Video"
      : locale === "ru"
      ? "Эксклюзивное видео"
      : "Eksklyuziv video";

  const videoBadge =
    locale === "en"
      ? "Video Interview"
      : locale === "ru"
      ? "Видеоинтервью"
      : "Video suhbat";

  const openInYouTubeText =
    locale === "en"
      ? "Open in YouTube"
      : locale === "ru"
      ? "Открыть в YouTube"
      : "YouTube’da ochish";

  // Deterministic sample video duration based on interview id
  const durations = ["14:20", "18:45", "22:10", "16:30", "19:15", "12:50"];
  const duration = interview.video_duration || durations[(interview.id || 0) % durations.length];

  const ytThumbnail = getYouTubeThumbnailUrl(interview.video_url);
  const ytWatchUrl = getYouTubeWatchUrl(interview.video_url);

  // Alumnus avatar source: ONLY for author profile avatar
  const avatarSrc = `/images/faxriylar/${alumnus.slug}.png` || alumnus.image_url || alumnus.avatar;
  
  // Video thumbnail: ONLY use official video thumbnail, never graduate portrait
  const thumbnailSrc = ytThumbnail || undefined;

  return (
    <>
      <article className={`interview-card video-interview-card ${interview.is_featured ? "is-featured" : ""}`}>
        {/* VIDEO THUMBNAIL CONTAINER (16:9 Ratio) */}
        <div
          className="video-card-thumbnail-wrap"
          onClick={() => setIsVideoModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsVideoModalOpen(true);
            }
          }}
          aria-label={`${title} video intervyusini ko‘rish`}
        >
          {/* Background Video Image */}
          <div className="video-card-bg-image">
            {thumbnailSrc ? (
              <RemoteImage
                className="video-thumbnail-img"
                src={thumbnailSrc}
                alt={`${title} video suhbati`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                priority={interview.is_featured}
              />
            ) : (
              <div className="video-card-default-cover" />
            )}
          </div>

          {/* Dark Cinematic Gradient Overlay */}
          <div className="video-thumbnail-overlay" />

          {/* Top Badges */}
          <div className="video-thumbnail-top-bar">
            <span className="video-type-badge">
              <Volume2 size={12} className="video-badge-icon" />
              <span>{interview.is_featured ? featuredBadge : videoBadge}</span>
            </span>

            {interview.is_featured && (
              <span className="video-featured-star" title="Tanlangan suhbat">
                <Sparkles size={13} />
              </span>
            )}
          </div>

          {/* Center Glowing Play Button */}
          <div className="video-play-btn-wrapper">
            <div className="video-play-btn" aria-hidden="true">
              <Play size={22} className="play-triangle-icon" fill="currentColor" />
            </div>
            <span className="video-play-hint">{watchText}</span>
          </div>

          {/* Bottom Info Bar: Alumnus Name & Duration */}
          <div className="video-thumbnail-bottom-bar">
            <div className="video-author-chip">
              <span className="video-author-chip-name">{alumnus.full_name}</span>
            </div>
            <span className="video-duration-tag">{duration}</span>
          </div>
        </div>

        {/* AUTHOR & CONTENT INFO */}
        <div className="interview-card-body">
          <div className="interview-card-top-compact">
            <div className="interview-card-avatar-mini">
              <RemoteImage
                className="interview-avatar-img-mini"
                src={avatarSrc}
                slug={alumnus.slug}
                alt={alumnus.full_name}
                fallback={initials}
                sizes="36px"
              />
            </div>
            <div className="interview-author-meta-compact">
              <Link href={`/alumni/${alumnus.slug}`} className="interview-author-name">
                {alumnus.full_name}
              </Link>
              <span className="interview-author-position">
                {alumnus.position || alumnus.faculty || "Qarshi davlat universiteti bitiruvchisi"}
                {alumnus.faculty && ` · ${alumnus.faculty}`}
              </span>
            </div>
          </div>

          <h3
            className="interview-card-title"
            onClick={() => setIsVideoModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsVideoModalOpen(true);
              }
            }}
          >
            <span>{title}</span>
          </h3>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="interview-card-footer">
          <button
            type="button"
            onClick={() => setIsVideoModalOpen(true)}
            className="video-card-watch-cta"
            aria-label={`${title} videosini tomosha qilish`}
          >
            <Play size={14} fill="currentColor" />
            <span>{watchText}</span>
          </button>
        </div>
      </article>

      {/* VIDEO PLAYER MODAL */}
      {isVideoModalOpen && (
        <div
          className="video-modal-backdrop"
          onClick={() => setIsVideoModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <div className="video-modal-title-group">
                <span className="video-modal-badge">{videoBadge}</span>
                <h3 className="video-modal-title">{title}</h3>
                <p className="video-modal-author">
                  {alumnus.full_name} — {alumnus.position || alumnus.faculty || "Qarshi davlat universiteti bitiruvchisi"}
                </p>
              </div>
              <button
                type="button"
                className="video-modal-close"
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Yopish"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="video-modal-player-box">
              {(() => {
                const embedUrl = getYouTubeEmbedUrl(interview.video_url);

                if (embedUrl) {
                  return (
                    <iframe
                      src={embedUrl}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="video-modal-iframe"
                    />
                  );
                }

                return (
                  <div className="video-placeholder-player">
                    <div className="video-player-ambient-bg">
                      {thumbnailSrc ? (
                        <RemoteImage
                          className="video-ambient-poster"
                          src={thumbnailSrc}
                          alt={title}
                          sizes="800px"
                        />
                      ) : (
                        <div className="video-card-default-cover" />
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer with Video Details */}
            <div className="video-modal-footer">
              <div className="video-modal-tags">
                <span className="video-modal-duration-pill">{duration}</span>
                {ytWatchUrl && (
                  <a
                    href={ytWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-modal-youtube-link"
                  >
                    <span>{openInYouTubeText}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              <button
                type="button"
                className="video-modal-view-full-btn"
                onClick={() => setIsVideoModalOpen(false)}
              >
                <span>Yopish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
