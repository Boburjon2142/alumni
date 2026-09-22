"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Award, Briefcase, Users, Building2, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { ImpactSummary } from "@/types/alumni";
import { getAlumniImpact } from "@/lib/api";

interface AlumniImpactCardProps {
  slug: string;
  t: Dictionary;
  initialData?: ImpactSummary;
}

export function AlumniImpactCard({ slug, t, initialData }: AlumniImpactCardProps) {
  const [impact, setImpact] = useState<ImpactSummary | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    let mounted = true;
    getAlumniImpact(slug)
      .then((res) => {
        if (mounted && res.success) {
          setImpact(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load alumni impact", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug, initialData]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
      </div>
    );
  }

  if (!impact || impact.verified_count === 0) {
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
    <div className="rounded-2xl border border-[#D38E4F]/30 bg-gradient-to-br from-white via-white to-[#D38E4F]/5 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 p-6 md:p-8 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1A247E]/10 text-[#1A247E] border border-[#1A247E]/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D38E4F]" />
            <span>{t.impactTitle || "E’tirof"}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
            {t.impactTitle || "E’tirof"}
          </h3>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Tasdiqlangan amallar</span>
            <span className="text-base font-bold text-[#1A247E]">
              {impact.verified_count} ta hissa
            </span>
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      {impact.achievements && impact.achievements.length > 0 && (
        <div className="py-6 border-b border-slate-100 dark:border-slate-700/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D38E4F]" />
            <span>{t.impactProfileBadges}</span>
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {impact.achievements.map((ach) => (
              <div
                key={ach.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                title={ach.description_uz}
              >
                <span className="text-lg">{ach.icon}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {ach.title_uz}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Contributions List */}
      {impact.recent_contributions && impact.recent_contributions.length > 0 && (
        <div className="pt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t.impactProfileContributions} ({impact.verified_count})</span>
          </h4>
          <div className="space-y-2.5">
            {impact.recent_contributions.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {item.category_display || item.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date_occurred}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                    Tasdiqlangan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
