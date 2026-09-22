import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Newspaper, Star, User } from "lucide-react";
import { getNewsBySlug } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const news = await getNewsBySlug(slug);
    return {
      title: `${news.title_uz} — QarDU ALUMNI`,
      description: news.summary_uz,
    };
  } catch {
    return { title: "Yangilik — Qarshi davlat universiteti ALUMNI" };
  }
}

function formatDate(dateStr?: string | null, locale = "uz") {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale === "ru" ? "ru-RU" : "uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);

  let news;
  try {
    news = await getNewsBySlug(slug);
  } catch {
    notFound();
  }

  if (!news) notFound();

  const title = (locale === "en" && news.title_en) || (locale === "ru" && news.title_ru) || news.title_uz;
  const summary = (locale === "en" && news.summary_en) || (locale === "ru" && news.summary_ru) || news.summary_uz;
  const content = (locale === "en" && news.content_en) || (locale === "ru" && news.content_ru) || news.content_uz || summary;
  const formattedDate = formatDate(news.published_at || news.created_at, locale);

  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <article className="editorial-page section">
      <div className="container">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0d1667] transition-colors">
            <ArrowLeft size={16} />
            <span>{t.newsBack || "Barcha yangiliklarga qaytish"}</span>
          </Link>
        </div>

        {/* Header */}
        <header className="max-w-4xl mx-auto mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f0f1f8] text-[#0d1667]">
              <Newspaper size={13} />
              {news.category?.toUpperCase()}
            </span>
            {news.is_featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Star size={12} /> {t.newsFeaturedBadge || "Muhim xabar"}
              </span>
            )}
            {formattedDate && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Calendar size={13} className="text-slate-400" /> {formattedDate}
              </span>
            )}
            {typeof news.views_count === "number" && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Eye size={13} className="text-slate-400" /> {news.views_count} {t.newsViews || "ko‘rildi"}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d1667] tracking-tight leading-tight mb-6">
            {title}
          </h1>

          {summary && (
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal border-l-4 border-[#0d1667]/20 pl-4 py-1">
              {summary}
            </p>
          )}

          {news.author_name && (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <User size={15} className="text-slate-400" />
              <span>{news.author_name}</span>
            </div>
          )}
        </header>

        {/* Cover Image */}
        {(news.cover_image || news.cover_image_url) && (
          <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <div className="aspect-[16/9] w-full relative">
              <RemoteImage
                src={news.cover_image || news.cover_image_url}
                alt={news.cover_image_alt || title}
                className="w-full h-full object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            </div>
            {news.cover_image_credit && (
              <p className="text-xs text-slate-400 text-right px-4 py-2 bg-slate-50 border-t border-slate-100">
                {news.cover_image_credit}
              </p>
            )}
          </div>
        )}

        {/* Article Body */}
        <div className="max-w-3xl mx-auto text-slate-700 leading-relaxed space-y-6 text-base sm:text-lg">
          {paragraphs.map((para, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>

        {/* Footer Back Button */}
        <div className="max-w-3xl mx-auto mt-14 pt-8 border-t border-slate-200">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0d1667] text-white font-medium text-sm hover:bg-[#0a1254] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t.newsBack || "Barcha yangiliklarga qaytish"}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
