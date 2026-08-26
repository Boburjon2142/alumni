import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, BadgeCheck, BriefcaseBusiness, ExternalLink, GraduationCap, MapPin } from "lucide-react";
import { getAlumniById } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const alumnus = await getAlumniById(id);
    const title = alumnus.seo_title || `${alumnus.full_name} — QarDU faxriy bitiruvchisi`;
    const description = alumnus.seo_description || alumnus.biography_uz || alumnus.bio;
    return { title, description, alternates: { canonical: `/alumni/${alumnus.slug}` }, openGraph: { title, description } };
  } catch { return {}; }
}

export default async function Profile({ params }: Props) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { id } = await params;
  let a;
  try { a = await getAlumniById(id); } catch { return notFound(); }
  const initials = a.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  const biography = (locale === "en" ? a.biography_en : a.biography_uz) || a.bio || t.noBio;
  const story = locale === "en" ? a.career_story_en : a.career_story_uz;
  const labels = locale === "en"
    ? { story: "Career story", achievements: "Achievements", timeline: "Career timeline", sources: "Sources", source: "View source", featured: "Featured alumnus" }
    : locale === "ru"
      ? { story: "История карьеры", achievements: "Достижения", timeline: "Карьерный путь", sources: "Источники", source: "Открыть источник", featured: "Почётный выпускник" }
      : { story: "Muvaffaqiyat hikoyasi", achievements: "Yutuqlar", timeline: "Faoliyat yo‘li", sources: "Manbalar", source: "Manbani ko‘rish", featured: "Faxriy bitiruvchi" };

  return <article className="honorary-profile">
    <header className="honorary-profile-hero"><div className="container honorary-profile-hero-grid">
      <div className="honorary-profile-photo"><div aria-hidden="true">{initials}</div></div>
      <div className="honorary-profile-summary">
        {a.is_featured && <span className="honorary-badge"><Award/> {labels.featured}</span>}
        <h1>{a.full_name}</h1>
        <p className="honorary-role">{a.position}{a.position && a.current_company && " — "}{a.current_company}</p>
        {a.verified && <span className="verified"><BadgeCheck/> {t.universityVerified}</span>}
        <div className="honorary-meta">
          {a.faculty && <span><GraduationCap/> {a.faculty}{a.graduation_year && ` · ${a.graduation_year}`}</span>}
          {a.city && <span><MapPin/> {a.city}{a.country && `, ${a.country}`}</span>}
          {a.industry && <span><BriefcaseBusiness/> {a.industry}</span>}
        </div>
      </div>
    </div></header>

    <div className="container honorary-profile-body">
      <section aria-labelledby="about-title"><span className="profile-section-number">01</span><h2 id="about-title">{t.aboutGraduate}</h2><p className="profile-lead">{biography}</p></section>
      {story && <section aria-labelledby="story-title"><span className="profile-section-number">02</span><h2 id="story-title">{labels.story}</h2><p>{story}</p></section>}
      {!!a.achievements?.length && <section aria-labelledby="achievements-title"><span className="profile-section-number">03</span><h2 id="achievements-title">{labels.achievements}</h2><div className="achievement-list">{a.achievements.map((item) => <article key={item.id}><span>{item.year || item.category}</span><div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}
      {!!a.timeline?.length && <section aria-labelledby="timeline-title"><span className="profile-section-number">04</span><h2 id="timeline-title">{labels.timeline}</h2><ol className="career-timeline">{a.timeline.map((item) => <li key={item.id}><time>{item.year}</time><div><h3>{item.title}</h3>{item.organization && <strong>{item.organization}</strong>}{item.description && <p>{item.description}</p>}</div></li>)}</ol></section>}
      {!!a.sources?.length && <section aria-labelledby="sources-title"><span className="profile-section-number">05</span><h2 id="sources-title">{labels.sources}</h2><div className="source-list">{a.sources.map((source) => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.id}><div><strong>{source.title}</strong>{source.publisher && <span>{source.publisher}</span>}</div><span>{labels.source} <ExternalLink/></span></a>)}</div></section>}
    </div>
  </article>;
}
