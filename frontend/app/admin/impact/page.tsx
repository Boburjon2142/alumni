"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Loader2,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  approveAdminContribution,
  getAdminContributions,
  rejectAdminContribution,
} from "@/lib/api";
import type { ImpactContribution } from "@/types/alumni";

const categories = [
  { value: "career", label: "Career Impact" },
  { value: "mentorship", label: "Mentorship Impact" },
  { value: "university", label: "University Contribution" },
  { value: "community", label: "Community Contribution" },
];

export default function AdminImpactPage() {
  const [contributions, setContributions] = useState<ImpactContribution[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Action Modal
  const [modalItem, setModalItem] = useState<ImpactContribution | null>(null);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [verificationNote, setVerificationNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await getAdminContributions(params.toString());
      setContributions(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      console.error("Failed to load contributions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [statusFilter, categoryFilter]);

  const handleOpenAction = (item: ImpactContribution, action: "approve" | "reject") => {
    setModalItem(item);
    setModalAction(action);
    setVerificationNote("");
    setRejectionReason("");
    setError("");
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem) return;

    setSaving(true);
    setError("");
    try {
      if (modalAction === "approve") {
        await approveAdminContribution(modalItem.id, verificationNote.trim());
        setSuccessMsg("Hissa muvaffaqiyatli tasdiqlandi va ballar taqsimlandi.");
      } else {
        if (!rejectionReason.trim()) {
          setError("Iltimos, rad etish sababini yozing.");
          setSaving(false);
          return;
        }
        await rejectAdminContribution(modalItem.id, rejectionReason.trim());
        setSuccessMsg("Hissa arizasi rad etildi.");
      }
      setModalItem(null);
      await fetchContributions();
    } catch (err: any) {
      setError(err.message || "Amalni bajarishda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Bitiruvchilar Hissasi va Ballar Verifikatsiyasi
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Universitetga va talabalarga qo‘shilgan amaliy hissalarni (ishga joylash, mentorlik, grantlar) tekshirish va ball berish
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select sm:w-56"
          >
            <option value="">Barcha holatlar</option>
            <option value="pending">Kutilmoqda (Pending)</option>
            <option value="verified">Tasdiqlangan (Verified)</option>
            <option value="rejected">Rad etilgan (Rejected)</option>
            <option value="revoked">Bekor qilingan (Revoked)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-filter-select sm:w-56"
          >
            <option value="">Barcha yo‘nalishlar</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Jami: <strong className="text-slate-800">{totalCount}</strong> ta hissa arizasi
        </div>
      </div>

      {/* Contributions Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "220px" }}>Hissa Nomi & Yo‘nalishi</th>
                <th style={{ minWidth: "180px" }}>Amal Turi</th>
                <th style={{ minWidth: "140px" }}>Holat</th>
                <th style={{ minWidth: "130px" }}>Berilgan Ball</th>
                <th style={{ minWidth: "120px" }}>Sana</th>
                <th style={{ minWidth: "180px", textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D1667]" />
                    Hissalar yuklanmoqda...
                  </td>
                </tr>
              ) : contributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Hissalar arizasi topilmadi.
                  </td>
                </tr>
              ) : (
                contributions.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <p className="font-bold text-slate-900 text-sm">{c.title}</p>
                      <p className="text-[11px] text-[#612175] font-bold mt-0.5 capitalize">
                        {c.category_display || c.category}
                      </p>
                    </td>

                    <td>
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.action_type}
                      </span>
                      {c.description && (
                        <p className="text-slate-500 text-xs line-clamp-1 mt-1 leading-normal">
                          {c.description}
                        </p>
                      )}
                    </td>

                    <td>
                      <span
                        className={`admin-status-pill ${
                          c.status === "verified"
                            ? "admin-status-approved"
                            : c.status === "rejected"
                            ? "admin-status-rejected"
                            : "admin-status-pending"
                        }`}
                      >
                        <span className="admin-status-dot" />
                        <span>
                          {c.status === "verified"
                            ? "Tasdiqlangan"
                            : c.status === "rejected"
                            ? "Rad etilgan"
                            : "Kutilmoqda"}
                        </span>
                      </span>
                    </td>

                    <td className="whitespace-nowrap font-bold text-emerald-700 text-sm">
                      {c.points_awarded ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-xs font-bold">
                          +{c.points_awarded} ball
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap text-slate-500 text-xs">
                      {c.date_occurred
                        ? new Date(c.date_occurred).toLocaleDateString("uz-UZ")
                        : "—"}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      {c.status === "pending" ? (
                        <div className="admin-actions-group justify-end">
                          <button
                            onClick={() => handleOpenAction(c, "approve")}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tasdiqlash</span>
                          </button>
                          <button
                            onClick={() => handleOpenAction(c, "reject")}
                            className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rad etish</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Ko‘rib chiqilgan</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span>{modalAction === "approve" ? "Hissani Tasdiqlash va Ball Berish" : "Hissani Rad Etish"}</span>
              </h3>
              <button
                onClick={() => setModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 text-sm">{modalItem.title}</p>
                <p className="text-slate-600 capitalize">Yo‘nalish: {modalItem.category}</p>
                {modalItem.description && (
                  <p className="text-slate-500 italic mt-1">&ldquo;{modalItem.description}&rdquo;</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {modalAction === "approve" ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verifikatsiya izohi (ixtiyoriy)
                  </label>
                  <textarea
                    rows={2}
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Masalan: Ma’lumotlar tekshirildi va tasdiqlandi..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rad etish sababi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Iltimos, rad etish sababini batafsil yozing..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
                    modalAction === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalAction === "approve" ? "Tasdiqlash" : "Rad etish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

