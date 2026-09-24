"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authenticatedFetch } from "@/lib/auth";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  GraduationCap,
  Info,
  Lock,
  MapPin,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import type { Alumni, EducationExperience, GraduationYearChangeRequest, WorkExperience } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { CustomSelect } from "@/components/ui/custom-select";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1956 + 2 }, (_, i) => CURRENT_YEAR + 1 - i);

const DEGREE_LEVEL_OPTIONS = [
  { value: "master", label: "Magistratura (Magistr)" },
  { value: "phd", label: "Falsafa doktori (PhD)" },
  { value: "dsc", label: "Fan doktori (DSc)" },
  { value: "bachelor", label: "Bakalavriat (Bakalavr)" },
  { value: "residency", label: "Ordinatura / Rezidentura" },
  { value: "second_degree", label: "Ikkinchi oliy ta’lim" },
  { value: "other", label: "Boshqa oliy ta’lim" },
];

const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Qashqadaryo viloyati",
  "Samarqand viloyati",
  "Buxoro viloyati",
  "Andijon viloyati",
  "Farg‘ona viloyati",
  "Namangan viloyati",
  "Jizzax viloyati",
  "Navoiy viloyati",
  "Sirdaryo viloyati",
  "Surxondaryo viloyati",
  "Xorazm viloyati",
  "Qoraqalpog‘iston Respublikasi",
  "Xorij / Chet el",
];

const ACADEMIC_CHOICES = [
  { value: "", label: "Mavjud emas / Tanlanmagan" },
  { value: "bachelor", label: "Bakalavr" },
  { value: "master", label: "Magistr" },
  { value: "phd", label: "Falsafa doktori (PhD)" },
  { value: "dsc", label: "Fan doktori (DSc)" },
  { value: "docent", label: "Dotsent" },
  { value: "professor", label: "Professor" },
  { value: "senior_researcher", label: "Katta ilmiy xodim" },
  { value: "academician", label: "Akademik" },
];

const INDUSTRIES = [
  "Axborot texnologiyalari (IT) va media",
  "Ta’lim, fan va ilmiy tadqiqot",
  "Davlat xizmati, boshqaruv va huquq",
  "Moliya, bank va iqtisodiyot",
  "Sanoat, energetika va qurilish",
  "Tibbiyot va sog‘liqni saqlash",
  "Qishloq xo‘jaligi va agro-biznes",
  "Biznes, savdo va xizmat ko‘rsatish",
  "Madaniyat, san’at va sport",
  "Boshqa soha",
];

