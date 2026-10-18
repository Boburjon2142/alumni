"use client";

import { useState, type ImgHTMLAttributes } from "react";

/** Responsive copies of the same artwork; retain the original as a fallback. */
export function RecognitionArtwork({ src, sizes, onError, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string; sizes: string }) {
  const [fallbackSrc, setFallbackSrc] = useState<string>();
  const responsive = fallbackSrc !== src && /^\/recognitions\/\d\d-.+\.png$/.test(src);
  const base = src.replace("/recognitions/", "/recognitions/responsive-v1/").replace(/\.png$/, "");
  return <img {...props} src={src} sizes={sizes}
    srcSet={responsive ? [80, 160, 480].map(width => `${base}-${width}.webp ${width}w`).join(", ") : undefined}
    loading="lazy" decoding="async"
    onError={event => {
      if (responsive) setFallbackSrc(src);
      else onError?.(event);
    }} />;
}
