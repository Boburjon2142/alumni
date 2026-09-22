"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Faculty, ImpactRankingEntry } from "@/types/alumni";
import { ImpactHeader } from "./impact-header";
import { ImpactFilters } from "./impact-filters";
import { ImpactRankingTable } from "./impact-ranking-table";
import { ImpactExplanation } from "./impact-explanation";
import { ImpactSubmitModal } from "./impact-submit-modal";
import { getImpactRankings } from "@/lib/api";
import styles from "@/app/impact/impact.module.css";

interface ImpactViewProps {
  t: Dictionary;
  initialRankings: ImpactRankingEntry[];
  faculties: Faculty[];
}

export function ImpactView({ t, initialRankings, faculties }: ImpactViewProps) {
  const [category, setCategory] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [rankings, setRankings] = useState<ImpactRankingEntry[]>(initialRankings);
  const [loading, setLoading] = useState(false);

  // Fetch rankings when category, faculty, or year change
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const params = new URLSearchParams();
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
  }, [category, faculty, year]);

  // Client-side search filter & sort by graduation year ascending (eng oldingi yil birinchi)
  const filteredRankings = useMemo(() => {
    let list = [...rankings];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((item) => {
        return (
          item.alumni.full_name.toLowerCase().includes(q) ||
          (item.alumni.position && item.alumni.position.toLowerCase().includes(q)) ||
          (item.alumni.current_company && item.alumni.current_company.toLowerCase().includes(q)) ||
          (item.alumni.faculty && item.alumni.faculty.toLowerCase().includes(q))
        );
      });
    }
    // Sort: oldest graduation year first (ascending)
    return list.sort((a, b) => (a.alumni.graduation_year || 9999) - (b.alumni.graduation_year || 9999));
  }, [rankings, search]);

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <ImpactHeader
        t={t}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />

      {/* 2. Simplified Filters */}
      <ImpactFilters
        t={t}
        category={category}
        faculty={faculty}
        year={year}
        search={search}
        faculties={faculties}
        onCategoryChange={setCategory}
        onFacultyChange={setFaculty}
        onYearChange={setYear}
        onSearchChange={setSearch}
      />

      {/* 3. Two-Column Layout: Left (Registry Table) & Right (Vertical Explanation) */}
      <div className={styles.mainLayout}>
        {/* Left: Recognized Alumni Table */}
        <div>
          {loading ? (
            <div className={styles.rankingsCard}>
              <div className={styles.emptyState}>
                <p>Yuklanmoqda...</p>
              </div>
            </div>
          ) : (
            <ImpactRankingTable t={t} entries={filteredRankings} />
          )}
        </div>

        {/* Right: Vertical 'E’tirof qanday beriladi?' Sidebar */}
        <div>
          <ImpactExplanation t={t} />
        </div>
      </div>

      {/* 4. Submit Contribution Modal */}
      <ImpactSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        t={t}
        onSubmitted={() => {
          getImpactRankings("").then((res) => {
            if (res.success) setRankings(res.data);
          });
        }}
      />
    </div>
  );
}
