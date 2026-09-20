"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  Users,
  Sparkles,
} from "lucide-react";
import {
  deleteAdminStory,
  getAdminAlumni,
  getAdminStories,
  saveAdminStory,
} from "@/lib/api";
import type { Alumni, StorySection, SuccessStory } from "@/types/alumni";

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editor Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [alumniId, setAlumniId] = useState<number | string>("");
  const [titleUz, setTitleUz] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [summaryUz, setSummaryUz] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageAlt, setHeroImageAlt] = useState("");
  const [studentTakeawayUz, setStudentTakeawayUz] = useState("");
  const [studentTakeawayEn, setStudentTakeawayEn] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [sections, setSections] = useState<
    { kind: string; heading_uz: string; heading_en: string; content_uz: string; content_en: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await getAdminStories(params.toString());
      setStories(res.results || []);
    } catch (err: any) {
      setError(err.message || "Hikoyalarni yuklab bo‘lmadi");
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
    const timer = setTimeout(fetchStories, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setAlumniId(alumniList[0]?.id || "");
    setTitleUz("");
    setTitleEn("");
    setSummaryUz("");
    setSummaryEn("");
    setHeroImageUrl("");
    setHeroImageAlt("");
    setStudentTakeawayUz("");
    setStudentTakeawayEn("");
    setIsFeatured(false);
    setIsPublished(true);
    setSections([
      {
        kind: "introduction",
        heading_uz: "Kirish va tanishuv",
        heading_en: "Introduction",
        content_uz: "",
        content_en: "",
      },
    ]);
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleOpenEdit = (story: SuccessStory) => {
    setEditingId(story.id);
    const foundAlumnus = alumniList.find((a) => a.full_name === story.alumnus?.full_name);
    setAlumniId(foundAlumnus?.id || "");
    setTitleUz(story.title_uz || story.title || "");
    setTitleEn(story.title_en || "");
    setSummaryUz(story.summary_uz || story.summary || "");
    setSummaryEn(story.summary_en || "");
    setHeroImageUrl(story.hero_image_url || story.hero_image || "");
    setHeroImageAlt(story.hero_image_alt || "");
    setStudentTakeawayUz(story.student_takeaway_uz || "");
    setStudentTakeawayEn(story.student_takeaway_en || "");
    setIsFeatured(Boolean(story.is_featured));
    setIsPublished(Boolean(story.published_at));
    setSections(
      story.sections?.map((s) => ({
        kind: s.heading_uz || "introduction",
        heading_uz: s.heading_uz || "",
        heading_en: s.heading_en || "",
        content_uz: s.content_uz || "",
        content_en: s.content_en || "",
      })) || []
    );
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        kind: "achievements",
        heading_uz: "Yutuqlar va tajriba",
        heading_en: "Achievements",
        content_uz: "",
        content_en: "",
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleUz.trim() || !alumniId) {
      setError("Sarlavha va tegishli bitiruvchini tanlash majburiy");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        alumni_id: Number(alumniId),
        title_uz: titleUz.trim(),
        title_en: titleEn.trim(),
        summary_uz: summaryUz.trim(),
        summary_en: summaryEn.trim(),
        hero_image_url: heroImageUrl.trim(),
        hero_image_alt: heroImageAlt.trim() || titleUz.trim(),
        student_takeaway_uz: studentTakeawayUz.trim(),
        student_takeaway_en: studentTakeawayEn.trim(),
        is_featured: isFeatured,
        is_published: isPublished,
        sections: sections.filter((s) => s.content_uz.trim()),
      };

      await saveAdminStory(editingId, payload);
      setSuccessMsg("Hikoya muvaffaqiyatli saqlandi");
      setModalOpen(false);
      await fetchStories();
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Haqiqatan ham "${title}" hikoyasini o‘chirmoqchimisiz?`)) return;
    try {
      await deleteAdminStory(id);
      await fetchStories();
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
            Muvaffaqiyat Hikoyalari Muharriri
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Bitiruvchilarning ilhomlantiruvchi muvaffaqiyat yo‘li va talabalar uchun maslahatlar
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D38E4F]" />
          <span>Yangi hikoya yaratish</span>
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
            placeholder="Hikoya sarlavhasi yoki bitiruvchi ismi..."
          />
        </div>
      </div>

      {/* Stories Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "260px" }}>Hikoya & Bitiruvchi</th>
                <th style={{ minWidth: "240px" }}>Qisqacha Mazmuni</th>
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
                    Hikoyalar yuklanmoqda...
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Hikoyalar topilmadi.
                  </td>
                </tr>
              ) : (
                stories.map((story) => (
                  <tr key={story.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {story.hero_image_url || story.hero_image ? (
                            <Image
                              src={story.hero_image_url || story.hero_image || ""}
                              alt={story.title_uz || ""}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm leading-tight truncate max-w-[200px]">
                            {story.title_uz || story.title}
                          </p>
                          <p className="text-[11px] text-[#612175] font-bold mt-0.5 truncate max-w-[200px]">
                            {story.alumnus?.full_name || "Bitiruvchi"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {story.summary_uz || story.summary || "Qisqacha mazmun yo‘q"}
                      </p>
                    </td>

                    <td>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`admin-status-pill ${
                            story.published_at
                              ? "admin-status-approved"
                              : "admin-status-pending"
                          }`}
                        >
                          <span className="admin-status-dot" />
                          <span>{story.published_at ? "Nashr qilingan" : "Qoralama"}</span>
                        </span>
                        {story.is_featured && (
                          <span className="admin-status-featured">
                            <Sparkles className="w-3 h-3" />
                            <span>Tavsiya etilgan</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="whitespace-nowrap text-slate-500 text-xs">
                      {story.published_at
                        ? new Date(story.published_at).toLocaleDateString("uz-UZ")
                        : "—"}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="admin-actions-group justify-end">
                        <button
                          onClick={() => handleOpenEdit(story)}
                          className="admin-action-icon-btn"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(story.id, story.title_uz || story.title)}
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
                <BookOpen className="w-5 h-5 text-[#0D1667]" />
                <span>{editingId ? "Hikoyani Tahrirlash" : "Yangi Muvaffaqiyat Hikoyasi"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Alumnus Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Qahramon Bitiruvchi <span className="text-red-500">*</span>
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

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sarlavha (UZ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={titleUz}
                    onChange={(e) => setTitleUz(e.target.value)}
                    placeholder="QarDUdan xalqaro IT kompaniyasigacha..."
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
                    placeholder="From KarSU to global tech..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qisqacha mazmun (UZ)</label>
                  <textarea
                    rows={2}
                    value={summaryUz}
                    onChange={(e) => setSummaryUz(e.target.value)}
                    placeholder="Bosh sahifa cardida ko‘rinadigan qisqacha xulosa..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qisqacha mazmun (EN)</label>
                  <textarea
                    rows={2}
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="Short summary for english version..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Muqova Rasmi URL (Unsplash)</label>
                <input
                  type="url"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
              </div>

              {/* Sections Repeater */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900 uppercase tracking-wider text-[#0D1667]">
                    Hikoya Bo‘limlari ({sections.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bo‘lim qo‘shish</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={sec.heading_uz}
                          onChange={(e) => {
                            const copy = [...sections];
                            copy[idx].heading_uz = e.target.value;
                            setSections(copy);
                          }}
                          placeholder="Bo‘lim sarlavhasi (UZ)"
                          className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={sec.content_uz}
                        onChange={(e) => {
                          const copy = [...sections];
                          copy[idx].content_uz = e.target.value;
                          setSections(copy);
                        }}
                        placeholder="Bo‘lim matni (UZ)..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaway */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Talabalar uchun asosiy xulosa / maslahat (UZ)
                </label>
                <textarea
                  rows={2}
                  value={studentTakeawayUz}
                  onChange={(e) => setStudentTakeawayUz(e.target.value)}
                  placeholder="Talabalarga eng muhim tavsiya..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
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

