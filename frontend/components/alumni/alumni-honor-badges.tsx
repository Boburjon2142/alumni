"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Award, BadgeCheck, Medal, Star } from "lucide-react";
import { getRecognitionTitle, type Locale } from "@/lib/i18n";
import type { Recognition } from "@/types/alumni";
import styles from "./alumni-card.module.css";

export function AlumniHonorBadge({ honor, locale }: { honor: Recognition; locale: Locale }) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const title = getRecognitionTitle(honor.slug, locale, honor.name);
  const icon = honor.symbol_name || honor.icon;
  const Icon = icon === "star" ? Star : icon === "badge-check" ? BadgeCheck : icon?.includes("medal") ? Medal : Award;
  return (
    <Link href="/impact" className={styles.honorTarget} tabIndex={0} aria-label={title} aria-describedby={tooltipId}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onMouseEnter={() => setOpen(true)} onMouseLeave={event => { if (document.activeElement !== event.currentTarget) setOpen(false); }}
      onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
      <span className={styles.badge}><Icon size={19} aria-hidden="true" /></span>
      <span id={tooltipId} role="tooltip" className={styles.tooltip} data-open={open}>{title}</span>
    </Link>
  );
}

export function AlumniHonorBadges({ honors, locale }: { honors: Recognition[]; locale: Locale }) {
  const visible = [...honors]
    .filter(honor => honor.is_active !== false && (!honor.status || honor.status === "approved"))
    .sort((a, b) => {
      const dateValue = (honor: Recognition) => {
        const value = Date.parse(honor.awarded_at || (honor.year ? `${honor.year}-01-01` : ""));
        return Number.isNaN(value) ? 0 : value;
      };
      return dateValue(b) - dateValue(a) || (b.assignment_id ?? b.id) - (a.assignment_id ?? a.id);
    })
    .slice(0, 1);
  if (!visible.length) return null;
  return <div className={styles.honors}>{visible.map(honor => <AlumniHonorBadge key={honor.assignment_id ?? honor.id} honor={honor} locale={locale} />)}</div>;
}
