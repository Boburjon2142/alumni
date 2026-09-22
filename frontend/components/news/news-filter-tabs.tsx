"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";
import type { Dictionary } from "@/lib/i18n";

export function NewsFilterTabs({ t }: { t: Dictionary }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const categories = [
    { id: "", label: t.newsCategoryAll || "Barchasi" },
    { id: "university", label: t.newsCategoryUniversity || "Universitet" },
    { id: "alumni", label: t.newsCategoryAlumni || "Alumni" },
    { id: "event", label: t.newsCategoryEvent || "Tadbirlar" },
    { id: "achievement", label: t.newsCategoryAchievement || "Yutuqlar" },
    { id: "general", label: t.newsCategoryGeneral || "Umumiy" },
  ];

  const updateFilters = (newCategory?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory !== undefined) {
      if (newCategory) params.set("category", newCategory);
      else params.delete("category");
    }
    if (newSearch !== undefined) {
      if (newSearch.trim()) params.set("search", newSearch.trim());
      else params.delete("search");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="news-filter-toolbar">
      {/* Category Tabs */}
      <div className="news-categories-bar">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilters(cat.id, undefined)}
              className={`news-category-tab ${isActive ? "active" : ""}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="news-search-box">
        <Search size={16} className="news-search-icon" />
        <input
          type="search"
          defaultValue={currentSearch}
          placeholder={t.newsSearchPlaceholder || "Yangiliklar bo‘yicha qidiruv..."}
          onChange={(e) => updateFilters(undefined, e.target.value)}
          className="news-search-input"
        />
      </div>
    </div>
  );
}
