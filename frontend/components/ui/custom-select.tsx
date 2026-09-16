"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LucideIcon } from "lucide-react";

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
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  // Find selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

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
        const currentIndex = normalizedOptions.findIndex(
          (opt) => String(opt.value) === String(value)
        );
        const nextIndex =
          currentIndex < normalizedOptions.length - 1 ? currentIndex + 1 : 0;
        onChange(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex(
          (opt) => String(opt.value) === String(value)
        );
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : normalizedOptions.length - 1;
        onChange(normalizedOptions[prevIndex].value);
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
          <div className="custom-select-options-list">
            {normalizedOptions.map((opt) => {
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
