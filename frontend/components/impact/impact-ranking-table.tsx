"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Award, Briefcase, Users, Building2, Sparkles } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { ImpactRankingEntry } from "@/types/alumni";

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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-12 text-center">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
          {t.impactEmptyRankings}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {t.impactEmptyRankingsSub}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white font-serif text-lg">
          {t.impactFullList}
        </h3>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Jami: {entries.length} nafar bitiruvchi
        </span>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-3.5 pl-6 pr-3 w-16 text-center">{t.impactRank}</th>
              <th className="py-3.5 px-4">Bitiruvchi</th>
              <th className="py-3.5 px-4">Fakultet va Bitiruv yili</th>
              <th className="py-3.5 px-4">Asosiy yo‘nalish</th>
              <th className="py-3.5 px-4 text-center">Hissa taqsimoti</th>
              <th className="py-3.5 px-4 text-right">{t.impactScore}</th>
              <th className="py-3.5 pl-4 pr-6 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-sm">
            {entries.map((entry) => {
              const avatarUrl = entry.alumni.avatar || entry.alumni.image_url;
              const DominantIcon = categoryIcons[entry.top_category] || ShieldCheck;
              const dominantLabel = categoryLabels[entry.top_category] || entry.top_category;
              const rank = entry.rank;

              const rankBadgeColor =
                rank === 1
                  ? "bg-[#D38E4F] text-white"
                  : rank === 2
                  ? "bg-slate-500 text-white"
                  : rank === 3
                  ? "bg-amber-700 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";

              return (
                <tr
                  key={entry.alumni.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-4 pl-6 pr-3 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankBadgeColor}`}>
                      {rank}
                    </span>
                  </td>

                  {/* Alumni Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={entry.alumni.full_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                            {entry.alumni.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/alumni/${entry.alumni.slug}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-[#0D1667] dark:hover:text-[#D38E4F] transition-colors truncate block"
                        >
                          {entry.alumni.full_name}
                        </Link>
                        {entry.alumni.position && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {entry.alumni.position} {entry.alumni.current_company ? `(${entry.alumni.current_company})` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Faculty & Year */}
                  <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-medium truncate max-w-[200px]">{entry.alumni.faculty || "QarshiDU"}</p>
                    <p className="text-slate-400">{entry.alumni.graduation_year}-yil</p>
                  </td>

                  {/* Dominant Category */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      <DominantIcon className="w-3.5 h-3.5 text-[#0D1667] dark:text-[#D38E4F]" />
                      <span>{dominantLabel}</span>
                    </span>
                  </td>

                  {/* Score Breakdown Bars */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-mono">
                      <span className="text-indigo-600 dark:text-indigo-400" title={`${t.impactCareer}: ${entry.category_breakdown.career}`}>
                        C:{entry.category_breakdown.career}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">/</span>
                      <span className="text-purple-600 dark:text-purple-400" title={`${t.impactMentorship}: ${entry.category_breakdown.mentorship}`}>
                        M:{entry.category_breakdown.mentorship}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">/</span>
                      <span className="text-amber-600 dark:text-amber-400" title={`${t.impactUniversity}: ${entry.category_breakdown.university}`}>
                        U:{entry.category_breakdown.university}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">/</span>
                      <span className="text-emerald-600 dark:text-emerald-400" title={`${t.impactCommunity}: ${entry.category_breakdown.community}`}>
                        E:{entry.category_breakdown.community}
                      </span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-4 px-4 text-right">
                    <span className="font-extrabold text-[#0D1667] dark:text-[#D38E4F] text-base">
                      {entry.total_score}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">ball</span>
                  </td>

                  {/* Link */}
                  <td className="py-4 pl-4 pr-6 text-center">
                    <Link
                      href={`/alumni/${entry.alumni.slug}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors inline-block"
                      aria-label={`${entry.alumni.full_name} profilini ko‘rish`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View (< 768px) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
        {entries.map((entry) => {
          const avatarUrl = entry.alumni.avatar || entry.alumni.image_url;
          const DominantIcon = categoryIcons[entry.top_category] || ShieldCheck;
          const dominantLabel = categoryLabels[entry.top_category] || entry.top_category;
          const rank = entry.rank;

          return (
            <Link
              key={entry.alumni.id}
              href={`/alumni/${entry.alumni.slug}`}
              className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                  {rank}
                </span>

                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={entry.alumni.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                      {entry.alumni.full_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {entry.alumni.full_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {entry.alumni.graduation_year}-yil • {dominantLabel}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-extrabold text-[#0D1667] dark:text-[#D38E4F] text-sm">
                  {entry.total_score}
                </span>
                <span className="text-[10px] text-slate-400 block">ball</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
