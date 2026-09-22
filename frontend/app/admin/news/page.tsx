"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  Eye,
  Calendar,
  Star,
} from "lucide-react";
import {
  deleteAdminNews,
  getAdminNews,
  createAdminNews,
  updateAdminNews,
} from "@/lib/api";
import type { AdminNewsItem, AdminNewsPayload } from "@/types/admin";

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<AdminNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editor Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titleUz, setTitleUz] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [summaryUz, setSummaryUz] = useState("");
  const [summaryRu, setSummaryRu] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [contentUz, setContentUz] = useState("");
  const [contentRu, setContentRu] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [category, setCategory] = useState<"university" | "alumni" | "event" | "achievement" | "general">("general");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [coverImageCredit, setCoverImageCredit] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await getAdminNews(params.toString());
      setNewsList(res.results || []);
    } catch (err: any) {
      setError(err.message || "Yangiliklarni yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchNews, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitleUz("");
    setTitleRu("");
    setTitleEn("");
    setSummaryUz("");
    setSummaryRu("");
    setSummaryEn("");
    setContentUz("");
    setContentRu("");
    setContentEn("");
    setCategory("general");
    setCoverImageUrl("");
    setCoverImageAlt("");
    setCoverImageCredit("");
    setAuthorName("Axborot xizmati");
    setIsFeatured(false);
    setIsPublished(true);
    setError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AdminNewsItem) => {
    setEditingId(item.id);
    setTitleUz(item.title_uz || "");
    setTitleRu(item.title_ru || "");
    setTitleEn(item.title_en || "");
    setSummaryUz(item.summary_uz || "");
    setSummaryRu(item.summary_ru || "");
    setSummaryEn(item.summary_en || "");
    setContentUz(item.content_uz || "");
    setContentRu(item.content_ru || "");
    setContentEn(item.content_en || "");
    setCategory(item.category || "general");
    setCoverImageUrl(item.cover_image_url || "");
    setCoverImageAlt(item.cover_image_alt || "");
    setCoverImageCredit(item.cover_image_credit || "");
    setAuthorName(item.author_name || "");
    setIsFeatured(Boolean(item.is_featured));
    setIsPublished(Boolean(item.is_published));
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleUz.trim() || !summaryUz.trim()) {
      setError("O‘zbekcha sarlavha va qisqacha ma’lumot to‘ldirilishi shart!");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: AdminNewsPayload = {
        title_uz: titleUz.trim(),
        title_ru: titleRu.trim(),
        title_en: titleEn.trim(),
        summary_uz: summaryUz.trim(),
        summary_ru: summaryRu.trim(),
        summary_en: summaryEn.trim(),
        content_uz: contentUz.trim(),
        content_ru: contentRu.trim(),
        content_en: contentEn.trim(),
        category,
        cover_image_url: coverImageUrl.trim(),
        cover_image_alt: coverImageAlt.trim(),
        cover_image_credit: coverImageCredit.trim(),
        author_name: authorName.trim(),
        is_featured: isFeatured,
        is_published: isPublished,
      };

      if (editingId) {
        await updateAdminNews(editingId, payload);
        setSuccessMsg("Yangilik muvaffaqiyatli saqlandi!");
      } else {
        await createAdminNews(payload);
        setSuccessMsg("Yangi yangilik muvaffaqiyatli chop etildi!");
      }

      setModalOpen(false);
      fetchNews();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: AdminNewsItem) => {
    try {
      await updateAdminNews(item.id, { is_published: !item.is_published });
      setNewsList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_published: !n.is_published } : n))
      );
    } catch (err: any) {
      alert("Holatni o‘zgartirib bo‘lmadi: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu yangilikni o‘chirmoqchimisiz?")) return;
    try {
      await deleteAdminNews(id);
      setNewsList((prev) => prev.filter((n) => n.id !== id));
      setSuccessMsg("Yangilik o‘chirildi");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert("O‘chirishda xatolik: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-[#0d1667] mb-1">
            <Newspaper className="w-6 h-6" />
            <h1 className="text-xl font-bold">Yangiliklar Boshqaruvi</h1>
          </div>
          <p className="text-sm text-slate-500">
            Universitet va ALUMNI yangiliklarini yaratish, tahrirlash va e’lon qilish (Eng yangilari yuqorida).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0d1667] text-white text-sm font-semibold rounded-xl hover:bg-[#0a1254] transition shadow-sm"
        >
          <Plus size={18} />
          <span>Yangi yangilik qo‘shish</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-sm">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Yangiliklar bo‘yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1667]/20 focus:border-[#0d1667]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1667]/20 focus:border-[#0d1667]"
        >
          <option value="">Barcha kategoriyalar</option>
          <option value="university">Universitet</option>
          <option value="alumni">Alumni</option>
          <option value="event">Tadbirlar</option>
          <option value="achievement">Yutuqlar</option>
          <option value="general">Umumiy</option>
        </select>
      </div>

      {/* News List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#0d1667]" />
          <p className="text-sm">Yangiliklar yuklanmoqda...</p>
        </div>
      ) : newsList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-semibold text-slate-700 mb-1">Hozircha yangiliklar yo‘q</h3>
          <p className="text-sm text-slate-400 mb-4">Birinchi yangilikni yaratish uchun yuqoridagi tugmani bosing.</p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d1667] text-white text-sm font-medium rounded-lg hover:bg-[#0a1254]"
          >
            <Plus size={16} />
            <span>Yangilik qo‘shish</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              {/* Cover Image */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {item.cover_image_url || item.cover_image ? (
                  <Image
                    src={item.cover_image_url || (item.cover_image as string)}
                    alt={item.cover_image_alt || item.title_uz}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Newspaper size={40} />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                    {item.category?.toUpperCase()}
                  </span>
                  {item.is_featured && (
                    <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Star size={12} /> Muhim
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(item.published_at || item.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={13} />
                      {item.views_count}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 mb-2 hover:text-[#0d1667]">
                    {item.title_uz}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {item.summary_uz}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${
                      item.is_published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {item.is_published ? "Nashr qilingan" : "Qoralama"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-[#0d1667] hover:bg-slate-50 rounded-lg transition"
                      title="Tahrirlash"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="O‘chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "Yangilikni tahrirlash" : "Yangi yangilik yaratish"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategoriya</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  >
                    <option value="general">Umumiy</option>
                    <option value="university">Universitet</option>
                    <option value="alumni">Alumni</option>
                    <option value="event">Tadbirlar</option>
                    <option value="achievement">Yutuqlar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Muallif / Bo‘lim</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Masalan: Axborot xizmati"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
              </div>

              {/* Title UZ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sarlavha (O‘zbekcha) *
                </label>
                <input
                  type="text"
                  required
                  value={titleUz}
                  onChange={(e) => setTitleUz(e.target.value)}
                  placeholder="Yangilikning asosiy sarlavhasi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
              </div>

              {/* Summary UZ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qisqacha mazmun (O‘zbekcha) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={summaryUz}
                  onChange={(e) => setSummaryUz(e.target.value)}
                  placeholder="Karta va ro‘yxatlarda ko‘rinadigan qisqacha tavsif"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
              </div>

              {/* Full Content UZ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  To‘liq matn (O‘zbekcha)
                </label>
                <textarea
                  rows={6}
                  value={contentUz}
                  onChange={(e) => setContentUz(e.target.value)}
                  placeholder="Yangilikning to‘liq matni..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Muqova rasm URL (Unsplash yoki to‘g‘ridan-to‘g‘ri havola)
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#0d1667] rounded border-slate-300"
                  />
                  <span>Muhim xabar (Featured - eng yuqorida turadi)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#0d1667] rounded border-slate-300"
                  />
                  <span>Darhol nashr qilish (Saytda ko‘rinadi)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#0d1667] text-white text-sm font-semibold rounded-xl hover:bg-[#0a1254] transition shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingId ? "O‘zgarishlarni saqlash" : "Chop etish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
