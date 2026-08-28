"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    id: "hero_slide_1",
    sources: [
      { media: "(max-width: 599px)", srcSet: "/images/hero-carousel/alumni-background-9x16.png" },
      { media: "(max-width: 1024px)", srcSet: "/images/hero-carousel/alumni-background-4x3.png" },
      { media: "(min-width: 1025px)", srcSet: "/images/hero-carousel/large_slide_1.png" },
    ],
    fallback: "/images/hero-carousel/large_slide_1.png",
  },
  {
    id: "hero_slide_2",
    sources: [
      { media: "(max-width: 599px)", srcSet: "/images/hero-carousel/alumni-background-9x16.png" },
      { media: "(max-width: 1024px)", srcSet: "/images/hero-carousel/alumni-background-4x3.png" },
      { media: "(min-width: 1025px)", srcSet: "/images/hero-carousel/large_slide_2.png" },
    ],
    fallback: "/images/hero-carousel/large_slide_2.png",
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-carousel-container" aria-hidden="true">
      {slides.map((slide, idx) => {
        const isActive = idx === activeIndex;
        return (
          <picture
            key={slide.id}
            className={`hero-carousel-slide ${isActive ? "active" : ""}`}
          >
            {slide.sources.map((src, sIdx) => (
              <source key={sIdx} media={src.media} srcSet={src.srcSet} />
            ))}
            <img
              src={slide.fallback}
              alt=""
              fetchPriority={idx === 0 ? "high" : "low"}
              loading={idx === 0 ? "eager" : "lazy"}
              className="hero-carousel-img"
            />
          </picture>
        );
      })}
    </div>
  );
}
