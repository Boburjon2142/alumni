import Link from "next/link";
import { ArrowRight, Calendar, Eye, Newspaper, Star } from "lucide-react";
import type { NewsItem, NewsCategory } from "@/types/news";
import type { Locale, Dictionary } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

function getCategoryBadge(category: NewsCategory, t: Dictionary) {
  switch (category) {
    case "university":
      return t.newsCategoryUniversity || "Universitet";
    case "alumni":
      return t.newsCategoryAlumni || "Alumni";
    case "event":
      return t.newsCategoryEvent || "Tadbirlar";
    case "achievement":
      return t.newsCategoryAchievement || "Yutuqlar";
    default:
      return t.newsCategoryGeneral || "Umumiy";
  }
}

function formatDate(dateStr?: string | null, locale: Locale = "uz") {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale === "ru" ? "ru-RU" : "uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function NewsCard({ news, locale, t }: { news: NewsItem; locale: Locale; t: Dictionary }) {
  const title = (locale === "en" && news.title_en) || (locale === "ru" && news.title_ru) || news.title_uz;
  const summary = (locale === "en" && news.summary_en) || (locale === "ru" && news.summary_ru) || news.summary_uz;
  const categoryLabel = getCategoryBadge(news.category, t);
  const formattedDate = formatDate(news.published_at || news.created_at, locale);

  return (
    <article className="news-card">
      <Link href={`/news/${news.slug}`} className="news-card-media" tabIndex={-1} aria-hidden="true">
        <RemoteImage
          className="news-card-image"
          src={news.cover_image || news.cover_image_url}
          alt={news.cover_image_alt || title}
          fallback="Q"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
        />
        <div className="news-card-overlay" />
        <span className="news-card-badge">
          {news.is_featured ? <Star size={12} className="text-amber-400 fill-amber-400" /> : <Newspaper size={12} />}
          <span>{categoryLabel}</span>
        </span>
      </Link>
      <div className="news-card-body">
        <div className="news-card-meta">
          {formattedDate && (
            <span className="news-meta-item">
              <Calendar size={13} className="news-meta-icon" />
              <span>{formattedDate}</span>
            </span>
          )}
          {typeof news.views_count === "number" && (
            <span className="news-meta-item">
              <Eye size={13} className="news-meta-icon" />
              <span>{news.views_count}</span>
            </span>
          )}
        </div>
        <h3 className="news-card-title">
          <Link href={`/news/${news.slug}`}>{title}</Link>
        </h3>
        {summary && <p className="news-card-excerpt">{summary}</p>}
        <Link href={`/news/${news.slug}`} className="news-card-action">
          <span>{t.newsReadMore || "Batafsil o‘qish"}</span>
          <ArrowRight size={15} className="news-action-arrow" />
        </Link>
      </div>
    </article>
  );
}
