"use client";

import React from "react";
import { Search, Filter, Calendar, Layers, GraduationCap } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { Faculty } from "@/types/alumni";

interface ImpactFiltersProps {
  t: Dictionary;
  period: "year" | "lifetime";
  category: string;
  faculty: string;
  year: string;
  search: string;
  faculties: Faculty[];
  onPeriodChange: (period: "year" | "lifetime") => void;
  onCategoryChange: (category: string) => void;
  onFacultyChange: (faculty: string) => void;
  onYearChange: (year: string) => void;
  onSearchChange: (search: string) => void;
}

export function ImpactFilters({
  t,
  period,
  category,
  faculty,
  year,
  search,
  faculties,
  onPeriodChange,
  onCategoryChange,
  onFacultyChange,
  onYearChange,
  onSearchChange,
}: ImpactFiltersProps) {
  const categories = [
    { key: "", label: t.impactAllCategories },
    { key: "career", label: t.impactCareer },
    { key: "mentorship", label: t.impactMentorship },
    { key: "university", label: t.impactUniversity },
    { key: "community", label: t.impactCommunity },
  ];

  // Graduation years from 1992 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1991 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4 mb-8">
      {/* Top Bar: Period switch & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Period Segmented Switch */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onPeriodChange("year")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 ${
              period === "year"
                ? "bg-white dark:bg-slate-700 text-[#0D1667] dark:text-white shadow-sm border border-slate-200 dark:border-slate-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t.impactPeriodAnnual} ({currentYear})
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange("lifetime")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 ${
              period === "lifetime"
                ? "bg-white dark:bg-slate-700 text-[#0D1667] dark:text-white shadow-sm border border-slate-200 dark:border-slate-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t.impactPeriodLifetime}
          </button>
        </div>

        {/* Search input */}
        <div className="admin-search-box flex-1 max-w-md">
          <Search />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Bitiruvchi ismi yoki lavozimi..."
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onCategoryChange(cat.key)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#0D1667] text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters: Faculty & Graduation Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="relative">
          <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={faculty}
            onChange={(e) => onFacultyChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs md:text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D1667]/20 dark:focus:ring-white/20 focus:border-[#0D1667] dark:focus:border-slate-500 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">{t.impactFilterFaculty}</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs md:text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D1667]/20 dark:focus:ring-white/20 focus:border-[#0D1667] dark:focus:border-slate-500 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">{t.impactFilterYear}</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>
                {y}-yil bitiruvchilari
              </option>
            ))}
          </select>
          <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
