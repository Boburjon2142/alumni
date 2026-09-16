"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Briefcase, Users, Building2, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
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
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D38E4F] mb-1">
            <Award className="w-4 h-4" />
            <span>{t.impactTopContributors}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-serif">
            {t.impactTopContributors}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topContributors.map((entry) => {
          const rank = entry.rank;
          const DominantIcon = categoryIcons[entry.top_category] || ShieldCheck;
          const dominantLabel = categoryLabels[entry.top_category] || entry.top_category;
          
          const rankStyles =
            rank === 1
              ? "border-[#D38E4F]/40 bg-gradient-to-b from-[#D38E4F]/5 via-white to-white dark:from-[#D38E4F]/10 dark:via-slate-800 dark:to-slate-800 ring-1 ring-[#D38E4F]/20"
              : rank === 2
              ? "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800";

          const rankBadgeStyle =
            rank === 1
              ? "bg-[#D38E4F] text-white"
              : rank === 2
              ? "bg-slate-600 text-white"
              : "bg-amber-700 text-white";

          const avatarUrl = entry.alumni.avatar || entry.alumni.image_url;

          return (
            <div
              key={entry.alumni.id}
              className={`relative rounded-2xl p-6 border ${rankStyles} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                {/* Header: Rank + Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-sm ${rankBadgeStyle}`}>
                    #{rank}
                  </span>

                  {entry.top_badge && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#612175]/10 dark:bg-[#612175]/30 text-[#612175] dark:text-purple-300 border border-[#612175]/20">
                      <span>{entry.top_badge.icon}</span>
                      <span className="truncate max-w-[120px]">{entry.top_badge.title_uz}</span>
                    </span>
                  )}
                </div>

                {/* Alumni Identity */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={entry.alumni.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                        {entry.alumni.full_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/alumni/${entry.alumni.slug}`}
                      className="font-bold text-slate-900 dark:text-white text-base hover:text-[#0D1667] dark:hover:text-[#D38E4F] transition-colors truncate block"
                    >
                      {entry.alumni.full_name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {entry.alumni.position || entry.alumni.faculty || `${entry.alumni.graduation_year}-yil bitiruvchisi`}
                    </p>
                    {entry.alumni.current_company && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {entry.alumni.current_company}
                      </p>
                    )}
                  </div>
                </div>

                {/* Impact Category & Score */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-100 dark:border-slate-700/50 mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <DominantIcon className="w-3.5 h-3.5 text-[#0D1667] dark:text-[#D38E4F]" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{dominantLabel}</span>
                    </span>
                    <span className="font-bold text-[#0D1667] dark:text-[#D38E4F] text-sm">
                      {entry.total_score} ball
                    </span>
                  </div>

                  {/* Micro Breakdown Bars */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <div className="text-center" title={`${t.impactCareer}: ${entry.category_breakdown.career} ball`}>
                      <div className="h-1.5 rounded-full bg-indigo-500" style={{ opacity: Math.max(0.2, entry.category_breakdown.career / (entry.total_score || 1)) }} />
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{entry.category_breakdown.career}</span>
                    </div>
                    <div className="text-center" title={`${t.impactMentorship}: ${entry.category_breakdown.mentorship} ball`}>
                      <div className="h-1.5 rounded-full bg-purple-500" style={{ opacity: Math.max(0.2, entry.category_breakdown.mentorship / (entry.total_score || 1)) }} />
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{entry.category_breakdown.mentorship}</span>
                    </div>
                    <div className="text-center" title={`${t.impactUniversity}: ${entry.category_breakdown.university} ball`}>
                      <div className="h-1.5 rounded-full bg-amber-500" style={{ opacity: Math.max(0.2, entry.category_breakdown.university / (entry.total_score || 1)) }} />
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{entry.category_breakdown.university}</span>
                    </div>
                    <div className="text-center" title={`${t.impactCommunity}: ${entry.category_breakdown.community} ball`}>
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ opacity: Math.max(0.2, entry.category_breakdown.community / (entry.total_score || 1)) }} />
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{entry.category_breakdown.community}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50">
                <span>{entry.verified_contributions_count} {t.impactVerifiedCount}</span>
                <Link
                  href={`/alumni/${entry.alumni.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#0D1667] dark:text-[#D38E4F] hover:underline"
                >
                  <span>Profil</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
