"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppLoader } from "./app-loader";

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

  return <AppLoader fading={isFading} fadeDurationMs={fadeDurationMs} />;
}
