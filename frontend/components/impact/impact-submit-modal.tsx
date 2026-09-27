"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Send, CheckCircle2, AlertCircle, Sparkles, LogIn, UserCheck } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { ImpactCategory, ImpactContributionPayload } from "@/types/alumni";
import { submitContribution } from "@/lib/api";
import { AuthModal } from "@/components/auth/auth-modal";

interface ImpactSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: Dictionary;
  locale?: Locale;
  isAuthenticated?: boolean;
  onSubmitted?: () => void;
}

export function ImpactSubmitModal({
  isOpen,
  onClose,
  t,
  locale = "uz",
  isAuthenticated = false,
  onSubmitted,
}: ImpactSubmitModalProps) {
  const [category, setCategory] = useState<ImpactCategory>("career");
  const [actionType, setActionType] = useState<string>("hiring_alumni");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateOccurred, setDateOccurred] = useState(() => new Date().toISOString().split("T")[0]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [financialAmount, setFinancialAmount] = useState("");
  const [supportingNotes, setSupportingNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const actionTypeOptions: Record<ImpactCategory, { value: string; label: string }[]> = {
    career: [
      { value: "hiring_alumni", label: "Talaba yoki bitiruvchini ishga qabul qilish" },
      { value: "student_internship", label: "Talaba uchun amaliyot o‘tashni tashkil etish" },
      { value: "placement_confirmed", label: "Kasbiy yo‘naltirish orqali ishga joylashtirish" },
    ],
    mentorship: [
      { value: "mentorship_completed", label: "Talaba yoki yosh mutaxassisga to‘liq mentorlik" },
      { value: "mentee_outcome_verified", label: "Mentining loyihasi yoki ish natijasi tasdiqlanishi" },
      { value: "portfolio_review", label: "Portfolio va rezyume tahlili" },
    ],
    university: [
      { value: "institutional_grant", label: "Universitetga grant, stipendiya yoki laboratoriya ko‘magi" },
      { value: "equipment_support", label: "O‘quv va texnik jihozlar bilan ta’minlash" },
      { value: "curriculum_advisory", label: "O‘quv dasturini takomillashtirishda ekspertiza" },
    ],
    community: [
      { value: "event_speaker", label: "Universitetda spiker yoki mehmon sifatida ma’ruza" },
      { value: "masterclass_organized", label: "Amaliy master-klass yoki workshop o‘tkazish" },
      { value: "community_initiative", label: "Bitiruvchilar hamjamiyati tashabbusi" },
    ],
  };

  const handleCategoryChange = (cat: ImpactCategory) => {
    setCategory(cat);
    const defaults = actionTypeOptions[cat];
    if (defaults && defaults.length > 0) {
      setActionType(defaults[0].value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: ImpactContributionPayload = {
      category,
      action_type: actionType,
      title: title.trim(),
      description: description.trim(),
      date_occurred: dateOccurred,
      evidence_url: evidenceUrl.trim() || undefined,
      financial_amount: financialAmount ? parseFloat(financialAmount) : undefined,
      supporting_notes: supportingNotes.trim() || undefined,
    };

    try {
      await submitContribution(payload);
      setSuccess(true);
      if (onSubmitted) onSubmitted();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D1667] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#D38E4F]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t.impactSubmitModalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Moderator tekshiruvidan so‘ng hissa ballari hisoblanadi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isAuthenticated ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#0D1667] dark:text-indigo-300 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/50">
                <LogIn className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {t.impactLoginRequired || "Tashabbus haqida xabar berish uchun akkauntga kiring"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.impactLoginRequiredDesc || "Universitetga qo‘shgan hissangiz yoki tashabbusingiz moderatsiyadan o‘tishi va profilingizga hisoblanishi uchun platformaga kiring."}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center max-w-xs mx-auto">
                <AuthModal
                  locale={locale}
                  t={t}
                  trigger={
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0D1667] hover:bg-[#1a237e] text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{t.impactSignInBtn || "Akkauntga kirish"}</span>
                    </button>
                  }
                />
                <Link
                  href="/join"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.impactRegisterBtn || "Ro‘yxatdan o‘tish"}</span>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                Muvaffaqiyatli yuborildi!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {t.impactSubmitSuccess}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Yo‘nalish
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["career", "mentorship", "university", "community"] as ImpactCategory[]).map((cat) => {
                    const labels: Record<ImpactCategory, string> = {
                      career: t.impactCareer,
                      mentorship: t.impactMentorship,
                      university: t.impactUniversity,
                      community: t.impactCommunity,
                    };
                    const isSel = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                          isSel
                            ? "bg-[#0D1667] text-white border-[#0D1667] shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Amal turi
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0D1667]/20 focus:border-[#0D1667]"
                >
                  {actionTypeOptions[category].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Sarlavha / Qisqacha nom
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: 3 nafar talabani amaliyotga qabul qilish"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0D1667]/20 focus:border-[#0D1667]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Batafsil ma’lumot
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Amal qachon, qanday amalga oshirildi va qanday natijaga erishildi..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0D1667]/20 focus:border-[#0D1667]"
                />
              </div>

              {/* Date & Evidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Amal sanasi
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOccurred}
                    onChange={(e) => setDateOccurred(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0D1667]/20 focus:border-[#0D1667]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Havola / Isbot (ixtiyoriy)
                  </label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0D1667]/20 focus:border-[#0D1667]"
                  />
                </div>
              </div>

              {category === "university" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Ko‘mak miqdori (UZS, faqat ichki hisob uchun)
                  </label>
                  <input
                    type="number"
                    value={financialAmount}
                    onChange={(e) => setFinancialAmount(e.target.value)}
                    placeholder="Masalan: 5000000"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0D1667]/20 focus:border-[#0D1667]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Summa ochiq profilda ko‘rsatilmaydi, faqat toifali ball ajratishda ishlatiladi.
                  </span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0D1667] hover:bg-[#1a237e] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <span>Yuborilmoqda...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Tasdiqlashga yuborish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
