import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { AlumniCardGrid } from "@/components/alumni/alumni-card-grid";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/hero/hero-carousel";
import { getAlumni } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Alumni } from "@/types/alumni";
import fallbackAlumni from "@/lib/fallback-alumni.json";

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  let alumniList: Alumni[] = [];

  try {
    const alumniRes = await getAlumni("limit=12&ordering=graduation_year_asc");
    const fetched = Array.isArray(alumniRes)
      ? alumniRes
      : (alumniRes as any)?.data ?? (alumniRes as any)?.results ?? [];
    if (fetched && fetched.length > 0) {
      alumniList = [...fetched].sort((a, b) => (a.graduation_year ?? 9999) - (b.graduation_year ?? 9999));
    } else {
      alumniList = [...(fallbackAlumni as unknown as Alumni[])].sort((a, b) => (a.graduation_year ?? 9999) - (b.graduation_year ?? 9999));
    }
  } catch (err) {
    console.error("Failed to load alumni for home, using fallback:", err);
    alumniList = [...(fallbackAlumni as unknown as Alumni[])].sort((a, b) => (a.graduation_year ?? 9999) - (b.graduation_year ?? 9999));
  }

  return (
    <>
      {/* 01. Hero Section (Responsive Fullscreen Showcase Banner) */}
      <section className={`hero hero-v2 locale-${locale}`}>
        <HeroCarousel />
        <div className="hero-message-layer">
          <div className="container">
            <div className="hero-message">
              <span className="hero-eyebrow-badge">{t.heroEyebrow}</span>
              <h1>
                <span>
                  {t.heroTitle}
                  {t.heroLine2 ? ` ${t.heroLine2}` : ""}
                </span>
                <em>{t.heroAccent}</em>
              </h1>
              <p>{t.heroDescription}</p>
              <div className="hero-actions">
                <Button href="/alumni">
                  {t.heroCtaPrimary} <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Featured Alumni Section (Exact 3 rows / 12 cards layout) */}
      <section className="section featured-section" id="featured">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow gold">{t.brand}</span>
              <h2>{t.featuredTitle}</h2>
              <p className="section-sublead">{t.featuredSubtitle}</p>
            </div>
            <Link href="/alumni" className="section-heading-link">
              {t.viewAllAlumni} <ArrowRight />
            </Link>
          </div>

          {alumniList.length > 0 ? (
            <AlumniCardGrid alumni={alumniList.slice(0, 12)} locale={locale} />
          ) : (
            <div className="empty-state">
              <GraduationCap aria-hidden="true" />
              <h3>{t.featuredEmptyTitle}</h3>
              <p>{t.featuredEmptyText}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
