export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const match = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnailUrl(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function getYouTubeWatchUrl(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return url || null;
  return `https://www.youtube.com/watch?v=${id}`;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (id) {
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }
  if (!url) return null;
  const cleanUrl = url.trim();
  if (cleanUrl.includes("youtube.com/embed/")) {
    return cleanUrl;
  }
  return cleanUrl;
}

