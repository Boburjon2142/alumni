"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { Alumni } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";
import { AlumniHonorBadges } from "./alumni-honor-badges";
import { AlumniAwards } from "./alumni-awards";
import { getAlumniAwards, getCardRecognitions } from "@/lib/recognition-assets";
import styles from "./alumni-card.module.css";

export function AlumniCard({ alumni, locale, sizes, horizontal = false }: { alumni: Alumni; locale: Locale; sizes?: string; horizontal?: boolean }) {
  const name = alumni.full_name;
  const awards = alumni.awards ?? getAlumniAwards(alumni);
  const honors = getCardRecognitions(alumni);
  const details = locale === "ru" ? "Подробнее" : locale === "en" ? "View profile" : "Batafsil";
  const activity = alumni.current_activity || alumni.position || alumni.current_company;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("");
  const label = locale === "ru" ? `Посмотреть профиль ${name}` : locale === "en" ? `View profile of ${name}` : `${name} profilini ko‘rish`;
  return (
    <article className={`${styles.card}${horizontal ? ` ${styles.horizontalCard}` : ""}`}>
      <div className={styles.media}>
        <RemoteImage
          className={styles.portrait}
          src={alumni.avatar || alumni.image_url}
          slug={alumni.slug}
          alt={alumni.image_alt || name}
          fallback={initials}
          sizes={sizes ?? "(max-width: 599px) 280px, (max-width: 899px) 45vw, (max-width: 1199px) 30vw, 280px"}
        />
        <AlumniHonorBadges honors={honors.slice(0, 1)} locale={locale} />
      </div>
      <div className={styles.info}>
        {horizontal && alumni.graduation_year && <span className={styles.year}>{alumni.graduation_year}{locale === "uz" ? "-yil" : locale === "ru" ? " г." : ""}</span>}
        <h3 className={styles.name}>
          <Link href={`/alumni/${alumni.slug}`} aria-label={label} className={styles.link} title={name}>{name}</Link>
        </h3>
        {horizontal && <AlumniAwards awards={awards} honors={honors} locale={locale} />}
        {horizontal && (
          <>
            {activity && <p className={styles.activity}>{activity}</p>}
            {(alumni.specialty || alumni.faculty) && <p className={styles.faculty}><GraduationCap size={14} aria-hidden="true" />{alumni.specialty || alumni.faculty}</p>}
            <span className={styles.details} aria-hidden="true">{details}<ArrowRight size={14} /></span>
          </>
        )}
      </div>
    </article>
  );
}

export function AlumniCardSkeleton() {
  return <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true"><div className={styles.media} /><div className={styles.info}><span /></div></div>;
}
