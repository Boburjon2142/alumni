import type { NewsItem } from "@/types/news";
import type { Locale, Dictionary } from "@/lib/i18n";
import { NewsCard } from "./news-card";

export function NewsGrid({ newsList, locale, t }: { newsList: NewsItem[]; locale: Locale; t: Dictionary }) {
  return (
    <div className="news-grid">
      {newsList.map((item) => (
        <NewsCard key={item.id} news={item} locale={locale} t={t} />
      ))}
    </div>
  );
}
