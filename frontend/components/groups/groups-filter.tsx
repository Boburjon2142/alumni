"use client";
 
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

import { CustomSelect } from "@/components/ui/custom-select";
import { LOCATION_OPTIONS } from "@/lib/uzbekistan-locations";

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

  const handleSelectRegion = (regionValue: string) => {
    updateFilters(query, regionValue);
  };

  const handleClearSearch = () => {
    setQuery("");
    updateFilters("", currentRegion);
  };

  const handleClearAll = () => {
    setQuery("");
    updateFilters("", "");
  };

  const allLocationsLabel = locale === "en" ? "All cities and districts" : locale === "ru" ? "Все города и районы" : "Barcha shahar va tumanlar";
  const activeRegionLabel = LOCATION_OPTIONS.find((item) => item.value === currentRegion)?.label || currentRegion;

  return (
    <div className="groups-filter-wrapper">
      <div className="groups-filter-container">
        {/* Left: Search input */}
        <form onSubmit={handleSearch} className="groups-search-box" role="search">
          <div className="groups-search-input-wrap">
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
                className="groups-search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Tozalash"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="groups-search-submit-btn"
            disabled={isPending}
          >
            {isPending ? "..." : t.search || "Qidirish"}
          </button>
        </form>

        <div className="groups-region-dropdown-box">
          <CustomSelect
            id="groups-location"
            value={currentRegion}
            onChange={handleSelectRegion}
            icon={MapPin}
            options={[{ value: "", label: allLocationsLabel }, ...LOCATION_OPTIONS]}
            placeholder={allLocationsLabel}
            searchable
            searchPlaceholder={locale === "en" ? "Search city or district..." : locale === "ru" ? "Поиск города или района..." : "Shahar yoki tumanni qidiring..."}
          />
        </div>
      </div>

      {/* Active Filter Chips */}
      {(query || currentRegion) && (
        <div className="groups-active-chips">
          <span className="groups-chips-heading">Faol filtrlar:</span>
          {query && (
            <span className="groups-chip groups-chip-search">
              <span>Qidiruv: &ldquo;{query}&rdquo;</span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="groups-chip-clear"
                title="Qidiruvni o‘chirish"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {currentRegion && (
            <span className="groups-chip groups-chip-region">
              <MapPin size={13} />
              <span>Hudud: {activeRegionLabel}</span>
              <button
                type="button"
                onClick={() => updateFilters(query, "")}
                className="groups-chip-clear"
                title="Hududni o‘chirish"
              >
                <X size={13} />
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

