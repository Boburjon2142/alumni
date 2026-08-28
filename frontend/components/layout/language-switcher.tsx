"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

const options = [
  { code:"uz", short:"UZ", label:"O‘zbek" },
  { code:"ru", short:"RU", label:"Русский" },
  { code:"en", short:"EN", label:"English" },
] as const;

function Flag({ code }: { code: Locale }) {
  if (code === "uz") return <svg className="flag-icon" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#1eb5e9"/><rect y="6" width="30" height="1" fill="#d9212a"/><rect y="7" width="30" height="6" fill="#fff"/><rect y="13" width="30" height="1" fill="#d9212a"/><rect y="14" width="30" height="6" fill="#20a84b"/><circle cx="6" cy="4" r="2.5" fill="#fff"/><circle cx="7" cy="4" r="2.2" fill="#1eb5e9"/><g fill="#fff"><circle cx="10" cy="2" r=".5"/><circle cx="12" cy="3" r=".5"/><circle cx="10" cy="5" r=".5"/><circle cx="14" cy="2" r=".5"/><circle cx="14" cy="5" r=".5"/></g></svg>;
  if (code === "ru") return <svg className="flag-icon" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#1955a6"/><rect y="13.34" width="30" height="6.66" fill="#d52b1e"/></svg>;
  return <svg className="flag-icon" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#21468b"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#cf142b" strokeWidth="2"/><path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6"/><path d="M15 0v20M0 10h30" stroke="#cf142b" strokeWidth="3.5"/></svg>;
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const current = options.find(item => item.code === locale)!;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function select(code: Locale) {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    window.location.reload();
  }

  return (
    <div 
      className="language-switcher" 
      ref={ref}
      onKeyDown={(e) => {
        if (!open) {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
            setFocusedIndex(options.findIndex(o => o.code === locale));
          }
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % options.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (focusedIndex >= 0) {
            select(options[focusedIndex].code);
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        } else if (e.key === "Tab") {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        className="language-trigger"
        onClick={() => {
          if (!open) setFocusedIndex(options.findIndex(o => o.code === locale));
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="language-menu-options"
        type="button"
      >
        <Flag code={locale}/>
        <strong>{current.short}</strong>
        <ChevronDown className="lang-chevron" aria-hidden="true"/>
      </button>
      {open && (
        <div id="language-menu-options" className="language-menu" role="menu" aria-activedescendant={focusedIndex >= 0 ? `lang-option-${options[focusedIndex].code}` : undefined}>
          {options.map((item, index) => {
            const isSelected = item.code === locale;
            const isFocused = index === focusedIndex;
            return (
              <button
                key={item.code}
                id={`lang-option-${item.code}`}
                role="menuitem"
                type="button"
                className={`${isSelected ? "active" : ""} ${isFocused ? "focused" : ""}`}
                onClick={() => select(item.code)}
              >
                <div className="lang-option-left">
                  <Flag code={item.code}/>
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check size={16} className="lang-check"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

