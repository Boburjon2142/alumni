"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Faculty, ImpactRankingEntry } from "@/types/alumni";
import { ImpactHeader } from "./impact-header";
import { ImpactFilters } from "./impact-filters";
import { ImpactTopContributors } from "./impact-top-contributors";
import { ImpactRankingTable } from "./impact-ranking-table";
import { ImpactExplanation } from "./impact-explanation";
import { ImpactSubmitModal } from "./impact-submit-modal";
import { getImpactRankings } from "@/lib/api";

interface ImpactViewProps {
  t: Dictionary;
  initialRankings: ImpactRankingEntry[];
  faculties: Faculty[];
}

export function ImpactView({ t, initialRankings, faculties }: ImpactViewProps) {
  const [period, setPeriod] = useState<"year" | "lifetime">("year");
  const [category, setCategory] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [rankings, setRankings] = useState<ImpactRankingEntry[]>(initialRankings);
  const [loading, setLoading] = useState(false);

  // Fetch rankings when period, category, faculty, or year change
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const params = new URLSearchParams();
    params.set("period", period);
    if (category) params.set("category", category);
    if (faculty) params.set("faculty", faculty);
    if (year) params.set("graduation_year", year);

    getImpactRankings(params.toString())
      .then((res) => {
        if (mounted && res.success) {
          setRankings(res.data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch rankings", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [period, category, faculty, year]);

  // Client-side search filter
  const filteredRankings = useMemo(() => {
    if (!search.trim()) return rankings;
    const q = search.toLowerCase().trim();
    return rankings.filter((item) => {
      return (
        item.alumni.full_name.toLowerCase().includes(q) ||
        (item.alumni.position && item.alumni.position.toLowerCase().includes(q)) ||
        (item.alumni.current_company && item.alumni.current_company.toLowerCase().includes(q)) ||
        (item.alumni.faculty && item.alumni.faculty.toLowerCase().includes(q))
      );
    });
  }, [rankings, search]);

  const topThree = useMemo(() => {
    return filteredRankings.slice(0, 3);
  }, [filteredRankings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Institutional Header */}
      <ImpactHeader
        t={t}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />

      {/* Filters Bar */}
      <ImpactFilters
        t={t}
        period={period}
        category={category}
        faculty={faculty}
        year={year}
        search={search}
        faculties={faculties}
        onPeriodChange={setPeriod}
        onCategoryChange={setCategory}
        onFacultyChange={setFaculty}
        onYearChange={setYear}
        onSearchChange={setSearch}
      />

      {/* Top 3 Contributors Podium/Showcase */}
      {!loading && topThree.length > 0 && (
        <ImpactTopContributors t={t} topContributors={topThree} />
      )}

      {/* Full Registry Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-12 text-center animate-pulse">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4" />
          <div className="space-y-3">
            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
          </div>
        </div>
      ) : (
        <ImpactRankingTable t={t} entries={filteredRankings} />
      )}

      {/* 4 Pillars Explanation */}
      <ImpactExplanation t={t} />

      {/* Submit Contribution Modal */}
      <ImpactSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        t={t}
        onSubmitted={() => {
          // Re-fetch after submission
          getImpactRankings(`period=${period}`).then((res) => {
            if (res.success) setRankings(res.data);
          });
        }}
      />
    </div>
  );
}
