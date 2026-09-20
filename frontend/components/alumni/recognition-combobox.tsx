"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Check, ChevronDown } from "lucide-react";
import type { Recognition } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { getRecognitionTitle } from "@/lib/i18n";
import { RecognitionIcon } from "./recognition-icon";

interface RecognitionComboboxProps {
  recognitions: Recognition[];
  value: string;
  onChange: (slug: string) => void;
  locale?: Locale;
  allLabel?: string;
  className?: string;
}

export function RecognitionCombobox({
  recognitions,
  value,
  onChange,
  locale = "uz",
  allLabel = "Barcha unvonlar",
  className = "",
}: RecognitionComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedItem = recognitions.find((r) => r.slug === value);
  const selectedLabel = selectedItem
    ? getRecognitionTitle(selectedItem.slug, locale, selectedItem.name)
    : allLabel;

  // All options including the default "All"
  const options = [
    { id: 0, name: allLabel, slug: "", icon: "🏅" },
    ...recognitions.map((r) => ({
      ...r,
      displayName: getRecognitionTitle(r.slug, locale, r.name),
    })),
  ];

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

  const handleSelect = (slug: string) => {
    onChange(slug);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = options.findIndex((opt) => opt.slug === value);
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
          handleSelect(options[focusedIndex].slug);
        }
        break;
      case "Escape":
      case "Tab":
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

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
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Faxriy unvon bo‘yicha filtrlash"
      >
        <span className="combobox-trigger-leading">
          <Award className="combobox-medal-icon" aria-hidden="true" />
          <span className="combobox-trigger-text">
            {selectedLabel}
          </span>
        </span>
        <ChevronDown
          className={`combobox-chevron ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          className="recognition-combobox-dropdown"
          role="listbox"
          aria-label="Faxriy unvonlar ro‘yxati"
          tabIndex={-1}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.slug === value;
            const isFocused = idx === focusedIndex;
            const displayName = "displayName" in opt ? (opt.displayName as string) : opt.name;

            return (
              <li
                key={opt.slug || "all"}
                role="option"
                aria-selected={isSelected}
                className={`recognition-dropdown-item ${isSelected ? "selected" : ""} ${
                  isFocused ? "focused" : ""
                }`}
                onClick={() => handleSelect(opt.slug)}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                <div className="recognition-item-left">
                  <RecognitionIcon
                    icon={opt.icon || (opt.slug ? "award" : "🏅")}
                    size={16}
                    className="recognition-item-icon"
                  />
                  <span className="recognition-item-name">{displayName}</span>
                </div>
                {isSelected && (
                  <Check className="recognition-item-check" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
