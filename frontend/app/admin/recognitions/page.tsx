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
  Crown,
  Sparkles,
  ShieldCheck,
  Calendar,
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

const CATEGORIES = [
  { value: "", label: "Barcha e’tiroflar" },
  { value: "supreme_honor", label: "Oliy unvon", icon: Crown },
  { value: "achievement_nomination", label: "Yutuqlar nominatsiyalari", icon: Sparkles },
  { value: "university_contribution", label: "Universitetga hissa", icon: ShieldCheck },
  { value: "traditional_status", label: "An’anaviy statuslar", icon: Calendar },
];

const COMMON_ICONS = [
  { key: "crown", label: "Toj (Oliy unvon)" },
  { key: "astrolabe", label: "Usturlob (Ilm-fan)" },
  { key: "torch", label: "Mash’al (Ziyo)" },
  { key: "wing", label: "Qanot (Yuksak parvoz)" },
  { key: "example", label: "Namuna / Ibrat" },
  { key: "rocket", label: "Raketa (Istiqbol)" },
  { key: "heart", label: "Yurak (Ezgulik)" },
  { key: "coins", label: "Tangalar (Oliyhimmat)" },
  { key: "seedling", label: "Nihol (Iste’dodlar)" },
  { key: "book", label: "Kitob (Ma’rifat)" },
  { key: "lamp", label: "Chiroq (Yo‘lchiroq)" },
  { key: "bridge", label: "Ko‘prik (Kelajakka)" },
  { key: "building", label: "Bino (Ona dargoh)" },
  { key: "globe", label: "Globus (QarDU elchisi)" },
  { key: "medal-silver", label: "Kumush medal" },
  { key: "medal-gold", label: "Oltin medal" },
  { key: "users", label: "Oila / Sulola" },
  { key: "award", label: "Mukofot (Standart)" },
];

