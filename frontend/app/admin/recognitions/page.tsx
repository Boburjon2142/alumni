"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Users,
} from "lucide-react";
import {
  createAdminRecognition,
  deleteAdminRecognition,
  getAdminRecognitions,
  updateAdminRecognition,
} from "@/lib/api";
import { RecognitionIcon } from "@/components/alumni/recognition-icon";
import { getRecognitionTitle } from "@/lib/i18n";
import type { AdminRecognition } from "@/types/admin";

export default function AdminRecognitionsPage() {
  const [recognitions, setRecognitions] = useState<AdminRecognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminRecognition | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("award");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRecognitions = async () => {
    try {
      setLoading(true);
      const res = await getAdminRecognitions();
      setRecognitions(res.results || []);
    } catch (err: any) {
      setError(err.message || "Faxriy unvonlarni yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecognitions();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setName("");
    setSlug("");
    setIcon("award");
    setDescription("");
    setOrder(recognitions.length + 1);
    setIsActive(true);
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AdminRecognition) => {
    setEditingItem(item);
    setName(item.name);
    setSlug(item.slug);
    setIcon(item.icon || "award");
    setDescription(item.description || "");
    setOrder(item.order || 0);
    setIsActive(item.is_active);
    setError("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError("Unvon nomi va identifikatori (slug) majburiy");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: icon.trim() || "award",
        description: description.trim(),
        order: Number(order) || 0,
        is_active: isActive,
      };

      if (editingItem) {
        await updateAdminRecognition(editingItem.id, payload);
        setSuccessMsg("Faxriy unvon yangilandi");
      } else {
        await createAdminRecognition(payload);
        setSuccessMsg("Yangi faxriy unvon yaratildi");
      }

      setModalOpen(false);
      await fetchRecognitions();
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Haqiqatan ham "${title}" faxriy unvonini o‘chirmoqchimisiz?`)) return;
    try {
      await deleteAdminRecognition(id);
      await fetchRecognitions();
    } catch (err: any) {
      alert(err.message || "O‘chirishda xatolik");
    }
  };

  const commonIcons = [
    "award",
    "graduation-cap",
    "flask-conical",
    "landmark",
    "globe",
    "heart-handshake",
    "shield-star",
    "briefcase",
    "sparkles",
    "lightbulb",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Tavsiyaviy Faxriy Unvonlar Tizimi
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Bitiruvchilarga beriladigan unvonlar ro‘yxati, belgilari va ketma-ketlik tartibi
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D38E4F]" />
          <span>Yangi unvon qo‘shish</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Recognitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D1667]" />
            Unvonlar yuklanmoqda...
          </div>
        ) : recognitions.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Hozircha faxriy unvonlar mavjud emas.
          </div>
        ) : (
          recognitions.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#D38E4F]/60 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#612175] flex items-center justify-center border border-purple-100">
                    <RecognitionIcon icon={rec.icon} className="w-5 h-5 text-[#612175]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {rec.is_active ? "Faol" : "Nofaol"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 bg-slate-50 rounded">
                      #{rec.order}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">
                  {getRecognitionTitle(rec.slug, "uz", rec.name)}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{rec.slug}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {rec.description || "Tavsif ko‘rsatilmagan"}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>{rec.alumni_count || 0} ta bitiruvchida</span>
                </div>
                <div className="admin-actions-group">
                  <button
                    onClick={() => handleOpenEdit(rec)}
                    className="admin-action-icon-btn"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id, rec.name)}
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D38E4F]" />
                <span>{editingItem ? "Faxriy Unvonni Tahrirlash" : "Yangi Faxriy Unvon"}</span>
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
                <label className="block font-bold text-slate-700 mb-1">Unvon Nomi (O‘zbekcha)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingItem && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "_")
                          .replace(/[^a-z0-9_]/g, "")
                      );
                    }
                  }}
                  placeholder="Masalan: Faxriy ustoz"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Identifikator (Slug)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="faxriy_ustoz"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ketma-ketlik tartibi</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Belgi (Lucide Icon)</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="award, graduation-cap, flask-conical, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667] mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {commonIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-1.5 rounded-lg border flex items-center gap-1 transition ${
                        icon === ic
                          ? "bg-[#612175] text-white border-[#612175]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <RecognitionIcon icon={ic} className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tavsif (Kriteriya)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ushbu unvon qaysi xizmatlari yoki yutuqlari uchun berilishi haqida..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#0D1667] rounded border-slate-300 focus:ring-[#0D1667]"
                  />
                  <span className="font-bold text-slate-800">Unvon faol holatda</span>
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
