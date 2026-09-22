import Link from "next/link";
import { Award, BadgeCheck, Building2, GraduationCap, MapPin } from "lucide-react";
import type { Alumni } from "@/types/alumni";
import type { Dictionary } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

export function AlumniCard({ alumni, featured = false, t }: { alumni: Alumni; featured?: boolean; t: Dictionary }) {
  const initials = alumni.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <article className={`alumni-card ${featured ? "featured-card" : ""}`}>
    <RemoteImage
      className="alumni-card-image"
      src={alumni.image_url || alumni.avatar || `/images/faxriylar/${alumni.slug}.png`}
      slug={alumni.slug}
      alt={alumni.image_alt || `${alumni.full_name} portreti`}
      fallback={initials}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
    <div className="card-top">
      <span />
    </div>
    <div>
      {featured && <span className="featured-label"><Award size={14}/> {t.featuredBadge || t.graduate}</span>}
      <h3><Link href={`/alumni/${alumni.slug}`}>{alumni.full_name}</Link></h3>
      <p className="role">{alumni.position || t.graduate}{alumni.current_company && ` — ${alumni.current_company}`}</p>
    </div>
    <div className="meta">
      {alumni.faculty && <span><GraduationCap/> {alumni.faculty}{alumni.graduation_year && ` · ${alumni.graduation_year}`}</span>}
      {alumni.city && <span><MapPin/> {alumni.city}{alumni.country && `, ${alumni.country}`}</span>}
      {alumni.industry && <span><Building2/> {alumni.industry}</span>}
    </div>
  </article>;
}
