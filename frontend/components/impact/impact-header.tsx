"use client";

import React from "react";
import { HelpCircle, PlusCircle, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import styles from "@/app/impact/impact.module.css";

interface ImpactHeaderProps {
  t: Dictionary;
  onOpenSubmitModal?: () => void;
}

export function ImpactHeader({ t, onOpenSubmitModal }: ImpactHeaderProps) {
  return (
    <div className={styles.headerCard}>
      <div className={styles.headerLeft}>
        <div className={styles.headerBadge}>
          <ShieldCheck size={14} color="#D38E4F" />
          <span>{t.brand || "Qarshi davlat universiteti"}</span>
        </div>

        <h1 className={styles.headerTitle}>{t.impactTitle}</h1>

        <p className={styles.headerSubtitle}>{t.impactSubtitle}</p>
      </div>

      <div className={styles.headerActions}>
        {onOpenSubmitModal && (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className={styles.primaryBtn}
          >
            <PlusCircle size={16} />
            <span>{t.impactSubmitCta}</span>
          </button>
        )}

        <a href="#how-it-works" className={styles.secondaryBtn}>
          <HelpCircle size={15} color="#667085" />
          <span>{t.impactHowItWorksTitle}</span>
        </a>
      </div>
    </div>
  );
}
