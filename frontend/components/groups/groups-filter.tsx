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
    <div className="groups-filter-wrapper mb-8">
      <div className="groups-filter-bar flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Left: Search input */}
        <form onSubmit={handleSearch} className="groups-search-form flex-1 relative flex items-center" role="search">
          <Search className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} aria-hidden="true" />
          <input
            type="search"
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 placeholder:text-slate-400 border border-slate-200/90 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#002B49]/15 focus:border-[#002B49]"
            placeholder={t.groupsSearchPlaceholder || "Yil bo‘yicha qidirish (masalan: 2012)..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t.groupsSearchPlaceholder || "Yil bo‘yicha qidirish"}
          />
          {query && (
            <button
              type="button"
              className="absolute right-20 text-slate-400 hover:text-slate-600 p-1"
              onClick={handleClearSearch}
              aria-label="Tozalash"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            className="button button-primary absolute right-1.5 top-1.5 bottom-1.5 px-4 !min-h-0 !h-auto text-xs font-semibold rounded-lg shadow-none"
            disabled={isPending}
          >
            {isPending ? "..." : t.search || "Qidirish"}
          </button>
        </form>

        {/* Right: Region Dropdown */}
        <div className="groups-region-filter relative flex items-center min-w-[240px]">
          <MapPin className="absolute left-3.5 text-amber-600 pointer-events-none z-10" size={17} aria-hidden="true" />
          <select
            value={currentRegion}
            onChange={handleRegionChange}
            aria-label="Faoliyat hududi bo‘yicha saralash"
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 border border-slate-200/90 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#002B49]/15 focus:border-[#002B49] cursor-pointer appearance-none"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label[locale] || r.label.uz}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(query || currentRegion) && (
        <div className="groups-active-chips flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-slate-500 font-medium">Faol filtrlar:</span>
          {query && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-900 rounded-full font-medium">
              <span>Qidiruv: &ldquo;{query}&rdquo;</span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:text-red-600 ml-0.5"
                title="Qidiruvni o‘chirish"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {currentRegion && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-full font-medium">
              <MapPin size={12} className="text-amber-600" />
              <span>Hudud: {activeRegionLabel}</span>
              <button
                type="button"
                onClick={() => updateFilters(query, "")}
                className="hover:text-red-600 ml-0.5"
                title="Hududni o‘chirish"
              >
                <X size={13} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            className="text-slate-500 hover:text-red-600 underline underline-offset-2 ml-2 transition-colors"
          >
            Barchasini tozalash
          </button>
        </div>
      )}
    </div>
  );
}
