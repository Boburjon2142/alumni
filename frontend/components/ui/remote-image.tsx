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
  priority = false,
}: {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  fallback?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = formatSrc(src);

  return (
    <div className={`remote-image ${className}`}>
      {imageSrc && !failed ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="remote-image-fallback" aria-label={alt}>
          {fallback ? <strong>{fallback}</strong> : <ImageIcon aria-hidden="true" />}
        </span>
      )}
    </div>
  );
}
