import Link from "next/link";
import { ArrowRight, Calendar, GraduationCap, Users } from "lucide-react";
import { getAlumni, getAlumniGroups } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { GroupsGrid } from "@/components/groups/groups-grid";
import { GroupsFilter } from "@/components/groups/groups-filter";
import { AlumniCardGrid } from "@/components/alumni/alumni-card-grid";
import { Button } from "@/components/ui/button";
import type { Alumni, GraduationGroup } from "@/types/alumni";

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

  const isFiltered = Boolean(params.search || params.region);

  let groups: GraduationGroup[] = [];
  let alumniList: Alumni[] = [];
  let totalCount = 0;
  let error = false;

  try {
    if (isFiltered) {
      const res = await getAlumni(query.toString());
      alumniList = res.data ?? [];
      totalCount = res.pagination?.count ?? alumniList.length;
    } else {
      const res = await getAlumniGroups(query.toString());
      groups = res.data ?? [];
      totalCount = groups.length;
    }
  } catch (err) {
    console.error("Failed to load alumni data on groups page:", err);
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
        ) : isFiltered ? (
          alumniList.length > 0 ? (
            <>
              <div className="result-count groups-result-count">
                <strong>{totalCount}</strong> {locale === "en" ? "alumni found" : locale === "ru" ? "выпускников найдено" : "nafar bitiruvchi topildi"}
              </div>
              <AlumniCardGrid alumni={alumniList} locale={locale} />
            </>
          ) : (
            <div className="empty-state">
              <GraduationCap aria-hidden="true" size={48} className="empty-icon" />
              <h3>{locale === "en" ? "No alumni found" : locale === "ru" ? "Выпускники не найдены" : "Bitiruvchilar topilmadi"}</h3>
              <p>{locale === "en" ? "Try changing your search keywords or selected location." : locale === "ru" ? "Попробуйте изменить поисковый запрос или выбранный регион." : "Qidiruv so‘zini yoki tanlangan hududni o‘zgartirib ko‘ring."}</p>
              <Button href="/join">{t.landingCtaButton}</Button>
            </div>
          )
        ) : groups.length > 0 ? (
          <>
            <div className="result-count groups-result-count">
              <strong>{groups.length}</strong> {locale === "en" ? "graduation groups available" : locale === "ru" ? "групп выпускников доступно" : "ta bitiruv guruhi mavjud"}
            </div>
            <GroupsGrid groups={groups} locale={locale} t={t} />
          </>
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
