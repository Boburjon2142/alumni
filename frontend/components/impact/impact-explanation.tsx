"use client";

import React from "react";
import { Briefcase, Users, Building2, Sparkles, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import styles from "@/app/impact/impact.module.css";

interface ImpactExplanationProps {
  t: Dictionary;
}

export function ImpactExplanation({ t }: ImpactExplanationProps) {
  const pillars = [
    {
      icon: Briefcase,
      title: t.impactPillar1Title,
      desc: t.impactPillar1Desc,
    },
    {
      icon: Users,
      title: t.impactPillar2Title,
      desc: t.impactPillar2Desc,
    },
    {
      icon: Building2,
      title: t.impactPillar3Title,
      desc: t.impactPillar3Desc,
    },
    {
      icon: Sparkles,
      title: t.impactPillar4Title,
      desc: t.impactPillar4Desc,
    },
  ];

  return (
    <section id="how-it-works" className={styles.explanationSection}>
      <div className={styles.explanationHeader}>
        <div className={styles.headerBadge}>
          <ShieldCheck size={14} color="#D38E4F" />
          <span>{t.impactHowItWorksTitle}</span>
        </div>
        <h2 className={styles.explanationTitle}>{t.impactHowItWorksTitle}</h2>
        <p className={styles.explanationDesc}>{t.impactHowItWorksDesc}</p>
      </div>

      <div className={styles.pillarsGrid}>
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div key={idx} className={styles.pillarCard}>
              <div className={styles.pillarIconWrapper}>
                <Icon size={18} />
              </div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDesc}>{pillar.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