export default function AdminRecognitionsPage() {
  const [recognitions, setRecognitions] = useState<AdminRecognition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminRecognition | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("achievement_nomination");
  const [recognitionType, setRecognitionType] = useState("nomination");
  const [icon, setIcon] = useState("award");
  const [symbolName, setSymbolName] = useState("");
  const [description, setDescription] = useState("");
  const [eligibilitySummary, setEligibilitySummary] = useState("");
  const [hasLevels, setHasLevels] = useState(false);
  const [annualQuota, setAnnualQuota] = useState<number | "">("");
  const [termYears, setTermYears] = useState<number | "">("");
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
    setCategory("achievement_nomination");
    setRecognitionType("nomination");
    setIcon("award");
    setSymbolName("");
    setDescription("");
    setEligibilitySummary("");
    setHasLevels(false);
    setAnnualQuota("");
    setTermYears("");
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
    setCategory(item.category || "achievement_nomination");
    setRecognitionType(item.recognition_type || "nomination");
    setIcon(item.icon || "award");
    setSymbolName(item.symbol_name || "");
    setDescription(item.description || "");
    setEligibilitySummary(item.eligibility_summary || "");
    setHasLevels(Boolean(item.has_levels));
    setAnnualQuota(item.annual_quota !== undefined && item.annual_quota !== null ? item.annual_quota : "");
    setTermYears(item.term_years !== undefined && item.term_years !== null ? item.term_years : "");
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
      const payload: Partial<AdminRecognition> = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        category,
        recognition_type: recognitionType,
        icon: icon.trim() || "award",
        symbol_name: symbolName.trim(),
        description: description.trim(),
        eligibility_summary: eligibilitySummary.trim(),
        has_levels: hasLevels,
        annual_quota: annualQuota === "" ? null : Number(annualQuota),
        term_years: termYears === "" ? null : Number(termYears),
        order: Number(order) || 0,
        is_active: isActive,
      };

      if (editingItem) {
        await updateAdminRecognition(editingItem.id, payload);
        setSuccessMsg("E’tirof / Mukofot ma’lumotlari yangilandi");
      } else {
        await createAdminRecognition(payload);
        setSuccessMsg("Yangi e’tirof / mukofot yaratildi");
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
    if (!confirm(`Haqiqatan ham "${title}" mukofotini o‘chirmoqchimisiz?`)) return;
    try {
      await deleteAdminRecognition(id);
      await fetchRecognitions();
    } catch (err: any) {
      alert(err.message || "O‘chirishda xatolik");
    }
  };

  const filteredRecognitions = recognitions.filter((r) => {
    if (!selectedCategory) return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            QarDU Ramziy Unvon va Mukofotlar Tizimi
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Universitet nizomiga muvofiq rasmiy e’tiroflar, nominatsiyalar, statuslar va ularning mezonlari
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D38E4F]" />
          <span>Yangi mukofot / unvon</span>
        </button>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-[#0D1667] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {IconComp && <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-[#D38E4F]" : "text-slate-400"}`} />}
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {cat.value ? recognitions.filter((r) => r.category === cat.value).length : recognitions.length}
              </span>
            </button>
          );
        })}
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
            Mukofotlar katalogi yuklanmoqda...
          </div>
        ) : filteredRecognitions.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Ushbu toifada mukofotlar topilmadi.
          </div>
        ) : (
          filteredRecognitions.map((rec) => {
            const isSupreme = rec.category === "supreme_honor";
            return (
              <div
                key={rec.id}
                className={`bg-white p-5 rounded-2xl border transition flex flex-col justify-between ${
                  isSupreme
                    ? "border-[#D38E4F] shadow-md ring-1 ring-[#D38E4F]/30"
                    : "border-slate-200 shadow-sm hover:border-[#D38E4F]/60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isSupreme
                          ? "bg-amber-50 text-[#D38E4F] border-amber-200"
                          : "bg-purple-50 text-[#612175] border-purple-100"
                      }`}
                    >
                      <RecognitionIcon icon={rec.symbol_name || rec.icon} className="w-5 h-5" />
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

                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                      {rec.category_display || rec.category}
                    </span>
                    {rec.annual_quota && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded text-[10px] font-bold">
                        Kvota: {rec.annual_quota} ta/yil
                      </span>
                    )}
                    {rec.has_levels && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded text-[10px] font-bold">
                        Darajali
                      </span>
                    )}
                    {rec.term_years && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded text-[10px] font-bold">
                        {rec.term_years} yil muddatli
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-1">
                    {getRecognitionTitle(rec.slug, "uz", rec.name)}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{rec.slug}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {rec.description || rec.eligibility_summary || "Tavsif ko‘rsatilmagan"}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{rec.alumni_count || 0} nafar laureat</span>
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
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D38E4F]" />
                <span>{editingItem ? "Mukofot / Unvonni Tahrirlash" : "Yangi Mukofot / Unvon"}</span>
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
                <label className="block font-bold text-slate-700 mb-1">Mukofot Nomi (O‘zbekcha)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingItem && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                      );
                    }
                  }}
                  placeholder="Masalan: QarDU iftixori"
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
                    placeholder="qardu-iftixori"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategoriya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  >
                    <option value="supreme_honor">Oliy unvon</option>
                    <option value="achievement_nomination">Yutuqlar uchun nominatsiya</option>
                    <option value="university_contribution">Universitetga qo‘shgan hissa</option>
                    <option value="traditional_status">An’anaviy status</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E’tirof turi</label>
                  <select
                    value={recognitionType}
                    onChange={(e) => setRecognitionType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  >
                    <option value="supreme_honor">Oliy unvon</option>
                    <option value="nomination">Yillik nominatsiya</option>
                    <option value="term_status">Muddatli maqom</option>
                    <option value="traditional_status">An’anaviy status</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Yillik kvota (ko‘pi bilan)</label>
                  <input
                    type="number"
                    value={annualQuota}
                    onChange={(e) => setAnnualQuota(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Masalan: 3 (Bo‘sh bo‘lsa kvotasiz)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amal qilish muddati (yil)</label>
                  <input
                    type="number"
                    value={termYears}
                    onChange={(e) => setTermYears(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Masalan: 2 (QarDU elchisi uchun)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ramziy belgi (Symbol / Icon)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_ICONS.map((ic) => (
                    <button
                      key={ic.key}
                      type="button"
                      onClick={() => {
                        setIcon(ic.key);
                        setSymbolName(ic.key);
                      }}
                      className={`p-1.5 rounded-lg border flex items-center gap-1 transition ${
                        icon === ic.key
                          ? "bg-[#0D1667] text-white border-[#0D1667]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <RecognitionIcon icon={ic.key} className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Qisqa tavsif</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ushbu mukofot nima maqsadda berilishi haqida..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomzodlik va baholash mezonlari (Eligibility)</label>
                <textarea
                  rows={3}
                  value={eligibilitySummary}
                  onChange={(e) => setEligibilitySummary(e.target.value)}
                  placeholder="Kimlar nomzod bo‘lishi mumkin, qanday talablar mavjud..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLevels}
                    onChange={(e) => setHasLevels(e.target.checked)}
                    className="w-4 h-4 text-[#0D1667] rounded border-slate-300 focus:ring-[#0D1667]"
                  />
                  <span className="font-bold text-slate-800">Darajalarga ega (Bronza, Kumush, Oltin)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#0D1667] rounded border-slate-300 focus:ring-[#0D1667]"
                  />
                  <span className="font-bold text-slate-800">Mukofot faol holatda</span>
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
