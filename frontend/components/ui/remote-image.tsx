"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

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
  return <div className={`remote-image ${className}`}>
    {src && !failed
      ? <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onError={() => setFailed(true)} />
      : <span className="remote-image-fallback" aria-label={alt}>
          {fallback ? <strong>{fallback}</strong> : <ImageIcon aria-hidden="true" />}
        </span>}
  </div>;
}
