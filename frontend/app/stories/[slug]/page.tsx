import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Lightbulb,
  Quote,
  Sparkles,
  User,
} from "lucide-react";
import { getStoryBySlug } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";
import { StoryShareButton } from "@/components/stories/story-share-button";
import { ReadingProgress } from "@/components/stories/reading-progress";
import styles from "./story-detail.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const story = await getStoryBySlug(slug);
    const title = story.title_uz || "Muvaffaqiyat hikoyasi";
    const desc = story.summary_uz || "Qarshi davlat universiteti bitiruvchisi muvaffaqiyat hikoyasi.";
    return {
      title: `${title} — QarDU ALUMNI`,
      description: desc,
      openGraph: {
        title: `${title} — QarDU ALUMNI`,
        description: desc,
        images: story.hero_image_url || story.hero_image ? [story.hero_image_url || story.hero_image!] : [],
      },
    };
  } catch {
    return { title: "Muvaffaqiyat hikoyasi — Qarshi davlat universiteti ALUMNI" };
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

  const title = (locale === "en" && story.title_en) || (locale === "ru" && story.title_ru) || story.title_uz;
  const summary = (locale === "en" && story.summary_en) || (locale === "ru" && story.summary_ru) || story.summary_uz;
  const takeaway = (locale === "en" && story.student_takeaway_en) || story.student_takeaway_uz;

  const alumnus = story.alumnus;
  const portraitUrl =
    story.hero_image ||
    story.hero_image_url ||
    alumnus?.avatar ||
    alumnus?.image_url ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80";

  // Academic degree / title formatting
  const academicDegree =
    alumnus?.academic_degree_display ||
    alumnus?.academic_title_display ||
    alumnus?.academic_degree ||
    alumnus?.academic_title ||
    alumnus?.degree ||
    "";

  // Hero Quote text
  const heroQuoteText =
    takeaway ||
    (alumnus?.bio ? alumnus.bio.split(".")[0] + "." : "") ||
    "Ilm, mehnat va sabr har qanday maqsadga eltadi.";

  // Timeline items
  const timelineItems = alumnus?.timeline && alumnus.timeline.length > 0 ? alumnus.timeline : [];

  // Key achievements
  const achievements = alumnus?.achievements && alumnus.achievements.length > 0 ? alumnus.achievements : [];

  // Default youth advice items
  const adviceList = [
    {
      num: "01",
      title: locale === "en" ? "Never Stop Inquiring" : locale === "ru" ? "Постоянно стремитесь к знаниям" : "Doim izlaning",
      desc:
        locale === "en"
          ? "Never hesitate to ask questions and pursue deeper knowledge beyond the classroom."
          : locale === "ru"
          ? "Не бойтесь задавать вопросы и стремиться к более глубоким знаниям."
          : "Savol berishdan va yangi bilimlarga intilishdan aslo to‘xtamang.",
    },
    {
      num: "02",
      title: locale === "en" ? "Learn from Mentors" : locale === "ru" ? "Учитесь у наставников" : "Ustozlardan o‘rganing",
      desc:
        locale === "en"
          ? "Behind every great milestone stands the guidance, wisdom, and support of great teachers."
          : locale === "ru"
          ? "За каждым успехом стоит совет, мудрость и поддержка наставников."
          : "Har bir muvaffaqiyat ortida ustozlar maslahati, mehnati va qo‘llab-quvvatlovi bor.",
    },
    {
      num: "03",
      title: locale === "en" ? "Set Ambitious Goals" : locale === "ru" ? "Ставьте высокие цели" : "Katta maqsadlar qo‘ying",
      desc:
        locale === "en"
          ? "Believe in your potential and work relentlessly toward long-term impactful visions."
          : locale === "ru"
          ? "Верьте в свои возможности и упорно стремитесь к долгосрочным целям."
          : "O‘z imkoniyatlaringizga ishoning va jamiyatga foydali uzoq muddatli maqsadlar sari intiling.",
    },
    {
      num: "04",
      title: locale === "en" ? "Give Back to Society" : locale === "ru" ? "Служите обществу" : "Jamiyatga hissa qo‘shing",
      desc:
        locale === "en"
          ? "Channel your acquired education, expertise, and leadership to empower the community."
          : locale === "ru"
          ? "Используйте накопленные знания и опыт для развития университета и общества."
          : "Olingan bilim, tajriba va natijalarni jamiyat va yangi avlod rivoji uchun yo‘naltiring.",
    },
  ];

  // Story topics tags
  const storyTopics = [
    locale === "en" ? "Scientific Research" : locale === "ru" ? "Научные исследования" : "Ilmiy izlanishlar",
    locale === "en" ? "Education & Leadership" : locale === "ru" ? "Образование и руководство" : "Ta’lim va rahbarlik",
    locale === "en" ? "Community Impact" : locale === "ru" ? "Вклад в общество" : "Jamiyatga hissa",
    locale === "en" ? "Youth Inspiration" : locale === "ru" ? "Вдохновение для молодежи" : "Yangi avlod uchun ilhom",
  ];

  const relatedStories = story.related_stories || [];

  return (
    <article className={styles.page}>
      <ReadingProgress />

      {/* 1. BACK NAVIGATION */}
      <div className={styles.backNav}>
        <div className={styles.container}>
          <Link href="/stories" className={styles.backLink}>
            <ArrowLeft size={15} />
            <span>{t.storyBack || "Barcha hikoyalarga qaytish"}</span>
          </Link>
        </div>
      </div>

      {/* 2. EDITORIAL HERO (2 COLUMN) */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            {/* Left Column (58%) */}
            <div className={styles.heroLeft}>
              {/* Category Badge */}
              <div className={styles.categoryBadge}>
                <BookOpen size={12} color="#1A247E" />
                <span>{t.storyBadge || "MUVAFFAQIYAT HIKOYASI"}</span>
              </div>

              {/* Main Title */}
              <h1 className={styles.mainTitle}>{title}</h1>

              {/* Story Hook / Intro */}
              <p className={styles.heroIntro}>{summary}</p>

              {/* Alumni Quick Facts */}
              {alumnus && (
                <div className={styles.quickFactsGrid}>
                  {alumnus.faculty && (
                    <div className={styles.factItem}>
                      <span className={styles.factLabel}>{t.storyFaculty || "Fakultet"}</span>
                      <strong className={styles.factValue}>{alumnus.faculty}</strong>
                    </div>
                  )}

                  {alumnus.graduation_year && (
                    <div className={styles.factItem}>
                      <span className={styles.factLabel}>{t.storyGradYear || "Bitirgan yili"}</span>
                      <strong className={styles.factValue}>{alumnus.graduation_year}-yil</strong>
                    </div>
                  )}

                  {alumnus.position && (
                    <div className={styles.factItem}>
                      <span className={styles.factLabel}>{t.storyCurrentRole || "Hozirgi lavozimi"}</span>
                      <strong className={styles.factValue}>{alumnus.position}</strong>
                    </div>
                  )}

                  {academicDegree && (
                    <div className={styles.factItem}>
                      <span className={styles.factLabel}>{t.storyAcademicDegree || "Ilmiy daraja"}</span>
                      <strong className={styles.factValue}>{academicDegree}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Hero Actions */}
              <div className={styles.heroActions}>
                {alumnus && (
                  <Link href={`/alumni/${alumnus.slug}`} className={styles.primaryBtn}>
                    <User size={16} />
                    <span>{t.storyViewProfile || "Bitiruvchi profili"}</span>
                  </Link>
                )}

                <StoryShareButton
                  title={title}
                  text={summary}
                  label={t.storyShare || "Ulashish"}
                  copiedLabel={t.storyCopied || "Havola nusxalandi"}
                />
              </div>
            </div>

            {/* Right Column (42%) - Portrait & Quote */}
            <div className={styles.heroRight}>
              <div className={styles.portraitWrapper}>
                <div className={styles.portraitMedia}>
                  <RemoteImage
                    src={portraitUrl}
                    alt={story.hero_image_alt || alumnus?.full_name || title}
                    className={styles.portraitImage}
                    sizes="(max-width: 1024px) 100vw, 460px"
                    fallback={alumnus?.full_name?.slice(0, 2) || "Q"}
                  />
                </div>

                {/* Hero Quote Card */}
                <div className={styles.heroQuoteCard}>
                  <Quote size={20} color="#D38E4F" style={{ marginBottom: "6px", opacity: 0.85 }} />
                  <p className={styles.heroQuoteText}>"{heroQuoteText}"</p>
                  {alumnus?.full_name && (
                    <span className={styles.heroQuoteAuthor}>— {alumnus.full_name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXECUTIVE SUMMARY BLOCK */}
      <section className={styles.summarySection}>
        <div className={styles.container}>
          <div className={styles.summaryHeader}>
            <Sparkles size={14} color="#D38E4F" />
            <span>{t.storySummaryHeading || "Qisqacha mazmun"}</span>
          </div>
          <p className={styles.summaryText}>{summary}</p>

          {/* Topic Chips */}
          <div className={styles.topicsList}>
            {storyTopics.map((topic, i) => (
              <span key={i} className={styles.topicChip}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MAIN ARTICLE + RIGHT RAIL LAYOUT */}
      <section className={styles.mainSection}>
        <div className={styles.container}>
          <div className={styles.mainGrid}>
            {/* Left / Main Article Column */}
            <div className={styles.articleColumn}>
              {/* Story Sections */}
              {story.sections && story.sections.length > 0 ? (
                <>
                  {story.sections.map((sec, idx) => {
                    const heading = (locale === "en" && sec.heading_en) || sec.heading_uz;
                    const content = (locale === "en" && sec.content_en) || sec.content_uz;
                    const sectionNum = String(idx + 1).padStart(2, "0");

                    return (
                      <section key={sec.id || idx} className={styles.storySection}>
                        <div className={styles.sectionHeader}>
                          <span className={styles.sectionNumber}>{sectionNum}</span>
                          {heading && <h2 className={styles.sectionHeading}>{heading}</h2>}
                        </div>
                        <div className={styles.sectionBody}>
                          {content.split("\n\n").map((para, pIdx) =>
                            para.trim() ? (
                              <p key={pIdx} style={{ whiteSpace: "pre-line" }}>
                                {para.trim()}
                              </p>
                            ) : null
                          )}
                        </div>
                      </section>
                    );
                  })}
                </>
              ) : null}

              {/* 5. LARGE EDITORIAL QUOTE SECTION */}
              <div className={styles.editorialQuoteCard}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <Quote size={28} color="#D38E4F" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <blockquote className={styles.editorialQuoteText}>"{heroQuoteText}"</blockquote>
                    {alumnus?.full_name && (
                      <cite className={styles.editorialQuoteAuthor}>
                        — {alumnus.full_name}
                        {alumnus.position ? `, ${alumnus.position}` : ""}
                      </cite>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Rail Column (320px sticky) */}
            <aside className={styles.rightRail}>
              {/* Timeline (Muhim bosqichlar) */}
              {timelineItems.length > 0 && (
                <div className={styles.railCard}>
                  <div className={styles.railCardHeader}>
                    <Briefcase size={18} color="#1A247E" />
                    <h3 className={styles.railCardTitle}>
                      {t.storyTimelineHeading || "Muhim bosqichlar"}
                    </h3>
                  </div>

                  <div className={styles.timelineList}>
                    {timelineItems.map((item, i) => (
                      <div key={item.id || i} className={styles.timelineItem}>
                        <span className={styles.timelineDot} />
                        <span className={styles.timelineYear}>{item.year}</span>
                        <h4 className={styles.timelineTitle}>{item.title}</h4>
                        {item.organization && (
                          <p className={styles.timelineOrg}>{item.organization}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Achievements (Ilmiy va kasbiy natijalar) */}
              {achievements.length > 0 && (
                <div className={styles.railCard}>
                  <div className={styles.railCardHeader}>
                    <Award size={18} color="#D38E4F" />
                    <h3 className={styles.railCardTitle}>
                      {t.storyAchievementsHeading || "Ilmiy va kasbiy natijalar"}
                    </h3>
                  </div>

                  <div className={styles.achievementsList}>
                    {achievements.map((ach, i) => (
                      <div key={ach.id || i} className={styles.achievementItem}>
                        <div className={styles.achievementTop}>
                          <span className={styles.achievementTitle}>{ach.title}</span>
                          {ach.year && <span className={styles.achievementYear}>{ach.year}</span>}
                        </div>
                        {ach.description && (
                          <p className={styles.achievementDesc}>{ach.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Youth Advice (Yoshlar uchun maslahat - Vertikal ketma-ketlik) */}
              <div className={styles.adviceRailCard}>
                <div className={styles.railCardHeader}>
                  <Lightbulb size={18} color="#D38E4F" />
                  <h3 className={styles.railCardTitle}>
                    {t.storyAdviceHeading || "Yoshlar uchun maslahat"}
                  </h3>
                </div>

                <div className={styles.adviceRailList}>
                  {adviceList.map((item, i) => (
                    <div key={i} className={styles.adviceRailItem}>
                      <span className={styles.adviceRailNum}>{item.num}</span>
                      <h4 className={styles.adviceRailTitle}>{item.title}</h4>
                      <p className={styles.adviceRailDesc}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 8. SIMILAR STORIES */}
      {relatedStories.length > 0 && (
        <section className={styles.similarSection}>
          <div className={styles.container}>
            <div className={styles.similarHeader}>
              <h3 className={styles.similarHeading}>
                {t.storySimilarHeading || "O‘xshash hikoyalar"}
              </h3>
              <Link href="/stories" className={styles.similarAllLink}>
                <span>{t.storyAllStoriesLink || "Barcha hikoyalar"}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.similarGrid}>
              {relatedStories.map((item) => (
                <Link key={item.id} href={`/stories/${item.slug}`} className={styles.similarCard}>
                  <div className={styles.similarCardMedia}>
                    <RemoteImage
                      src={item.hero_image || item.hero_image_url || item.alumnus?.avatar || item.alumnus?.image_url}
                      alt={item.title_uz}
                      className={styles.portraitImage}
                      fallback="Q"
                      sizes="360px"
                    />
                  </div>
                  <div className={styles.similarCardBody}>
                    <div>
                      {item.alumnus?.faculty && (
                        <span className={styles.similarCardFaculty}>{item.alumnus.faculty}</span>
                      )}
                      <h4 className={styles.similarCardTitle}>{item.title_uz}</h4>
                    </div>
                    <div className={styles.similarCardFooter}>
                      <span>{t.newsReadMore || "O‘qish"}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
