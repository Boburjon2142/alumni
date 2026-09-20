"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Mic,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";
import {
  deleteAdminInterview,
  getAdminAlumni,
  getAdminInterviews,
  saveAdminInterview,
} from "@/lib/api";
import type { Alumni, Interview } from "@/types/alumni";

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editor Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [alumniId, setAlumniId] = useState<number | string>("");
  const [titleUz, setTitleUz] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [introUz, setIntroUz] = useState("");
  const [introEn, setIntroEn] = useState("");
  const [pullQuoteUz, setPullQuoteUz] = useState("");
  const [pullQuoteEn, setPullQuoteEn] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [items, setItems] = useState<
    { question_uz: string; question_en: string; answer_uz: string; answer_en: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await getAdminInterviews(params.toString());
      setInterviews(res.results || []);
    } catch (err: any) {
      setError(err.message || "Intervyularni yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminAlumni("page_size=100")
      .then((res) => setAlumniList(res.results || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchInterviews, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setAlumniId(alumniList[0]?.id || "");
    setTitleUz("");
    setTitleEn("");
    setIntroUz("");
    setIntroEn("");
    setPullQuoteUz("");
    setPullQuoteEn("");
    setIsFeatured(false);
    setIsPublished(true);
    setItems([
      {
        question_uz: "Universitetda o‘qigan yillaringiz sizga nima berdi?",
        question_en: "What did your university years give you?",
        answer_uz: "",
        answer_en: "",
      },
    ]);
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleOpenEdit = (interview: Interview) => {
    setEditingId(interview.id);
    const foundAlumnus = alumniList.find((a) => a.full_name === interview.alumnus?.full_name);
    setAlumniId(foundAlumnus?.id || "");
    setTitleUz(interview.title_uz || "");
    setTitleEn(interview.title_en || "");
    setIntroUz(interview.intro_uz || "");
    setIntroEn(interview.intro_en || "");
    setPullQuoteUz(interview.pull_quote_uz || "");
    setPullQuoteEn(interview.pull_quote_en || "");
    setIsFeatured(Boolean(interview.is_featured));
    setIsPublished(Boolean(interview.published_at));
    setItems(
      interview.items?.map((item) => ({
        question_uz: item.question_uz || "",
        question_en: item.question_en || "",
        answer_uz: item.answer_uz || "",
        answer_en: item.answer_en || "",
      })) || []
    );
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        question_uz: "",
        question_en: "",
        answer_uz: "",
        answer_en: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleUz.trim() || !alumniId || !introUz.trim()) {
      setError("Sarlavha, bitiruvchi va kirish matni majburiy");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        alumni_id: Number(alumniId),
        title_uz: titleUz.trim(),
        title_en: titleEn.trim(),
        intro_uz: introUz.trim(),
        intro_en: introEn.trim(),
        pull_quote_uz: pullQuoteUz.trim(),
        pull_quote_en: pullQuoteEn.trim(),
        is_featured: isFeatured,
        is_published: isPublished,
        items: items.filter((i) => i.question_uz.trim() && i.answer_uz.trim()),
      };

      await saveAdminInterview(editingId, payload);
      setSuccessMsg("Intervyu muvaffaqiyatli saqlandi");
      setModalOpen(false);
      await fetchInterviews();
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Haqiqatan ham "${title}" intervyusini o‘chirmoqchimisiz?`)) return;
    try {
      await deleteAdminInterview(id);
      await fetchInterviews();
    } catch (err: any) {
      alert(err.message || "O‘chirishda xatolik");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Eksklyuziv Intervyular Muharriri
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Bitiruvchilar bilan chuqurlashtirilgan savol-javoblar va maslahatlar
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D38E4F]" />
          <span>Yangi intervyu yaratish</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="admin-search-box max-w-md">
          <Search />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Intervyu sarlavhasi yoki bitiruvchi..."
          />
        </div>
      </div>

      {/* Interviews Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "260px" }}>Intervyu & Bitiruvchi</th>
                <th style={{ minWidth: "160px" }}>Savollar Soni</th>
                <th style={{ minWidth: "150px" }}>Holat</th>
                <th style={{ minWidth: "120px" }}>Sana</th>
                <th style={{ minWidth: "110px", textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D1667]" />
                    Intervyular yuklanmoqda...
                  </td>
                </tr>
              ) : interviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Intervyular topilmadi.
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#612175] flex items-center justify-center shrink-0 border border-purple-100">
                          <Mic className="w-5 h-5 text-[#612175]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm leading-tight truncate max-w-[200px]">{interview.title_uz}</p>
                          <p className="text-[11px] text-[#612175] font-bold mt-0.5 truncate max-w-[200px]">
                            {interview.alumnus?.full_name || "Bitiruvchi"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap">
                      <span className="admin-badge admin-badge-slate font-bold">
                        {interview.items_count || interview.items?.length || 0} ta savol
                      </span>
                    </td>

                    <td>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`admin-status-pill ${
                            interview.published_at
                              ? "admin-status-approved"
                              : "admin-status-pending"
                          }`}
                        >
                          <span className="admin-status-dot" />
                          <span>{interview.published_at ? "Nashr qilingan" : "Qoralama"}</span>
                        </span>
                        {interview.is_featured && (
                          <span className="admin-status-featured">
                            <Sparkles className="w-3 h-3" />
                            <span>Tavsiya etilgan</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="whitespace-nowrap text-slate-500 text-xs">
                      {interview.published_at
                        ? new Date(interview.published_at).toLocaleDateString("uz-UZ")
                        : "—"}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="admin-actions-group justify-end">
                        <button
                          onClick={() => handleOpenEdit(interview)}
                          className="admin-action-icon-btn"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(interview.id, interview.title_uz)}
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

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Mic className="w-5 h-5 text-[#0D1667]" />
                <span>{editingId ? "Intervyuni Tahrirlash" : "Yangi Intervyu"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Suhbatdoshi (Bitiruvchi) <span className="text-red-500">*</span>
                </label>
                <select
                  value={alumniId}
                  onChange={(e) => setAlumniId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  required
                >
                  <option value="">Bitiruvchini tanlang...</option>
                  {alumniList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} ({a.current_company || a.faculty || "Bitiruvchi"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sarlavha (UZ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={titleUz}
                    onChange={(e) => setTitleUz(e.target.value)}
                    placeholder="Muvaffaqiyat kaliti — intizom va mehnatda..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sarlavha (EN)</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="The key to success is discipline..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kirish Matni (Intro UZ) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={introUz}
                  onChange={(e) => setIntroUz(e.target.value)}
                  placeholder="Suhbat haqida kirish so‘zi va qahramonning qisqacha tanishtiruvi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Iqtibos (Pull Quote UZ)</label>
                <input
                  type="text"
                  value={pullQuoteUz}
                  onChange={(e) => setPullQuoteUz(e.target.value)}
                  placeholder="Intervyudan eng yorqin iqtibos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
              </div>

              {/* Questions & Answers Repeater */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900 uppercase tracking-wider text-[#0D1667]">
                    Savol-Javoblar Ro‘yxati ({items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Savol qo‘shish</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#0D1667] text-xs">#{idx + 1}-savol</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.question_uz}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].question_uz = e.target.value;
                          setItems(copy);
                        }}
                        placeholder="Savol matni (UZ)..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        required
                      />
                      <textarea
                        rows={3}
                        value={item.answer_uz}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].answer_uz = e.target.value;
                          setItems(copy);
                        }}
                        placeholder="Qahramonning javobi (UZ)..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#0D1667] rounded border-slate-300 focus:ring-[#0D1667]"
                  />
                  <span className="font-bold text-slate-800">Ommaviy nashr qilish</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#0D1667] rounded border-slate-300 focus:ring-[#0D1667]"
                  />
                  <span className="font-bold text-slate-800">Bosh sahifada tavsiya etish</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

