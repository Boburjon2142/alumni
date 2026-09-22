import Link from "next/link";
import { MessageSquare, X } from "lucide-react";
import { getInterviews } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { InterviewFilters } from "@/components/interviews/interview-filters";
import { InterviewGrid } from "@/components/interviews/interview-grid";
import type { Interview, Page } from "@/types/alumni";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Bitiruvchilar bilan intervyular — Qarshi davlat universiteti",
  description: "Qarshi davlat universiteti faxriy va yetuk bitiruvchilari bilan eksklyuziv suhbatlar, hayotiy tajriba va kasbiy saboqlar.",
};

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.featured) query.set("featured", params.featured);
  if (params.page) query.set("page", params.page);

  let result: Page<Interview> | null = null;
  let error = false;

  try {
    result = await getInterviews(query.toString());
  } catch (err) {
    console.error("Failed to load interviews:", err);
    error = true;
  }

  const interviewsList = result?.data || [];
  const totalCount = result?.pagination?.count ?? interviewsList.length;
  const hasActiveFilters = Boolean(params.search || params.featured);

  return (
    <section className="section interviews-page">
      <div className="container">
        {/* Unified Compact Header Row: Title on Left, Search on Right */}
        <div className="interviews-header-row">
          <div className="interviews-header-left">
            <span className="eyebrow gold">{t.brand}</span>
            <div className="interviews-title-wrap">
              <h1>{t.interviewsTitle}</h1>
              {totalCount > 0 && <span className="interviews-count-pill">{totalCount}</span>}
            </div>
          </div>

          <div className="interviews-header-right">
            <InterviewFilters
              locale={locale}
              t={t}
              totalCount={totalCount}
              translations={{
                search: t.search,
                searchPlaceholder: t.interviewsSearchPlaceholder,
                allInterviews: t.allInterviews,
                featuredInterviews: t.featuredInterviews,
                clearFilters: t.clearFilters,
                interviewsFound: t.interviewsFound,
              }}
            />
          </div>
        </div>

        {error ? (
          <div className="empty-state error-state">
            <h2>{t.loadError}</h2>
            <p>{t.retryText}</p>
          </div>
        ) : interviewsList.length > 0 ? (
          <>
            <InterviewGrid interviews={interviewsList} locale={locale} />

            {result && result.pagination.pages > 1 && (
              <nav className="pagination" aria-label="Sahifalar">
                {result.pagination.previous && (
                  <Link href={`?page=${result.pagination.page - 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.featured ? `&featured=${params.featured}` : ""}`}>
                    {t.previous}
                  </Link>
                )}
                <span>
                  {result.pagination.page} / {result.pagination.pages}
                </span>
                {result.pagination.next && (
                  <Link href={`?page=${result.pagination.page + 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.featured ? `&featured=${params.featured}` : ""}`}>
                    {t.next}
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="empty-state">
            <MessageSquare aria-hidden="true" size={48} />
            <h2>{hasActiveFilters ? t.noResults : t.interviewsEmptyTitle}</h2>
            <p>{hasActiveFilters ? t.noResultsText : t.interviewsEmptyText}</p>
            {hasActiveFilters && (
              <Link href="/interviews" className="button button-secondary">
                <X size={16} /> {t.clearFilters}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
