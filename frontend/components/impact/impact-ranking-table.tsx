"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Briefcase, Users, Building2, Sparkles } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { ImpactRankingEntry } from "@/types/alumni";
import styles from "@/app/impact/impact.module.css";

interface ImpactRankingTableProps {
  t: Dictionary;
  entries: ImpactRankingEntry[];
}

export function ImpactRankingTable({ t, entries }: ImpactRankingTableProps) {
  const categoryIcons: Record<string, any> = {
    career: Briefcase,
    mentorship: Users,
    university: Building2,
    community: Sparkles,
  };

  const categoryLabels: Record<string, string> = {
    career: t.impactCareer,
    mentorship: t.impactMentorship,
    university: t.impactUniversity,
    community: t.impactCommunity,
  };

  if (!entries || entries.length === 0) {
    return (
      <div className={styles.rankingsCard}>
        <div className={styles.emptyState}>
          <ShieldCheck size={36} color="#98A2B3" style={{ margin: "0 auto" }} />
          <h3 className={styles.emptyStateTitle}>{t.impactEmptyRankings}</h3>
          <p className={styles.emptyStateSub}>{t.impactEmptyRankingsSub}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rankingsCard}>
      <div className={styles.rankingsHeader}>
        <h3 className={styles.rankingsTitle}>{t.impactFullList}</h3>
        <span className={styles.rankingsCount}>
          Jami: {entries.length} nafar bitiruvchi
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.rankingTable}>
          <thead>
            <tr>
              <th>Bitiruvchi</th>
              <th>Bitiruv yili</th>
              <th>E’tirof</th>
              <th style={{ width: "90px", textAlign: "center" }}></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const avatarUrl = entry.alumni.avatar || entry.alumni.image_url;
              const DominantIcon = categoryIcons[entry.top_category] || ShieldCheck;
              const dominantLabel = categoryLabels[entry.top_category] || entry.top_category;

              return (
                <tr key={entry.alumni.id}>
                  {/* Alumni Info */}
                  <td>
                    <div className={styles.alumniCell}>
                      <div className={styles.alumniAvatar}>
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={entry.alumni.full_name}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <span>{entry.alumni.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/alumni/${entry.alumni.slug}`}
                          className={styles.alumniName}
                        >
                          {entry.alumni.full_name}
                        </Link>
                        {entry.alumni.position && (
                          <span className={styles.alumniRole}>
                            {entry.alumni.position}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Faculty & Year */}
                  <td>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#182037" }}>
                      {entry.alumni.faculty || "QarDU"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#667085" }}>
                      {entry.alumni.graduation_year}-yil bitiruvchisi
                    </div>
                  </td>

                  {/* Dominant Category */}
                  <td>
                    <span className={styles.catBadge}>
                      <DominantIcon size={13} color="#1A247E" />
                      <span>{dominantLabel}</span>
                    </span>
                  </td>

                  {/* Profile Link */}
                  <td style={{ textAlign: "center" }}>
                    <Link
                      href={`/alumni/${entry.alumni.slug}`}
                      className={styles.profileLinkBtn}
                      aria-label={`${entry.alumni.full_name} profilini ko‘rish`}
                    >
                      <span>Profil</span>
                      <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
