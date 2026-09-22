"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Globe,
  Trash2,
  Clock,
  Eye,
  Calendar,
  Layers,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import {
  getAdminAlumniById,
  getAdminRecognitions,
  updateAdminAlumni,
  deleteAdminAlumni,
} from "@/lib/api";
import { RecognitionIcon } from "@/components/alumni/recognition-icon";
import { getRecognitionTitle } from "@/lib/i18n";
import type { AdminRecognition } from "@/types/admin";
import type { Alumni } from "@/types/alumni";

interface AlumniFormEditorProps {
  initialId?: string;
}

export function AlumniFormEditor({ initialId }: AlumniFormEditorProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(Boolean(initialId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [alumnus, setAlumnus] = useState<Alumni | null>(null);
  const [recognitionsList, setRecognitionsList] = useState<AdminRecognition[]>([]);

  // Moderation state (these are the ONLY fields editable by admin)
  const [isHonorary, setIsHonorary] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("approved");
  const [selectedRecognitionIds, setSelectedRecognitionIds] = useState<number[]>([]);

  useEffect(() => {
    getAdminRecognitions()
      .then((res) => setRecognitionsList(res.results || []))
      .catch(console.error);

    if (initialId) {
      getAdminAlumniById(initialId)
        .then((data: Alumni) => {
          setAlumnus(data);
          setIsHonorary(Boolean(data.is_honorary));
          setIsFeatured(Boolean(data.is_featured));
          setIsPublished(data.is_published !== false);
          setApprovalStatus((data.approval_status as any) || "approved");

          if (data.recognitions && Array.isArray(data.recognitions)) {
            setSelectedRecognitionIds(data.recognitions.map((r: any) => r.id || r.title?.id || r));
          }
        })
        .catch((err) => {
          console.error("Failed to load alumni profile:", err);
          setError("Bitiruvchi profilini yuklashda xatolik yuz berdi.");
        })
        .finally(() => setLoading(false));
    }
  }, [initialId]);

  const handleSaveModeration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!initialId || !alumnus) return;

    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        is_honorary: isHonorary,
        is_featured: isFeatured,
        is_published: isPublished,
        approval_status: approvalStatus,
        recognition_ids: selectedRecognitionIds,
      };

      const updated = await updateAdminAlumni(initialId, payload);
      setAlumnus(updated);
      setSuccessMsg("Moderatsiya va unvonlar muvaffaqiyatli saqlandi!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!alumnus) return;
    if (
      !confirm(
        `Haqiqatan ham "${alumnus.full_name}" profilini o‘chirmoqchimisiz? Ushbu amalni ortga qaytarib bo‘lmaydi.`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await deleteAdminAlumni(alumnus.id.toString());
      router.push("/admin/alumni");
    } catch (err: any) {
      setError(err.message || "Profilni o‘chirishda xatolik");
      setSaving(false);
    }
  };

  const toggleRecognition = (id: number) => {
    setSelectedRecognitionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D1667]" />
        <p className="text-sm font-medium">Bitiruvchi profili yuklanmoqda...</p>
      </div>
    );
  }

  if (!alumnus && initialId) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Bitiruvchi profili topilmadi</h2>
        <p className="text-sm text-slate-500">Bunday ID yoki slugga ega bitiruvchi mavjud emas.</p>
        <Link
          href="/admin/alumni"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1667] text-white text-sm font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Bitiruvchilar ro‘yxatiga qaytish
        </Link>
      </div>
    );
  }

  // If user navigated directly to /admin/alumni/new
  if (!initialId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/alumni"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Bitiruvchi Ma’lumotlari Xavfsizligi
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Profil yaratish va tahrirlash siyosati
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Bitiruvchilar o‘z profillarini rasmiy anketa orqali shakllantiradilar
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Qarshi davlat universiteti ALUMNI platformasida bitiruvchilarning shaxsiy ma’lumotlari daxlsizdir.
            Adminlar bitiruvchilar nomidan ma’lumotlarni to‘g‘ridan-to‘g‘ri kiritishi yoki o‘zgartirishi cheklangan.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Yangi bitiruvchilar portalda ro‘yxatdan o‘tish yoki rasmiy anketa sahifasi (<strong>/anketa</strong>) orqali ma’lumot yuboradilar.
            Adminlar yuborilgan anketalarni tekshiradi, tasdiqlaydi va faxriy unvonlar biriktiradi.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/admin/alumni"
              className="px-4 py-2.5 bg-[#0D1667] text-white text-sm font-semibold rounded-xl hover:bg-[#1a2580] transition"
            >
              Bitiruvchilar ro‘yxatiga qaytish
            </Link>
            <a
              href="/anketa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 text-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-200 transition inline-flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Anketa sahifasini ko‘rish
            </a>
          </div>
        </div>
      </div>
    );
  }

  const hasPhoto = Boolean(alumnus?.avatar || alumnus?.image_url);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/alumni"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {alumnus?.full_name}
              </h2>
              {isHonorary && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold inline-flex items-center gap-1 border border-amber-200">
                  <Award className="w-3 h-3 text-amber-600" /> Faxriy
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Profil auditi, moderatsiya va unvonlar boshqaruvi
            </p>
          </div>
        </div>

        {alumnus?.slug && (
          <a
            href={`/alumni/${alumnus.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition inline-flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Ommaviy sahifani ko‘rish</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        )}
      </div>

      {/* Security & Integrity Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 shadow-sm">
        <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm text-blue-950 leading-relaxed">
          <strong className="font-bold block text-blue-900 mb-0.5">
            Bitiruvchi ma’lumotlari daxlsizligi himoyalangan (Read-Only)
          </strong>
          Ushbu sahifada bitiruvchining shaxsiy biografiyasi, kasbiy faoliyati va aloqa ma’lumotlari faqat ko‘rish rejimida taqdim etiladi. Admin profil ma’lumotlarini o‘zboshimchalik bilan o‘zgartira olmaydi — faqat moderatsiya holati, verifikatsiya va faxriy unvonlarni boshqara oladi.
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Read-only Profile Information (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 pb-5 border-b border-slate-100">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
                {hasPhoto ? (
                  <Image
                    src={alumnus?.avatar || alumnus?.image_url || ""}
                    alt={alumnus?.full_name || "Alumni"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-[#0D1667]">
                    {alumnus?.full_name?.charAt(0) || "A"}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {alumnus?.full_name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{alumnus?.faculty || "Fakultet ko‘rsatilmagan"}</span>
                  {alumnus?.graduation_year && (
                    <span className="font-semibold text-slate-700">
                      ({alumnus.graduation_year}-yil)
                    </span>
                  )}
                </p>
                {alumnus?.specialty && (
                  <p className="text-xs text-slate-500">
                    Mutaxassislik: <span className="text-slate-700">{alumnus.specialty}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Career & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Briefcase className="w-3.5 h-3.5" /> Hozirgi lavozim
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {alumnus?.position || alumnus?.current_activity || "Ko‘rsatilmagan"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Building className="w-3.5 h-3.5" /> Tashkilot / Kompaniya
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {alumnus?.current_company || "Ko‘rsatilmagan"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5" /> Joylashuv
                </span>
                <p className="font-semibold text-slate-700">
                  {[alumnus?.city, alumnus?.country].filter(Boolean).join(", ") || "Ko‘rsatilmagan"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Layers className="w-3.5 h-3.5" /> Faoliyat sohasi
                </span>
                <p className="font-semibold text-slate-700">
                  {alumnus?.industry || "Umumiy"}
                </p>
              </div>
            </div>

            {/* Academic Degrees & Titles */}
            {(alumnus?.academic_degree || alumnus?.academic_title || alumnus?.degree) && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1 text-xs">
                <span className="font-bold text-amber-900 block">Ilmiy salohiyat:</span>
                <p className="text-slate-700">
                  {[alumnus?.academic_degree, alumnus?.academic_title, alumnus?.degree]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            )}

            {/* Contact Details (Admin only) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Aloqa va Bog‘lanish
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 truncate">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{alumnus?.email || alumnus?.contact_email || "Email yo‘q"}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 truncate">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{alumnus?.phone || "Telefon kiritilmagan"}</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex flex-wrap gap-2 pt-1">
                {alumnus?.linkedin_url && (
                  <a
                    href={alumnus.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
                  >
                    <Globe className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {alumnus?.github_url && (
                  <a
                    href={alumnus.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    <Globe className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {alumnus?.website_url && (
                  <a
                    href={alumnus.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition"
                  >
                    <Globe className="w-3.5 h-3.5" /> Veb-sayt
                  </a>
                )}
              </div>
            </div>

            {/* Biography & Story */}
            {(alumnus?.bio || alumnus?.biography_uz || alumnus?.career_story_uz) && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tarjimai hol & Karyera yo‘li
                </h4>
                {alumnus.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{alumnus.bio}"
                  </p>
                )}
                {alumnus.biography_uz && (
                  <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                    {alumnus.biography_uz}
                  </div>
                )}
                {alumnus.career_story_uz && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <strong className="font-bold text-slate-900 block">Karyera tajribasi:</strong>
                    <p className="leading-relaxed whitespace-pre-line">{alumnus.career_story_uz}</p>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {alumnus?.skills && Array.isArray(alumnus.skills) && alumnus.skills.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ko‘nikmalar va Mutaxassisliklar
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {alumnus.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Admin Moderation Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Moderation Controls Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-[#0D1667]" />
              <h3 className="font-bold text-slate-900 text-base">
                Moderatsiya va Boshqaruv
              </h3>
            </div>

            {/* Approval Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Moderatsiya holati:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalStatus("approved")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    approvalStatus === "approved"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tasdiqlangan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalStatus("pending")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    approvalStatus === "pending"
                      ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Kutilmoqda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalStatus("rejected")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    approvalStatus === "rejected"
                      ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Rad etilgan</span>
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              {/* Published Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Saytda e’lon qilish (Nashr)
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Bitiruvchi profili ommaviy katalogda ko‘rinishi
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0D1667] focus:ring-[#0D1667] cursor-pointer"
                />
              </label>

              {/* Featured Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Bosh sahifada tavsiya etish
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Bosh sahifa va maxsus bloklarda ko‘rsatish
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0D1667] focus:ring-[#0D1667] cursor-pointer"
                />
              </label>

              {/* Honorary Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 cursor-pointer transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Faxriy Bitiruvchi maqomi
                  </span>
                  <span className="text-[11px] text-amber-700/80 block">
                    Oltin faxriy nishon va faxriylar ro‘yxatiga kiritish
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isHonorary}
                  onChange={(e) => setIsHonorary(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Honorary Recognitions Multi-Select */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>Faxriy Unvonlar & Nishonlar</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {selectedRecognitionIds.length} ta tanlandi
                </span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {recognitionsList.map((rec) => {
                  const isChecked = selectedRecognitionIds.includes(rec.id);
                  return (
                    <div
                      key={rec.id}
                      onClick={() => toggleRecognition(rec.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                        isChecked
                          ? "bg-purple-50 border-purple-300 text-purple-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RecognitionIcon icon={rec.icon} size={14} className="text-purple-600" />
                        <span>{getRecognitionTitle(rec.slug, "uz", rec.name)}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded text-purple-600 pointer-events-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <button
                type="button"
                onClick={handleSaveModeration}
                disabled={saving}
                className="w-full py-2.5 px-4 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Moderatsiyani Saqlash</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Soxta / Spamer profilni o‘chirish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
