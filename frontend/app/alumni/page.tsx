import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { AlumniCardGrid } from "@/components/alumni/alumni-card-grid";
import { DirectoryFilters } from "@/components/alumni/directory-filters";
import { getAlumni, getFaculties, getRecognitions } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Alumni, Faculty, Page, Recognition } from "@/types/alumni";

export const metadata = {
  title: "Faxriy bitiruvchilar — Qarshi davlat universiteti",
  description: "Qarshi davlat universitetining turli sohalarda e'tibor qozongan faxriy bitiruvchilari katalogi.",
};

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  let result: Page<Alumni> | null = null;
  let faculties: Faculty[] = [];
  let recognitions: Recognition[] = [];
  let error = false;

  try {
    const [alumniRes, facultyRes, recognitionRes] = await Promise.allSettled([
      getAlumni(query.toString()),
      getFaculties(),
      getRecognitions(),
    ]);

    if (alumniRes.status === "fulfilled") {
      result = alumniRes.value;
    } else {
      error = true;
    }

    if (facultyRes.status === "fulfilled") {
      faculties = facultyRes.value;
    }

    if (recognitionRes.status === "fulfilled") {
      recognitions = recognitionRes.value;
    }
  } catch {
    error = true;
  }

  const hasActiveFilters = Boolean(
    params.search || params.recognition || params.faculty || params.graduation_year
  );

  return (
    <section className="directory section">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{t.directoryTitle}</h1>
          <p>{t.directoryText}</p>
        </div>

        <DirectoryFilters
          faculties={faculties}
          recognitions={recognitions}
          locale={locale}
          translations={{
            search: t.search,
            searchPlaceholder: t.searchPlaceholder,
            filters: t.filters,
            faculty: t.faculty,
            allFaculties: t.allFaculties,
            year: t.year,
            clearFilters: t.clearFilters,
            allRecognitions: t.allRecognitions,
            filterBy: t.filterBy,
            clearAll: t.clearAll,
          }}
        />

        {error ? (
          <div className="empty-state error-state">
            <h2>{t.loadError}</h2>
            <p>{t.retryText}</p>
          </div>
        ) : result && result.data.length > 0 ? (
          <>
            <div className="result-count">
              <strong>{result.pagination.count}</strong> {t.found}
            </div>
            <AlumniCardGrid alumni={result.data} locale={locale} />
            {result.pagination.pages > 1 && (
              <nav className="pagination" aria-label="Sahifalar">
                {result.pagination.previous && (
                  <Link href={`?page=${result.pagination.page - 1}`}>
                    {t.previous}
                  </Link>
                )}
                <span>
                  {result.pagination.page} / {result.pagination.pages}
                </span>
                {result.pagination.next && (
                  <Link href={`?page=${result.pagination.page + 1}`}>
                    {t.next}
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="empty-state">
            <GraduationCap aria-hidden="true" />
            <h2>{t.noResults}</h2>
            <p>{t.noResultsText}</p>
            {hasActiveFilters && (
              <Link className="button button-secondary" href="/alumni">
                {t.clearFilters}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
