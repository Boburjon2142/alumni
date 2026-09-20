"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  X,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  deleteAdminFeedback,
  getAdminFeedback,
  updateAdminFeedbackStatus,
} from "@/lib/api";
import type { AdminFeedbackItem } from "@/types/admin";

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<AdminFeedbackItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<AdminFeedbackItem | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      const res = await getAdminFeedback(params.toString());
      setFeedbackList(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchFeedback, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  const handleUpdateStatus = async (id: number, newStatus: "new" | "reviewing" | "resolved" | "spam") => {
    try {
      setActionLoading(id);
      await updateAdminFeedbackStatus(id, newStatus);
      await fetchFeedback();
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || "Holatni o‘zgartirib bo‘lmadi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu murojaatni o‘chirmoqchimisiz?")) return;
    try {
      setActionLoading(id);
      await deleteAdminFeedback(id);
      if (selectedItem?.id === id) setSelectedItem(null);
      await fetchFeedback();
    } catch (err: any) {
      alert(err.message || "O‘chirishda xatolik");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Foydalanuvchilar Murojaatlari va Takliflar
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Sayt orqali yuborilgan takliflar, savollar, xatolik xabarlari va qo‘shimcha ma’lumotlar
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="admin-search-box">
            <Search />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, aloqa yoki xabar matni..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="">Barcha holatlar</option>
            <option value="new">Yangi (Ko‘rilmagan)</option>
            <option value="reviewing">Ko‘rib chiqilmoqda</option>
            <option value="resolved">Hal qilingan</option>
            <option value="spam">Spam</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="">Barcha turlar</option>
            <option value="proposal">Taklif</option>
            <option value="question">Savol</option>
            <option value="error_report">Ma’lumotdagi xato</option>
            <option value="additional_info">Qo‘shimcha ma’lumot</option>
            <option value="other">Boshqa</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
          Jami: <strong className="text-slate-800">{totalCount}</strong> ta murojaat
        </div>
      </div>

      {/* Messages Table */}
      {/* Messages Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "200px" }}>Yuboruvchi & Aloqa</th>
                <th style={{ minWidth: "140px" }}>Turi</th>
                <th style={{ minWidth: "280px" }}>Xabar Matni</th>
                <th style={{ minWidth: "130px" }}>Sana</th>
                <th style={{ minWidth: "150px" }}>Holat</th>
                <th style={{ minWidth: "110px", textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D1667]" />
                    Murojaatlar yuklanmoqda...
                  </td>
                </tr>
              ) : feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Murojaatlar topilmadi.
                  </td>
                </tr>
              ) : (
                feedbackList.map((f) => (
                  <tr
                    key={f.id}
                    className={`cursor-pointer ${
                      f.status === "new" ? "bg-purple-50/20 font-medium" : ""
                    }`}
                    onClick={() => setSelectedItem(f)}
                  >
                    <td>
                      <div className="font-bold text-slate-900 text-sm">{f.name || "Anonim"}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{f.contact || "Aloqa kiritilmagan"}</div>
                    </td>

                    <td>
                      <span className="admin-badge admin-badge-slate font-semibold">
                        {f.type_display}
                      </span>
                    </td>

                    <td className="max-w-sm">
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{f.message}</p>
                    </td>

                    <td className="whitespace-nowrap text-slate-500 text-xs">
                      {new Date(f.created_at).toLocaleDateString("uz-UZ", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={f.status}
                        onChange={(e) => handleUpdateStatus(f.id, e.target.value as any)}
                        disabled={actionLoading === f.id}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                          f.status === "new"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : f.status === "reviewing"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : f.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        <option value="new">Yangi</option>
                        <option value="reviewing">Ko‘rib chiqilmoqda</option>
                        <option value="resolved">Hal qilindi</option>
                        <option value="spam">Spam</option>
                      </select>
                    </td>

                    <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <div className="admin-actions-group justify-end">
                        <button
                          onClick={() => setSelectedItem(f)}
                          className="admin-action-icon-btn"
                          title="Batafsil ko‘rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          disabled={actionLoading === f.id}
                          className="admin-action-icon-btn btn-delete"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#0D1667]" />
                <h3 className="font-bold text-slate-900 text-base">Murojaat Tafsilotlari</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 block mb-0.5">Yuboruvchi:</span>
                  <strong className="text-slate-900 text-sm">{selectedItem.name || "Anonim"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Aloqa:</span>
                  <strong className="text-slate-900 text-sm">{selectedItem.contact || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Murojaat turi:</span>
                  <span className="font-semibold text-purple-700">{selectedItem.type_display}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Yuborilgan vaqti:</span>
                  <span className="text-slate-700">
                    {new Date(selectedItem.created_at).toLocaleString("uz-UZ")}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Xabar Matni:</span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
                  {selectedItem.message}
                </div>
              </div>

              {selectedItem.page_url && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Tegishli sahifa:</span>
                  <a
                    href={selectedItem.page_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0D1667] hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>{selectedItem.page_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Holatni o‘zgartirish:</span>
                  <select
                    value={selectedItem.status}
                    onChange={(e) => handleUpdateStatus(selectedItem.id, e.target.value as any)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="new">Yangi</option>
                    <option value="reviewing">Ko‘rib chiqilmoqda</option>
                    <option value="resolved">Hal qilindi</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-[#0D1667] text-white rounded-xl font-bold"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

