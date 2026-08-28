import type { SuccessStory } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { StoryCard } from "./story-card";

export function StoryGrid({ stories, locale }: { stories: SuccessStory[]; locale: Locale }) {
  return (
    <div className="story-grid">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} locale={locale} />
      ))}
    </div>
  );
}
