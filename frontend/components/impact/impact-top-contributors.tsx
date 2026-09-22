"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, Users, Building2, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { ImpactRankingEntry } from "@/types/alumni";

interface ImpactTopContributorsProps {
  t: Dictionary;
  topContributors: ImpactRankingEntry[];
}

export function ImpactTopContributors({ t, topContributors }: ImpactTopContributorsProps) {
  if (!topContributors || topContributors.length === 0) {
    return null;
  }

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

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {topContributors.map((entry) => {
          const rank = entry.rank;
          const DominantIcon = categoryIcons[entry.top_category] || ShieldCheck;
          const dominantLabel = categoryLabels[entry.top_category] || entry.top_category;
          const avatarUrl = entry.alumni.avatar || entry.alumni.image_url;

          return (
            <div
              key={entry.alumni.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e3e6ef",
                borderRadius: "14px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: rank === 1 ? "#d38e4f" : "#64748b",
                      color: "#ffffff",
                    }}
                  >
                    #{rank}
                  </span>

                  {entry.top_badge && (
                    <span style={{ fontSize: "11.5px", color: "#1a247e", fontWeight: 600 }}>
                      {entry.top_badge.icon} {entry.top_badge.title_uz}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#f1f3f9", flexShrink: 0 }}>
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={entry.alumni.full_name} width={42} height={42} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1a247e" }}>
                        {entry.alumni.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <Link href={`/alumni/${entry.alumni.slug}`} style={{ fontSize: "14px", fontWeight: 700, color: "#182037", textDecoration: "none" }}>
                      {entry.alumni.full_name}
                    </Link>
                    <div style={{ fontSize: "12px", color: "#667085" }}>
                      {entry.alumni.position || entry.alumni.faculty}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #f1f3f9" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a247e" }}>
                  {entry.total_score} ball
                </span>
                <Link href={`/alumni/${entry.alumni.slug}`} style={{ fontSize: "12px", color: "#1a247e", textDecoration: "none", fontWeight: 600 }}>
                  Profil
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
