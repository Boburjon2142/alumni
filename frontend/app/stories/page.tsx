import { getStories } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { StoryGrid } from "@/components/stories/story-grid";
import { Button } from "@/components/ui/button";
import styles from "./stories.module.css";

export const metadata = {
  title: "Muvaffaqiyat hikoyalari — Qarshi davlat universiteti",
  description: "Qarshi davlat universiteti faxriy bitiruvchilarining ibratli hayot va kasbiy yo‘li haqidagi tahririyat maqolalari.",
};

export default async function StoriesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  let stories: import("@/types/alumni").SuccessStory[] = [];
  try {
    const res = await getStories("limit=12");
    stories = res.data ?? [];
  } catch (err) {
    console.error("Failed to load stories:", err);
  }

  return (
    <div className={`stories-page ${styles.page}`}>
      <div className={`container ${styles.content}`}>
        <div className="page-heading">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{t.storiesTitle}</h1>
          <p>{t.storiesSubtitle}</p>
        </div>

        {stories.length > 0 ? (
          <StoryGrid stories={stories} locale={locale} />
        ) : (
          <div className="empty-state">
            <h3>{t.storiesEmptyTitle}</h3>
            <p>{t.storiesEmptyText}</p>
            <Button href="/alumni">{t.heroCtaPrimary}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
