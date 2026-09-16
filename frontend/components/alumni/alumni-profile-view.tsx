"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  FileText,
  GraduationCap,
  HeartHandshake,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  Share2,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import type { Alumni, EducationExperience, WorkExperience } from "@/types/alumni";

const DEGREE_LABELS: Record<string, string> = {
  bachelor: "Bakalavr",
  master: "Magistratura (Magistr)",
  phd: "Falsafa doktori (PhD)",
  dsc: "Fan doktori (DSc)",
  residency: "Ordinatura / Rezidentura",
  second_degree: "Ikkinchi oliy ta’lim",
  other: "Oliy ta’lim",
};

type Props = {
  profile: Alumni;
  locale: Locale;
  t: Dictionary;
};

type TabType = "all" | "about" | "education" | "experience";

export function AlumniProfileView({ profile, locale, t }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [emailCopiedToast, setEmailCopiedToast] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Real profile data extraction
  const fullName = profile.full_name || "Bitiruvchi";
  const email = profile.email || "";
  const position = profile.position || "";
  const currentCompany = profile.current_company || "";
  const city = profile.city || (profile.work_experiences && profile.work_experiences[0]?.region) || "";
  const graduationYear = profile.graduation_year || null;
  const faculty = profile.faculty_name || profile.faculty || "";
  const specialty = profile.specialty || "";
  const industry = profile.industry || "";
  
  // Format academic degree
  const academicDegree =
    profile.academic_degree ||
    profile.academic_title ||
    profile.degree ||
    "Bakalavr";

  const rawBio = profile.bio || profile.biography_uz || "";

  // Education experiences list
  const educationList: EducationExperience[] = Array.isArray(profile.educations)
    ? profile.educations
    : [];

  // Work experiences list
  const workList: WorkExperience[] = Array.isArray(profile.work_experiences)
    ? profile.work_experiences
    : [];

  // Calculate real profile completion percentage based on actual editable fields
  const checklist = [
    {
      id: "name_avatar",
      label: "Asosiy shaxsiy ma’lumotlar (F.I.Sh., Surat)",
      done: Boolean(profile.full_name && (profile.avatar || profile.image_url)),
    },
    {
      id: "education",
      label: "Ta’lim ma’lumotlari (Fakultet, Bitirgan yil)",
      done: Boolean(profile.faculty_name || profile.faculty) && Boolean(profile.graduation_year),
    },
    {
      id: "current_job",
      label: "Hozirgi ish joyi va faoliyat sohasi",
      done: Boolean(profile.current_company && profile.position),
    },
    {
      id: "work_history",
      label: "Mehnat faoliyati tarixi (Qo‘shimcha ish joylari)",
      done: workList.length > 0,
    },
    {
      id: "bio",
      label: "O‘zingiz haqingizda qisqacha BIO tavsif",
      done: Boolean(rawBio && rawBio.trim().length > 10),
    },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const completionPercent = Math.round((completedCount / checklist.length) * 100);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleCopyEmail = () => {
    if (typeof window !== "undefined" && email) {
      navigator.clipboard?.writeText(email);
      setEmailCopiedToast(true);
      setTimeout(() => setEmailCopiedToast(false), 3000);
    }
  };

  return (
    <div className="alumni-profile-root">
      {/* Toast Notification */}
      {shareToast && (
        <div className="profile-toast-notice" role="status">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>Profil havolasi nusxalandi!</span>
        </div>
      )}
      {emailCopiedToast && (
        <div className="profile-toast-notice" role="status">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>Email manzili nusxalandi!</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. PROFILE HERO / HEADER                             */}
      {/* ---------------------------------------------------- */}
      <header className="profile-hero-card">
        {/* Subtle geometric motif background */}
        <div className="profile-hero-watermark" aria-hidden="true">
          <svg width="340" height="220" viewBox="0 0 340 220" fill="none">
            <path
              d="M340 0L240 220H340V0Z"
              fill="url(#qardu-hero-grad1)"
              fillOpacity="0.04"
            />
            <path
              d="M260 0L160 220H210L310 0H260Z"
              fill="url(#qardu-hero-grad2)"
              fillOpacity="0.03"
            />
            <circle cx="280" cy="50" r="90" stroke="url(#qardu-hero-grad1)" strokeWidth="1.5" strokeOpacity="0.05" />
            <defs>
              <linearGradient id="qardu-hero-grad1" x1="0" y1="0" x2="340" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0D1667" />
                <stop offset="0.5" stopColor="#612175" />
                <stop offset="1" stopColor="#D38E4F" />
              </linearGradient>
              <linearGradient id="qardu-hero-grad2" x1="160" y1="0" x2="310" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#612175" />
                <stop offset="1" stopColor="#892376" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="profile-hero-inner">
          {/* LEFT: Avatar */}
          <div className="profile-hero-avatar-col">
            <div className="profile-avatar-ring">
              {profile.avatar || profile.image_url ? (
                <Image
                  src={profile.avatar || profile.image_url || ""}
                  alt={fullName}
                  width={128}
                  height={128}
                  className="profile-avatar-img"
                  priority
                />
              ) : (
                <div className="profile-avatar-fallback">
                  <User size={54} className="profile-avatar-icon" />
                </div>
              )}
              {/* Verified Badge */}
              <div
                className="profile-avatar-verified-badge"
                title="QarshiDU tomonidan tasdiqlangan bitiruvchi"
                aria-label="Tasdiqlangan bitiruvchi"
              >
                <ShieldCheck size={18} className="verified-shield-icon" />
              </div>
            </div>
          </div>

          {/* CENTER: Name, Role, Metadata */}
          <div className="profile-hero-info-col">
            {/* Trust Status Badge */}
            <div className="profile-trust-badge">
              <ShieldCheck size={14} className="trust-shield-icon" />
              <span>Universitet tomonidan tasdiqlangan</span>
              {profile.graduation_year && (
                <>
                  <span className="trust-dot">•</span>
                  <span className="trust-year">{profile.graduation_year}-yil bitiruvchisi</span>
                </>
              )}
            </div>

            <h1 className="profile-hero-name">{fullName}</h1>

            {(position || currentCompany) && (
              <div className="profile-hero-role-row">
                {position && <span className="profile-role-title">{position}</span>}
                {position && currentCompany && <span className="profile-role-sep">•</span>}
                {currentCompany && <span className="profile-role-company">{currentCompany}</span>}
              </div>
            )}

            {/* Metadata row with icons */}
            <div className="profile-hero-meta-grid">
              {city && (
                <div className="profile-meta-item">
                  <MapPin size={15} className="meta-icon" />
                  <span>{city}</span>
                </div>
              )}
              {graduationYear && (
                <div className="profile-meta-item">
                  <GraduationCap size={15} className="meta-icon" />
                  <span>{graduationYear}-yil bitiruvchisi</span>
                </div>
              )}
              {faculty && (
                <div className="profile-meta-item">
                  <Building2 size={15} className="meta-icon" />
                  <span>{faculty}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Completion Indicator & Actions */}
          <div className="profile-hero-actions-col">
            <div className="profile-completion-mini-card">
              <div className="completion-mini-header">
                <span className="completion-mini-title">Profil to‘liqligi</span>
                <span className="completion-mini-percent">{completionPercent}%</span>
              </div>
              <div className="completion-mini-bar-track">
                <div className="completion-mini-bar-fill" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>

            <div className="profile-hero-buttons">
              <Link href="/profile/edit" className="profile-btn profile-btn-primary">
                <Edit3 size={15} />
                <span>Profilni tahrirlash</span>
              </Link>

              <button
                type="button"
                className="profile-btn profile-btn-secondary"
                onClick={() => setPreviewModalOpen(true)}
              >
                <Eye size={15} />
                <span>Profilni ko‘rish</span>
              </button>

              <div className="profile-hero-sub-actions">
                <button
                  type="button"
                  className="profile-btn profile-btn-ghost"
                  onClick={handleShare}
                  title="Profil havolasini ulashish"
                >
                  <Share2 size={15} />
                  <span>Ulashish</span>
                </button>

                <button
                  type="button"
                  className="profile-btn profile-btn-logout"
                  title="Tizimdan chiqish"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                    router.refresh();
                  }}
                >
                  <LogOut size={15} />
                  <span>Chiqish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. REAL TABS SYSTEM (Only fillable sections)         */}
      {/* ---------------------------------------------------- */}
      <nav className="profile-tabs-nav" aria-label="Profil bo'limlari">
        <div className="profile-tabs-scroll-container">
          <button
            type="button"
            className={`profile-tab-item ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <Layers size={15} />
            <span>Asosiy ma’lumot</span>
          </button>

          <button
            type="button"
            className={`profile-tab-item ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            <User size={15} />
            <span>Men haqimda</span>
          </button>

          <button
            type="button"
            className={`profile-tab-item ${activeTab === "education" ? "active" : ""}`}
            onClick={() => setActiveTab("education")}
          >
            <GraduationCap size={15} />
            <span>Ta’lim</span>
          </button>

          <button
            type="button"
            className={`profile-tab-item ${activeTab === "experience" ? "active" : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            <Briefcase size={15} />
            <span>Ish tajribasi</span>
          </button>
        </div>
      </nav>

      {/* ---------------------------------------------------- */}
      {/* 3. MAIN 12-COLUMN LAYOUT (8 cols main, 4 cols side) */}
      {/* ---------------------------------------------------- */}
      <div className="profile-layout-grid">
        {/* =================================================== */}
        {/* MAIN CONTENT (8 columns)                           */}
        {/* =================================================== */}
        <main className="profile-main-col">
          {/* ABOUT SECTION */}
          {(activeTab === "all" || activeTab === "about") && (
            <section className="profile-card profile-section-card" id="about-section">
              <div className="profile-card-header">
                <div className="profile-card-title-wrap">
                  <User size={18} className="profile-card-icon" />
                  <h2 className="profile-card-title">Men haqimda</h2>
                </div>
              </div>
              <div className="profile-card-body">
                {rawBio ? (
                  <>
                    <p className={`profile-bio-text ${bioExpanded ? "expanded" : "clamped"}`}>
                      {rawBio}
                    </p>
                    {rawBio.length > 180 && (
                      <button
                        type="button"
                        className="profile-expand-bio-btn"
                        onClick={() => setBioExpanded(!bioExpanded)}
                      >
                        {bioExpanded ? (
                          <>
                            <span>Qisqartirish</span>
                            <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            <span>To‘liq ko‘rish</span>
                            <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="profile-section-empty-box">
                    <p className="text-slate-500 text-sm m-0">
                      Hozircha o‘zingiz haqingizda qisqacha ma’lumot (BIO) kiritilmagan.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* EDUCATION SECTION */}
          {(activeTab === "all" || activeTab === "education") && (
            <section className="profile-card profile-section-card" id="education-section">
              <div className="profile-card-header">
                <div className="profile-card-title-wrap">
                  <GraduationCap size={18} className="profile-card-icon" />
                  <h2 className="profile-card-title">Ta’lim</h2>
                </div>
                <span className="profile-card-tag">
                  {educationList.length > 0
                    ? `${educationList.length} ta bosqich`
                    : graduationYear
                    ? "1 ta bosqich"
                    : "QarDU"}
                </span>
              </div>
              <div className="profile-card-body">
                <div className="education-timeline-list">
                  {educationList.length > 0 ? (
                    educationList.map((edu, idx) => (
                      <article key={edu.id || idx} className="education-timeline-item">
                        <div className="timeline-badge-wrap">
                          <div className="timeline-logo-badge">
                            <GraduationCap size={20} className="text-brand-navy" />
                          </div>
                          {idx < educationList.length - 1 && <div className="timeline-connector" />}
                        </div>
                        <div className="timeline-content-card">
                          <div className="timeline-period-row">
                            <span className="timeline-years">
                              {edu.start_year ? `${edu.start_year} - ` : "Bitirgan yili: "}
                              {edu.graduation_year}-yil
                            </span>
                            <span className="timeline-degree-badge">
                              {DEGREE_LABELS[edu.degree_level] || edu.degree_level_display || edu.degree_level}
                            </span>
                          </div>
                          <h3 className="timeline-org-name">{edu.institution || "Qarshi davlat universiteti"}</h3>
                          {edu.faculty && <p className="timeline-faculty-name">{edu.faculty}</p>}
                          {edu.specialty && (
                            <p className="timeline-description text-slate-600 font-medium">
                              Mutaxassislik / Ixtisoslik: {edu.specialty}
                            </p>
                          )}
                        </div>
                      </article>
                    ))
                  ) : graduationYear ? (
                    <article className="education-timeline-item">
                      <div className="timeline-badge-wrap">
                        <div className="timeline-logo-badge">
                          <GraduationCap size={20} className="text-brand-navy" />
                        </div>
                      </div>
                      <div className="timeline-content-card">
                        <div className="timeline-period-row">
                          <span className="timeline-years">Bitirgan yili: {graduationYear}-yil</span>
                          <span className="timeline-degree-badge">{academicDegree}</span>
                        </div>
                        <h3 className="timeline-org-name">Qarshi davlat universiteti</h3>
                        {faculty && <p className="timeline-faculty-name">{faculty}</p>}
                        {specialty && (
                          <p className="timeline-description text-slate-600 font-medium">
                            Mutaxassislik / Ixtisoslik: {specialty}
                          </p>
                        )}
                      </div>
                    </article>
                  ) : (
                    <div className="profile-section-empty-box">
                      <p className="text-slate-500 text-sm m-0">
                        Hozircha ta’lim ma’lumotlari kiritilmagan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* EXPERIENCE SECTION */}
          {(activeTab === "all" || activeTab === "experience") && (
            <section className="profile-card profile-section-card" id="experience-section">
              <div className="profile-card-header">
                <div className="profile-card-title-wrap">
                  <Briefcase size={18} className="profile-card-icon" />
                  <h2 className="profile-card-title">Ish tajribasi va faoliyat</h2>
                </div>
                {industry && <span className="profile-card-tag">{industry}</span>}
              </div>

              <div className="profile-card-body">
                {/* Current Primary Job Banner */}
                {(currentCompany || position) && (
                  <div className="profile-current-job-banner">
                    <div className="current-job-badge-icon">
                      <Building2 size={20} className="text-brand-navy" />
                    </div>
                    <div className="current-job-content">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="current-job-status-chip">Hozirgi asosiy ish joyi</span>
                        {industry && <span className="current-job-industry-chip">{industry}</span>}
                        {city && (
                          <span className="current-job-industry-chip flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{city}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="current-job-title">{position || "Lavozim kiritilmagan"}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="current-job-company">{currentCompany || "Tashkilot kiritilmagan"}</p>
                        {city && (
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{city}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Work Experiences Timeline */}
                {workList.length > 0 ? (
                  <div className="experience-timeline-list mt-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Clock size={15} className="text-brand-purple" />
                      <span>Mehnat faoliyati tarixi ({workList.length} ta joy)</span>
                    </h4>
                    {workList.map((item, idx) => (
                      <article
                        key={item.id || idx}
                        className={`experience-timeline-item ${item.is_current ? "current-job" : ""}`}
                      >
                        <div className="timeline-badge-wrap">
                          <div className={`timeline-company-badge ${item.is_current ? "active-badge" : ""}`}>
                            <Building2 size={18} />
                          </div>
                          {idx !== workList.length - 1 && <div className="timeline-connector" />}
                        </div>

                        <div className="timeline-content-card">
                          <div className="timeline-top-meta">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="timeline-org-name">{item.company || "Tashkilot"}</h3>
                                {item.is_current && (
                                  <span className="timeline-current-status-tag">Hozirda ishlaydi</span>
                                )}
                              </div>
                              <p className="timeline-job-role">{item.position || "Lavozim"}</p>
                            </div>
                            <span className="timeline-years">
                              {item.start_year} — {item.is_current || !item.end_year ? "Hozir" : item.end_year}
                            </span>
                          </div>

                          {item.region && (
                            <div className="timeline-location-row">
                              <MapPin size={13} />
                              <span>{item.region}</span>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  !currentCompany && !position && (
                    <div className="profile-section-empty-box">
                      <p className="text-slate-500 text-sm m-0">
                        Hozircha ish tajribasi va faoliyat ma’lumotlari kiritilmagan.
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          )}
        </main>

        {/* =================================================== */}
        {/* RIGHT SIDEBAR (4 columns)                          */}
        {/* =================================================== */}
        <aside className="profile-sidebar-col">
          {/* ALUMNI IMPACT & RECOGNITION CARD */}
          <div className="profile-card sidebar-card" style={{ borderColor: "rgba(211, 142, 79, 0.4)", background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(211, 142, 79, 0.05) 100%)" }}>
            <div className="sidebar-card-header" style={{ borderBottomColor: "rgba(211, 142, 79, 0.2)" }}>
              <Award size={16} className="sidebar-header-icon" style={{ color: "#D38E4F" }} />
              <h3 className="sidebar-card-title">{t.impactTitle}</h3>
            </div>
            <div className="sidebar-card-body">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Universitet va bitiruvchilar hamjamiyatiga qo‘shgan tasdiqlangan hissangiz orqali platformada e’tirof etiling.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/impact"
                  className="profile-btn profile-btn-primary w-full justify-center text-xs"
                  style={{ background: "#0D1667" }}
                >
                  <Award size={14} style={{ color: "#D38E4F" }} />
                  <span>Reyting va hissalarni ko‘rish</span>
                </Link>
              </div>
            </div>
          </div>

          {/* PROFILE COMPLETION CARD */}
          <div className="profile-card sidebar-card completion-card">
            <div className="sidebar-card-header">
              <CheckCircle2 size={16} className="sidebar-header-icon text-indigo-600" />
              <h3 className="sidebar-card-title">Profil to‘ldirilish darajasi</h3>
            </div>
            <div className="sidebar-card-body">
              <div className="completion-visual-row">
                <div className="completion-ring-box">
                  <span className="completion-big-percent">{completionPercent}%</span>
                </div>
                <div className="completion-summary-text">
                  <strong>{completionPercent >= 80 ? "Yuqori daraja" : completionPercent >= 50 ? "O‘rta daraja" : "Boshlang‘ich daraja"}</strong>
                  <p>Profilingiz qanchalik to‘liq bo‘lsa, bitiruvchilar tarmog‘idagi nufuzingiz shunchalik yuqori bo‘ladi.</p>
                </div>
              </div>

              <div className="completion-checklist">
                {checklist.map((item) => (
                  <div key={item.id} className={`checklist-item ${item.done ? "done" : "pending"}`}>
                    {item.done ? (
                      <Check size={14} className="check-icon" />
                    ) : (
                      <div className="pending-circle" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRIVACY & SECURITY CARD */}
          <div className="profile-card sidebar-card privacy-card">
            <div className="sidebar-card-header">
              <Lock size={16} className="sidebar-header-icon" />
              <h3 className="sidebar-card-title">Maxfiylik va ko‘rinish</h3>
            </div>
            <div className="sidebar-card-body">
              <div className="privacy-status-box">
                <div className="privacy-badge">
                  <ShieldCheck size={14} />
                  <span>Bitiruvchilar uchun ochiq</span>
                </div>
                <p className="privacy-desc">
                  Shaxsiy telefon raqami, pasport va yashash manzili ma’lumotlari xavfsizlik maqsadida ommaga
                  ko‘rsatilmaydi.
                </p>
              </div>

              <button
                type="button"
                className="profile-btn profile-btn-ghost w-full justify-center"
                onClick={() => setPrivacyModalOpen(true)}
              >
                <span>Ko‘rinish sozlamalari</span>
              </button>
            </div>
          </div>

          {/* CONTACT / EMAIL CARD */}
          <div className="profile-card sidebar-card networking-card">
            <div className="sidebar-card-header">
              <Mail size={16} className="sidebar-header-icon text-brand-navy" />
              <h3 className="sidebar-card-title">Bog‘lanish (Email)</h3>
            </div>
            <div className="sidebar-card-body">
              <p className="networking-desc">
                Rasmiy va kasbiy muloqot uchun elektron pochta manzili:
              </p>

              {email ? (
                <div className="email-card-body-stack">
                  <a
                    href={`mailto:${email}`}
                    className="pro-link-item"
                    title="Email orqali yozish"
                  >
                    <div className="pro-link-icon-box" style={{ background: "#0D1667" }}>
                      <Mail size={14} />
                    </div>
                    <div className="pro-link-text">
                      <span className="pro-link-label">Email</span>
                      <span className="pro-link-val">{email}</span>
                    </div>
                    <Send size={13} className="pro-link-arrow" />
                  </a>

                  <button
                    type="button"
                    className="profile-btn profile-btn-ghost w-full justify-center text-xs"
                    onClick={handleCopyEmail}
                  >
                    <span>Email manzilidan nusxa olish</span>
                  </button>
                </div>
              ) : (
                <div className="profile-empty-notice-box">
                  Email manzili biriktirilmagan
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODALS & DIALOGS                                    */}
      {/* ---------------------------------------------------- */}
      {privacyModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setPrivacyModalOpen(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Profil ko‘rinish sozlamalari</h3>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setPrivacyModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="profile-modal-body">
              <div className="profile-modal-item">
                <div className="profile-modal-item-header">
                  <span className="profile-modal-item-title">Bitiruvchilar tarmog‘i</span>
                  <span className="profile-modal-badge profile-modal-badge-open">
                    Ochiq
                  </span>
                </div>
                <p className="profile-modal-desc">
                  Universitet bitiruvchilari katalogida ism, fakultet va ish joyingiz ko‘rinadi.
                </p>
              </div>

              <div className="profile-modal-item">
                <div className="profile-modal-item-header">
                  <span className="profile-modal-item-title">Aloqa ma’lumotlari</span>
                  <span className="profile-modal-badge profile-modal-badge-protected">
                    Himoyalangan
                  </span>
                </div>
                <p className="profile-modal-desc">
                  Email va telefon raqamingiz faqat siz ruxsat bergan foydalanuvchilarga ko‘rinadi.
                </p>
              </div>

              <div className="profile-modal-footer">
                <button
                  type="button"
                  className="profile-btn profile-btn-primary"
                  onClick={() => setPrivacyModalOpen(false)}
                >
                  Tushundim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setPreviewModalOpen(false)}>
          <div className="profile-modal-card" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Ommaviy ko‘rinish prevyusi</h3>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setPreviewModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="profile-modal-body">
              <div className="profile-preview-card">
                <div className="profile-preview-avatar">
                  {fullName[0]}
                </div>
                <div className="profile-preview-info">
                  <h4 className="profile-preview-name">{fullName}</h4>
                  <p className="profile-preview-role">{position} {currentCompany ? `• ${currentCompany}` : ""}</p>
                  <p className="profile-preview-grad">QarDU {graduationYear ? `${graduationYear}-yil bitiruvchisi` : ""}</p>
                </div>
              </div>
              <p className="profile-modal-desc">
                Bu ko‘rinish boshqa bitiruvchilar va mehmonlar sizning profilingizni ochganda qanday aks etishini ifodalaydi.
              </p>
              <div className="profile-modal-footer">
                <button
                  type="button"
                  className="profile-btn profile-btn-primary"
                  onClick={() => setPreviewModalOpen(false)}
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
