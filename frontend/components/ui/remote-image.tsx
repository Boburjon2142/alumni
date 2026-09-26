"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

function formatSrc(src?: string): string | undefined {
  if (!src) return undefined;
  let s = src.trim();
  if (!s) return undefined;
  // Convert full backend URLs for media into relative URLs so Next.js rewrites proxy them cleanly
  s = s.replace(/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/media\//i, "/media/");
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
    return s;
  }
  return `/media/${s}`;
}

export function RemoteImage({
  src,
  alt,
  sizes,
  className = "",
  fallback,
  slug,
  priority = false,
}: {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  fallback?: string;
  slug?: string;
  priority?: boolean;
}) {
  const directSrc = formatSrc(src);

  // Build candidate sources in order of preference:
  const candidates: string[] = [];

  if (directSrc) {
    if (directSrc.endsWith(".png") && directSrc.includes("/faxriylar/")) {
      const webpVersion = directSrc.replace(/\.png$/, ".webp");
      candidates.push(webpVersion);
      candidates.push(directSrc);
    } else {
      candidates.push(directSrc);
    }
  }

  if (slug) {
    const webpSlug = `/images/faxriylar/${slug}.webp`;
    const pngSlug = `/images/faxriylar/${slug}.png`;
    if (!candidates.includes(webpSlug)) candidates.push(webpSlug);
    if (!candidates.includes(pngSlug)) candidates.push(pngSlug);
  }

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttemptIndex(0);
    setFailed(false);
  }, [src, slug]);

  const activeSrc = candidates[attemptIndex];

  const handleError = () => {
    if (attemptIndex + 1 < candidates.length) {
      setAttemptIndex((prev) => prev + 1);
    } else {
      setFailed(true);
    }
  };

  const isLocalOrUnoptimized = Boolean(
    activeSrc &&
      (activeSrc.startsWith("http://localhost") ||
        activeSrc.startsWith("http://127.0.0.1") ||
        activeSrc.startsWith("/media/") ||
        activeSrc.startsWith("https://i.ytimg.com") ||
        activeSrc.startsWith("https://img.youtube.com"))
  );

  return (
    <div className={`remote-image ${className}`}>
      {activeSrc && !failed ? (
        <Image
          src={activeSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={isLocalOrUnoptimized ? true : undefined}
          onError={handleError}
        />
      ) : (
        <span className="remote-image-fallback" aria-label={alt}>
          {fallback ? <strong>{fallback}</strong> : <ImageIcon aria-hidden="true" />}
        </span>
      )}
    </div>
  );
}
