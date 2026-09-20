"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BrandPreloaderProps {
  /**
   * Display time in milliseconds before starting fade-out (default: 320ms)
   */
  minDisplayMs?: number;
  /**
   * Fade-out duration in milliseconds (default: 200ms)
   */
  fadeDurationMs?: number;
}

export function BrandPreloader({
  minDisplayMs = 320,
  fadeDurationMs = 200,
}: BrandPreloaderProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsFading(false);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, minDisplayMs);

    const destroyTimer = setTimeout(() => {
      setIsMounted(false);
      setIsFading(false);
    }, minDisplayMs + fadeDurationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, [pathname, minDisplayMs, fadeDurationMs]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`brand-preloader ${isFading ? "brand-preloader-fading" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Qarshi Davlat Universiteti Alumni platformasi yuklanmoqda"
    >
      <div className="brand-preloader-backdrop" />
      <div className="brand-preloader-content">
        {/* Official University Logo */}
        <div className="brand-preloader-logo-wrapper">
          <img
            src="/brand/Logo.png"
            alt="Qarshi Davlat Universiteti"
            width={320}
            height={190}
            fetchPriority="high"
            decoding="async"
            className="brand-preloader-logo"
          />
        </div>

        {/* Minimalist, Luxury Alumni Tag & Slogan */}
        <div className="brand-preloader-text">
          <div className="brand-preloader-badge">
            <span className="brand-preloader-pill">ALUMNI PLATFORMASI</span>
          </div>
          <p className="brand-preloader-slogan">Bir umrlik aloqa</p>
        </div>

        {/* Smooth Gold Shimmer Progress Bar */}
        <div className="brand-preloader-track" aria-hidden="true">
          <div className="brand-preloader-bar" />
        </div>

        <span className="sr-only">Yuklanmoqda...</span>
      </div>
    </div>
  );
}
