"use client";
 
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, MapPin, Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

const REGIONS = [
  { value: "", label: { uz: "Barcha hududlar", ru: "Все регионы", en: "All regions" } },
  { value: "Qashqadaryo", label: { uz: "Qashqadaryo viloyati / Qarshi", ru: "Кашкадарьинская область / Карши", en: "Kashkadarya / Karshi" } },
  { value: "Toshkent", label: { uz: "Toshkent shahri va viloyati", ru: "г. Ташкент и область", en: "Tashkent City & Region" } },
  { value: "Samarqand", label: { uz: "Samarqand viloyati", ru: "Самаркандская область", en: "Samarkand Region" } },
  { value: "Buxoro", label: { uz: "Buxoro viloyati", ru: "Бухарская область", en: "Bukhara Region" } },
  { value: "Surxondaryo", label: { uz: "Surxondaryo viloyati", ru: "Сурхандарьинская область", en: "Surkhandarya Region" } },
  { value: "Navoiy", label: { uz: "Navoiy viloyati", ru: "Навоийская область", en: "Navoi Region" } },
  { value: "Jizzax", label: { uz: "Jizzax viloyati", ru: "Джизакская область", en: "Jizzakh Region" } },
  { value: "Sirdaryo", label: { uz: "Sirdaryo viloyati", ru: "Сырдарьинская область", en: "Sirdaryo Region" } },
  { value: "Andijon", label: { uz: "Andijon viloyati", ru: "Андижанская область", en: "Andijan Region" } },
  { value: "Farg'ona", label: { uz: "Farg‘ona viloyati", ru: "Ферганская область", en: "Fergana Region" } },
  { value: "Namangan", label: { uz: "Namangan viloyati", ru: "Наманганская область", en: "Namangan Region" } },
  { value: "Xorazm", label: { uz: "Xorazm viloyati", ru: "Хорезмская область", en: "Khorezm Region" } },
  { value: "Qoraqalpog'iston", label: { uz: "Qoraqalpog‘iston Respublikasi", ru: "Республика Каракалпакстан", en: "Republic of Karakalpakstan" } },
  { value: "Xorij", label: { uz: "Xorijiy davlatlar (Chet el)", ru: "Зарубежные страны (За границей)", en: "International / Abroad" } },
];

export function GroupsFilter({ t, locale = "uz" }: { t: Dictionary; locale?: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const currentRegion = searchParams.get("region") || "";
  const [isPending, startTransition] = useTransition();

  const updateFilters = (newSearch: string, newRegion: string) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set("search", newSearch.trim());
    if (newRegion) params.set("region", newRegion);
    
    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `/groups?${queryString}` : "/groups");
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(query, currentRegion);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRegion = e.target.value;
    updateFilters(query, nextRegion);
  };

  const handleClearSearch = () => {
    setQuery("");
    updateFilters("", currentRegion);
  };

  const handleClearAll = () => {
    setQuery("");
    updateFilters("", "");
  };

  const activeRegionObj = REGIONS.find((r) => r.value === currentRegion);
  const activeRegionLabel = activeRegionObj
    ? activeRegionObj.label[locale] || activeRegionObj.label.uz
    : currentRegion;

  return (
    <div className="groups-filter-wrapper">
      <div className="groups-filter-bar">
        {/* Left: Search input */}
        <form onSubmit={handleSearch} className="groups-search-form" role="search">
          <Search className="groups-search-icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="groups-search-input"
            placeholder={t.groupsSearchPlaceholder || "Yil bo‘yicha qidirish (masalan: 2012)..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t.groupsSearchPlaceholder || "Yil bo‘yicha qidirish"}
          />
          {query && (
            <button
              type="button"
              className="groups-clear-btn"
              onClick={handleClearSearch}
              aria-label="Tozalash"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            className="button button-primary groups-submit-btn"
            disabled={isPending}
          >
            {isPending ? "..." : t.search || "Qidirish"}
          </button>
        </form>

        {/* Right: Region Dropdown (O'ng chetda) */}
        <div className="groups-region-filter">
          <MapPin className="groups-region-icon" size={17} aria-hidden="true" />
          <select
            value={currentRegion}
            onChange={handleRegionChange}
            aria-label="Faoliyat hududi bo‘yicha saralash"
            className="groups-region-select"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label[locale] || r.label.uz}
              </option>
            ))}
          </select>
          <div className="groups-region-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(query || currentRegion) && (
        <div className="groups-active-chips">
          <span style={{ color: "#64748b", fontWeight: 600 }}>Faol filtrlar:</span>
          {query && (
            <span className="groups-chip groups-chip-search">
              <span>Qidiruv: &ldquo;{query}&rdquo;</span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="groups-chip-clear"
                title="Qidiruvni o‘chirish"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {currentRegion && (
            <span className="groups-chip groups-chip-region">
              <MapPin size={12} />
              <span>Hudud: {activeRegionLabel}</span>
              <button
                type="button"
                onClick={() => updateFilters(query, "")}
                className="groups-chip-clear"
                title="Hududni o‘chirish"
              >
                <X size={12} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            className="groups-clear-all-btn"
          >
            Barchasini tozalash
          </button>
        </div>
      )}
    </div>
  );
}
