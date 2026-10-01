const heroVariants = [
  { minWidth: 1800, asset: "1920x1080", width: 1672, height: 941 },
  { minWidth: 1440, asset: "1440x900", width: 1586, height: 992 },
  { minWidth: 1200, asset: "1366x768", width: 1672, height: 941 },
  { minWidth: 820, asset: "820x1180", width: 1045, height: 1505 },
  { minWidth: 600, asset: "768x1024", width: 1086, height: 1448 },
  { minWidth: 410, asset: "430x932", width: 852, height: 1846 },
  { minWidth: 368, asset: "390x844", width: 853, height: 1844 },
  { minWidth: 0, asset: "360x800", width: 841, height: 1870 },
];

const heroBase = "/images/hero/campus-20261001";

export function HeroCarousel() {
  return (
    <div className="hero-banner-wrapper">
      <picture className="hero-responsive-picture">
        {heroVariants.map(({ minWidth, asset, width, height }) => (
          <source
            key={`webp-${asset}`}
            type="image/webp"
            media={`(min-width: ${minWidth}px)`}
            srcSet={`${heroBase}/hero-${asset}.webp`}
            width={width}
            height={height}
          />
        ))}
        {heroVariants.map(({ minWidth, asset, width, height }) => (
          <source
            key={`png-${asset}`}
            type="image/png"
            media={`(min-width: ${minWidth}px)`}
            srcSet={`${heroBase}/hero-${asset}.png`}
            width={width}
            height={height}
          />
        ))}
        <img
          src={`${heroBase}/hero-360x800.png`}
          width={841}
          height={1870}
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
