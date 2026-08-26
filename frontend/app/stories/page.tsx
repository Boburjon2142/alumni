import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, Quote } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { getAdvice, getInterviews, getStories } from "@/lib/api";
import { getLocale } from "@/lib/i18n";

export const metadata = { title: "Muvaffaqiyat hikoyalari" };

export default async function StoriesPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const [stories, interviews, advice] = await Promise.all([
    getStories().catch(() => null), getInterviews().catch(() => null), getAdvice("page_size=8").catch(() => null),
  ]);
  return <main className="editorial-page">
    <header className="editorial-page-header"><div className="container"><span className="eyebrow">{en ? "Alumni experience" : "Bitiruvchilar tajribasi"}</span><h1>{en ? "Paths worth learning from" : "O‘rganishga arzigulik yo‘llar"}</h1><p>{en ? "Realistic demo career stories and first-person interviews for product development." : "Platformani rivojlantirish uchun realistik demo kasbiy hikoyalar va bevosita suhbatlar."}</p></div></header>
    <section className="section"><div className="container"><div className="editorial-section-heading"><div><span className="eyebrow">{en ? "Success stories" : "Muvaffaqiyat hikoyalari"}</span><h2>{en ? "The journey behind the achievement" : "Yutuq ortidagi yo‘l"}</h2></div></div>
      {stories?.data.length ? <div className="story-grid">{stories.data.map((story) => <article className="story-card" key={story.id}>
        <RemoteImage className="story-card-image" src={story.hero_image || story.hero_image_url} alt={story.hero_image_alt || ((en && story.title_en) || story.title_uz)} sizes="(max-width: 768px) 100vw, 33vw" />
        <div><span className="story-person">{story.alumnus.full_name}</span><h3><Link href={`/stories/${story.slug}`}>{(en && story.title_en) || story.title_uz}</Link></h3><p>{(en && story.summary_en) || story.summary_uz}</p><Link className="editorial-link" href={`/stories/${story.slug}`}>{en ? "Read the story" : "Hikoyani o‘qish"}<ArrowRight /></Link></div>
      </article>)}</div> : <div className="empty-state"><BookOpen /><h3>{en ? "No success stories have been published yet" : "Hozircha muvaffaqiyat hikoyalari e’lon qilinmagan"}</h3></div>}
    </div></section>
    <section className="section interview-index" id="interviews"><div className="container"><div className="editorial-section-heading"><div><span className="eyebrow">{en ? "First person" : "Birinchi shaxs"}</span><h2>{en ? "Alumni interviews" : "Bitiruvchilar bilan intervyular"}</h2></div></div>{interviews?.data.length ? <div className="interview-list">{interviews.data.map((item) => <article key={item.id}><Quote /><div><span>{item.alumnus.full_name}</span><h3><Link href={`/interviews/${item.slug}`}>{(en && item.title_en) || item.title_uz}</Link></h3><p>{(en && item.intro_en) || item.intro_uz}</p></div></article>)}</div> : <div className="empty-state"><Quote /><h3>{en ? "No interviews have been published yet" : "Hozircha intervyular e’lon qilinmagan"}</h3></div>}</div></section>
    <section className="section inspiration-index" id="inspiration"><div className="container"><div className="editorial-section-heading"><div><span className="eyebrow">{en ? "For students" : "Talabalar uchun"}</span><h2>{en ? "Guidance grounded in experience" : "Tajribaga tayangan ilhom va maslahatlar"}</h2></div></div>{advice?.data.length ? <div className="advice-grid">{advice.data.map((item) => <blockquote key={item.id}><Lightbulb /><p>{(en && item.content_en) || item.content_uz}</p><footer><strong>{item.alumnus.full_name}</strong><span>{item.alumnus.position}{item.alumnus.current_company && ` · ${item.alumnus.current_company}`}</span></footer></blockquote>)}</div> : <div className="empty-state"><Lightbulb /><h3>{en ? "Student guidance will appear here" : "Talabalar uchun maslahatlar shu yerda chiqadi"}</h3></div>}</div></section>
  </main>;
}
