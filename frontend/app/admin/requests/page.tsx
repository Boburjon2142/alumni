"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { actionAdminYearRequest, getAdminYearRequests } from "@/lib/api";
import type { AdminYearRequestItem } from "@/types/admin";

export default function AdminYearRequestsPage() {
  const [requests, setRequests] = useState<AdminYearRequestItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Action Modal
  const [modalItem, setModalItem] = useState<AdminYearRequestItem | null>(null);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await getAdminYearRequests(params.toString());
      setRequests(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      console.error("Failed to load year requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleOpenAction = (item: AdminYearRequestItem, action: "approve" | "reject") => {
    setModalItem(item);
    setModalAction(action);
    setAdminNote("");
    setError("");
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem) return;

    setSaving(true);
    setError("");
    try {
      await actionAdminYearRequest(modalItem.id, modalAction, adminNote.trim());
      setSuccessMsg(`So‘rov muvaffaqiyatli ${modalAction === "approve" ? "tasdiqlandi" : "rad etildi"}.`);
      setModalItem(null);
      await fetchRequests();
    } catch (err: any) {
      setError(err.message || "So‘rovni qayta ishlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Bitiruv Yilini O‘zgartirish So‘rovlari
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Bitiruvchilar tomonidan yuborilgan yillar to‘g‘rilash arizalarini tekshirish va tasdiqlash
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-filter-select sm:w-64"
        >
          <option value="">Barcha so‘rovlar holati</option>
          <option value="pending">Kutilmoqda (Pending)</option>
          <option value="approved">Tasdiqlangan (Approved)</option>
          <option value="rejected">Rad etilgan (Rejected)</option>
        </select>

        <div className="text-xs text-slate-500">
          Jami: <strong className="text-slate-800">{totalCount}</strong> ta so‘rov
        </div>
      </div>

      {/* Requests Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "220px" }}>Bitiruvchi</th>
                <th style={{ minWidth: "160px" }}>Yil O‘zgarishi</th>
                <th style={{ minWidth: "260px" }}>Asos / Sabab</th>
                <th style={{ minWidth: "140px" }}>Holat</th>
                <th style={{ minWidth: "120px" }}>Sana</th>
                <th style={{ minWidth: "180px", textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D1667]" />
                    So‘rovlar yuklanmoqda...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    So‘rovlar mavjud emas.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link
                        href={`/admin/alumni/${r.alumni_slug || r.alumni_id}/edit`}
                        className="font-bold text-slate-900 hover:text-[#0D1667] text-sm block"
                      >
                        {r.alumni_name}
                      </Link>
                    </td>

                    <td className="whitespace-nowrap">
                      <span className="line-through text-slate-400 mr-2 text-xs">
                        {r.old_year || "Tanlanmagan"}
                      </span>
                      &rarr;
                      <span className="font-bold text-[#0D1667] ml-2 text-sm bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {r.requested_year}
                      </span>
                    </td>

                    <td className="max-w-sm">
                      <p className="text-xs text-slate-700 leading-relaxed">{r.reason}</p>
                      {r.admin_note && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          Admin izohi: {r.admin_note}
                        </p>
                      )}
                    </td>

                    <td>
                      <span
                        className={`admin-status-pill ${
                          r.status === "approved"
                            ? "admin-status-approved"
                            : r.status === "rejected"
                            ? "admin-status-rejected"
                            : "admin-status-pending"
                        }`}
                      >
                        <span className="admin-status-dot" />
                        <span>{r.status_display}</span>
                      </span>
                    </td>

                    <td className="text-slate-500 text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString("uz-UZ")}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      {r.status === "pending" ? (
                        <div className="admin-actions-group justify-end">
                          <button
                            onClick={() => handleOpenAction(r, "approve")}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tasdiqlash</span>
                          </button>
                          <button
                            onClick={() => handleOpenAction(r, "reject")}
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

      {/* Approve / Reject Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {modalAction === "approve" ? "So‘rovni Tasdiqlash" : "So‘rovni Rad Etish"}
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
                <p className="font-bold text-slate-900 text-sm">{modalItem.alumni_name}</p>
                <p className="text-slate-600">
                  Bitirgan yili: <strong>{modalItem.requested_year}</strong> ga o‘zgartiriladi.
                </p>
                <p className="text-slate-500 italic mt-1">&ldquo;{modalItem.reason}&rdquo;</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Administrator izohi (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Qaror sababi yoki tasdiq ma’lumotlari..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
              </div>

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

