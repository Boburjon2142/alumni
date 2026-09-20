"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Award,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { actionAdminAlumni, deleteAdminAlumni, getAdminAlumni, getFaculties } from "@/lib/api";
import { RecognitionIcon } from "@/components/alumni/recognition-icon";
import { getRecognitionTitle } from "@/lib/i18n";
import type { Alumni, Faculty } from "@/types/alumni";

export default function AdminAlumniListPage() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [honoraryFilter, setHonoraryFilter] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (honoraryFilter) params.set("is_honorary", honoraryFilter);
      if (facultyFilter) params.set("faculty", facultyFilter);
      params.set("page", page.toString());

      const data = await getAdminAlumni(params.toString());
      setAlumniList(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err: any) {
      console.error("Failed to load alumni:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFaculties().then(setFaculties).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAlumni();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, statusFilter, honoraryFilter, facultyFilter, page]);

  const handleAction = async (id: number, action: "approve" | "reject" | "toggle_publish" | "toggle_featured" | "set_honorary", data?: any) => {
    try {
      setActionLoading(id);
      await actionAdminAlumni(id, action, data);
      await fetchAlumni();
    } catch (err: any) {
      alert(err.message || "Amalni bajarishda xatolik");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" profilini o‘chirmoqchimisiz? Ushbu amalni ortga qaytarib bo‘lmaydi.`)) {
      return;
    }
    try {
      setActionLoading(id);
      await deleteAdminAlumni(id.toString());
      await fetchAlumni();
    } catch (err: any) {
      alert(err.message || "O‘chirishda xatolik");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Bitiruvchilar Boshqaruvi
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Barcha bitiruvchilar profillari, unvonlar, moderatsiya va nashr holatlari
          </p>
        </div>
        <Link
          href="/admin/alumni/new"
          className="px-4 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D38E4F]" />
          <span>Yangi bitiruvchi qo‘shish</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search */}
          <div className="admin-search-box">
            <Search />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Ism, kompaniya yoki lavozim..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="admin-filter-select"
          >
            <option value="">Barcha moderatsiya holatlari</option>
            <option value="pending">Kutilmoqda (Pending)</option>
            <option value="approved">Tasdiqlangan (Approved)</option>
            <option value="rejected">Rad etilgan (Rejected)</option>
          </select>

          {/* Honorary Filter */}
          <select
            value={honoraryFilter}
            onChange={(e) => {
              setHonoraryFilter(e.target.value);
              setPage(1);
            }}
            className="admin-filter-select"
          >
            <option value="">Barcha toifalar</option>
            <option value="true">Faqat Faxriy bitiruvchilar</option>
            <option value="false">Oddiy bitiruvchilar</option>
          </select>

          {/* Faculty Filter */}
          <select
            value={facultyFilter}
            onChange={(e) => {
              setFacultyFilter(e.target.value);
              setPage(1);
            }}
            className="admin-filter-select"
          >
            <option value="">Barcha fakultetlar</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Jami: <strong className="text-slate-800 font-bold">{totalCount}</strong> ta bitiruvchi topildi
          </span>
          {(search || statusFilter || honoraryFilter || facultyFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setHonoraryFilter("");
                setFacultyFilter("");
                setPage(1);
              }}
              className="text-[#0D1667] font-bold hover:underline transition"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>
      </div>

      {/* Alumni Data Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "240px" }}>Bitiruvchi</th>
                <th style={{ minWidth: "170px" }}>Fakultet & Yil</th>
                <th style={{ minWidth: "180px" }}>Kasbiy Faoliyat</th>
                <th style={{ minWidth: "220px" }}>Faxriy Unvonlar</th>
                <th style={{ minWidth: "150px" }}>Holat</th>
                <th style={{ minWidth: "140px", textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D1667]" />
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : alumniList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Hech qanday bitiruvchi topilmadi.
                  </td>
                </tr>
              ) : (
                alumniList.map((alumnus) => {
                  const hasPhoto = Boolean(alumnus.avatar || alumnus.image_url);
                  return (
                    <tr key={alumnus.id}>
                      {/* Photo & Name */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {hasPhoto ? (
                              <Image
                                src={alumnus.avatar || alumnus.image_url || ""}
                                alt={alumnus.full_name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-[#0D1667] text-sm">
                                {alumnus.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/alumni/${alumnus.slug || alumnus.id}/edit`}
                              className="font-bold text-slate-900 hover:text-[#0D1667] text-sm block leading-tight truncate"
                            >
                              {alumnus.full_name}
                            </Link>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {alumnus.email || "Email kiritilmagan"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Faculty & Year */}
                      <td>
                        <div className="font-semibold text-slate-800 text-xs leading-tight">
                          {alumnus.faculty || "Ko‘rsatilmagan"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Bitirgan: <span className="font-semibold text-slate-600">{alumnus.graduation_year || "Noma’lum"}</span>
                        </div>
                      </td>

                      {/* Job & Company */}
                      <td>
                        <div className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                          {alumnus.position || alumnus.current_activity || "Ko‘rsatilmagan"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5">
                          {alumnus.current_company || alumnus.city || ""}
                        </div>
                      </td>

                      {/* Recognitions */}
                      <td>
                        <div className="admin-badge-list">
                          {alumnus.is_honorary && (
                            <span className="admin-badge admin-badge-gold">
                              <Award className="w-3.5 h-3.5" />
                              <span>Faxriy</span>
                            </span>
                          )}
                          {alumnus.recognitions && alumnus.recognitions.length > 0 ? (
                            alumnus.recognitions.map((r) => (
                              <span
                                key={r.id}
                                className="admin-badge admin-badge-purple"
                                title={r.description || r.name}
                              >
                                <RecognitionIcon icon={r.icon} size={12} className="w-3 h-3 text-[#6b21a8]" />
                                <span>{getRecognitionTitle(r.slug, "uz", r.name)}</span>
                              </span>
                            ))
                          ) : (
                            !alumnus.is_honorary && (
                              <span className="text-[11px] text-slate-400 italic">Unvonlar yo‘q</span>
                            )
                          )}
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td>
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`admin-status-pill ${
                              alumnus.approval_status === "approved"
                                ? "admin-status-approved"
                                : alumnus.approval_status === "rejected"
                                ? "admin-status-rejected"
                                : "admin-status-pending"
                            }`}
                          >
                            <span className="admin-status-dot" />
                            <span>
                              {alumnus.approval_status === "approved"
                                ? "Tasdiqlangan"
                                : alumnus.approval_status === "rejected"
                                ? "Rad etilgan"
                                : "Kutilmoqda"}
                            </span>
                          </span>
                          {alumnus.is_featured && (
                            <span className="admin-status-featured">
                              <Sparkles className="w-3 h-3" />
                              <span>Tavsiya etilgan</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-actions-group justify-end">
                          {alumnus.approval_status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(alumnus.id, "approve")}
                                disabled={actionLoading === alumnus.id}
                                className="admin-action-icon-btn btn-approve"
                                title="Profilni tasdiqlash"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(alumnus.id, "reject")}
                                disabled={actionLoading === alumnus.id}
                                className="admin-action-icon-btn btn-reject"
                                title="Rad etish"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              handleAction(alumnus.id, "set_honorary", {
                                is_honorary: !alumnus.is_honorary,
                              })
                            }
                            disabled={actionLoading === alumnus.id}
                            className={`admin-action-icon-btn btn-honorary ${
                              alumnus.is_honorary ? "active" : ""
                            }`}
                            title={alumnus.is_honorary ? "Faxriy maqomini bekor qilish" : "Faxriy unvoni berish"}
                          >
                            <Award className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/admin/alumni/${alumnus.slug || alumnus.id}/edit`}
                            className="admin-action-icon-btn"
                            title="Tahrirlash"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(alumnus.id, alumnus.full_name)}
                            disabled={actionLoading === alumnus.id}
                            className="admin-action-icon-btn btn-delete"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 20 && (
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="font-medium">
              Jami <strong>{totalCount}</strong> ta bitiruvchidan <strong>{Math.min((page - 1) * 20 + 1, totalCount)} - {Math.min(page * 20, totalCount)}</strong> oralig‘i ko‘rsatilmoqda
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Oldingi</span>
              </button>
              <span className="px-3 py-1 font-bold text-slate-900 bg-white border border-slate-200 rounded-xl">
                {page} / {Math.ceil(totalCount / 20) || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / 20) || 1, p + 1))}
                disabled={page >= Math.ceil(totalCount / 20) || loading}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex items-center gap-1 text-xs"
              >
                <span>Keyingi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