export function EditProfilePage({ locale = "uz" }: { locale?: Locale }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Block 1 state
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [graduationYear, setGraduationYear] = useState<number | null>(null);
  const [isYearLocked, setIsYearLocked] = useState(false);
  const [facultyName, setFacultyName] = useState("");
  const [bio, setBio] = useState("");
  const [academicCredentials, setAcademicCredentials] = useState("");
  const [educations, setEducations] = useState<EducationExperience[]>([]);

  // Year Change Request Modal/Inline State
  const [showYearRequestModal, setShowYearRequestModal] = useState(false);
  const [requestedYear, setRequestedYear] = useState<number>(CURRENT_YEAR);
  const [yearRequestReason, setYearRequestReason] = useState("");
  const [submittingYearRequest, setSubmittingYearRequest] = useState(false);
  const [pendingYearRequest, setPendingYearRequest] = useState<GraduationYearChangeRequest | null>(null);

  // Block 2 state
  const [industry, setIndustry] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [position, setPosition] = useState("");
  const [city, setCity] = useState("");
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);

  useEffect(() => {
    let active = true;
    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/alumni/me/", { credentials: "same-origin", cache: "no-store" });
        if ([401, 403].includes(res.status)) {
          router.push("/profile");
          return;
        }
        if (!res.ok) throw new Error("Profil ma’lumotlarini yuklashda xatolik.");
        const json = await res.json();
        const data: Alumni = json.data;
        if (!active) return;

        setFullName(data.full_name || "");
        setAvatarPreview(data.avatar || data.image_url || null);
        setGraduationYear(data.graduation_year ?? null);
        setIsYearLocked(Boolean(data.graduation_year));
        setFacultyName(data.faculty_name || data.faculty || "");
        setBio(data.bio || "");

        if (data.academic_degree) {
          setAcademicCredentials(data.academic_degree);
        } else if (data.academic_title) {
          setAcademicCredentials(data.academic_title);
        } else if (data.degree) {
          setAcademicCredentials(data.degree);
        }

        setPendingYearRequest(data.pending_graduation_request || null);

        if (Array.isArray(data.educations) && data.educations.length > 0) {
          setEducations(data.educations);
        } else {
          setEducations([]);
        }

        // Block 2
        setIndustry(data.industry || "");
        setCurrentCompany(data.current_company || "");
        setPosition(data.position || "");
        setCity(data.city || "");

        if (Array.isArray(data.work_experiences) && data.work_experiences.length > 0) {
          setWorkExperiences(data.work_experiences);
        } else {
          setWorkExperiences([]);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      active = false;
    };
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Rasm hajmi 3 MB dan oshmasligi kerak.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Faqat JPG, PNG yoki WebP formatdagi rasmlar qabul qilinadi.");
      return;
    }

    setError("");
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddEducation = () => {
    if (educations.length >= 10) {
      setError("Ko‘pi bilan 10 ta ta’lim bosqichini qo‘shishingiz mumkin.");
      return;
    }
    setError("");
    setEducations([
      ...educations,
      {
        degree_level: "master",
        institution: "Qarshi davlat universiteti",
        faculty: "",
        specialty: "",
        start_year: null,
        graduation_year: CURRENT_YEAR,
        order: educations.length,
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleUpdateEducation = (index: number, patch: Partial<EducationExperience>) => {
    setEducations(
      educations.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const handleAddWorkExperience = () => {
    if (workExperiences.length >= 7) {
      setError("Maksimal 7 tagacha ish joyi qo‘shishingiz mumkin.");
      return;
    }
    setError("");
    setWorkExperiences([
      ...workExperiences,
      {
        region: "Toshkent shahri",
        company: "",
        position: "",
        industry: "",
        start_year: CURRENT_YEAR,
        end_year: null,
        is_current: true,
      },
    ]);
  };

  const handleRemoveWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const handleUpdateWorkExperience = (index: number, patch: Partial<WorkExperience>) => {
    setWorkExperiences(
      workExperiences.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...patch };
        if (patch.end_year !== undefined) {
          updated.is_current = patch.end_year === null;
        }
        return updated;
      })
    );
  };

  const handleSubmitYearChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearRequestReason.trim() || yearRequestReason.trim().length < 5) {
      setError("Iltimos, bitiruv yilini o‘zgartirish sababini batafsilroq yozing (kamida 5 ta belgi).");
      return;
    }

    setSubmittingYearRequest(true);
    setError("");
    try {
      const res = await authenticatedFetch("/api/v1/alumni/me/graduation-year-request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requested_year: requestedYear,
          reason: yearRequestReason.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        let msg = json?.error?.message || json?.detail || "So‘rovni yuborib bo‘lmadi.";
        if (json?.error?.fields && typeof json.error.fields === "object") {
          const fieldDetails = Object.entries(json.error.fields)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("; ");
          if (fieldDetails) msg += ` (${fieldDetails})`;
        }
        throw new Error(msg);
      }

      setPendingYearRequest(json.data);
      setShowYearRequestModal(false);
      setSuccessMessage("Bitirgan yilni o‘zgartirish so‘rovi adminga muvaffaqiyatli yuborildi.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
    } finally {
      setSubmittingYearRequest(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSaving(true);

    try {
      if (!fullName.trim()) {
        throw new Error("F.I.Sh. kiritilishi shart.");
      }

      let degreeVal = "";
      let academicDegreeVal = "";
      let academicTitleVal = "";

      if (["phd", "dsc"].includes(academicCredentials)) {
        academicDegreeVal = academicCredentials;
      } else if (["docent", "professor", "senior_researcher", "academician"].includes(academicCredentials)) {
        academicTitleVal = academicCredentials;
      } else if (["bachelor", "master"].includes(academicCredentials)) {
        degreeVal = academicCredentials === "bachelor" ? "Bakalavr" : "Magistr";
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append("city", city.trim());
        const resAvatar = await authenticatedFetch("/api/v1/alumni/me/", {
          method: "PATCH",
          body: formData,
        });
        if (!resAvatar.ok) {
          const errData = await resAvatar.json().catch(() => ({}));
          let msg = errData?.error?.message || errData?.detail || "Rasmni saqlashda xatolik yuz berdi.";
          if (errData?.error?.fields && typeof errData.error.fields === "object") {
            const fieldDetails = Object.entries(errData.error.fields)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("; ");
            if (fieldDetails) msg += ` (${fieldDetails})`;
          }
          throw new Error(msg);
        }
      }

      // Save educations, work experiences and main profile data
      const jsonPayload = {
        full_name: fullName.trim(),
        faculty_name: facultyName.trim(),
        bio: bio.trim(),
        degree: degreeVal,
        academic_degree: academicDegreeVal,
        academic_title: academicTitleVal,
        industry: industry.trim(),
        current_company: currentCompany.trim(),
        position: position.trim(),
        city: city.trim(),
        ...(!isYearLocked && graduationYear ? { graduation_year: graduationYear } : {}),
        educations: educations.map((e, idx) => ({
          degree_level: e.degree_level || "master",
          institution: (e.institution || "Qarshi davlat universiteti").trim(),
          faculty: (e.faculty || "").trim(),
          specialty: (e.specialty || "").trim(),
          start_year: e.start_year ? Number(e.start_year) : null,
          graduation_year: Number(e.graduation_year) || CURRENT_YEAR,
          order: idx + 1,
        })),
        work_experiences: workExperiences.map((w, idx) => ({
          region: w.region || "Toshkent shahri",
          company: w.company.trim(),
          position: w.position.trim(),
          industry: (w.industry || "").trim(),
          start_year: Number(w.start_year) || CURRENT_YEAR,
          end_year: w.end_year ? Number(w.end_year) : null,
          is_current: !w.end_year,
          order: idx + 1,
        })),
      };

      const resMain = await authenticatedFetch("/api/v1/alumni/me/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonPayload),
      });

      if (!resMain.ok) {
        const errData = await resMain.json().catch(() => ({}));
        let msg = errData?.error?.message || errData?.detail || "Ma’lumotlarni saqlashda xatolik yuz berdi.";
        if (errData?.error?.fields && typeof errData.error.fields === "object") {
          const fieldDetails = Object.entries(errData.error.fields)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("; ");
          if (fieldDetails) msg += ` (${fieldDetails})`;
        }
        throw new Error(msg);
      }

      setSuccessMessage("Profilingiz muvaffaqiyatli saqlandi!");
      window.dispatchEvent(new Event("auth-changed"));

      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-loading" role="status">
        <div className="edit-profile-spinner" />
        <p>Profil ma’lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      {/* Top Breadcrumb & Page Header */}
      <div className="edit-profile-top-bar">
        <Link href="/profile" className="edit-profile-back-link">
          <ArrowLeft size={16} />
          <span>Profilga qaytish</span>
        </Link>
        <div className="edit-profile-heading-group">
          <span className="edit-profile-eyebrow">QarDU ALUMNI • SHAXSIY KABINET</span>
          <h1 className="edit-profile-page-title">Profilni tahrirlash</h1>
          <p className="edit-profile-page-subtitle">
            Shaxsiy va mehnat faoliyati ma’lumotlaringizni yangilab, universitet tarmog‘idagi nufuzingizni oshiring.
          </p>
        </div>
      </div>

      {error && (
        <div className="edit-profile-alert error" role="alert">
          <Info size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="edit-profile-alert success" role="alert">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="edit-profile-form">
        <div className="edit-profile-grid">
          {/* ================================================================= */}
          {/* 1. BLOK: ASOSIY MA'LUMOTLAR                                       */}
          {/* ================================================================= */}
          <section className="edit-profile-card">
            <div className="edit-profile-card-header">
              <div className="edit-profile-card-badge-wrap">
                <span className="edit-profile-card-number">1</span>
                <div>
                  <h2 className="edit-profile-card-title">Asosiy ma’lumotlar</h2>
                  <span className="edit-profile-card-subtitle">Shaxsiy profil va ta'lim ma'lumotlari</span>
                </div>
              </div>
              <ShieldCheck size={20} className="text-brand-navy opacity-40" />
            </div>

            {/* Avatar uploader */}
            <div className="edit-profile-avatar-studio">
              <div className="edit-profile-avatar-wrapper">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={fullName || "Profil rasmi"}
                    width={96}
                    height={96}
                    className="edit-profile-avatar-img"
                    unoptimized={avatarPreview.startsWith("blob:") || avatarPreview.startsWith("data:")}
                  />
                ) : (
                  <div className="edit-profile-avatar-placeholder">
                    <User size={44} className="text-slate-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="edit-profile-avatar-camera-btn"
                  title="Rasmni almashtirish"
                  aria-label="Rasm yuklash"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div className="edit-profile-avatar-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  aria-hidden="true"
                />
                <div className="edit-profile-avatar-btns">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="edit-profile-btn edit-profile-btn-upload"
                  >
                    <Upload size={14} />
                    <span>Rasm yuklash</span>
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="edit-profile-btn edit-profile-btn-danger-outline"
                    >
                      <Trash2 size={13} />
                      <span>O‘chirish</span>
                    </button>
                  )}
                </div>
                <span className="edit-profile-avatar-hint">JPG, PNG, WebP (maks. 3 MB, ixtiyoriy)</span>
              </div>
            </div>

            {/* F.I.Sh. */}
            <div className="edit-profile-field">
              <label htmlFor="full_name" className="edit-profile-label">
                F.I.Sh. (To‘liq ism-familiya) <span className="text-red-500">*</span>
              </label>
              <div className="edit-profile-input-icon-wrap">
                <User size={16} className="input-leading-icon" />
                <input
                  id="full_name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Abdug‘aniyev Boburjon Akramjon o‘g‘li"
                  className="edit-profile-input with-leading-icon"
                />
              </div>
            </div>

            {/* Bitirgan yili & Fakulteti (Side-by-side grid) */}
            <div className="edit-profile-row-2col">
              {/* Bitirgan yil */}
              <div className="edit-profile-field">
                <div className="edit-profile-label-row">
                  <label className="edit-profile-label">Bitirgan yil</label>
                  {isYearLocked && (
                    <span className="edit-profile-chip-locked">
                      <Lock size={11} />
                      <span>Tasdiqlangan</span>
                    </span>
                  )}
                </div>

                {isYearLocked ? (
                  <div className="edit-profile-locked-year-card">
                    <div className="locked-year-badge-left">
                      <GraduationCap size={18} className="text-brand-gold" />
                      <span className="locked-year-text">{graduationYear}-yil</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowYearRequestModal(true)}
                      className="edit-profile-req-btn"
                    >
                      <Edit3 size={13} />
                      <span>O‘zgartirish so‘rovi</span>
                    </button>
                  </div>
                ) : (
                  <CustomSelect
                    value={graduationYear}
                    onChange={(val) => setGraduationYear(val ? Number(val) : null)}
                    options={YEARS.map((y) => ({ value: y, label: `${y}-yil` }))}
                    placeholder="Bitirgan yilingizni tanlang"
                    icon={GraduationCap}
                  />
                )}

                {pendingYearRequest && (
                  <div className="edit-profile-pending-notice">
                    <Clock size={13} className="text-amber-600 flex-shrink-0" />
                    <span>
                      Adminga <strong>{pendingYearRequest.requested_year}-yil</strong> uchun so‘rov yuborilgan (Kutilmoqda).
                    </span>
                  </div>
                )}
              </div>

              {/* Fakulteti */}
              <div className="edit-profile-field">
                <div className="edit-profile-label-row">
                  <label htmlFor="faculty_name" className="edit-profile-label">
                    Fakulteti
                  </label>
                  <span className="edit-profile-optional-badge">Ixtiyoriy</span>
                </div>
                <div className="edit-profile-input-icon-wrap">
                  <Building2 size={16} className="input-leading-icon" />
                  <input
                    id="faculty_name"
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="Masalan: Axborot texnologiyalari"
                    className="edit-profile-input with-leading-icon"
                  />
                </div>
              </div>
            </div>

            {/* BIO */}
            <div className="edit-profile-field">
              <div className="edit-profile-label-row">
                <label htmlFor="bio" className="edit-profile-label">
                  O‘zingiz haqingizda qisqacha ma’lumot (BIO)
                </label>
                <span className="edit-profile-optional-badge">Ixtiyoriy</span>
              </div>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mutaxassisligingiz, sohadagi faoliyatingiz, yutuqlaringiz va maqsadlaringiz haqida qisqacha yozing..."
                className="edit-profile-textarea"
              />
              <span className="edit-profile-field-hint">
                Ushbu ma’lumot boshqa bitiruvchilar va talabalar uchun profilingizda ko‘rsatiladi.
              </span>
            </div>



          </section>

          {/* ================================================================= */}
          {/* 2. BLOK: TA'LIM BOSQICHLARI                                       */}
          {/* ================================================================= */}
          <section className="edit-profile-card">
            <div className="edit-profile-card-header">
              <div className="edit-profile-card-badge-wrap">
                <span className="edit-profile-card-number">2</span>
                <div>
                  <h2 className="edit-profile-card-title">Ta’lim bosqichlari</h2>
                  <span className="edit-profile-card-subtitle">
                    Magistratura, PhD, DSc va boshqa oliy ta’lim ({educations.length}/10)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {educations.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="edit-profile-add-exp-btn"
                  >
                    <Plus size={14} />
                    <span>Ta’lim qo‘shish</span>
                  </button>
                )}
                <GraduationCap size={20} className="text-brand-navy opacity-40" />
              </div>
            </div>

            {educations.length === 0 ? (
              <div className="edit-profile-empty-experiences">
                <div className="empty-exp-icon-wrap">
                  <GraduationCap size={24} className="text-brand-navy" />
                </div>
                <h4 className="empty-exp-title">Hozircha qo‘shimcha ta’lim bosqichlari qo‘shilmagan</h4>
                <p className="empty-exp-desc">
                  Magistratura, Falsafa doktori (PhD), Fan doktori (DSc) yoki ikkinchi oliy ta’limingizni qo‘shing.
                </p>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="edit-profile-empty-add-btn"
                >
                  <Plus size={15} />
                  <span>+ Magistratura / PhD qo‘shish</span>
                </button>
              </div>
            ) : (
              <div className="edit-profile-experiences-list">
                {educations.map((edu, idx) => (
                  <div key={idx} className="edit-profile-exp-card">
                    <div className="edit-profile-exp-card-top">
                      <div className="flex items-center gap-2">
                        <span className="edit-profile-exp-badge">#{idx + 1}</span>
                        <span className="edit-profile-exp-title">
                          {DEGREE_LEVEL_OPTIONS.find((o) => o.value === edu.degree_level)?.label || "Ta’lim bosqichi"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="edit-profile-exp-del-btn"
                        title="Ushbu ta’lim ma’lumotini o‘chirish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Ta'lim darajasi & Bitirgan yili */}
                    <div className="edit-profile-row-2col mb-3">
                      <div className="edit-profile-field">
                        <label className="edit-profile-label">Ta’lim darajasi / Bosqichi</label>
                        <CustomSelect
                          value={edu.degree_level}
                          onChange={(val) => handleUpdateEducation(idx, { degree_level: val })}
                          options={DEGREE_LEVEL_OPTIONS}
                          placeholder="Darajani tanlang"
                          icon={Award}
                        />
                      </div>
                      <div className="edit-profile-field">
                        <label className="edit-profile-label">Bitirgan yili</label>
                        <CustomSelect
                          value={edu.graduation_year}
                          onChange={(val) => handleUpdateEducation(idx, { graduation_year: Number(val) })}
                          options={YEARS.map((y) => ({ value: y, label: `${y}-yil` }))}
                          placeholder="Bitirgan yilni tanlang"
                          icon={GraduationCap}
                        />
                      </div>
                    </div>

                    {/* Muassasa nomi & Fakultet/Yo'nalish */}
                    <div className="edit-profile-row-2col mb-3">
                      <div className="edit-profile-field">
                        <label className="edit-profile-label">OTM / Muassasa nomi</label>
                        <div className="edit-profile-input-icon-wrap">
                          <Building2 size={15} className="input-leading-icon" />
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(idx, { institution: e.target.value })}
                            placeholder="Masalan: Qarshi davlat universiteti"
                            className="edit-profile-input with-leading-icon"
                          />
                        </div>
                      </div>
                      <div className="edit-profile-field">
                        <label className="edit-profile-label">Fakultet / Yo‘nalish</label>
                        <div className="edit-profile-input-icon-wrap">
                          <BookOpen size={15} className="input-leading-icon" />
                          <input
                            type="text"
                            value={edu.faculty || ""}
                            onChange={(e) => handleUpdateEducation(idx, { faculty: e.target.value })}
                            placeholder="Masalan: Axborot texnologiyalari"
                            className="edit-profile-input with-leading-icon"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mutaxassislik / Ixtisoslik */}
                    <div className="edit-profile-field">
                      <label className="edit-profile-label">Mutaxassislik / Ixtisoslik (Ixtiyoriy)</label>
                      <div className="edit-profile-input-icon-wrap">
                        <BookOpen size={15} className="input-leading-icon" />
                        <input
                          type="text"
                          value={edu.specialty || ""}
                          onChange={(e) => handleUpdateEducation(idx, { specialty: e.target.value })}
                          placeholder="Masalan: 70610101 - Kompyuter ilmlari va dasturlash texnologiyalari"
                          className="edit-profile-input with-leading-icon"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ================================================================= */}
          {/* 3. BLOK: FAOLIYAT VA MEHNAT TARIXI                                */}
          {/* ================================================================= */}
          <section className="edit-profile-card">
            <div className="edit-profile-card-header">
              <div className="edit-profile-card-badge-wrap">
                <span className="edit-profile-card-number">3</span>
                <div>
                  <h2 className="edit-profile-card-title">Faoliyat va Mehnat tarixi</h2>
                  <span className="edit-profile-card-subtitle">
                    Hozirgi soha va ishlagan tashkilotlar ({workExperiences.length}/7)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {workExperiences.length < 7 && (
                  <button
                    type="button"
                    onClick={handleAddWorkExperience}
                    className="edit-profile-add-exp-btn"
                  >
                    <Plus size={14} />
                    <span>Ish joyi qo‘shish</span>
                  </button>
                )}
                <Briefcase size={20} className="text-brand-navy opacity-40" />
              </div>
            </div>

            {/* Hozirgi soha (Industry) */}
            <div className="edit-profile-field">
              <div className="edit-profile-label-row">
                <label htmlFor="industry" className="edit-profile-label">
                  Hozirgi faoliyat sohasi
                </label>
                <span className="edit-profile-optional-badge">Ixtiyoriy</span>
              </div>
              <CustomSelect
                id="industry"
                value={industry}
                onChange={(val) => setIndustry(val)}
                options={
                  industry && !INDUSTRIES.includes(industry)
                    ? [industry, ...INDUSTRIES]
                    : INDUSTRIES
                }
                placeholder="O‘z sohangizni tanlang"
                icon={Briefcase}
              />
            </div>

            {/* Hozirgi tashkilot va lavozim */}
            <div className="edit-profile-row-2col">
              <div className="edit-profile-field">
                <div className="edit-profile-label-row">
                  <label htmlFor="current_company" className="edit-profile-label">
                    Hozirgi tashkilot / ish joyi
                  </label>
                </div>
                <div className="edit-profile-input-icon-wrap">
                  <Building2 size={16} className="input-leading-icon" />
                  <input
                    id="current_company"
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="Masalan: IT Park Uzbekistan"
                    className="edit-profile-input with-leading-icon"
                  />
                </div>
              </div>

              <div className="edit-profile-field">
                <div className="edit-profile-label-row">
                  <label htmlFor="position" className="edit-profile-label">
                    Hozirgi lavozimi
                  </label>
                </div>
                <div className="edit-profile-input-icon-wrap">
                  <User size={16} className="input-leading-icon" />
                  <input
                    id="position"
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Masalan: Yetakchi dasturchi"
                    className="edit-profile-input with-leading-icon"
                  />
                </div>
              </div>
            </div>

            {/* Hozirgi ish joyi hududi */}
            <div className="edit-profile-field">
              <div className="edit-profile-label-row">
                <label htmlFor="city" className="edit-profile-label">
                  Hozirgi ish joyi hududi (Shahar / Viloyat)
                </label>
                <span className="edit-profile-optional-badge">Ixtiyoriy</span>
              </div>
              <CustomSelect
                id="city"
                value={city}
                onChange={(val) => setCity(val)}
                options={
                  city && !REGIONS.includes(city)
                    ? [city, ...REGIONS].map((r) => ({ value: r, label: r }))
                    : REGIONS.map((r) => ({ value: r, label: r }))
                }
                placeholder="Hududni tanlang (masalan: Qashqadaryo viloyati)"
                icon={MapPin}
              />
            </div>

            {/* Mehnat faoliyati tarixi */}
            <div className="edit-profile-work-history-section">
              <div className="edit-profile-work-history-header">
                <div>
                  <h3 className="edit-profile-subheading">Mehnat faoliyati tarixi</h3>
                  <p className="edit-profile-subheading-desc">
                    Ixtiyoriy, 7 tagacha ish joyi qo‘shishingiz mumkin ({workExperiences.length}/7)
                  </p>
                </div>
                {workExperiences.length < 7 && (
                  <button
                    type="button"
                    onClick={handleAddWorkExperience}
                    className="edit-profile-add-exp-btn"
                  >
                    <Plus size={14} />
                    <span>Ish joyi qo‘shish</span>
                  </button>
                )}
              </div>

              {workExperiences.length === 0 ? (
                <div className="edit-profile-empty-experiences">
                  <div className="empty-exp-icon-wrap">
                    <Briefcase size={24} className="text-brand-purple" />
                  </div>
                  <h4 className="empty-exp-title">Hozircha qo‘shimcha ish joylari qo‘shilmagan</h4>
                  <p className="empty-exp-desc">
                    Avvalgi yoki qo‘shimcha ishlagan korxonalaringizni qo‘shib, tajribangizni boyiting.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddWorkExperience}
                    className="edit-profile-empty-add-btn"
                  >
                    <Plus size={15} />
                    <span>Birinchi ish joyini qo‘shish</span>
                  </button>
                </div>
              ) : (
                <div className="edit-profile-experiences-list">
                  {workExperiences.map((exp, idx) => (
                    <div key={idx} className="edit-profile-exp-card">
                      <div className="edit-profile-exp-card-top">
                        <div className="flex items-center gap-2">
                          <span className="edit-profile-exp-badge">#{idx + 1}</span>
                          <span className="edit-profile-exp-title">
                            {exp.company || "Yangi ish joyi"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkExperience(idx)}
                          className="edit-profile-exp-del-btn"
                          title="Ushbu ish joyini o‘chirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Hudud va Faoliyat sohasi */}
                      <div className="edit-profile-row-2col mb-3">
                        <div className="edit-profile-field">
                          <label className="edit-profile-label">Hudud (Shahar / Viloyat)</label>
                          <CustomSelect
                            value={exp.region}
                            onChange={(val) => handleUpdateWorkExperience(idx, { region: val })}
                            options={REGIONS}
                            placeholder="Hududni tanlang"
                            icon={MapPin}
                          />
                        </div>
                        <div className="edit-profile-field">
                          <label className="edit-profile-label">Faoliyat sohasi (Soha)</label>
                          <CustomSelect
                            value={exp.industry || ""}
                            onChange={(val) => handleUpdateWorkExperience(idx, { industry: val })}
                            options={
                              exp.industry && !INDUSTRIES.includes(exp.industry)
                                ? [exp.industry, ...INDUSTRIES]
                                : INDUSTRIES
                            }
                            placeholder="Sohani tanlang"
                            icon={Briefcase}
                          />
                        </div>
                      </div>

                      {/* Tashkilot & Lavozim */}
                      <div className="edit-profile-row-2col mb-3">
                        <div className="edit-profile-field">
                          <label className="edit-profile-label">Tashkilot nomi</label>
                          <div className="edit-profile-input-icon-wrap">
                            <Building2 size={15} className="input-leading-icon" />
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdateWorkExperience(idx, { company: e.target.value })}
                              placeholder="Masalan: IT Park"
                              className="edit-profile-input with-leading-icon"
                            />
                          </div>
                        </div>
                        <div className="edit-profile-field">
                          <label className="edit-profile-label">Lavozimi</label>
                          <div className="edit-profile-input-icon-wrap">
                            <User size={15} className="input-leading-icon" />
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => handleUpdateWorkExperience(idx, { position: e.target.value })}
                              placeholder="Masalan: Dasturchi"
                              className="edit-profile-input with-leading-icon"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ishga kirgan & Ishdan chiqqan yillari */}
                      <div className="edit-profile-row-2col">
                        <div className="edit-profile-field">
                          <label className="edit-profile-label">Ish boshlangan yil</label>
                          <CustomSelect
                            value={exp.start_year}
                            onChange={(val) => handleUpdateWorkExperience(idx, { start_year: Number(val) })}
                            options={YEARS.map((y) => ({ value: y, label: `${y}-yil` }))}
                            placeholder="Yilni tanlang"
                            icon={Calendar}
                          />
                        </div>

                        <div className="edit-profile-field">
                          <label className="edit-profile-label">Ish yakunlangan yil</label>
                          <CustomSelect
                            value={exp.end_year ?? "current"}
                            onChange={(val) =>
                              handleUpdateWorkExperience(idx, {
                                end_year: val === "current" ? null : Number(val),
                              })
                            }
                            options={[
                              { value: "current", label: "Hozirgi vaqtgacha" },
                              ...YEARS.map((y) => ({ value: y, label: `${y}-yil` })),
                            ]}
                            placeholder="Yilni tanlang"
                            icon={Calendar}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Action Bar */}
        <div className="edit-profile-action-bar">
          <div className="edit-profile-action-bar-info">
            <Info size={16} className="text-brand-navy opacity-60 flex-shrink-0" />
            <span>Kiritilgan ma’lumotlar saqlanganidan so‘ng profilingizda bir zumda aks etadi.</span>
          </div>

          <div className="edit-profile-action-bar-btns">
            <Link href="/profile" className="edit-profile-btn edit-profile-btn-cancel">
              Bekor qilish
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="edit-profile-btn edit-profile-btn-save"
            >
              {saving ? (
                <>
                  <div className="edit-profile-btn-spinner" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>O‘zgarishlarni saqlash</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ================================================================= */}
      {/* GRADUATION YEAR REQUEST MODAL                                     */}
      {/* ================================================================= */}
      {showYearRequestModal && (
        <div className="edit-profile-modal-backdrop" onClick={() => setShowYearRequestModal(false)}>
          <div className="edit-profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-profile-modal-header">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-brand-primary" />
                <h3 className="edit-profile-modal-title">Bitirgan yilni o‘zgartirish so‘rovi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowYearRequestModal(false)}
                className="edit-profile-modal-close"
                aria-label="Yopish"
              >
                <X size={18} />
              </button>
            </div>

            <p className="edit-profile-modal-desc">
              Bitiruv yili universitet rasmiy arxivi bilan bog‘liq bo‘lgani bois, o‘zgartirish kiritish uchun yangi yilni
              va asosli sababni yozib adminga so‘rov yuboring.
            </p>

            <form onSubmit={handleSubmitYearChangeRequest}>
              <div className="edit-profile-field mb-4">
                <label className="edit-profile-label">O‘zgartirilmoqchi bo‘lgan yangi bitiruv yili</label>
                <CustomSelect
                  value={requestedYear}
                  onChange={(val) => setRequestedYear(Number(val))}
                  options={YEARS.map((y) => ({ value: y, label: `${y}-yil` }))}
                  placeholder="Yilni tanlang"
                  icon={GraduationCap}
                />
              </div>

              <div className="edit-profile-field mb-5">
                <label className="edit-profile-label">
                  O‘zgartirish sababi / Izoh <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={yearRequestReason}
                  onChange={(e) => setYearRequestReason(e.target.value)}
                  placeholder="Masalan: Anketani to‘ldirishda texnik xatolik sababli 2020 kiritilgan, aslida 2021-yilda bitirganman..."
                  className="edit-profile-textarea"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYearRequestModal(false)}
                  className="edit-profile-btn edit-profile-btn-cancel"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingYearRequest}
                  className="edit-profile-btn edit-profile-btn-save"
                >
                  <Send size={15} />
                  <span>{submittingYearRequest ? "Yuborilmoqda..." : "Adminga yuborish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
