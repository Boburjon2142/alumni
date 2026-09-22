"use client";
 
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Globe, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

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
    setIsDropdownOpen(false);
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

  const activeRegionObj = REGIONS.find((r) => r.value === currentRegion);
  const activeRegionLabel = activeRegionObj
    ? activeRegionObj.label[locale] || activeRegionObj.label.uz
    : currentRegion;

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

        {/* Right: Custom Dropdown Menu for Regions */}
        <div className="groups-region-dropdown-box" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`groups-dropdown-trigger ${currentRegion ? "has-value" : ""} ${isDropdownOpen ? "is-open" : ""}`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="Faoliyat hududi bo‘yicha saralash"
          >
            <div className="groups-dropdown-label-group">
              {currentRegion === "Xorij" ? (
                <Globe className="groups-dropdown-icon" size={18} aria-hidden="true" />
              ) : (
                <MapPin className="groups-dropdown-icon" size={18} aria-hidden="true" />
              )}
              <span className="groups-dropdown-current-text">
                {activeRegionLabel || "Barcha hududlar"}
              </span>
            </div>
            <ChevronDown
              className={`groups-dropdown-arrow ${isDropdownOpen ? "rotate" : ""}`}
              size={17}
              aria-hidden="true"
            />
          </button>

          {isDropdownOpen && (
            <div className="groups-dropdown-menu" role="listbox">
              <div className="groups-dropdown-menu-header">
                <span>Hududni tanlang</span>
                {currentRegion && (
                  <button
                    type="button"
                    onClick={() => handleSelectRegion("")}
                    className="groups-dropdown-reset-text"
                  >
                    Barchasi
                  </button>
                )}
              </div>
              <div className="groups-dropdown-menu-list">
                {REGIONS.map((r) => {
                  const isSelected = r.value === currentRegion;
                  const label = r.label[locale] || r.label.uz;
                  return (
                    <button
                      key={r.value || "all"}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectRegion(r.value)}
                      className={`groups-dropdown-option ${isSelected ? "selected" : ""}`}
                    >
                      <div className="groups-option-left">
                        {r.value === "" ? (
                          <Globe size={16} className="groups-option-icon" />
                        ) : r.value === "Xorij" ? (
                          <Globe size={16} className="groups-option-icon" />
                        ) : (
                          <MapPin size={16} className="groups-option-icon" />
                        )}
                        <span className="groups-option-label">{label}</span>
                      </div>
                      {isSelected && (
                        <Check size={16} className="groups-option-check" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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

