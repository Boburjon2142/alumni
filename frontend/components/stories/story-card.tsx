import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { SuccessStory } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

export function StoryCard({ story, locale }: { story: SuccessStory; locale: Locale }) {
  const title = (locale === "en" && story.title_en) || (locale === "ru" && story.title_ru) || story.title_uz || story.title;
  const summary = (locale === "en" && story.summary_en) || (locale === "ru" && story.summary_ru) || story.summary_uz || story.summary;
  const readText = locale === "en" ? "Read Story" : locale === "ru" ? "Читать историю" : "Hikoyani o‘qish";
  const eyebrowText = locale === "en" ? "Success Story" : locale === "ru" ? "История успеха" : "Muvaffaqiyat hikoyasi";

  return (
    <article className="story-card">
      <Link href={`/stories/${story.slug}`} className="story-card-media" tabIndex={-1} aria-hidden="true">
        <RemoteImage
          className="story-card-image"
          src={story.hero_image || story.hero_image_url || story.alumnus?.avatar || story.alumnus?.image_url}
          alt={story.hero_image_alt || title}
          fallback="Q"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
        />
        <span className="story-card-badge">
          <BookOpen size={13} /> {eyebrowText}
        </span>
      </Link>
      <div className="story-card-body">
        {story.alumnus && (
          <div className="story-card-author">
            <strong>{story.alumnus.full_name}</strong>
            {story.alumnus.position && <span>{story.alumnus.position}</span>}
          </div>
        )}
        <h3 className="story-card-title">
          <Link href={`/stories/${story.slug}`}>{title}</Link>
        </h3>
        <p className="story-card-excerpt">{summary}</p>
        <Link href={`/stories/${story.slug}`} className="story-card-action">
          <span>{readText}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
