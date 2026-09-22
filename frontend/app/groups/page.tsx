import Link from "next/link";
import { ArrowRight, Calendar, GraduationCap, Users } from "lucide-react";
import { getAlumniGroups } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { GroupsGrid } from "@/components/groups/groups-grid";
import { GroupsFilter } from "@/components/groups/groups-filter";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Bitiruvchilar guruhlari — Qarshi davlat universiteti",
  description:
    "Qarshi davlat universitetining turli yillardagi bitiruvchilar guruhlari katalogi.",
};

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.region) query.set("region", params.region);

  let groups: import("@/types/alumni").GraduationGroup[] = [];
  let error = false;

  try {
    const res = await getAlumniGroups(query.toString());
    groups = res.data ?? [];
  } catch (err) {
    console.error("Failed to load alumni groups:", err);
    error = true;
  }

  return (
    <section className="section groups-page-section">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{t.groupsTitle}</h1>
          <p className="section-sublead">{t.groupsSubtitle}</p>
        </div>

        {/* Search Bar & Region Dropdown */}
        <GroupsFilter t={t} locale={locale} />

        {/* Results */}
        {error ? (
          <div className="empty-state error-state">
            <h3>{t.loadError}</h3>
            <p>{t.retryText}</p>
          </div>
        ) : groups.length > 0 ? (
          <GroupsGrid groups={groups} locale={locale} t={t} />
        ) : (
          <div className="empty-state">
            <Calendar aria-hidden="true" size={48} className="empty-icon" />
            <h3>{t.groupsEmptyTitle}</h3>
            <p>{t.groupsEmptyText}</p>
            <Button href="/join">{t.landingCtaButton}</Button>
          </div>
        )}

        {/* Bottom CTA to join */}
        <div className="groups-bottom-join-banner">
          <div className="join-banner-text">
            <h3>{t.landingCtaTitle}</h3>
            <p>{t.landingCtaText}</p>
          </div>
          <Button href="/join">
            {t.landingCtaButton} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
