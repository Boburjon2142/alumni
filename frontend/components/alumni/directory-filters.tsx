"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Filter, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import type { Faculty, Recognition } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { IndustryCombobox } from "./industry-combobox";
import { ActiveFilterChips } from "./active-filter-chips";

interface DirectoryFiltersProps {
  faculties: Faculty[];
  recognitions?: Recognition[];
  industries?: string[];
  locale: Locale;
  translations: {
    search: string;
    searchPlaceholder: string;
    filters: string;
    faculty: string;
    allFaculties: string;
    year: string;
    clearFilters: string;
    allIndustries?: string;
    allRecognitions?: string;
    filterBy?: string;
    clearAll?: string;
  };
}

export function DirectoryFilters({
  faculties,
  recognitions = [],
  industries,
  locale,
  translations: t,
}: DirectoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentIndustry = searchParams.get("industry") || "";
  const currentRecognition = searchParams.get("recognition") || "";
  const currentFaculty = searchParams.get("faculty") || "";
  const currentGradYear = searchParams.get("graduation_year") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [industryValue, setIndustryValue] = useState(currentIndustry);
  const [recognitionValue, setRecognitionValue] = useState(currentRecognition);
  const [facultyValue, setFacultyValue] = useState(currentFaculty);
  const [gradYearValue, setGradYearValue] = useState(currentGradYear);

  const hasAdvancedFiltersActive = Boolean(currentFaculty || currentGradYear);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasAdvancedFiltersActive);

  // Sync state when URL searchParams change
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setIndustryValue(currentIndustry);
  }, [currentIndustry]);

  useEffect(() => {
    setRecognitionValue(currentRecognition);
  }, [currentRecognition]);

  useEffect(() => {
    setFacultyValue(currentFaculty);
  }, [currentFaculty]);

  useEffect(() => {
    setGradYearValue(currentGradYear);
  }, [currentGradYear]);

  useEffect(() => {
    if (hasAdvancedFiltersActive) {
      setIsAdvancedOpen(true);
    }
  }, [hasAdvancedFiltersActive]);

  // Unified filter update callback
  const pushFilters = useCallback(
    (
      newSearch: string,
      newIndustry: string,
      newFaculty: string,
      newGradYear: string,
      newRecognition: string = recognitionValue
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page to 1 on any filter change
      params.delete("page");

      if (newSearch.trim()) {
        params.set("search", newSearch.trim());
      } else {
        params.delete("search");
      }

      if (newIndustry) {
        params.set("industry", newIndustry);
      } else {
        params.delete("industry");
      }

      if (newRecognition) {
        params.set("recognition", newRecognition);
      } else {
        params.delete("recognition");
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
    [pathname, recognitionValue, router, searchParams]
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      pushFilters(val, industryValue, facultyValue, gradYearValue);
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    pushFilters("", industryValue, facultyValue, gradYearValue);
  };

  const handleIndustryChange = (ind: string) => {
    setIndustryValue(ind);
    pushFilters(searchValue, ind, facultyValue, gradYearValue);
  };

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFacultyValue(val);
    pushFilters(searchValue, industryValue, val, gradYearValue);
  };

  const handleGradYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGradYearValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      pushFilters(searchValue, industryValue, facultyValue, val);
    }, 350);
  };

  const handleClearAll = () => {
    setSearchValue("");
    setIndustryValue("");
    setRecognitionValue("");
    setFacultyValue("");
    setGradYearValue("");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const advancedFiltersCount = [currentFaculty, currentGradYear].filter(Boolean).length;

  return (
    <div className="directory-controls-container">
      {/* 3-Element Toolbar: [ Search Input ] [ Industry Combobox ] [ Filtrlar Button ] */}
      <div className="directory-main-toolbar">
        {/* 1. Primary Text Search */}
        <div className="directory-search-wrapper">
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
            placeholder={t.searchPlaceholder || "Ism, lavozim yoki tashkilot bo‘yicha qidiring..."}
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

        {/* 2. Industry Single-Select Combobox */}
        <div className="directory-recognition-wrapper">
          <IndustryCombobox
            industries={industries}
            value={industryValue}
            onChange={handleIndustryChange}
            locale={locale}
            allLabel={t.allIndustries || "Barcha sohalar"}
          />
        </div>

        {/* 3. Advanced Filters Toggle Button */}
        <button
          type="button"
          className={`directory-filter-toggle-btn ${
            isAdvancedOpen || advancedFiltersCount > 0 ? "active" : ""
          }`}
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          aria-expanded={isAdvancedOpen}
          aria-label="Qo‘shimcha filtrlarni ko‘rsatish"
        >
          <SlidersHorizontal className="filter-icon" size={17} aria-hidden="true" />
          <span>{t.filters}</span>
          {advancedFiltersCount > 0 && (
            <span className="active-filter-badge">{advancedFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Expandable Advanced Filters Panel (Faculty & Year) */}
      {isAdvancedOpen && (
        <div className="directory-advanced-panel animate-fade-in">
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
        </div>
      )}

      {/* Active Filter Chips */}
      <ActiveFilterChips
        search={currentSearch}
        industry={currentIndustry}
        recognition={currentRecognition}
        recognitions={recognitions}
        faculty={currentFaculty}
        gradYear={currentGradYear}
        locale={locale}
        filterByLabel={t.filterBy || "Filtrlangan:"}
        clearAllLabel={t.clearAll || t.clearFilters || "Barchasini tozalash"}
        onRemoveSearch={() => {
          setSearchValue("");
          pushFilters("", industryValue, facultyValue, gradYearValue);
        }}
        onRemoveIndustry={() => {
          setIndustryValue("");
          pushFilters(searchValue, "", facultyValue, gradYearValue);
        }}
        onRemoveRecognition={() => {
          setRecognitionValue("");
          pushFilters(searchValue, industryValue, facultyValue, gradYearValue, "");
        }}
        onRemoveFaculty={() => {
          setFacultyValue("");
          pushFilters(searchValue, industryValue, "", gradYearValue);
        }}
        onRemoveGradYear={() => {
          setGradYearValue("");
          pushFilters(searchValue, industryValue, facultyValue, "");
        }}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
