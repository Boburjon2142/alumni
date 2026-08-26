"use client";

import Link from "next/link";
import { BookOpen, ChevronDown, Lightbulb, Menu, Mic2, Search, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import type { Dictionary, Locale } from "@/lib/i18n";

const storyMenus = {
  uz: [
    ["/stories", "Muvaffaqiyat hikoyalari", "Faxriy bitiruvchilarning yo‘li, burilish nuqtalari va yutuqlari."],
    ["/stories#interviews", "Intervyular", "QarDU tajribasi va talabalar uchun qisqa, samimiy suhbatlar."],
    ["/stories#inspiration", "Talabalar uchun ilhom", "Faxriy bitiruvchilardan amaliy va kasbiy maslahatlar."],
  ],
  ru: [
    ["/stories", "Истории успеха", "Путь, ключевые решения и достижения почётных выпускников."],
    ["/stories#interviews", "Интервью", "Короткие беседы об опыте КарГУ и советах студентам."],
    ["/stories#inspiration", "Вдохновение студентам", "Практические и профессиональные советы выпускников."],
  ],
  en: [
    ["/stories", "Success stories", "The journeys, turning points and achievements of honorary alumni."],
    ["/stories#interviews", "Interviews", "Short conversations about the KarSU experience and advice for students."],
    ["/stories#inspiration", "Student inspiration", "Practical career guidance from honorary alumni."],
  ],
} as const;

const storyIcons = [BookOpen, Mic2, Lightbulb] as const;

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const home = pathname === "/";
  const stories = locale === "en" ? "Stories" : locale === "ru" ? "Истории" : "Hikoyalar";

  return <header className={`site-header ${home ? "home-header" : ""}`}><div className="container nav">
    <Link href="/" className="brand brand-logo" aria-label={`${t.university} bosh sahifa`}><img src="/images/qardu-logo.webp?v=3" alt={`${t.university} logotipi`} width="420" height="120"/></Link>
    <nav className={open ? "nav-links open" : "nav-links"} aria-label="Asosiy navigatsiya">
      <Link href="/directory">{t.navDirectory}</Link>
      <details className="nav-dropdown">
        <summary>{stories}<ChevronDown aria-hidden="true"/></summary>
        <div className="nav-dropdown-panel">
          {storyMenus[locale].map(([href,title,description],index)=>{const Icon=storyIcons[index];return <Link href={href} key={href}><span className="nav-dropdown-icon"><Icon aria-hidden="true"/></span><span><strong>{title}</strong><small>{description}</small></span></Link>})}
        </div>
      </details>
      <Link href="/events">{t.navEvents}</Link>
      <Link href="/#benefits">{t.navAbout}</Link>
      <Link href="/directory" className="nav-search" aria-label={t.search} title={t.search}><Search aria-hidden="true"/></Link>
      <LanguageSwitcher locale={locale}/>
      <Button href="/login" variant="ghost">{t.login}</Button>
      <Button href="/register">{t.join}</Button>
    </nav>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}>{open ? <X/> : <Menu/>}</button>
  </div></header>;
}
