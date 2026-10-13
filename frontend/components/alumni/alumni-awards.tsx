"use client";

import { useState } from "react";
import { getRecognitionTitle, type Locale } from "@/lib/i18n";
import { recognitionAssets } from "@/lib/recognition-assets";
import styles from "./alumni-awards.module.css";

export function AlumniAwards({ awards, locale }: { awards: string[]; locale: Locale }) {
  const [failed, setFailed] = useState<string[]>([]);
  const visible = [...new Set(awards)].filter(file =>
    !failed.includes(file) && Object.values(recognitionAssets).includes(`/recognitions/${file}`)
  ).slice(0, 5);
  if (!visible.length) return null;
  return <div className={styles.awards}>
    {visible.map(file => {
      const slug = Object.keys(recognitionAssets).find(key => recognitionAssets[key] === `/recognitions/${file}`)!;
      const title = getRecognitionTitle(slug, locale);
      return <img key={file} src={`/recognitions/${file}`} alt={title} title={title}
        width={40} height={40} className={styles.award}
        onError={() => setFailed(previous => [...previous, file])} />;
    })}
  </div>;
}
