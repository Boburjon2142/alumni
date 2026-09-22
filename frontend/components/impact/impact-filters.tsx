"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { Faculty } from "@/types/alumni";
import styles from "@/app/impact/impact.module.css";

interface CustomDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (val: string) => void;
}

function CustomDropdown({ value, options, placeholder, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.customDropdown} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.customDropdownTrigger} ${value ? styles.customDropdownTriggerActive : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.customDropdownLabel}>{displayLabel}</span>
        <ChevronDown
          size={14}
          className={`${styles.customDropdownChevron} ${isOpen ? styles.customDropdownChevronOpen : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles.customDropdownMenu} role="listbox">
          <button
            type="button"
            className={`${styles.customDropdownItem} ${!value ? styles.customDropdownItemActive : ""}`}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            role="option"
            aria-selected={!value}
          >
            <span>{placeholder}</span>
            {!value && <Check size={14} className={styles.checkIcon} />}
          </button>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.customDropdownItem} ${isSelected ? styles.customDropdownItemActive : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} className={styles.checkIcon} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ImpactFiltersProps {
  t: Dictionary;
  period?: "year" | "lifetime";
  category: string;
  faculty: string;
  year: string;
  search: string;
  faculties: Faculty[];
  onPeriodChange?: (period: "year" | "lifetime") => void;
  onCategoryChange: (category: string) => void;
  onFacultyChange: (faculty: string) => void;
  onYearChange: (year: string) => void;
  onSearchChange: (search: string) => void;
}

export function ImpactFilters({
  t,
  category,
  faculty,
  year,
  search,
  faculties,
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

  // Graduation years from 1980 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

  const facultyOptions = faculties.map((f) => ({
    value: f.name,
    label: f.name,
  }));

  const yearOptions = years.map((y) => ({
    value: y.toString(),
    label: `${y}-yil`,
  }));

  return (
    <div className={styles.filterCard}>
      {/* Search & Custom Selects Row */}
      <div className={styles.filterTopRow}>
        {/* Search input */}
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Bitiruvchi ismi, lavozimi yoki tashkiloti..."
            className={styles.searchInput}
          />
        </div>

        {/* Custom Dropdown Selects */}
        <div className={styles.dropdownGroup}>
          <CustomDropdown
            value={faculty}
            options={facultyOptions}
            placeholder={t.impactFilterFaculty}
            onChange={onFacultyChange}
          />

          <CustomDropdown
            value={year}
            options={yearOptions}
            placeholder={t.impactFilterYear}
            onChange={onYearChange}
          />
        </div>
      </div>

      {/* Categories Row */}
      <div className={styles.filterBottomRow}>
        <div className={styles.categoryPills}>
          {categories.map((cat) => {
            const isActive = category === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategoryChange(cat.key)}
                className={`${styles.catPill} ${isActive ? styles.catPillActive : ""}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
