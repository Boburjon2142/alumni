import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Quote } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { getAdvice, getEvents, getStories } from "@/lib/api";
import type { Locale } from "@/lib/i18n";

export async function EditorialHighlights({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [stories, advice, events] = await Promise.all([
    getStories("featured=true&page_size=3").catch(() => null),
    getAdvice("page_size=4").catch(() => null),
    getEvents("status=upcoming&page_size=3").catch(() => null),
  ]);
  if (!stories?.data.length && !advice?.data.length && !events?.data.length) return null;

  return <div className="home-editorial-flow">
    {!!stories?.data.length && <section className="section home-stories"><div className="container"><div className="section-heading"><div><span className="eyebrow">{en ? "Success stories" : "Muvaffaqiyat hikoyalari"}</span><h2>{en ? "Experience that becomes a path" : "Tajribadan shakllangan yo‘l"}</h2><p>{en ? "Discover the decisions and turning points behind alumni achievements." : "Bitiruvchilar yutuqlari ortidagi qarorlar va burilish nuqtalarini o‘rganing."}</p></div><Link href="/stories">{en ? "All stories" : "Barcha hikoyalar"}<ArrowRight /></Link></div><div className="home-story-list">{stories.data.map((story) => <article key={story.id}>
      <RemoteImage className="home-story-image" src={story.hero_image || story.hero_image_url} alt={story.hero_image_alt || ((en && story.title_en) || story.title_uz)} sizes="(max-width: 768px) 100vw, 33vw" />
      <span>{story.alumnus.full_name}</span><h3><Link href={`/stories/${story.slug}`}>{(en && story.title_en) || story.title_uz}</Link></h3><p>{(en && story.summary_en) || story.summary_uz}</p><Link className="editorial-link" href={`/stories/${story.slug}`}>{en ? "Read" : "O‘qish"}<ArrowRight /></Link>
    </article>)}</div></div></section>}

    {!!advice?.data.length && <section className="section home-advice"><div className="container"><div className="section-heading"><div><span className="eyebrow">{en ? "For students" : "Talabalar uchun"}</span><h2>{en ? "Advice grounded in experience" : "Tajribaga tayangan maslahatlar"}</h2></div></div><div className="advice-grid">{advice.data.map((item) => <blockquote key={item.id}><Quote /><p>{(en && item.content_en) || item.content_uz}</p><footer><strong>{item.alumnus.full_name}</strong><span>{item.alumnus.position}{item.alumnus.current_company && ` · ${item.alumnus.current_company}`}</span></footer></blockquote>)}</div></div></section>}

    {!!events?.data.length && <section className="section home-events" id="events"><div className="container"><div className="section-heading"><div><span className="eyebrow">{en ? "Upcoming" : "Yaqinlashmoqda"}</span><h2>{en ? "University events" : "Universitet tadbirlari"}</h2></div><Link href="/events">{en ? "All events" : "Barcha tadbirlar"}<ArrowRight /></Link></div><div className="home-event-grid">{events.data.map((event) => <article key={event.id}>
      <RemoteImage className="home-event-image" src={event.cover_image || event.cover_image_url} alt={event.cover_image_alt || ((en && event.title_en) || event.title_uz)} sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="home-event-copy"><time dateTime={event.start_at}><CalendarDays />{new Intl.DateTimeFormat(en ? "en-GB" : "uz-UZ", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Tashkent" }).format(new Date(event.start_at))}</time><h3><Link href={`/events/${event.slug}`}>{(en && event.title_en) || event.title_uz}</Link></h3><p><MapPin />{(en && event.location_en) || event.location_uz}</p><Link className="editorial-link" href={`/events/${event.slug}`}>{en ? "Details" : "Batafsil"}<ArrowRight /></Link></div>
    </article>)}</div></div></section>}
  </div>;
}
