"use client";

import { BookOpen, Briefcase, Calendar, Search, X } from "lucide-react";
import type { Recognition } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { getRecognitionTitle } from "@/lib/i18n";
import { RecognitionIcon } from "./recognition-icon";

interface ActiveFilterChipsProps {
  search?: string;
  industry?: string;
  recognition?: string;
  recognitions?: Recognition[];
  faculty?: string;
  gradYear?: string;
  locale?: Locale;
  filterByLabel?: string;
  clearAllLabel?: string;
  onRemoveSearch: () => void;
  onRemoveIndustry?: () => void;
  onRemoveRecognition?: () => void;
  onRemoveFaculty: () => void;
  onRemoveGradYear: () => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  search,
  industry,
  recognition,
  recognitions = [],
  faculty,
  gradYear,
  locale = "uz",
  filterByLabel = "Filtrlangan:",
  clearAllLabel = "Barchasini tozalash",
  onRemoveSearch,
  onRemoveIndustry,
  onRemoveRecognition,
  onRemoveFaculty,
  onRemoveGradYear,
  onClearAll,
}: ActiveFilterChipsProps) {
  const activeRecognition = recognitions.find((r) => r.slug === recognition);
  const recognitionName = recognition
    ? getRecognitionTitle(recognition, locale, activeRecognition?.name)
    : "";

  const hasAnyFilter = Boolean(search || industry || recognition || faculty || gradYear);

  if (!hasAnyFilter) {
    return null;
  }

  const gradYearText =
    locale === "ru"
      ? `${gradYear} год`
      : locale === "en"
      ? `Class of ${gradYear}`
      : `${gradYear}-yil`;

  return (
    <div className="active-filters-bar" aria-label={filterByLabel}>
      <span className="active-filters-label">{filterByLabel}</span>
      <div className="active-chips-list">
        {search && (
          <span className="filter-chip">
            <Search className="chip-icon" size={13} aria-hidden="true" />
            <span className="chip-text">
              &ldquo;{search}&rdquo;
            </span>
            <button
              type="button"
              className="chip-remove-btn"
              onClick={onRemoveSearch}
              aria-label={`Qidiruv filtrini o‘chirish: ${search}`}
            >
              <X size={13} />
            </button>
          </span>
        )}

        {industry && (
          <span className="filter-chip chip-industry">
            <Briefcase size={13} className="chip-icon" aria-hidden="true" />
            <span className="chip-text">
              {industry}
            </span>
            {onRemoveIndustry && (
              <button
                type="button"
                className="chip-remove-btn"
                onClick={onRemoveIndustry}
                aria-label={`Soha filtrini o‘chirish: ${industry}`}
              >
                <X size={13} />
              </button>
            )}
          </span>
        )}

        {recognition && (
          <span className="filter-chip chip-recognition">
            <RecognitionIcon
              icon={activeRecognition?.icon}
              size={13}
              className="chip-icon"
            />
            <span className="chip-text">
              {recognitionName}
            </span>
            <button
              type="button"
              className="chip-remove-btn"
              onClick={onRemoveRecognition}
              aria-label={`Unvon filtrini o‘chirish: ${recognitionName}`}
            >
              <X size={13} />
            </button>
          </span>
        )}

        {faculty && (
          <span className="filter-chip">
            <BookOpen className="chip-icon" size={13} aria-hidden="true" />
            <span className="chip-text">{faculty}</span>
            <button
              type="button"
              className="chip-remove-btn"
              onClick={onRemoveFaculty}
              aria-label={`Fakultet filtrini o‘chirish: ${faculty}`}
            >
              <X size={13} />
            </button>
          </span>
        )}

        {gradYear && (
          <span className="filter-chip">
            <Calendar className="chip-icon" size={13} aria-hidden="true" />
            <span className="chip-text">{gradYearText}</span>
            <button
              type="button"
              className="chip-remove-btn"
              onClick={onRemoveGradYear}
              aria-label={`Bitirgan yil filtrini o‘chirish: ${gradYear}`}
            >
              <X size={13} />
            </button>
          </span>
        )}

        <button
          type="button"
          className="clear-all-chips-btn"
          onClick={onClearAll}
        >
          {clearAllLabel}
        </button>
      </div>
    </div>
  );
}
