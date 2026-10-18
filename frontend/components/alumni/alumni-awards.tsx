"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { getRecognitionTitle, type Locale } from "@/lib/i18n";
import { recognitionAssets } from "@/lib/recognition-assets";
import styles from "./alumni-awards.module.css";
import type { Recognition } from "@/types/alumni";
import { RecognitionIcon } from "./recognition-icon";
import { RecognitionArtwork } from "./recognition-artwork";

export function AlumniAwards({ awards, honors, locale }: { awards: string[]; honors?: Recognition[]; locale: Locale }) {
  const tooltipId = useId();
  const [failed, setFailed] = useState<string[]>([]);
  if (honors) {
    const unique = honors.filter((h, i) => honors.findIndex(other => other.slug === h.slug) === i).slice(0, 5);
    if (!unique.length) return null;
    return <div className={styles.awards}>{unique.map(honor => {
      const title = getRecognitionTitle(honor.slug, locale, honor.name);
      const src = recognitionAssets[honor.slug];
      return <Link key={honor.slug} href="/impact" className={styles.target} aria-label={title} aria-describedby={`${tooltipId}-${honor.slug}`}>
        {src && !failed.includes(src) ? <RecognitionArtwork src={src} sizes="40px" alt={title} width={40} height={40} className={styles.award}
          onError={() => setFailed(previous => [...previous, src])} /> : <span className={`${styles.award} ${styles.symbol}`}><RecognitionIcon icon={honor.symbol_name || honor.icon} size={24} /></span>}
        <span id={`${tooltipId}-${honor.slug}`} role="tooltip" className={styles.tooltip}>{title}</span>
      </Link>;
    })}</div>;
  }
  const visible = [...new Set(awards)].filter(file =>
    !failed.includes(file) && Object.values(recognitionAssets).includes(`/recognitions/${file}`)
  ).slice(0, 5);
  if (!visible.length) return null;
  return <div className={styles.awards}>
    {visible.map(file => {
      const slug = Object.keys(recognitionAssets).find(key => recognitionAssets[key] === `/recognitions/${file}`)!;
      const title = getRecognitionTitle(slug, locale);
      return <Link key={file} href="/impact" className={styles.target} aria-label={title} aria-describedby={`${tooltipId}-${slug}`}>
        <RecognitionArtwork src={`/recognitions/${file}`} sizes="40px" alt={title}
        width={40} height={40} className={styles.award}
        onError={() => setFailed(previous => [...previous, file])} />
        <span id={`${tooltipId}-${slug}`} role="tooltip" className={styles.tooltip}>{title}</span>
      </Link>;
    })}
  </div>;
}
