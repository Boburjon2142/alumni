"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, HelpCircle, MessageCircle, Play, Sparkles, Volume2, X } from "lucide-react";
import type { Interview } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

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

  const intro =
    (locale === "en" && interview.intro_en) ||
    (locale === "ru" && interview.intro_ru) ||
    interview.intro_uz;

  const pullQuote =
    (locale === "en" && interview.pull_quote_en) ||
    (locale === "ru" && interview.pull_quote_ru) ||
    interview.pull_quote_uz;

  const alumnus = interview.alumnus;
  const initials = alumnus.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const readText =
    locale === "en"
      ? "Read Transcript"
      : locale === "ru"
      ? "Текст интервью"
      : "Suhbat matni";

  const watchText =
    locale === "en"
      ? "Watch Video"
      : locale === "ru"
      ? "Смотреть видео"
      : "Videoni ko‘rish";

  const countText =
    interview.items_count !== undefined
      ? locale === "en"
        ? `${interview.items_count} questions`
        : locale === "ru"
        ? `${interview.items_count} вопросов`
        : `${interview.items_count} ta savol`
      : null;

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

  // Deterministic sample video duration based on interview id
  const durations = ["14:20", "18:45", "22:10", "16:30", "19:15", "12:50"];
  const duration = interview.video_duration || durations[(interview.id || 0) % durations.length];

  const avatarSrc = alumnus.image_url || alumnus.avatar || `/images/faxriylar/${alumnus.slug}.png`;

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
          aria-label={`${alumnus.full_name} video intervyusini ko‘rish`}
        >
          {/* Background Alumnus Image */}
          <div className="video-card-bg-image">
            <RemoteImage
              className="video-thumbnail-img"
              src={avatarSrc}
              slug={alumnus.slug}
              alt={`${alumnus.full_name} video suhbati`}
              fallback={initials}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
            />
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
                {alumnus.position || alumnus.faculty || "QarshiDU bitiruvchisi"}
                {alumnus.faculty && ` · ${alumnus.faculty}`}
              </span>
            </div>
          </div>

          <h3 className="interview-card-title">
            <Link href={`/interviews/${interview.slug}`}>{title}</Link>
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

          <Link href={`/interviews/${interview.slug}`} className="interview-card-cta">
            <FileText size={14} />
            <span>{readText}</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
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
                  {alumnus.full_name} — {alumnus.position || alumnus.faculty || "QarshiDU bitiruvchisi"}
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
              {interview.video_url && interview.video_url.includes("youtube.com") ? (
                <iframe
                  src={interview.video_url}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-modal-iframe"
                />
              ) : (
                <div className="video-placeholder-player">
                  <div className="video-player-ambient-bg">
                    <RemoteImage
                      className="video-ambient-poster"
                      src={avatarSrc}
                      slug={alumnus.slug}
                      alt={alumnus.full_name}
                      fallback={initials}
                      sizes="800px"
                    />
                  </div>
                  <div className="video-player-center-overlay">
                    <div className="video-player-big-play">
                      <Play size={36} fill="currentColor" />
                    </div>
                    <h4>QarshiDU Eksklyuziv Video Intervyusi</h4>
                    <p>Davomiyligi: {duration} • 1080p Full HD</p>
                    <Link
                      href={`/interviews/${interview.slug}`}
                      className="video-player-full-cta"
                    >
                      <span>To‘liq savol-javob matnini o‘qish</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Questions summary */}
            <div className="video-modal-footer">
              <div className="video-modal-tags">
                {countText && (
                  <span className="video-modal-q-count">
                    <HelpCircle size={14} />
                    <span>{countText}</span>
                  </span>
                )}
                <span className="video-modal-duration-pill">{duration}</span>
              </div>

              <Link
                href={`/interviews/${interview.slug}`}
                className="video-modal-view-full-btn"
                onClick={() => setIsVideoModalOpen(false)}
              >
                <span>Batafsil sahifaga o‘tish</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
