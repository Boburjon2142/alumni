import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  MessageSquareQuote,
  User,
} from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { EditProfileModal } from "@/components/alumni/edit-profile-modal";
import { PeerConfirmation } from "@/components/alumni/peer-confirmation";
import { ProfileShareButtons } from "@/components/alumni/profile-share-buttons";
import { AlumniOfficialAwards } from "@/components/alumni/alumni-official-awards";
import { AlumniImpactCard } from "@/components/impact/alumni-impact-card";
import type { EducationExperience, WorkExperience } from "@/types/alumni";

import { getAlumniById } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEGREE_LABELS: Record<string, string> = {
  bachelor: "Bakalavr",
  master: "Magistratura (Magistr)",
  phd: "Falsafa doktori (PhD)",
  dsc: "Fan doktori (DSc)",
  residency: "Ordinatura / Rezidentura",
  second_degree: "Ikkinchi oliy ta’lim",
  other: "Oliy ta’lim",
};

function formatMetaImageUrl(src?: string | null, slug?: string, isHonorary?: boolean): string {
  let s = (src || "").trim();
  
  // Clean up any localhost/127.0.0.1/backend internal hostnames from Django DRF serialization
  s = s.replace(/^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0|backend)(?::\d+)?\/?/i, "/");

  if (s.startsWith("http://") || s.startsWith("https://")) {
    return s;
  }

  // If empty and is honorary alumnus with slug
  if (!s && slug && isHonorary) {
    s = `/images/faxriylar/${slug}.webp`;
  }

  // If still empty, fall back to official university brand avatar
  if (!s) {
    return "https://alumni.qarshidu.uz/images/qardu-avatar.png";
  }

  // If it's a relative path like "alumni/..." or "avatars/...", make sure it starts with /media/
  if (!s.startsWith("/")) {
    s = `/media/${s}`;
  }

  return `https://alumni.qarshidu.uz${s}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const alumnus = await getAlumniById(id);
    const title = alumnus.seo_title || `${alumnus.full_name} — Qarshi davlat universiteti bitiruvchisi`;
    const description = alumnus.seo_description || alumnus.biography_uz || alumnus.bio || `${alumnus.full_name} haqida to‘liq ma’lumot, hayot yo‘li va erishgan yutuqlari.`;
    
    // Resolve absolute public image URL for Telegram / social media preview
    const imageUrl = formatMetaImageUrl(alumnus.avatar || alumnus.image_url, alumnus.slug, alumnus.is_honorary);

    return {
      title,
      description,
      alternates: { canonical: `/alumni/${alumnus.slug}` },
      openGraph: {
        title,
        description,
        url: `https://alumni.qarshidu.uz/alumni/${alumnus.slug}`,
        siteName: "Qarshi davlat universiteti",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: alumnus.full_name,
          },
        ],
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Bitiruvchi profili — Qarshi davlat universiteti",
      openGraph: {
        images: ["https://alumni.qarshidu.uz/images/qardu-avatar.png"],
      },
    };
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

  const cleanPos = (a.position || "").trim();
  const cleanComp = (a.current_company || "").trim();
  const normPos = cleanPos.toLowerCase().replace(/['`ʻʼ’]/g, "'");
  const normComp = cleanComp.toLowerCase().replace(/['`ʻʼ]/g, "'");
  const isCompanyInPosition =
    Boolean(cleanPos && cleanComp && (normPos.includes(normComp) || normComp.includes(normPos)));
  const displayPosition = cleanPos || t.graduate;
  const displayCompany = cleanComp && !isCompanyInPosition ? cleanComp : null;

  const academicDegree = a.academic_degree || a.academic_title || a.degree || "Bakalavr";
  const educationList: EducationExperience[] = Array.isArray(a.educations) ? a.educations : [];
  const workList: WorkExperience[] = Array.isArray(a.work_experiences) ? a.work_experiences : [];

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
              src={a.avatar || a.image_url || (a.slug ? `/images/faxriylar/${a.slug}.webp` : undefined)}
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
              <span className="honorary-role-title">{displayPosition}</span>
              {displayCompany && (
                <>
                  <span className="honorary-role-sep" aria-hidden="true">—</span>
                  <span className="honorary-role-company">{displayCompany}</span>
                </>
              )}
            </p>

            <div style={{ margin: "0.85rem 0" }}>
              <PeerConfirmation alumnus={a} locale={locale} />
            </div>

            <div className="honorary-meta" aria-label="Alumni metadata">
              {a.graduation_year && (
                <div className="honorary-meta-item honorary-meta-edu">
                  <span className="honorary-meta-icon-wrapper" aria-hidden="true">
                    <GraduationCap size={15} />
                  </span>
                  <span className="honorary-meta-text">QarDU {a.graduation_year}-yil bitiruvchisi</span>
                </div>
              )}
              {academicDegree && (
                <div className="honorary-meta-item honorary-meta-deg">
                  <span className="honorary-meta-icon-wrapper" aria-hidden="true">
                    <Award size={15} />
                  </span>
                  <span className="honorary-meta-text">{DEGREE_LABELS[academicDegree] || academicDegree}</span>
                </div>
              )}
              {(a.city || a.country) && (
                <div className="honorary-meta-item honorary-meta-loc">
                  <span className="honorary-meta-icon-wrapper" aria-hidden="true">
                    <MapPin size={15} />
                  </span>
                  <span className="honorary-meta-text">
                    {[a.city, a.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {a.faculty && (
                <div className="honorary-meta-item honorary-meta-spec" title={a.faculty}>
                  <span className="honorary-meta-icon-wrapper" aria-hidden="true">
                    <Building2 size={15} />
                  </span>
                  <span className="honorary-meta-text">{a.faculty}</span>
                </div>
              )}
              {a.specialty && (
                <div className="honorary-meta-item honorary-meta-spec" title={a.specialty}>
                  <span className="honorary-meta-icon-wrapper" aria-hidden="true">
                    <BookOpen size={15} />
                  </span>
                  <span className="honorary-meta-text">{a.specialty}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <EditProfileModal alumnus={a} locale={locale} />
              <ProfileShareButtons
                fullName={a.full_name}
                position={a.position || a.current_activity}
                faculty={a.faculty}
                graduationYear={a.graduation_year}
                slug={a.slug}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Profile Body: Rich Structured Cards Layout */}
      <div className="container honorary-profile-body">
        {/* Official QarDU Recognitions and Awards */}
        <AlumniOfficialAwards recognitions={a.recognitions || []} locale={locale} t={t} />

        {/* Alumni Impact & Contributions Activity */}
        <AlumniImpactCard slug={a.slug} t={t} />

        {/* Rich Sections Grid */}
        <div className="preview-sections-grid">
          {/* 1. BIO / Haqida */}
          {biography && (
            <div className="preview-section-card full-width">
              <div className="preview-section-title-row">
                <User size={16} className="preview-section-icon" />
                <h2 className="preview-section-title">O‘zi haqida qisqacha (BIO)</h2>
              </div>
              <p className="preview-bio-text">{biography}</p>
            </div>
          )}

          {/* 2. Hozirgi kasbiy faoliyat */}
          <div className="preview-section-card">
            <div className="preview-section-title-row">
              <Briefcase size={16} className="preview-section-icon" />
              <h2 className="preview-section-title">Hozirgi kasbiy faoliyat</h2>
            </div>
            <div className="preview-key-val-list">
              <div className="preview-key-val-item">
                <span className="preview-item-label">Tashkilot / Ish joyi</span>
                <span className="preview-item-value">{cleanComp || "Ko‘rsatilmagan"}</span>
              </div>
              <div className="preview-key-val-item">
                <span className="preview-item-label">Lavozimi</span>
                <span className="preview-item-value">{cleanPos || "Ko‘rsatilmagan"}</span>
              </div>
              <div className="preview-key-val-item">
                <span className="preview-item-label">Faoliyat sohasi</span>
                <span className="preview-item-value">{a.industry || "Ko‘rsatilmagan"}</span>
              </div>
              <div className="preview-key-val-item">
                <span className="preview-item-label">Hudud (Shahar / Tuman)</span>
                <span className="preview-item-value">{a.city || "Ko‘rsatilmagan"}</span>
              </div>
            </div>
          </div>

          {/* 3. Ta'lim ma'lumotlari */}
          <div className="preview-section-card">
            <div className="preview-section-title-row">
              <GraduationCap size={16} className="preview-section-icon" />
              <h2 className="preview-section-title">Ta’lim ma’lumotlari</h2>
            </div>
            <div className="preview-key-val-list">
              <div className="preview-key-val-item">
                <span className="preview-item-label">Oliy ta’lim muassasasi</span>
                <span className="preview-item-value">Qarshi davlat universiteti</span>
              </div>
              {a.faculty && (
                <div className="preview-key-val-item">
                  <span className="preview-item-label">Fakultet</span>
                  <span className="preview-item-value">{a.faculty}</span>
                </div>
              )}
              {a.specialty && (
                <div className="preview-key-val-item">
                  <span className="preview-item-label">Yo‘nalish / Mutaxassislik</span>
                  <span className="preview-item-value">{a.specialty}</span>
                </div>
              )}
              <div className="preview-key-val-item">
                <span className="preview-item-label">Bitirgan yili & Daraja</span>
                <span className="preview-item-value">
                  {a.graduation_year ? `${a.graduation_year}-yil` : "Ko‘rsatilmagan"} • {DEGREE_LABELS[academicDegree] || academicDegree}
                </span>
              </div>
            </div>

            {/* Qo'shimcha ta'lim bosqichlari */}
            {educationList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="preview-item-label block mb-2">Qo‘shimcha ta’lim bosqichlari ({educationList.length})</span>
                <div className="flex flex-col gap-2">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="preview-history-item">
                      <div className="preview-history-top">
                        <span className="preview-history-company">
                          {DEGREE_LABELS[edu.degree_level] || edu.degree_level_display || edu.degree_level}
                        </span>
                        {edu.graduation_year && (
                          <span className="preview-history-period">{edu.graduation_year}-yil</span>
                        )}
                      </div>
                      <span className="preview-history-role">
                        {edu.institution || "Qarshi davlat universiteti"}
                        {edu.faculty ? ` • ${edu.faculty}` : ""}
                        {edu.specialty ? ` • ${edu.specialty}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Mehnat faoliyati tarixi */}
          {workList.length > 0 && (
            <div className="preview-section-card full-width">
              <div className="preview-section-title-row">
                <Clock size={16} className="preview-section-icon" />
                <h2 className="preview-section-title">Mehnat faoliyati tarixi ({workList.length})</h2>
              </div>
              <div className="preview-history-list">
                {workList.map((w, idx) => (
                  <div key={idx} className="preview-history-item">
                    <div className="preview-history-top">
                      <div className="flex items-center gap-2">
                        <span className="preview-history-company">{w.company}</span>
                        {w.region && (
                          <span className="text-xs text-slate-500 font-normal">({w.region})</span>
                        )}
                      </div>
                      <span className="preview-history-period">
                        {w.start_year || ""}{w.end_year ? ` — ${w.end_year}-yil` : " — Hozirgacha"}
                      </span>
                    </div>
                    <div className="preview-history-role">
                      <span className="font-medium text-slate-700">{w.position}</span>
                      {w.industry && <span className="text-slate-500"> • {w.industry}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Talabalarga maslahat */}
          {!!a.advice?.length && (
            <div className="preview-section-card full-width">
              <div className="preview-section-title-row">
                <MessageSquareQuote size={16} className="preview-section-icon" />
                <h2 className="preview-section-title">{t.alumniAdvice}</h2>
              </div>
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
            </div>
          )}

          {/* 6. Asosiy yutuqlar */}
          {!!a.achievements?.length && (
            <div className="preview-section-card full-width">
              <div className="preview-section-title-row">
                <Award size={16} className="preview-section-icon" />
                <h2 className="preview-section-title">{t.achievements}</h2>
              </div>
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
            </div>
          )}

          {/* 7. Faoliyat yo'li (Timeline) */}
          {!!a.timeline?.length && (
            <div className="preview-section-card full-width timeline-card-section">
              <div className="preview-section-title-row">
                <Clock size={16} className="preview-section-icon" />
                <h2 className="preview-section-title">{t.timeline}</h2>
              </div>
              <div className="career-timeline-container">
                <ol className="career-timeline">
                  {a.timeline.map((item) => (
                    <li key={item.id} className="timeline-entry">
                      <div className="timeline-year-col">
                        <time className="timeline-year-badge">{item.year}</time>
                      </div>
                      <div className="timeline-line-node" aria-hidden="true">
                        <span className="timeline-dot" />
                      </div>
                      <div className="timeline-content-card">
                        <h3>{item.title}</h3>
                        {item.organization && (
                          <strong className="timeline-org">{item.organization}</strong>
                        )}
                        {item.description && item.description.trim() !== item.title.trim() && (
                          <p className="timeline-desc">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* 8. Career Story */}
          {careerStory && (
            <div className="preview-section-card full-width">
              <div className="preview-section-title-row">
                <BookOpen size={16} className="preview-section-icon" />
                <h2 className="preview-section-title">
                  {locale === "en" ? "Career Story" : locale === "ru" ? "История карьеры" : "Hayot va kasbiy yo‘l"}
                </h2>
              </div>
              <div className="profile-prose">
                <p>{careerStory}</p>
              </div>
            </div>
          )}

          {/* 9. Tasdiqlangan manbalar */}
          {!!a.sources?.length && (
            <div className="preview-section-card full-width">
              <div className="preview-section-title-row">
                <ExternalLink size={16} className="preview-section-icon" />
                <h2 className="preview-section-title">{t.verifiedSources}</h2>
              </div>
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
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
