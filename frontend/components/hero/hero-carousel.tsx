const heroVariants = [
  { minWidth: 1800, width: 1920, height: 1080 },
  { minWidth: 1440, width: 1600, height: 900 },
  { minWidth: 1200, width: 1366, height: 768 },
  { minWidth: 900, width: 1024, height: 768 },
  { minWidth: 600, width: 768, height: 1024 },
  { minWidth: 410, width: 430, height: 932 },
  { minWidth: 383, width: 390, height: 844 },
  { minWidth: 368, width: 375, height: 812 },
];

export function HeroCarousel() {
  return (
    <div className="hero-banner-wrapper">
      <picture className="hero-responsive-picture">
        {heroVariants.map(({ minWidth, width, height }) => (
          <source
            key={`webp-${width}`}
            type="image/webp"
            media={`(min-width: ${minWidth}px)`}
            srcSet={`/images/hero/profiles/hero-${width}x${height}.webp`}
            width={width}
            height={height}
          />
        ))}
        {heroVariants.map(({ minWidth, width, height }) => (
          <source
            key={`png-${width}`}
            type="image/png"
            media={`(min-width: ${minWidth}px)`}
            srcSet={`/images/hero/profiles/hero-${width}x${height}.png`}
            width={width}
            height={height}
          />
        ))}
        <img
          src="/images/hero/profiles/hero-360x800.webp"
          width={360}
          height={800}
          alt="Qarshi davlat universiteti faxriy bitiruvchilari"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="hero-responsive-img"
        />
      </picture>
    </div>
  );
}
