"use client";

import React from "react";
import { FileText, PlusCircle, ShieldCheck } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { AuthModal } from "@/components/auth/auth-modal";
import styles from "@/app/impact/impact.module.css";

interface ImpactHeaderProps {
  t: Dictionary;
  locale?: Locale;
  isAuthenticated?: boolean;
  onOpenSubmitModal?: () => void;
}

export function ImpactHeader({
  t,
  locale = "uz",
  isAuthenticated = false,
  onOpenSubmitModal,
}: ImpactHeaderProps) {
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
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className={styles.primaryBtn}
          >
            <PlusCircle size={16} />
            <span>{t.impactSubmitCta}</span>
          </button>
        ) : (
          <AuthModal
            locale={locale}
            t={t}
            trigger={
              <button
                type="button"
                className={styles.primaryBtn}
              >
                <PlusCircle size={16} />
                <span>{t.impactSubmitCta}</span>
              </button>
            }
          />
        )}

        <a
          href="/documents/qardu-bitiruvchilar-mukofotlari.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondaryBtn}
        >
          <FileText size={15} color="#667085" />
          <span>{t.impactRegulationBtn || "Nizom bilan tanishish"}</span>
        </a>
      </div>
    </div>
  );
}
