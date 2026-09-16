import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BadgeCheck, BookOpen, ExternalLink, GraduationCap, MapPin, MessageSquareQuote } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { EditProfileModal } from "@/components/alumni/edit-profile-modal";
import { PeerConfirmation } from "@/components/alumni/peer-confirmation";
import { AlumniImpactCard } from "@/components/impact/alumni-impact-card";
import { getAlumniById } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const alumnus = await getAlumniById(id);
    const title = alumnus.seo_title || `${alumnus.full_name} — QarshiDU faxriy bitiruvchisi`;
    const description = alumnus.seo_description || alumnus.biography_uz || alumnus.bio;
    return {
      title,
      description,
      alternates: { canonical: `/alumni/${alumnus.slug}` },
      openGraph: { title, description },
    };
  } catch {
    return {};
  }
}

export default async function Profile({ params }: Props) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { id } = await params;

  let a;
  try {
    a = await getAlumniById(id);
  } catch {
    return notFound();
  }

  const initials = a.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  const biography = (locale === "en" ? a.biography_en : a.biography_uz) || a.bio;
  const careerStory = locale === "en" ? a.career_story_en : a.career_story_uz;

  return (
    <article className="honorary-profile">
      <div className="container profile-back-nav">
        <Link href="/alumni" className="back-link">
          <ArrowLeft size={16} /> {t.backToDirectory}
        </Link>
      </div>

      {/* Profile Hero */}
      <header className="honorary-profile-hero">
        <div className="container honorary-profile-hero-grid">
          <div className="honorary-profile-photo-wrapper">
            <RemoteImage
              className="honorary-profile-photo-img"
              src={a.image_url || a.avatar || `/images/faxriylar/${a.slug}.png`}
              slug={a.slug}
              alt={a.image_alt || `${a.full_name} portreti`}
              fallback={initials}
              sizes="(max-width: 640px) 100vw, 320px"
              priority
            />
          </div>

          <div className="honorary-profile-summary">
            {a.is_featured && (
              <span className="honorary-badge">
                <Award size={16} /> {t.featuredTitle}
              </span>
            )}
            <h1>{a.full_name}</h1>
            <p className="honorary-role">
              {a.position || t.graduate}
              {a.current_company && ` — ${a.current_company}`}
            </p>

            <div style={{ margin: "0.85rem 0" }}>
              <PeerConfirmation alumnus={a} locale={locale} />
            </div>

            <div className="honorary-meta">
              {a.faculty && (
                <span>
                  <GraduationCap size={18} /> {a.faculty}
                  {a.graduation_year && ` · ${a.graduation_year}`}
                </span>
              )}
              {a.specialty && (
                <span>
                  <BookOpen size={18} /> {a.specialty}
                </span>
              )}
              {a.city && (
                <span>
                  <MapPin size={18} /> {a.city}
                  {a.country && `, ${a.country}`}
                </span>
              )}
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <EditProfileModal alumnus={a} locale={locale} />
            </div>
          </div>
        </div>
      </header>

      {/* Profile Body: 2-Column Responsive Layout */}
      <div className="container honorary-profile-body">
        {/* Alumni Impact & Recognition section */}
        <AlumniImpactCard slug={a.slug} t={t} />

        <div className="honorary-profile-grid-2col">
          {/* Chap ustun: Qisqacha tavsif & Yoshlar uchun maslahatlar */}
          <div className="honorary-col-left">
            {/* 01. Overview / Biography */}
            {biography && (
              <section className="profile-section" aria-labelledby="about-title">
                <h2 id="about-title">{t.overview}</h2>
                <div className="profile-prose">
                  <p className="profile-lead">{biography}</p>
                </div>
              </section>
            )}

            {/* 02. Advice for Students */}
            {!!a.advice?.length && (
              <section className="profile-section profile-advice-section" aria-labelledby="advice-title">
                <h2 id="advice-title">{t.alumniAdvice}</h2>
                <div className="profile-advice-list">
                  {a.advice.map((item) => {
                    const text = (locale === "en" && item.content_en) || item.content_uz;
                    return (
                      <blockquote key={item.id} className="profile-advice-quote">
                        <MessageSquareQuote className="profile-advice-icon" aria-hidden="true" />
                        <p>"{text}"</p>
                        {item.category && (
                          <span className="profile-advice-category">{item.category}</span>
                        )}
                      </blockquote>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 05. Key Achievements */}
            {!!a.achievements?.length && (
              <section className="profile-section" aria-labelledby="achievements-title">
                <h2 id="achievements-title">{t.achievements}</h2>
                <div className="achievement-list">
                  {a.achievements.map((item) => (
                    <article key={item.id}>
                      <span className="achievement-year">{item.year || item.category}</span>
                      <div>
                        <h3>{item.title}</h3>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* 06. Verified Sources */}
            {!!a.sources?.length && (
              <section className="profile-section" aria-labelledby="sources-title">
                <h2 id="sources-title">{t.verifiedSources}</h2>
                <div className="source-list">
                  {a.sources.map((source) => (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={source.id}
                      className="source-item"
                    >
                      <div>
                        <strong>{source.title}</strong>
                        {source.publisher && <span>{source.publisher}</span>}
                      </div>
                      <span className="source-link-label">
                        <ExternalLink size={16} />
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* O'ng ustun: Hayot va kasbiy yo'l */}
          <div className="honorary-col-right">
            {/* 03. Career & Life Timeline */}
            {!!a.timeline?.length && (
              <section className="profile-section timeline-card-section" aria-labelledby="timeline-title">
                <h2 id="timeline-title">{t.timeline}</h2>
                <ol className="career-timeline">
                  {a.timeline.map((item) => (
                    <li key={item.id}>
                      <time>{item.year}</time>
                      <div>
                        <h3>{item.title}</h3>
                        {item.organization && <strong>{item.organization}</strong>}
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* 04. Career Story */}
            {careerStory && (
              <section className="profile-section story-prose-section" aria-labelledby="story-title">
                <h2 id="story-title">{locale === "en" ? "Career Story" : locale === "ru" ? "История карьеры" : "Hayot va kasbiy yo‘l"}</h2>
                <div className="profile-prose">
                  <p>{careerStory}</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
