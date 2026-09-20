"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

const labels: Record<Locale, string> = {
  uz: "Yuqoriga qaytish",
  ru: "Вернуться наверх",
  en: "Back to top",
};

export function BackToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 420);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function goToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? "visible" : ""}`}
      onClick={goToTop}
      aria-label={labels[locale]}
      title={labels[locale]}
    >
      <ChevronUp aria-hidden="true" />
      <span>TOP</span>
    </button>
  );
}
