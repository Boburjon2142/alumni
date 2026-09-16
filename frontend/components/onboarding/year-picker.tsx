"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export function YearPicker({ id, value, onChange, placeholder, invalid = false }: {
  id: string; value: string; onChange: (value: string) => void; placeholder: string; invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const list = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1955 }, (_, i) => String(currentYear - i)).filter((year) => year.includes(query));
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView?.({ block: "nearest" });
  }, [active, open]);
  const choose = (year: string) => { onChange(year); setOpen(false); setQuery(""); };
  return <div className="year-picker" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(""); }
  }}>
    <div className={`year-picker-control ${open ? "is-open" : ""}`}>
      <input id={id} role="combobox" type="text" inputMode="numeric" autoComplete="off"
        aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-required="true" aria-invalid={invalid}
        aria-activedescendant={open && years[active] ? `${listId}-${years[active]}` : undefined}
        placeholder={placeholder} value={open ? query : value}
        onFocus={() => { setQuery(""); setActive(Math.max(0, years.indexOf(value))); setOpen(true); }}
        onClick={() => { if (!open) { setQuery(""); setOpen(true); } }}
        onChange={(event) => { setQuery(event.target.value.replace(/\D/g, "").slice(0, 4)); setActive(0); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); setQuery(""); }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            setActive((index) => Math.max(0, Math.min(years.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
          }
          if (event.key === "Enter" && open) { event.preventDefault(); if (years[active]) choose(years[active]); }
        }} />
      {open ? <Search size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
    </div>
    {open && <div className="year-picker-panel">
      <div ref={list} id={listId} role="listbox" aria-label={placeholder} className="year-picker-list">
        {years.map((year, index) => <div key={year} id={`${listId}-${year}`} role="option" aria-selected={year === value}
          className={`year-picker-option ${index === active ? "is-active" : ""}`}
          onMouseDown={(event) => event.preventDefault()} onClick={() => choose(year)}>
          <span>{year}</span>{year === value && <Check size={17} aria-hidden="true" />}
        </div>)}
      </div>
      {years.length === 0 && <div className="year-picker-empty" role="status">1956–{currentYear}</div>}
    </div>}
  </div>;
}
