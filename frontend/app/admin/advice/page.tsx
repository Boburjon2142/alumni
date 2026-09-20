"use client";

import { useEffect, useState } from "react";
import {
  Lightbulb,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import {
  deleteAdminAdvice,
  getAdminAdvice,
  getAdminAlumni,
  saveAdminAdvice,
} from "@/lib/api";
import type { Advice, Alumni } from "@/types/alumni";

const categories = [
  { value: "career", label: "Karyera" },
  { value: "study", label: "O‘qish va ta’lim" },
  { value: "leadership", label: "Yetakchilik" },
  { value: "personal_growth", label: "Shaxsiy rivojlanish" },
  { value: "industry", label: "Soha va texnologiya" },
  { value: "life", label: "Hayotiy saboq" },
];

export default function AdminAdvicePage() {
  const [adviceList, setAdviceList] = useState<Advice[]>([]);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editor Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [alumniId, setAlumniId] = useState<number | string>("");
  const [category, setCategory] = useState("career");
  const [titleUz, setTitleUz] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentUz, setContentUz] = useState("");
  const [contentRu, setContentRu] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAdvice = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await getAdminAdvice(params.toString());
      setAdviceList(res.results || []);
    } catch (err: any) {
      setError(err.message || "Maslahatlarni yuklab bo‘lmadi");
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
    const timer = setTimeout(fetchAdvice, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setAlumniId(alumniList[0]?.id || "");
    setCategory("career");
    setTitleUz("");
    setTitleRu("");
    setTitleEn("");
    setContentUz("");
    setContentRu("");
    setContentEn("");
    setIsFeatured(false);
    setIsPublished(true);
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleOpenEdit = (advice: Advice) => {
    setEditingId(advice.id);
    const foundAlumnus = alumniList.find((a) => a.full_name === advice.alumnus?.full_name);
    setAlumniId(foundAlumnus?.id || "");
    setCategory(advice.category || "career");
    setTitleUz(advice.title_uz || "");
    setTitleRu(advice.title_ru || "");
    setTitleEn(advice.title_en || "");
    setContentUz(advice.content_uz || "");
    setContentRu(advice.content_ru || "");
    setContentEn(advice.content_en || "");
    setIsFeatured(Boolean(advice.is_featured));
    setIsPublished(Boolean(advice.published_at));
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniId || !contentUz.trim()) {
      setError("Bitiruvchi va maslahat matni (UZ) majburiy");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        alumni_id: Number(alumniId),
        category,
        title_uz: titleUz.trim(),
        title_ru: titleRu.trim(),
        title_en: titleEn.trim(),
        content_uz: contentUz.trim(),
        content_ru: contentRu.trim(),
        content_en: contentEn.trim(),
        is_featured: isFeatured,
        is_published: isPublished,
      };

      await saveAdminAdvice(editingId, payload);
      setSuccessMsg("Maslahat muvaffaqiyatli saqlandi");
      setModalOpen(false);
      await fetchAdvice();
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Haqiqatan ham maslahatni o‘chirmoqchimisiz?`)) return;
    try {
      await deleteAdminAdvice(id);
      await fetchAdvice();
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
            Karyera va Hayotiy Maslahatlar
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Bitiruvchilarning talabalar va yosh mutaxassislar uchun bergan amaliy tavsiyalari
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D38E4F]" />
          <span>Yangi maslahat qo‘shish</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="admin-search-box flex-1">
          <Search />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Matn yoki bitiruvchi ismi bo‘yicha qidiruv..."
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="admin-filter-select sm:w-64"
        >
          <option value="">Barcha kategoriyalar</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D1667]" />
            Maslahatlar yuklanmoqda...
          </div>
        ) : adviceList.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Maslahatlar topilmadi.
          </div>
        ) : (
          adviceList.map((adv) => (
            <div
              key={adv.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0D1667]/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="admin-badge admin-badge-purple uppercase font-bold text-[10px]">
                    {categories.find((c) => c.value === adv.category)?.label || adv.category}
                  </span>
                  {adv.is_featured && (
                    <span className="admin-status-featured">
                      <Sparkles className="w-3 h-3" />
                      <span>Tavsiya</span>
                    </span>
                  )}
                </div>

                <p className="font-bold text-slate-900 text-sm mb-1">{adv.title_uz || "Maslahat"}</p>
                <p className="text-xs text-slate-600 line-clamp-4 italic">
                  &ldquo;{adv.content_uz}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{adv.alumnus?.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                    {adv.alumnus?.position || adv.alumnus?.current_company || "Bitiruvchi"}
                  </p>
                </div>

                <div className="admin-actions-group">
                  <button
                    onClick={() => handleOpenEdit(adv)}
                    className="admin-action-icon-btn"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(adv.id, adv.title_uz || "maslahat")}
                    className="admin-action-icon-btn btn-delete"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#D38E4F]" />
                <span>{editingId ? "Maslahatni Tahrirlash" : "Yangi Maslahat"}</span>
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
                  Bitiruvchi <span className="text-red-500">*</span>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategoriya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sarlavha (UZ)</label>
                <input
                  type="text"
                  value={titleUz}
                  onChange={(e) => setTitleUz(e.target.value)}
                  placeholder="Masalan: Qat’iyat va sabr haqida"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Maslahat Matni (UZ) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={contentUz}
                  onChange={(e) => setContentUz(e.target.value)}
                  placeholder="Talabalarga to‘liq maslahat matni..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#0D1667] rounded border-slate-300 focus:ring-[#0D1667]"
                  />
                  <span className="font-bold text-slate-800">Nashr qilish</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#0D1667] rounded border-slate-300 focus:ring-[#0D1667]"
                  />
                  <span className="font-bold text-slate-800">Tavsiya etish</span>
                </label>
              </div>

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

