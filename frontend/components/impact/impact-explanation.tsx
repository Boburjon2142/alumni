"use client";

import React from "react";
import { Briefcase, Users, Building2, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

interface ImpactExplanationProps {
  t: Dictionary;
}

export function ImpactExplanation({ t }: ImpactExplanationProps) {
  const pillars = [
    {
      icon: Briefcase,
      title: t.impactPillar1Title,
      desc: t.impactPillar1Desc,
      color: "from-blue-600/10 to-indigo-600/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
      accent: "bg-indigo-600",
    },
    {
      icon: Users,
      title: t.impactPillar2Title,
      desc: t.impactPillar2Desc,
      color: "from-purple-600/10 to-pink-600/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
      accent: "bg-purple-600",
    },
    {
      icon: Building2,
      title: t.impactPillar3Title,
      desc: t.impactPillar3Desc,
      color: "from-amber-600/10 to-orange-600/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      accent: "bg-amber-600",
    },
    {
      icon: Sparkles,
      title: t.impactPillar4Title,
      desc: t.impactPillar4Desc,
      color: "from-emerald-600/10 to-teal-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
      accent: "bg-emerald-600",
    },
  ];

  return (
    <section id="how-it-works" className="mt-12 mb-16 scroll-mt-24">
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#612175] dark:text-[#D38E4F] mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.impactHowItWorksTitle}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-serif">
              {t.impactHowItWorksTitle}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {t.impactHowItWorksDesc}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
              100% Moderatorlar tomonidan tasdiqlangan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl bg-white dark:bg-slate-800/80 p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Bosqich {idx + 1}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Tasdiqlangan amallar</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
