import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { getEvents } from "@/lib/api";
import { getLocale } from "@/lib/i18n";

export const metadata = { title: "Tadbirlar" };

export default async function EventsPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const result = await getEvents().catch(() => null);
  return <main className="editorial-page"><header className="editorial-page-header"><div className="container"><span className="eyebrow">{en ? "University life" : "Universitet hayoti"}</span><h1>{en ? "Events that bring experience together" : "Tajribani birlashtiradigan tadbirlar"}</h1><p>{en ? "Meetings, conferences and public lectures involving alumni." : "Bitiruvchilar ishtirokidagi uchrashuvlar, konferensiyalar va ochiq ma’ruzalar."}</p></div></header><section className="section"><div className="container">
    {result?.data.length ? <div className="event-grid">{result.data.map((event) => { const date = new Intl.DateTimeFormat(en ? "en-GB" : "uz-UZ", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Tashkent" }).format(new Date(event.start_at)); return <article className="event-card" key={event.id}>
      <RemoteImage className="event-card-image" src={event.cover_image || event.cover_image_url} alt={event.cover_image_alt || ((en && event.title_en) || event.title_uz)} sizes="(max-width: 768px) 100vw, 33vw" />
      <time dateTime={event.start_at}>{date}</time><span className="event-type">{event.event_type.replaceAll("_", " ")}</span><h2><Link href={`/events/${event.slug}`}>{(en && event.title_en) || event.title_uz}</Link></h2><p>{(en && event.summary_en) || event.summary_uz}</p><span className="event-location"><MapPin />{(en && event.location_en) || event.location_uz}</span><Link className="editorial-link" href={`/events/${event.slug}`}>{en ? "Details" : "Batafsil"}<ArrowRight /></Link>
    </article>; })}</div> : <div className="empty-state"><CalendarDays /><h2>{en ? "No events yet" : "Hozircha tadbirlar yo‘q"}</h2></div>}
  </div></section></main>;
}
