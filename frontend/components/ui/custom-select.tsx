"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LucideIcon, Search, X } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  badge?: string;
}

interface CustomSelectProps {
  id?: string;
  name?: string;
  value: string | number | null | undefined;
  onChange: (value: any) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Tanlang...",
  icon: LeadingIcon,
  disabled = false,
  className = "",
  required = false,
  searchable,
  searchPlaceholder = "Qidirish...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  // Enable search if explicitly requested or if list is large (> 10 items)
  const isSearchEnabled =
    searchable === true || (searchable !== false && normalizedOptions.length > 10);

  // Filter options when searching
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const labelMatch = opt.label.toLowerCase().includes(q);
    const badgeMatch = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
    const valueMatch = String(opt.value).toLowerCase().includes(q);
    return labelMatch || badgeMatch || valueMatch;
  });

  // Find selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Reset search and auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      if (isSearchEnabled) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      setSearchQuery("");
    }
  }, [isOpen, isSearchEnabled]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = filteredOptions.findIndex(
          (opt) => String(opt.value) === String(value)
        );
        const nextIndex =
          currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0;
        if (filteredOptions[nextIndex]) {
          onChange(filteredOptions[nextIndex].value);
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = filteredOptions.findIndex(
          (opt) => String(opt.value) === String(value)
        );
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1;
        if (filteredOptions[prevIndex]) {
          onChange(filteredOptions[prevIndex].value);
        }
      }
    }
  };

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${disabled ? "is-disabled" : ""} ${
        isOpen ? "is-open" : ""
      } ${className}`}
    >
      {/* Hidden native input for form compatibility */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value ?? ""}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-listbox` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`custom-select-trigger ${
          LeadingIcon ? "has-leading-icon" : ""
        } ${!selectedOption?.value ? "is-placeholder" : ""}`}
      >
        {LeadingIcon && (
          <LeadingIcon size={16} className="custom-select-leading-icon" />
        )}

        <span className="custom-select-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {selectedOption?.badge && (
          <span className="custom-select-option-badge mr-1">
            {selectedOption.badge}
          </span>
        )}

        <ChevronDown
          size={16}
          className={`custom-select-chevron ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          ref={listboxRef}
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="custom-select-dropdown"
        >
          {/* Search box for large option lists */}
          {isSearchEnabled && (
            <div
              className="custom-select-search-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <Search size={14} className="custom-select-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="custom-select-search-input"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  } else if (e.key === "Enter" && filteredOptions.length > 0) {
                    e.preventDefault();
                    handleSelect(filteredOptions[0].value);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="custom-select-search-clear"
                  title="Tozalash"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Options list */}
          <div className="custom-select-options-list">
            {filteredOptions.length === 0 ? (
              <div className="custom-select-no-results">
                <span>Hech narsa topilmadi</span>
                {searchQuery && (
                  <span className="custom-select-no-results-hint">
                    "{searchQuery}" bo‘yicha mos hudud topilmadi
                  </span>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const ItemIcon = opt.icon;

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`custom-select-option ${
                      isSelected ? "is-selected" : ""
                    }`}
                  >
                    <div className="custom-select-option-content">
                      {ItemIcon && (
                        <ItemIcon size={15} className="custom-select-option-icon" />
                      )}
                      <span className="custom-select-option-label">
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="custom-select-option-badge">
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check size={15} className="custom-select-option-check" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
