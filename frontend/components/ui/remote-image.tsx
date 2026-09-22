"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

function formatSrc(src?: string): string | undefined {
  if (!src) return undefined;
  const s = src.trim();
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
  const [failed, setFailed] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const directSrc = formatSrc(src);
  const localSlugSrc = slug ? `/images/faxriylar/${slug}.png` : undefined;

  let activeSrc = directSrc;
  if (!activeSrc || usingFallback) {
    activeSrc = localSlugSrc;
  }

  const handleError = () => {
    if (!usingFallback && localSlugSrc && directSrc !== localSlugSrc) {
      setUsingFallback(true);
    } else {
      setFailed(true);
    }
  };

  const isLocalOrUnoptimized = Boolean(
    activeSrc &&
      (activeSrc.startsWith("http://localhost") ||
        activeSrc.startsWith("http://127.0.0.1") ||
        activeSrc.startsWith("/images/") ||
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
