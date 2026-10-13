import type { Alumni } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { AlumniCard } from "./alumni-card";
import styles from "./alumni-card.module.css";

export function AlumniCardGrid({ alumni, locale, fullWidth = false, horizontal = false }: { alumni: Alumni[]; locale: Locale; fullWidth?: boolean; horizontal?: boolean }) {
  const sizes = horizontal ? "(max-width: 599px) 120px, 190px" : fullWidth ? "(max-width: 599px) 100vw, (max-width: 899px) 50vw, (max-width: 1199px) 33vw, (max-width: 1799px) 25vw, 420px" : undefined;
  return (
    <div className={`${styles.grid}${fullWidth ? ` ${styles.fluid}` : ""}${horizontal ? ` ${styles.horizontalGrid}` : ""}`}>
      {alumni.map(item => <AlumniCard key={item.id} alumni={item} locale={locale} sizes={sizes} horizontal={horizontal} />)}
    </div>
  );
}
