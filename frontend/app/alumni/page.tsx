import { Filter, Search, GraduationCap, X } from "lucide-react";
import Link from "next/link";
import { AlumniCardGrid } from "@/components/alumni/alumni-card-grid";
import { getAlumni, getFaculties } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Alumni, Faculty, Page } from "@/types/alumni";

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
  let error = false;

  try {
    const [alumniRes, facultyRes] = await Promise.allSettled([
      getAlumni(query.toString()),
      getFaculties(),
    ]);

    if (alumniRes.status === "fulfilled") {
      result = alumniRes.value;
    } else {
      error = true;
    }

    if (facultyRes.status === "fulfilled") {
      faculties = facultyRes.value;
    }
  } catch {
    error = true;
  }

  const hasActiveFilters = Boolean(
    params.search || params.faculty || params.graduation_year
  );

  return (
    <section className="directory section">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{t.directoryTitle}</h1>
          <p>{t.directoryText}</p>
        </div>

        <form className="directory-controls" method="GET" action="/alumni">
          <div className="directory-search">
            <Search className="search-icon" aria-hidden="true" />
            <label className="sr-only" htmlFor="alumni-search">
              {t.search}
            </label>
            <input
              id="alumni-search"
              name="search"
              defaultValue={params.search}
              placeholder={t.searchPlaceholder}
            />
          </div>

          <details className="filters" open={Boolean(params.faculty || params.graduation_year)}>
            <summary className="filter-toggle-btn">
              <Filter className="filter-icon" aria-hidden="true" />
              <span>{t.filters}</span>
              {(params.faculty || params.graduation_year) && (
                <span className="active-filter-badge">
                  {[params.faculty, params.graduation_year].filter(Boolean).length}
                </span>
              )}
            </summary>
            <div className="filter-grid">
              <div className="filter-field">
                <label htmlFor="filter-faculty">{t.faculty}</label>
                <div className="select-wrapper">
                  <select id="filter-faculty" name="faculty" defaultValue={params.faculty || ""}>
                    <option value="">{t.allFaculties}</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-field">
                <label htmlFor="filter-grad-year">{t.year}</label>
                <input
                  id="filter-grad-year"
                  name="graduation_year"
                  type="number"
                  defaultValue={params.graduation_year}
                  placeholder="2010"
                  min="1956"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </details>

          <div className="filter-actions-row">
            <button type="submit" className="button button-primary submit-filter-btn">
              {t.results}
            </button>
            {hasActiveFilters && (
              <Link href="/alumni" className="button button-ghost clear-btn" title={t.clearFilters}>
                <X size={16} /> {t.clearFilters}
              </Link>
            )}
          </div>
        </form>

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
