import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Quote, Sparkles, UserCheck } from "lucide-react";
import { getInterviewBySlug } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);

  let interview = null;
  try {
    interview = await getInterviewBySlug(slug);
  } catch (err) {
    console.error("Interview not found:", err);
    notFound();
  }

  if (!interview) {
    notFound();
  }

  const title =
    (locale === "en" && interview.title_en) ||
    (locale === "ru" && interview.title_ru) ||
    interview.title_uz;

  const intro =
    (locale === "en" && interview.intro_en) ||
    (locale === "ru" && interview.intro_ru) ||
    interview.intro_uz;

  const pullQuote =
    (locale === "en" && interview.pull_quote_en) ||
    (locale === "ru" && interview.pull_quote_ru) ||
    interview.pull_quote_uz;

  const alumnus = interview.alumnus;
  const initials = alumnus.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const items = interview.items || [];

  return (
    <article className="section interview-detail-page">
      <div className="container interview-detail-container">
        {/* Back Link */}
        <div className="interview-back-nav">
          <Link href="/interviews" className="interview-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t.backToInterviews}</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="interview-detail-header">
          {interview.is_featured && (
            <div className="interview-detail-badge">
              <Sparkles size={14} aria-hidden="true" />
              <span>{locale === "en" ? "Exclusive Interview" : locale === "ru" ? "Эксклюзивное интервью" : "Eksklyuziv suhbat"}</span>
            </div>
          )}

          <h1 className="interview-detail-title">{title}</h1>

          {/* Author info card */}
          <div className="interview-detail-author-card">
            <Link href={`/alumni/${alumnus.slug}`} className="interview-detail-avatar-wrap">
              <RemoteImage
                className="interview-detail-avatar"
                src={alumnus.image_url || alumnus.avatar || `/images/faxriylar/${alumnus.slug}.png`}
                slug={alumnus.slug}
                alt={`${alumnus.full_name} portreti`}
                fallback={initials}
                sizes="96px"
              />
            </Link>
            <div className="interview-detail-author-meta">
              <Link href={`/alumni/${alumnus.slug}`} className="interview-detail-author-name">
                {alumnus.full_name}
              </Link>
              <p className="interview-detail-author-pos">
                {alumnus.position || (locale === "ru" ? "Выпускник КарГУ" : locale === "en" ? "KarSU Alumnus" : "QarshiDU bitiruvchisi")}
              </p>
              {alumnus.current_company && (
                <p className="interview-detail-author-company">
                  🏢 {alumnus.current_company}
                </p>
              )}
              {alumnus.faculty && (
                <p className="interview-detail-author-faculty">
                  🎓 {alumnus.faculty}
                </p>
              )}
            </div>
            <Link href={`/alumni/${alumnus.slug}`} className="button button-secondary interview-profile-btn">
              <UserCheck size={16} />
              <span>{t.authorProfile}</span>
            </Link>
          </div>
        </header>

        {/* Pull quote highlight */}
        {pullQuote && (
          <div className="interview-pullquote-box">
            <Quote className="pullquote-icon" size={28} aria-hidden="true" />
            <blockquote>"{pullQuote}"</blockquote>
          </div>
        )}

        {/* Editorial Intro */}
        {intro && (
          <div className="interview-intro-box">
            <div className="interview-intro-tag">{t.interviewerNote}</div>
            <p>{intro}</p>
          </div>
        )}

        {/* Q&A Items */}
        <section className="interview-qa-section" aria-label={t.questionsAndAnswers}>
          <div className="interview-qa-header">
            <MessageSquare size={20} aria-hidden="true" />
            <h2>{t.questionsAndAnswers}</h2>
          </div>

          <div className="interview-qa-list">
            {items.map((item, index) => {
              const question =
                (locale === "en" && item.question_en) ||
                (locale === "ru" && item.question_ru) ||
                item.question_uz;

              const answer =
                (locale === "en" && item.answer_en) ||
                (locale === "ru" && item.answer_ru) ||
                item.answer_uz;

              return (
                <div key={item.id || index} className="interview-qa-item">
                  <div className="interview-q-bubble">
                    <span className="interview-q-label">
                      {locale === "en" ? "Question" : locale === "ru" ? "Вопрос" : "Savol"} {index + 1}
                    </span>
                    <h3>{question}</h3>
                  </div>

                  <div className="interview-a-bubble">
                    <div className="interview-a-author-mini">
                      <strong>{alumnus.full_name}</strong>
                    </div>
                    <div className="interview-a-content">
                      <p>{answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="interview-detail-bottom">
          <Link href="/interviews" className="button button-secondary">
            <ArrowLeft size={16} /> {t.backToInterviews}
          </Link>
          <Link href={`/alumni/${alumnus.slug}`} className="button button-primary">
            {t.authorProfile} →
          </Link>
        </div>
      </div>
    </article>
  );
}
