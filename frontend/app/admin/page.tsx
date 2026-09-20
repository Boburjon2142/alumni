"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Award,
  BookOpen,
  CalendarCheck,
  Flame,
  Inbox,
  UserCheck,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getAdminStats, actionAdminAlumni, actionAdminYearRequest } from "@/lib/api";
import type { AdminDashboardStats } from "@/types/admin";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Statistikalarni yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApproveAlumni = async (id: number) => {
    try {
      setActionLoading(id);
      await actionAdminAlumni(id, "approve");
      await fetchStats();
    } catch (err: any) {
      alert(err.message || "Tasdiqlashda xatolik");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveYearRequest = async (id: number) => {
    try {
      setActionLoading(id);
      await actionAdminYearRequest(id, "approve");
      await fetchStats();
    } catch (err: any) {
      alert(err.message || "So‘rovni tasdiqlashda xatolik");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D1667] mb-3" />
        <p className="text-sm text-slate-500">Dashboard yuklanmoqda...</p>
      </div>
    );
  }

  const counts = stats?.counts;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#0D1667] via-[#1C2675] to-[#612175] text-white p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#D38E4F] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>QarDU ALUMNI Boshqaruv Tizimi</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Xush kelibsiz, Administrator!</h2>
          <p className="text-sm text-slate-200 mt-1 max-w-xl">
            Universitet bitiruvchilari ma’lumotlar bazasi, faxriy unvonlar, murojaatlar va tahririyat bo‘limlarini bitta markazdan boshqaring.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/alumni/new"
            className="px-4 py-2.5 bg-[#D38E4F] hover:bg-[#c27f42] text-[#0D1667] rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi bitiruvchi</span>
          </Link>
          <Link
            href="/admin/feedback"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition"
          >
            <Inbox className="w-4 h-4" />
            <span>Murojaatlar ({counts?.new_feedbacks || 0})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jami Bitiruvchilar</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{counts?.total_alumni || 0}</p>
            <span className="text-xs text-emerald-600 font-medium">
              {counts?.approved_alumni || 0} ta tasdiqlangan
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0D1667] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faxriy Bitiruvchilar</p>
            <p className="text-2xl font-black text-[#D38E4F] mt-1">{counts?.honorary_alumni || 0}</p>
            <span className="text-xs text-slate-500 font-medium">
              {counts?.total_recognitions || 0} ta unvon turi
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D38E4F] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Moderatsiya Navbati</p>
            <p className="text-2xl font-black text-orange-600 mt-1">
              {(counts?.pending_alumni || 0) + (counts?.pending_year_requests || 0)}
            </p>
            <span className="text-xs text-orange-600 font-medium">
              {counts?.pending_alumni || 0} profil, {counts?.pending_year_requests || 0} so‘rov
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yangi Murojaatlar</p>
            <p className="text-2xl font-black text-purple-700 mt-1">{counts?.new_feedbacks || 0}</p>
            <span className="text-xs text-purple-600 font-medium">Qutida ko‘rib chiqilishi kerak</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#612175] flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Moderation & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Profiles Moderation Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0D1667]" />
              <h3 className="font-bold text-slate-900 text-sm md:text-base">So‘nggi Qo‘shilgan Bitiruvchilar</h3>
            </div>
            <Link
              href="/admin/alumni"
              className="text-xs font-semibold text-[#0D1667] hover:underline flex items-center gap-1"
            >
              <span>Barchasi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1 divide-y divide-slate-100">
            {stats?.recent_profiles?.length ? (
              stats.recent_profiles.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/alumni/${p.slug || p.id}/edit`}
                        className="text-sm font-bold text-slate-900 hover:text-[#0D1667] truncate"
                      >
                        {p.full_name}
                      </Link>
                      {p.is_honorary && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold shrink-0">
                          Faxriy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString("uz-UZ")} &bull; Holat:{" "}
                      <span className="font-medium text-slate-600 capitalize">{p.approval_status}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.approval_status === "pending" && (
                      <button
                        onClick={() => handleApproveAlumni(p.id)}
                        disabled={actionLoading === p.id}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                        title="Tasdiqlash"
                      >
                        {actionLoading === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>Tasdiqlash</span>
                      </button>
                    )}
                    <Link
                      href={`/admin/alumni/${p.slug || p.id}/edit`}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                    >
                      Tahrirlash
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Hozircha yangi profillar yo‘q.</p>
            )}
          </div>
        </div>

        {/* Recent Graduation Year Change Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#0D1667]" />
              <h3 className="font-bold text-slate-900 text-sm md:text-base">Bitiruv Yili O‘zgartirish So‘rovlari</h3>
            </div>
            <Link
              href="/admin/requests"
              className="text-xs font-semibold text-[#0D1667] hover:underline flex items-center gap-1"
            >
              <span>Barchasi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1 divide-y divide-slate-100">
            {stats?.recent_requests?.length ? (
              stats.recent_requests.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{r.alumnus__full_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="line-through text-slate-400">{r.old_year || "Ko‘rsatilmagan"}</span> &rarr;{" "}
                      <strong className="text-slate-800">{r.requested_year}</strong> ({new Date(r.created_at).toLocaleDateString("uz-UZ")})
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {r.status === "pending" ? (
                      <button
                        onClick={() => handleApproveYearRequest(r.id)}
                        disabled={actionLoading === r.id}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                      >
                        {actionLoading === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>Qabul qilish</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold capitalize">
                        {r.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Yilni o‘zgartirish so‘rovlari mavjud emas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Editorial & Impact Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/stories"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#0D1667] transition group flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Muvaffaqiyat Hikoyalari</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{counts?.published_stories || 0} ta nashr qilingan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-[#0D1667] group-hover:text-white text-slate-600 flex items-center justify-center transition">
            <BookOpen className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/admin/interviews"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#0D1667] transition group flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Eksklyuziv Intervyular</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{counts?.published_interviews || 0} ta nashr qilingan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-[#0D1667] group-hover:text-white text-slate-600 flex items-center justify-center transition">
            <Award className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/admin/impact"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#0D1667] transition group flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bitiruvchilar Hissasi</p>
            <p className="text-xl font-bold text-orange-600 mt-1">{counts?.pending_contributions || 0} ta kutilmoqda</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-600 group-hover:text-white text-orange-600 flex items-center justify-center transition">
            <Flame className="w-5 h-5" />
          </div>
        </Link>
      </div>
    </div>
  );
}

