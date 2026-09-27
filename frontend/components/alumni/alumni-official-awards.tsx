"use client";

import React, { useState } from "react";
import {
  Award,
  Crown,
  Sparkles,
  ShieldCheck,
  Calendar,
  Info,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { RecognitionIcon } from "./recognition-icon";
import { getRecognitionTitle, type Dictionary, type Locale } from "@/lib/i18n";
import type { Recognition } from "@/types/alumni";

interface Props {
  recognitions: Recognition[];
  locale: Locale;
  t: Dictionary;
}

export function AlumniOfficialAwards({ recognitions, locale, t }: Props) {
  const [activeModalAward, setActiveModalAward] = useState<Recognition | null>(null);

  if (!recognitions || recognitions.length === 0) {
    return null;
  }

  // Sort: Supreme Honor first, then Achievement nominations, University contribution, Traditional status
  const categoryOrder: Record<string, number> = {
    supreme_honor: 1,
    achievement_nomination: 2,
    university_contribution: 3,
    traditional_status: 4,
  };

  const sortedAwards = [...recognitions].sort((a, b) => {
    const catA = categoryOrder[a.category || ""] || 99;
    const catB = categoryOrder[b.category || ""] || 99;
    if (catA !== catB) return catA - catB;
    return (b.year || 0) - (a.year || 0);
  });

  return (
    <section className="profile-section official-awards-section mb-8" aria-labelledby="official-awards-title">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D38E4F]/10 text-[#0D1667] border border-[#D38E4F]/30 mb-2">
            <Award className="w-3.5 h-3.5 text-[#D38E4F]" />
            <span>Rasmiy E’tiroflar</span>
          </div>
          <h2 id="official-awards-title" className="text-xl font-bold text-slate-900 tracking-tight font-serif">
            Mukofot va Faxriy Unvonlar
          </h2>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {recognitions.length} ta e’tirof
        </span>
      </div>

      {/* Awards List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {sortedAwards.map((rec) => {
          const isSupreme = rec.category === "supreme_honor" || rec.slug === "qardu-iftixori";
          const isTermStatus = rec.recognition_type === "term_status" || rec.slug === "qardu-elchisi";
          const localizedName = getRecognitionTitle(rec.slug, locale, rec.name);

          return (
            <div
              key={rec.assignment_id || rec.id || rec.slug}
              onClick={() => setActiveModalAward(rec)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between group ${
                isSupreme
                  ? "bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 border-[#D38E4F] shadow-sm hover:shadow-md ring-1 ring-[#D38E4F]/30"
                  : "bg-white border-slate-200 shadow-sm hover:border-[#D38E4F]/60 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border transition group-hover:scale-105 ${
                      isSupreme
                        ? "bg-[#0D1667] text-[#D38E4F] border-[#D38E4F]"
                        : "bg-slate-50 text-[#0D1667] border-slate-200"
                    }`}
                  >
                    <RecognitionIcon icon={rec.symbol_name || rec.icon} size={20} />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {rec.year && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isSupreme
                            ? "bg-[#0D1667] text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {rec.year}-yil
                      </span>
                    )}
                    {rec.level && (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          rec.level === "gold"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : rec.level === "silver"
                            ? "bg-slate-200 text-slate-800 border border-slate-300"
                            : "bg-orange-100 text-orange-900 border border-orange-300"
                        }`}
                      >
                        {rec.level_display || rec.level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {rec.category_display || (isSupreme ? "Oliy unvon" : "Universitet e’tirofi")}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0D1667] transition">
                    {localizedName}
                  </h3>
                </div>

                {rec.justification ? (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    «{rec.justification}»
                  </p>
                ) : rec.description ? (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {rec.description}
                  </p>
                ) : null}
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                {isTermStatus && rec.valid_until ? (
                  <span className="flex items-center gap-1 text-indigo-700 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Muddati: {rec.valid_until} gacha</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Universitet Kengashi qarori</span>
                  </span>
                )}
                <span className="text-[#0D1667] font-semibold inline-flex items-center gap-0.5 group-hover:underline">
                  Batafsil
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {activeModalAward && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0D1667] text-[#D38E4F] flex items-center justify-center shrink-0 shadow-sm">
                  <RecognitionIcon icon={activeModalAward.symbol_name || activeModalAward.icon} size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {activeModalAward.category_display || "QarDU E’tirofi"}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {getRecognitionTitle(activeModalAward.slug, locale, activeModalAward.name)}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModalAward(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Award metadata badges */}
              <div className="flex flex-wrap gap-2">
                {activeModalAward.year && (
                  <div className="px-3 py-1 bg-slate-100 rounded-xl font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Berilgan yili: {activeModalAward.year}</span>
                  </div>
                )}
                {activeModalAward.level && (
                  <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl font-bold text-amber-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Daraja: {activeModalAward.level_display || activeModalAward.level}</span>
                  </div>
                )}
                {activeModalAward.valid_until && (
                  <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-xl font-bold text-indigo-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Muddati: {activeModalAward.valid_until} gacha</span>
                  </div>
                )}
              </div>

              {/* Justification for this recipient */}
              {activeModalAward.justification && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                  <strong className="block text-slate-900 font-bold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mukofot berilish asosi va laureat xizmatlari:</span>
                  </strong>
                  <p className="text-slate-700 leading-relaxed italic">
                    «{activeModalAward.justification}»
                  </p>
                </div>
              )}

              {/* Official description & eligibility */}
              {activeModalAward.description && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Mukofot haqida:</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {activeModalAward.description}
                  </p>
                </div>
              )}

              {activeModalAward.eligibility_summary && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Nizomdagi baholash mezoni:</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {activeModalAward.eligibility_summary}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalAward(null)}
                className="px-5 py-2 bg-[#0D1667] text-white rounded-xl font-bold text-xs hover:bg-[#1a2580] transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
