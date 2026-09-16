"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import type { Dictionary } from "@/lib/i18n";

export function GroupsFilter({ t }: { t: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`/groups?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    startTransition(() => {
      router.push(`/groups?${params.toString()}`);
    });
  };

  return (
    <div className="groups-filter-bar">
      <form onSubmit={handleSearch} className="groups-search-form" role="search">
        <Search className="groups-search-icon" size={18} aria-hidden="true" />
        <input
          type="search"
          className="groups-search-input"
          placeholder={t.groupsSearchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t.groupsSearchPlaceholder}
        />
        {query && (
          <button
            type="button"
            className="groups-clear-btn"
            onClick={handleClear}
            aria-label="Tozalash"
          >
            <X size={16} />
          </button>
        )}
        <button type="submit" className="button button-primary groups-submit-btn" disabled={isPending}>
          {isPending ? "..." : t.search || "Qidirish"}
        </button>
      </form>
    </div>
  );
}
