"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { ImpactRankingEntry, Recognition } from "@/types/alumni";
import { ImpactAwardGallery } from "./impact-award-gallery";
import Link from "next/link";
import { ImpactHeader } from "./impact-header";
import { ImpactFilters } from "./impact-filters";
import { ImpactRankingTable } from "./impact-ranking-table";
import { ImpactExplanation } from "./impact-explanation";
import { ImpactSubmitModal } from "./impact-submit-modal";
import { getImpactRankings } from "@/lib/api";
import { getRecognizedAlumni } from "@/lib/recognized-alumni";
import { authSession } from "@/lib/auth";
import styles from "@/app/impact/impact.module.css";

interface ImpactViewProps {
  t: Dictionary;
  locale?: Locale;
  initialRankings: ImpactRankingEntry[];
  initialIndustry?: string;
  recognitions?: Recognition[];
  showRegistry?: boolean;
}

export function ImpactView({ t, locale = "uz", initialRankings, initialIndustry = "", recognitions = [], showRegistry = false }: ImpactViewProps) {
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState(initialIndustry);
  const [year, setYear] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [rankings, setRankings] = useState<ImpactRankingEntry[]>(initialRankings);
  const [loading, setLoading] = useState(false);

  // Sync auth state
  useEffect(() => {
    const sync = () => {
      authSession()
        .then((session) => setIsAuthenticated(Boolean(session?.authenticated)))
        .catch(() => setIsAuthenticated(false));
    };
    sync();
    window.addEventListener("auth-changed", sync);
    return () => window.removeEventListener("auth-changed", sync);
  }, []);

  // Fetch rankings when category, faculty, or year change
  useEffect(() => {
    if (!showRegistry) return;
    let mounted = true;
    setLoading(true);

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (industry) params.set("industry", industry);
    if (year) params.set("graduation_year", year);

    getRecognizedAlumni(params.toString())
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
  }, [category, industry, year, showRegistry]);

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
      {showRegistry ? <div className={styles.headerCard}>
        <div className={styles.headerLeft}><h1 className={styles.headerTitle}>{t.impactFullList}</h1></div>
        <Link href="/impact" className={styles.secondaryBtn}>{locale === "en" ? "Back to recognition" : locale === "ru" ? "Вернуться к признанию" : "E’tirof sahifasiga qaytish"}</Link>
      </div> : <ImpactHeader
        t={t}
        locale={locale}
        isAuthenticated={isAuthenticated}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />}

      {/* 2. Simplified Filters */}
      {showRegistry && <ImpactFilters
        t={t}
        category={category}
        industry={industry}
        year={year}
        search={search}
        onCategoryChange={setCategory}
        onIndustryChange={setIndustry}
        onYearChange={setYear}
        onSearchChange={setSearch}
      />}

      {/* 3. Two-Column Layout: Left (Registry Table) & Right (Vertical Explanation) */}
      <div className={showRegistry ? styles.mainLayout : undefined}>
        {/* Left: Recognized Alumni Table */}
        <div>
          {!showRegistry ? <ImpactAwardGallery recognitions={recognitions} locale={locale} /> : loading ? (
            <div className={styles.rankingsCard}>
              <div className={styles.emptyState}>
                <p>Yuklanmoqda...</p>
              </div>
            </div>
          ) : (
            <ImpactRankingTable t={t} entries={filteredRankings} locale={locale} />
          )}
        </div>

        {/* Right: Vertical 'E’tirof qanday beriladi?' Sidebar */}
        {showRegistry && <div>
          <ImpactExplanation t={t} />
        </div>}
      </div>

      {/* 4. Submit Contribution Modal */}
      <ImpactSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        t={t}
        locale={locale}
        isAuthenticated={isAuthenticated}
        onSubmitted={() => {
          getImpactRankings("").then((res) => {
            if (res.success) setRankings(res.data);
          });
        }}
      />
    </div>
  );
}
