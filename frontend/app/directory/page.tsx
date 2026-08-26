import { Filter, Search, UsersRound } from "lucide-react";
import { AlumniCard } from "@/components/alumni/alumni-card";
import { getAlumni } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Alumni, Page } from "@/types/alumni";

export const metadata = { title: "Bitiruvchilar" };

export default async function Directory({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const filterLabels = locale === "en"
    ? { faculty: "Faculty", specialty: "Specialty" }
    : locale === "ru"
      ? { faculty: "Факультет", specialty: "Специальность" }
      : { faculty: "Fakultet", specialty: "Mutaxassislik" };
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value && query.set(key, value));
  let result: Page<Alumni> | null = null;
  let error = false;
  try { result = await getAlumni(query.toString()); } catch { error = true; }

  return <section className="directory section"><div className="container">
    <div className="page-heading"><span className="eyebrow">{t.directoryEyebrow}</span><h1>{t.directoryTitle}</h1><p>{t.directoryText}</p></div>
    <form className="directory-controls">
      <div className="directory-search"><Search/><label className="sr-only" htmlFor="directory-search">{t.search}</label><input id="directory-search" name="search" defaultValue={params.search} placeholder={t.searchPlaceholder}/></div>
      <details className="filters"><summary><Filter/> {t.filters}</summary><div className="filter-grid">
        <label>{filterLabels.faculty}<input name="faculty" defaultValue={params.faculty}/></label>
        <label>{filterLabels.specialty}<input name="specialty" defaultValue={params.specialty}/></label>
        <label>{t.year}<input name="graduation_year" type="number" defaultValue={params.graduation_year} placeholder="2020"/></label>
        <label>{t.industry}<input name="industry" defaultValue={params.industry}/></label>
        <label>{t.company}<input name="company" defaultValue={params.company}/></label>
        <label>{t.location}<input name="location" defaultValue={params.location}/></label>
      </div></details>
      <button type="submit">{t.results}</button>
    </form>
    {error ? <div className="empty-state error-state"><h2>{t.loadError}</h2><p>{t.retryText}</p></div>
      : result && result.data.length ? <><div className="result-count"><strong>{result.pagination.count}</strong> {t.found}</div><div className="cards-grid directory-grid">{result.data.map(alumni => <AlumniCard alumni={alumni} key={alumni.id} t={t}/>)}</div><nav className="pagination" aria-label="Sahifalar">{result.pagination.previous&&<a href={`?${new URL(result.pagination.previous).searchParams}`}>{t.previous}</a>}<span>{result.pagination.page} / {result.pagination.pages}</span>{result.pagination.next&&<a href={`?${new URL(result.pagination.next).searchParams}`}>{t.next}</a>}</nav></>
      : <div className="empty-state"><UsersRound/><h2>{t.noResults}</h2><p>{t.noResultsText}</p><a className="button button-secondary" href="/directory">{t.clearFilters}</a></div>}
  </div></section>;
}
