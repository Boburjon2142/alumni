import { getNews } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { NewsGrid } from "@/components/news/news-grid";
import { NewsFilterTabs } from "@/components/news/news-filter-tabs";
import type { NewsItem } from "@/types/news";

export const metadata = {
  title: "So‘nggi yangiliklar — Qarshi davlat universiteti ALUMNI",
  description: "Qarshi davlat universiteti va bitiruvchilar hamjamiyatining eng so‘nggi yangiliklari va muhim voqealari.",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const queryParams = new URLSearchParams();
  if (typeof resolvedSearchParams.category === "string" && resolvedSearchParams.category) {
    queryParams.set("category", resolvedSearchParams.category);
  }
  if (typeof resolvedSearchParams.search === "string" && resolvedSearchParams.search) {
    queryParams.set("search", resolvedSearchParams.search);
  }

  let newsList: NewsItem[] = [];
  try {
    const res = await getNews(queryParams.toString());
    newsList = res.data ?? [];
  } catch (err) {
    console.error("Failed to load news:", err);
  }

  return (
    <div className="editorial-page section">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow gold">
            {locale === "en" ? "News & Events" : locale === "ru" ? "Новости и события" : "Yangiliklar va voqealar"}
          </span>
          <h1>{t.newsPageTitle || "So‘nggi yangiliklar"}</h1>
          <p>{t.newsPageSubtitle || "Qarshi davlat universiteti va bitiruvchilar hamjamiyatining eng so‘nggi yangiliklari va muhim voqealari."}</p>
        </div>

        <NewsFilterTabs t={t} />

        {newsList.length > 0 ? (
          <NewsGrid newsList={newsList} locale={locale} t={t} />
        ) : (
          <div className="empty-state">
            <h3>{t.newsEmptyTitle || "Hozircha yangiliklar topilmadi"}</h3>
            <p>{t.newsEmptyText || "Tez orada yangi ma’lumotlar yuklanadi."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
