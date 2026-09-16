"use client";

import React from "react";
import { Award, PlusCircle, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

interface ImpactHeaderProps {
  t: Dictionary;
  onOpenSubmitModal?: () => void;
}

export function ImpactHeader({ t, onOpenSubmitModal }: ImpactHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1667] via-[#1a237e] to-[#612175] text-white p-8 md:p-12 shadow-xl border border-white/10 mb-8">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-[#892376]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-[#D38E4F]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-white/90 mb-4">
          <ShieldCheck className="w-4 h-4 text-[#D38E4F]" />
          <span>{t.impactTitle}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-serif">
          {t.impactTitle}
        </h1>

        <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mb-8">
          {t.impactSubtitle}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {onOpenSubmitModal && (
            <button
              onClick={onOpenSubmitModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D38E4F] to-[#B25567] hover:from-[#c27f42] hover:to-[#a04859] text-white font-semibold text-sm shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.impactSubmitCta}</span>
            </button>
          )}

          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-medium text-sm border border-white/15 backdrop-blur-sm transition-all duration-200"
          >
            <Award className="w-4 h-4 text-[#D38E4F]" />
            <span>{t.impactHowItWorksTitle}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
