import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Lightbulb, User } from "lucide-react";
import { getStoryBySlug } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const story = await getStoryBySlug(slug);
    return {
      title: `${story.title_uz} — QarshiDU Alumni`,
      description: story.summary_uz,
    };
  } catch {
    return { title: "Muvaffaqiyat hikoyasi — Qarshi davlat universiteti" };
  }
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);

  let story;
  try {
    story = await getStoryBySlug(slug);
  } catch {
    notFound();
  }

  if (!story) notFound();

  const title = (locale === "en" && story.title_en) || story.title_uz;
  const summary = (locale === "en" && story.summary_en) || story.summary_uz;
  const takeaway = (locale === "en" && story.student_takeaway_en) || story.student_takeaway_uz;

  return (
    <article className="story-detail-page">
      {/* Breadcrumb */}
      <div className="container story-back-nav">
        <Link href="/stories" className="back-link">
          <ArrowLeft size={16} />
          <span>{t.backToStories}</span>
        </Link>
      </div>

      {/* Hero Header */}
      <header className="story-detail-header">
        <div className="container story-header-container">
          <div className="story-header-meta">
            <span className="story-eyebrow-tag">
              <BookOpen size={14} /> {t.storyEyebrow}
            </span>
            <h1 className="story-main-title">{title}</h1>
            <p className="story-main-summary">{summary}</p>

            {story.alumnus && (
              <div className="story-author-card">
                <RemoteImage
                  className="story-author-avatar"
                  src={story.alumnus.avatar || story.alumnus.image_url}
                  alt={story.alumnus.full_name}
                  fallback={story.alumnus.full_name.slice(0, 2)}
                  sizes="64px"
                />
                <div className="story-author-details">
                  <strong>{story.alumnus.full_name}</strong>
                  {story.alumnus.position && <span>{story.alumnus.position}</span>}
                  {story.alumnus.faculty && <small>{story.alumnus.faculty}</small>}
                </div>
                <Link href={`/alumni/${story.alumnus.slug}`} className="story-author-link-btn">
                  <User size={15} />
                  <span>{t.authorProfile}</span>
                </Link>
              </div>
            )}
          </div>

          {(story.hero_image || story.hero_image_url) && (
            <div className="story-hero-media">
              <RemoteImage
                className="story-hero-image"
                src={story.hero_image || story.hero_image_url}
                alt={story.hero_image_alt || title}
                fallback="Q"
                sizes="(max-width: 900px) 100vw, 480px"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Long-form Content */}
      <div className="container story-body-container">
        <div className="story-content-prose">
          {story.sections && story.sections.length > 0 ? (
            story.sections.map((sec) => {
              const heading = (locale === "en" && sec.heading_en) || sec.heading_uz;
              const content = (locale === "en" && sec.content_en) || sec.content_uz;
              return (
                <section key={sec.id} className="story-section-block">
                  {heading && <h2>{heading}</h2>}
                  <div className="story-section-text">
                    {content.split("\n").map((para, idx) => (
                      para.trim() ? <p key={idx}>{para}</p> : null
                    ))}
                  </div>
                </section>
              );
            })
          ) : null}

          {/* Student Takeaway / Advice */}
          {takeaway && (
            <section className="story-takeaway-card">
              <div className="takeaway-header">
                <Lightbulb size={24} />
                <h2>{t.studentTakeaway}</h2>
              </div>
              <p>{takeaway}</p>
            </section>
          )}

          {/* Feedback CTA */}
          <div className="story-feedback-banner">
            <p>
              {locale === "en"
                ? "Have a suggestion or spotted an inaccuracy in this article?"
                : locale === "ru"
                ? "Есть предложение или заметили неточность в материале?"
                : "Ushbu material bo‘yicha taklifingiz yoki tuzatishingiz bormi?"}
            </p>
            <Button href={`/feedback?story=${story.id}&url=/stories/${story.slug}`} variant="secondary">
              {t.navFeedback}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
