"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Filter, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import type { Faculty } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";

interface DirectoryFiltersProps {
  faculties: Faculty[];
  locale: Locale;
  translations: {
    search: string;
    searchPlaceholder: string;
    filters: string;
    faculty: string;
    allFaculties: string;
    year: string;
    clearFilters: string;
  };
}

export function DirectoryFilters({
  faculties,
  locale,
  translations: t,
}: DirectoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentFaculty = searchParams.get("faculty") || "";
  const currentGradYear = searchParams.get("graduation_year") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [facultyValue, setFacultyValue] = useState(currentFaculty);
  const [gradYearValue, setGradYearValue] = useState(currentGradYear);

  // Synchronize when URL searchParams change externally (e.g. browser back/forward or clear)
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setFacultyValue(currentFaculty);
  }, [currentFaculty]);

  useEffect(() => {
    setGradYearValue(currentGradYear);
  }, [currentGradYear]);

  // Debounced push to URL
  const pushFilters = useCallback(
    (newSearch: string, newFaculty: string, newGradYear: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page to 1 on any filter change
      params.delete("page");

      if (newSearch.trim()) {
        params.set("search", newSearch.trim());
      } else {
        params.delete("search");
      }

      if (newFaculty) {
        params.set("faculty", newFaculty);
      } else {
        params.delete("faculty");
      }

      if (newGradYear) {
        params.set("graduation_year", newGradYear);
      } else {
        params.delete("graduation_year");
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      pushFilters(val, facultyValue, gradYearValue);
    }, 280);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    pushFilters("", facultyValue, gradYearValue);
  };

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFacultyValue(val);
    pushFilters(searchValue, val, gradYearValue);
  };

  const handleGradYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGradYearValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      pushFilters(searchValue, facultyValue, val);
    }, 350);
  };

  const hasActiveFilters = Boolean(currentSearch || currentFaculty || currentGradYear);
  const activeFilterCount = [currentFaculty, currentGradYear].filter(Boolean).length;

  return (
    <div className="directory-controls">
      {/* Live search input with real-time feedback */}
      <div className="directory-search">
        {isPending ? (
          <Loader2 className="search-icon animate-spin text-primary" aria-hidden="true" />
        ) : (
          <Search className="search-icon" aria-hidden="true" />
        )}
        <label className="sr-only" htmlFor="alumni-search">
          {t.search}
        </label>
        <input
          id="alumni-search"
          name="search"
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={t.searchPlaceholder}
          autoComplete="off"
        />
        {searchValue && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClearSearch}
            aria-label={t.clearFilters}
            title={t.clearFilters}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Accordion Filters */}
      <details className="filters" open={Boolean(currentFaculty || currentGradYear)}>
        <summary className="filter-toggle-btn">
          <Filter className="filter-icon" aria-hidden="true" />
          <span>{t.filters}</span>
          {activeFilterCount > 0 && (
            <span className="active-filter-badge">{activeFilterCount}</span>
          )}
        </summary>
        <div className="filter-grid">
          <div className="filter-field">
            <label htmlFor="filter-faculty">{t.faculty}</label>
            <div className="select-wrapper">
              <select
                id="filter-faculty"
                name="faculty"
                value={facultyValue}
                onChange={handleFacultyChange}
              >
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
              value={gradYearValue}
              onChange={handleGradYearChange}
              placeholder="2010"
              min="1956"
              max={new Date().getFullYear()}
            />
          </div>
        </div>
      </details>

      {/* Clear active filters button when active */}
      {hasActiveFilters && (
        <div className="filter-actions-row">
          <Link href="/alumni" className="button button-ghost clear-btn" title={t.clearFilters}>
            <X size={16} /> {t.clearFilters}
          </Link>
        </div>
      )}
    </div>
  );
}

