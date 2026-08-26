import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getStory } from "@/lib/api";
import { getLocale } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const story = await getStory(slug);
    return {
      title: `${story.title_uz} | QarDU Hamjamiyat`,
      description: story.summary_uz,
      alternates: { canonical: `/stories/${slug}` },
    };
  } catch {
    return {};
  }
}

export default async function StoryDetail({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const en = locale === "en";
  let story;

  try {
    story = await getStory(slug);
  } catch {
    return notFound();
  }

  const takeaway = (en && story.student_takeaway_en) || story.student_takeaway_uz;

  return <article className="story-detail">
    <header className="story-detail-hero">
      <div className="container">
        <div className="story-detail-meta">
          <Link className="breadcrumb-back" href="/stories">
            <ArrowLeft aria-hidden="true" /> {en ? "All stories" : "Barcha hikoyalar"}
          </Link>
          <span className="eyebrow">{story.alumnus.full_name}</span>
        </div>
        <h1>{(en && story.title_en) || story.title_uz}</h1>
        <p>{(en && story.summary_en) || story.summary_uz}</p>
        <Link className="story-alumnus-link" href={`/alumni/${story.alumnus.slug}`}>
          {en ? "View alumni profile" : "Bitiruvchi profilini ko‘rish"}
        </Link>
      </div>
    </header>

    <div className="container story-detail-body">
      <div className="story-prose">
        {story.sections?.map((section) => <p key={section.id}>
          {(en && section.content_en) || section.content_uz}
        </p>)}
        {takeaway && <p>{takeaway}</p>}
      </div>
    </div>
  </article>;
}
