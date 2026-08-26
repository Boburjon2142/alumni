"use client";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
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
  const current = options.find(item => item.code === locale)!;
  function select(code: Locale) {
    document.cookie = `locale=${code};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    window.location.reload();
  }
  return <div className="language-switcher">
    <button className="language-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"><Flag code={locale}/><strong>{current.short}</strong><ChevronDown/></button>
    {open && <div className="language-menu" role="menu">{options.map(item => <button key={item.code} role="menuitem" className={item.code===locale?"active":""} onClick={() => select(item.code)}><Flag code={item.code}/><span>{item.label}</span>{item.code===locale&&<Check/>}</button>)}</div>}
  </div>;
}
