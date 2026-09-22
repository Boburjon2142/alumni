"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export const DEFAULT_INDUSTRIES = [
  "Oliy ta’lim va ilm-fan",
  "Maktabgacha va maktab ta’limi",
  "Davlat va jamoat boshqaruvi",
  "Huquq-tartibot va adliya",
  "Ishlab chiqarish va elektrotexnika",
  "Sanoat va investitsiyalar",
  "Axborot texnologiyalari (IT)",
  "Jurnalistika va OAV",
  "Madaniyat, adabiyot va meros",
  "Iqtisodiyot va moliya",
  "Tibbiyot va sog‘liqni saqlash",
  "Sport va jismoniy tarbiya",
];

interface IndustryComboboxProps {
  industries?: string[];
  value: string;
  onChange: (industry: string) => void;
  locale?: Locale;
  allLabel?: string;
  className?: string;
}

export function IndustryCombobox({
  industries = DEFAULT_INDUSTRIES,
  value,
  onChange,
  locale = "uz",
  allLabel = "Barcha sohalar",
  className = "",
}: IndustryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedLabel = value || allLabel;

  // Options including "All"
  const options = ["", ...industries];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  const handleSelect = (ind: string) => {
    onChange(ind);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = options.findIndex((opt) => opt === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          handleSelect(options[focusedIndex]);
        }
        break;
      case "Escape":
      case "Tab":
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll<HTMLLIElement>('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, isOpen]);

  return (
    <div
      ref={containerRef}
      className={`recognition-combobox-wrapper ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`recognition-combobox-trigger ${value ? "is-selected" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Soha bo‘yicha filtrlash"
      >
        <span className="combobox-trigger-leading">
          <span className="combobox-selected-text">{selectedLabel}</span>
        </span>
        <ChevronDown
          size={16}
          className={`combobox-chevron ${isOpen ? "open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          className="recognition-combobox-dropdown animate-fade-in"
          role="listbox"
          aria-label="Sohalar ro‘yxati"
          tabIndex={-1}
        >
          {options.map((opt, idx) => {
            const isSelected = opt === value;
            const isFocused = idx === focusedIndex;
            const label = opt || allLabel;

            return (
              <li
                key={opt || "all"}
                role="option"
                aria-selected={isSelected}
                className={`recognition-dropdown-item ${isSelected ? "selected" : ""} ${
                  isFocused ? "focused" : ""
                }`}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                <span className="recognition-item-name">{label}</span>
                {isSelected && (
                  <Check size={16} className="recognition-item-check" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
