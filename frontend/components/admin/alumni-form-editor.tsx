"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  User,
} from "lucide-react";
import {
  createAdminAlumni,
  getAdminAlumniById,
  getAdminRecognitions,
  getFaculties,
  updateAdminAlumni,
} from "@/lib/api";
import { RecognitionIcon } from "@/components/alumni/recognition-icon";
import { getRecognitionTitle } from "@/lib/i18n";
import type { AdminRecognition } from "@/types/admin";
import type { Alumni, Faculty } from "@/types/alumni";

interface AlumniFormEditorProps {
  initialId?: string;
}

export function AlumniFormEditor({ initialId }: AlumniFormEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialId);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [recognitionsList, setRecognitionsList] = useState<AdminRecognition[]>([]);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [specialtyName, setSpecialtyName] = useState("");
  const [graduationYear, setGraduationYear] = useState<string>("");
  const [degree, setDegree] = useState("");
  const [academicDegree, setAcademicDegree] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [position, setPosition] = useState("");
  const [currentActivity, setCurrentActivity] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("Qarshi");
  const [country, setCountry] = useState("O‘zbekiston");
  const [skillsStr, setSkillsStr] = useState("");
  const [bio, setBio] = useState("");
  const [biographyUz, setBiographyUz] = useState("");
  const [biographyEn, setBiographyEn] = useState("");
  const [careerStoryUz, setCareerStoryUz] = useState("");
  const [careerStoryEn, setCareerStoryEn] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Photo & Avatar State
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarBase64, setAvatarBase64] = useState<string>("");
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCredit, setImageCredit] = useState("");
  const [imageSourceUrl, setImageSourceUrl] = useState("");

  const [isHonorary, setIsHonorary] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("approved");

  const [selectedRecognitionIds, setSelectedRecognitionIds] = useState<number[]>([]);

  const [achievements, setAchievements] = useState<
    { title: string; description?: string; year?: number | null; category?: string }[]
  >([]);

  const [timeline, setTimeline] = useState<
    { year: number; title: string; organization?: string; description?: string; type?: string }[]
  >([]);

  useEffect(() => {
    Promise.all([
      getFaculties().then(setFaculties),
      getAdminRecognitions().then((res) => setRecognitionsList(res.results || [])),
    ]).catch(console.error);

    if (initialId) {
      getAdminAlumniById(initialId)
        .then((data: Alumni) => {
          setFullName(data.full_name || "");
          setFacultyName(data.faculty || data.faculty_name || "");
          setSpecialtyName(data.specialty || "");
          setGraduationYear(data.graduation_year ? data.graduation_year.toString() : "");
          setDegree(data.degree || "");
          setAcademicDegree(data.academic_degree || "");
          setAcademicTitle(data.academic_title || "");
          setCurrentCompany(data.current_company || "");
          setPosition(data.position || "");
          setCurrentActivity(data.current_activity || "");
          setIndustry(data.industry || "");
          setCity(data.city || "Qarshi");
          setCountry(data.country || "O‘zbekiston");
          setSkillsStr(data.skills?.join(", ") || "");
          setBio(data.bio || "");
          setBiographyUz(data.biography_uz || "");
          setBiographyEn(data.biography_en || "");
          setCareerStoryUz(data.career_story_uz || "");
          setCareerStoryEn(data.career_story_en || "");
          setLinkedinUrl(data.linkedin_url || "");
          setGithubUrl(data.github_url || "");
          setWebsiteUrl(data.website_url || "");
          setPhone(data.phone || "");
          setContactEmail(data.contact_email || "");

          if (data.avatar) {
            setAvatarPreview(data.avatar);
          }
          setImageUrl(data.image_url || "");
          setImageAlt(data.image_alt || "");
          setImageCredit(data.image_credit || "");
          setImageSourceUrl(data.image_source_url || "");

          setIsHonorary(Boolean(data.is_honorary));
          setIsFeatured(Boolean(data.is_featured));
          setIsPublished(data.is_published !== false);
          setApprovalStatus((data.approval_status as any) || "approved");

          if (data.recognitions && Array.isArray(data.recognitions)) {
            setSelectedRecognitionIds(data.recognitions.map((r: any) => r.id));
          }

          if (data.achievements) {
            setAchievements(
              data.achievements.map((a) => ({
                title: a.title,
                description: a.description,
                year: a.year,
                category: a.category,
              }))
            );
          }

          if (data.timeline) {
            setTimeline(
              data.timeline.map((t) => ({
                year: t.year,
                title: t.title,
                organization: t.organization,
                description: t.description,
                type: t.type,
              }))
            );
          }
        })
        .catch((err) => setError(err.message || "Profilni yuklab bo‘lmadi"))
        .finally(() => setLoading(false));
    }
  }, [initialId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm hajmi 5MB dan oshmasligi kerak.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview("");
    setAvatarBase64("");
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleToggleRecognition = (id: number) => {
    setSelectedRecognitionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddAchievement = () => {
    setAchievements((prev) => [
      ...prev,
      { title: "", description: "", year: new Date().getFullYear(), category: "professional" },
    ]);
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTimeline = () => {
    setTimeline((prev) => [
      ...prev,
      { year: new Date().getFullYear(), title: "", organization: "", description: "", type: "career" },
    ]);
  };

  const handleRemoveTimeline = (index: number) => {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("F.I.SH. majburiy maydon.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMsg("");

    const payload: any = {
      full_name: fullName.trim(),
      faculty_name: facultyName.trim() || undefined,
      specialty_name: specialtyName.trim() || undefined,
      graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
      degree: degree.trim(),
      academic_degree: academicDegree,
      academic_title: academicTitle,
      current_company: currentCompany.trim(),
      position: position.trim(),
      current_activity: currentActivity.trim(),
      industry: industry.trim(),
      city: city.trim(),
      country: country.trim(),
      skills: skillsStr ? skillsStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      bio: bio.trim(),
      biography_uz: biographyUz.trim(),
      biography_en: biographyEn.trim(),
      career_story_uz: careerStoryUz.trim(),
      career_story_en: careerStoryEn.trim(),
      linkedin_url: linkedinUrl.trim(),
      github_url: githubUrl.trim(),
      website_url: websiteUrl.trim(),
      phone: phone.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      image_url: imageUrl.trim(),
      image_alt: imageAlt.trim() || fullName.trim(),
      image_credit: imageCredit.trim(),
      image_source_url: imageSourceUrl.trim(),
      is_honorary: isHonorary,
      is_featured: isFeatured,
      is_published: isPublished,
      approval_status: approvalStatus,
      recognition_ids: selectedRecognitionIds,
      achievements: achievements.filter((a) => a.title.trim()),
      timeline: timeline.filter((t) => t.title.trim() && t.year),
    };

    if (avatarBase64) {
      payload.avatar = avatarBase64;
    } else if (!avatarPreview && isEditing) {
      payload.remove_avatar = true;
    }

    try {
      if (isEditing && initialId) {
        await updateAdminAlumni(initialId, payload);
        setSuccessMsg("Bitiruvchi profili muvaffaqiyatli yangilandi.");
      } else {
        const created = await createAdminAlumni(payload);
        setSuccessMsg("Yangi bitiruvchi profili muvaffaqiyatli yaratildi.");
        setTimeout(() => {
          router.push(`/admin/alumni/${created.slug || created.id}/edit`);
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D1667] mb-3" />
        <p className="text-sm text-slate-500">Profil ma’lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  const currentDisplayPhoto = avatarPreview || imageUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/alumni"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {isEditing ? "Profilni Tahrirlash" : "Yangi Bitiruvchi Qo‘shish"}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing ? `ID: ${initialId}` : "QarDU ALUMNI Ma’lumotlar Bazasi"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/alumni"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#D38E4F]" />
                <span>Saqlash</span>
              </>
            )}
          </button>
        </div>
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

      {/* 1. Asosiy Shaxsiy & Ta’lim Ma’lumotlari */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D1667] flex items-center gap-2">
          <span>1. Asosiy va Akademik Ma’lumotlar</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              To‘liq F.I.SH. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Azizov Sardor Bahodirovich"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bitirgan Yili</label>
            <input
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="Masalan: 2018"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fakultet</label>
            <input
              type="text"
              list="faculty-list"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              placeholder="Masalan: Fizika-matematika fakulteti"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
            <datalist id="faculty-list">
              {faculties.map((f) => (
                <option key={f.id} value={f.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mutaxassislik / Yo‘nalish</label>
            <input
              type="text"
              value={specialtyName}
              onChange={(e) => setSpecialtyName(e.target.value)}
              placeholder="Masalan: Amaliy matematika va informatika"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ta’lim Darajasi</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="Bakalavr / Magistr"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ilmiy Daraja</label>
            <select
              value={academicDegree}
              onChange={(e) => setAcademicDegree(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            >
              <option value="">Ilmiy darajasi yo‘q</option>
              <option value="phd">Falsafa doktori (PhD)</option>
              <option value="dsc">Fan doktori (DSc)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ilmiy Unvon</label>
            <select
              value={academicTitle}
              onChange={(e) => setAcademicTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            >
              <option value="">Ilmiy unvoni yo‘q</option>
              <option value="docent">Dotsent</option>
              <option value="professor">Professor</option>
              <option value="senior_researcher">Katta ilmiy xodim</option>
              <option value="academician">Akademik</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Kasbiy Faoliyat & Manzil */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D1667]">
          2. Kasbiy Faoliyat va Aloqa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hozirgi Ish Joyi / Tashkilot</label>
            <input
              type="text"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              placeholder="Masalan: EPAM Systems / QarDU"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lavozim</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Masalan: Bosh dasturchi / Kafedra mudiri"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Soha / Industriyalik</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Axborot texnologiyalari, Ta’lim, Moliya"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hozirgi Faoliyati Tavsifi</label>
            <input
              type="text"
              value={currentActivity}
              onChange={(e) => setCurrentActivity(e.target.value)}
              placeholder="Masalan: IT sohasida arxitektor"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shahar</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Toshkent / Qarshi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Davlat</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="O‘zbekiston"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Ko‘nikmalar (vergul bilan ajratilgan)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="Python, AI, Ilmiy tadqiqot, Menejment"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Manzil</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="alumnus@qarshidu.uz"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Raqami</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Havolasi</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>
        </div>
      </div>

      {/* 3. Portret Rasmi (Upload & URL) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D1667] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#D38E4F]" />
            <span>3. Portret Rasmi</span>
          </h3>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setImageTab("upload")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                imageTab === "upload" ? "bg-white text-[#0D1667] shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Upload className="w-3.5 h-3.5 inline mr-1" />
              Fayl yuklash
            </button>
            <button
              type="button"
              onClick={() => setImageTab("url")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                imageTab === "url" ? "bg-white text-[#0D1667] shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
              URL havola
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar Preview Box */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-32 h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative group shadow-sm">
              {currentDisplayPhoto ? (
                <>
                  <img
                    src={currentDisplayPhoto}
                    alt={fullName || "Portret"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                    title="Rasmni o‘chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-3">
                  <User className="w-10 h-10 text-slate-300 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-400 font-medium">Rasm yo‘q</span>
                </div>
              )}
            </div>
            {currentDisplayPhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Rasmni olib tashlash
              </button>
            )}
          </div>

          {/* Upload Dropzone / URL inputs */}
          <div className="flex-1 w-full space-y-4">
            {imageTab === "upload" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0D1667] rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-slate-100/60 transition group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#0D1667] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition shadow-sm">
                  <Upload className="w-6 h-6 text-[#D38E4F]" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Kompyuterdan rasm faylini tanlang yoki shu yerga tashlang
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Formatlar: JPG, PNG, WEBP &bull; Maksimal hajm: 5 MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3 px-4 py-1.5 bg-[#0D1667] text-white text-xs font-semibold rounded-xl hover:bg-[#1a2580] transition shadow-sm"
                >
                  Faylni tanlash
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rasm URL Havolasi</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rasm Muallifi (Credit)</label>
                  <input
                    type="text"
                    value={imageCredit}
                    onChange={(e) => setImageCredit(e.target.value)}
                    placeholder="Fotograf ismi / Unsplash"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rasm Manba Sahifasi</label>
                  <input
                    type="url"
                    value={imageSourceUrl}
                    onChange={(e) => setImageSourceUrl(e.target.value)}
                    placeholder="https://unsplash.com/photos/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Biografiya & Karyera Hikoyasi */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D1667]">
          4. Biografiya va Karyera Tarixi
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Qisqa Bio (Kartochka uchun)</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bitiruvchi haqida 1-2 jumlali qisqacha ma’lumot..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batafsil Biografiya (O‘zbekcha)</label>
              <textarea
                rows={5}
                value={biographyUz}
                onChange={(e) => setBiographyUz(e.target.value)}
                placeholder="Bitiruvchining to‘liq hayot va faoliyat yo‘li..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biography (English)</label>
              <textarea
                rows={5}
                value={biographyEn}
                onChange={(e) => setBiographyEn(e.target.value)}
                placeholder="Alumni detailed biography in English..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D1667]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Faxriy Unvonlar & Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D1667] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#D38E4F]" />
          <span>5. Moderatsiya va Faxriy Unvonlar</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Moderatsiya Holati</label>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0D1667]"
            >
              <option value="approved">✅ Tasdiqlangan (Approved)</option>
              <option value="pending">⏳ Kutilmoqda (Pending)</option>
              <option value="rejected">❌ Rad etilgan (Rejected)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="is-honorary-check"
              checked={isHonorary}
              onChange={(e) => setIsHonorary(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D1667] focus:ring-[#0D1667]"
            />
            <label htmlFor="is-honorary-check" className="text-xs font-bold text-slate-900 cursor-pointer">
              🏅 Faxriy Bitiruvchi
            </label>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="is-featured-check"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D1667] focus:ring-[#0D1667]"
            />
            <label htmlFor="is-featured-check" className="text-xs font-bold text-slate-900 cursor-pointer">
              ⭐ Bosh sahifada (Featured)
            </label>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="is-published-check"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D1667] focus:ring-[#0D1667]"
            />
            <label htmlFor="is-published-check" className="text-xs font-bold text-slate-900 cursor-pointer">
              🌐 Saytda ommaviy ko‘rinsin
            </label>
          </div>
        </div>

        {/* Recognitions Multi-Select Badges */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Biriktirilgan Faxriy Unvonlar (Tavsiyaviy unvon belgisini tanlang):
          </label>
          <div className="flex flex-wrap gap-2.5">
            {recognitionsList.map((rec) => {
              const isSelected = selectedRecognitionIds.includes(rec.id);
              return (
                <button
                  type="button"
                  key={rec.id}
                  onClick={() => handleToggleRecognition(rec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                    isSelected
                      ? "bg-[#0D1667] text-white border-[#0D1667] shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <RecognitionIcon icon={rec.icon} className="w-3.5 h-3.5 text-[#D38E4F]" />
                  <span>{getRecognitionTitle(rec.name, "uz")}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Floating Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Link
          href="/admin/alumni"
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
        >
          Bekor qilish
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#0D1667] hover:bg-[#1a2580] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saqlanmoqda...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#D38E4F]" />
              <span>{isEditing ? "O‘zgarishlarni Saqlash" : "Bitiruvchini Yaratish"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
