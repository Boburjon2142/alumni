"use client";

import { useState, useRef, useEffect } from "react";
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
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  HeartHandshake,
  Layers,
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
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewModalOpen && previewScrollRef.current) {
      previewScrollRef.current.scrollTop = 0;
    }
  }, [previewModalOpen]);

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

  // Calculate initials for fallback avatar
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "B";

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
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

      {/* ---------------------------------------------------- */}
      {/* 1. PROFILE HERO / HEADER WITH COVER BANNER           */}
      {/* ---------------------------------------------------- */}
      <header className="profile-hero-card">
        {/* Cover Banner */}
        <div className="profile-hero-banner">
          <div className="profile-hero-banner-overlay" />
          <div className="profile-hero-banner-badge">
            <GraduationCap size={14} className="text-amber-300" />
            <span>Qarshi davlat universiteti bitiruvchilar portali</span>
          </div>
        </div>

        <div className="profile-hero-inner">
          {/* Avatar Section */}
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
                  <span className="profile-avatar-initials">{initials}</span>
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

          {/* Identity & Metadata */}
          <div className="profile-hero-info-col">
            {profile.graduation_year && (
              <div className="profile-hero-tags-row">
                <div className="profile-trust-badge">
                  <GraduationCap size={14} className="trust-shield-icon" />
                  <span className="trust-year">{profile.graduation_year}-yil bitiruvchisi</span>
                </div>
              </div>
            )}

            <h1 className="profile-hero-name">{fullName}</h1>

            {(position || currentCompany) ? (
              <div className="profile-hero-role-row">
                {position && <span className="profile-role-title">{position}</span>}
                {position && currentCompany && <span className="profile-role-sep">•</span>}
                {currentCompany && <span className="profile-role-company">{currentCompany}</span>}
              </div>
            ) : (
              <div className="profile-hero-role-row profile-hero-role-empty">
                <span>Kasbiy faoliyat yoki lavozim hali ko‘rsatilmagan</span>
                <Link href="/profile/edit" className="profile-hero-add-chip">
                  <Plus size={12} />
                  <span>Kiritish</span>
                </Link>
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

          {/* Actions & Completion */}
          <div className="profile-hero-actions-col">
            <div className="profile-completion-mini-card">
              <div className="completion-mini-header">
                <span className="completion-mini-title">Profil to‘liqligi</span>
                <span className="completion-mini-percent">{completionPercent}%</span>
              </div>
              <div className="completion-mini-bar-track">
                <div
                  className="completion-mini-bar-fill"
                  style={{ width: `${completionPercent}%` }}
                />
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
      {/* 2. REAL TABS SYSTEM                                  */}
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
      {/* 3. MAIN 12-COLUMN LAYOUT                             */}
      {/* ---------------------------------------------------- */}
      <div className="profile-layout-grid">
        {/* =================================================== */}
        {/* MAIN CONTENT                                       */}
        {/* =================================================== */}
        <main className="profile-main-col">
          <div className={`profile-sections-wrapper ${activeTab === "all" ? "tri-cards-grid" : "single-card-view"}`}>
            {/* ABOUT SECTION */}
            {(activeTab === "all" || activeTab === "about") && (
              <section className="profile-card profile-section-card" id="about-section">
              <div className="profile-card-header">
                <div className="profile-card-title-wrap">
                  <div className="profile-card-icon-bubble">
                    <User size={18} />
                  </div>
                  <h2 className="profile-card-title">Men haqimda</h2>
                </div>
                <Link href="/profile/edit" className="profile-section-edit-btn flex-shrink-0" title="Tahrirlash">
                  <Edit3 size={13} />
                  <span>Tahrirlash</span>
                </Link>
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
                    <div className="empty-box-icon-wrap">
                      <User size={24} />
                    </div>
                    <div className="empty-box-text-wrap">
                      <h4 className="empty-box-title">O‘zingiz haqingizda ma’lumot kiriting</h4>
                      <p className="empty-box-desc">
                        Hozircha o‘zingiz haqingizda qisqacha ma’lumot (BIO) kiritilmagan.
                        Qisqacha tavsif boshqa bitiruvchilarga sizning kasbiy yo‘nalishingizni bilishga yordam beradi.
                      </p>
                    </div>
                    <Link href="/profile/edit" className="empty-box-cta-btn">
                      <Plus size={14} />
                      <span>BIO qo‘shish</span>
                    </Link>
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
                  <div className="profile-card-icon-bubble">
                    <GraduationCap size={18} />
                  </div>
                  <h2 className="profile-card-title">Ta’lim</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="profile-card-tag">
                    {educationList.length > 0
                      ? `${educationList.length} ta bosqich`
                      : graduationYear
                      ? "1 ta bosqich"
                      : "QarDU"}
                  </span>
                  <Link href="/profile/edit" className="profile-section-edit-btn" title="Tahrirlash">
                    <Edit3 size={13} />
                    <span>Tahrirlash</span>
                  </Link>
                </div>
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
                      <div className="empty-box-icon-wrap">
                        <GraduationCap size={24} />
                      </div>
                      <div className="empty-box-text-wrap">
                        <h4 className="empty-box-title">Ta’lim ma’lumotlarini kiriting</h4>
                        <p className="empty-box-desc">
                          Hozircha ta’lim ma’lumotlari kiritilmagan.
                          Fakultet, mutaxassislik va bitirgan yilingizni belgilab, o‘z ma’lumotingizni tasdiqlang.
                        </p>
                      </div>
                      <Link href="/profile/edit" className="empty-box-cta-btn">
                        <Plus size={14} />
                        <span>Ta’lim qo‘shish</span>
                      </Link>
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
                  <div className="profile-card-icon-bubble">
                    <Briefcase size={18} />
                  </div>
                  <h2 className="profile-card-title">Ish tajribasi</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href="/profile/edit" className="profile-section-edit-btn" title="Tahrirlash">
                    <Edit3 size={13} />
                    <span>Tahrirlash</span>
                  </Link>
                </div>
              </div>

              <div className="profile-card-body">
                {/* Current Primary Job Banner */}
                {(currentCompany || position) && (
                  <div className="profile-current-job-banner">
                    <div className="current-job-badge-icon">
                      <Building2 size={20} className="text-brand-navy" />
                    </div>
                    <div className="current-job-content">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="current-job-status-chip">Hozirgi ish joyi</span>
                        {industry && (
                          <span className="current-job-industry-chip">
                            <Briefcase size={11} className="mr-1 text-brand-purple" />
                            {industry}
                          </span>
                        )}
                      </div>
                      <h3 className="current-job-title">{position || "Lavozim kiritilmagan"}</h3>
                      <div className="flex items-center gap-3 flex-wrap mt-1">
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

                          {(item.industry || item.region) && (
                            <div className="timeline-location-row flex items-center gap-2 flex-wrap mt-1">
                              {item.industry && (
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  <Briefcase size={12} className="text-slate-500" />
                                  <span>{item.industry}</span>
                                </span>
                              )}
                              {item.region && (
                                <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                                  <MapPin size={12} />
                                  <span>{item.region}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  !currentCompany && !position && (
                    <div className="profile-section-empty-box">
                      <div className="empty-box-icon-wrap">
                        <Briefcase size={24} />
                      </div>
                      <div className="empty-box-text-wrap">
                        <h4 className="empty-box-title">Ish tajribangizni qo‘shing</h4>
                        <p className="empty-box-desc">
                          Hozircha ish tajribasi va faoliyat ma’lumotlari kiritilmagan.
                          Ish joyingiz va lavozimingizni ko‘rsatib, nufuzingizni oshiring.
                        </p>
                      </div>
                      <Link href="/profile/edit" className="empty-box-cta-btn">
                        <Plus size={14} />
                        <span>Ish joyini qo‘shish</span>
                      </Link>
                    </div>
                  )
                )}
              </div>
            </section>
          )}
          </div>
        </main>
      </div>




      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setPreviewModalOpen(false)}>
          <div className="profile-modal-card preview-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="preview-modal-header">
              <div>
                <span className="preview-modal-badge">
                  <Eye size={13} />
                  <span>Ommaviy ko‘rinish prevyusi</span>
                </span>
                <h3 className="preview-modal-title">Profilingiz boshqalar uchun qanday ko‘rinadi</h3>
                <p className="preview-modal-subtitle">
                  Sayt mehmonlari, talabalar va boshqa bitiruvchilar sizning ommaviy profilingizda quyidagi ma’lumotlarni ko‘radilar.
                </p>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setPreviewModalOpen(false)}
                title="Yopish"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="preview-modal-scrollable-body" ref={previewScrollRef}>
              {/* 1. Alumnus Hero Banner */}
              <div className="preview-public-hero">
                <div className="preview-hero-accent-strip" />
                <div className="preview-hero-content">
                  <div className="preview-avatar-box">
                    {profile.avatar || profile.image_url ? (
                      <Image
                        src={profile.avatar || profile.image_url || ""}
                        alt={fullName}
                        width={76}
                        height={76}
                        className="preview-avatar-img"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="preview-hero-main">
                    <h4 className="preview-hero-name">{fullName}</h4>
                    <div className="preview-hero-role">
                      <Briefcase size={14} className="text-brand-purple" />
                      <span>{position || "Soha mutaxassisi"}</span>
                      {currentCompany && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-brand-navy">{currentCompany}</span>
                        </>
                      )}
                    </div>

                    <div className="preview-pills-row">
                      {graduationYear && (
                        <span className="preview-pill pill-primary">
                          <GraduationCap size={13} />
                          <span>QarDU {graduationYear}-yil bitiruvchisi</span>
                        </span>
                      )}
                      {academicDegree && (
                        <span className="preview-pill pill-accent">
                          <Award size={13} />
                          <span>{academicDegree}</span>
                        </span>
                      )}
                      {city && (
                        <span className="preview-pill">
                          <MapPin size={13} />
                          <span>{city}</span>
                        </span>
                      )}
                      {faculty && (
                        <span className="preview-pill">
                          <Building2 size={13} />
                          <span>{faculty}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Key Sections Grid */}
              <div className="preview-sections-grid">
                {/* BIO / Haqida */}
                <div className="preview-section-card full-width">
                  <div className="preview-section-title-row">
                    <User size={16} className="preview-section-icon" />
                    <h5 className="preview-section-title">O‘zi haqida qisqacha (BIO)</h5>
                  </div>
                  {rawBio ? (
                    <p className="preview-bio-text">{rawBio}</p>
                  ) : (
                    <p className="preview-empty-hint">
                      Qisqacha ma’lumot (BIO) hali kiritilmagan. Profil tahrirlash orqali faoliyatingiz haqida yozishingiz mumkin.
                    </p>
                  )}
                </div>

                {/* Hozirgi kasbiy faoliyat */}
                <div className="preview-section-card">
                  <div className="preview-section-title-row">
                    <Briefcase size={16} className="preview-section-icon" />
                    <h5 className="preview-section-title">Hozirgi kasbiy faoliyat</h5>
                  </div>
                  <div className="preview-key-val-list">
                    <div className="preview-key-val-item">
                      <span className="preview-item-label">Tashkilot / Ish joyi</span>
                      <span className="preview-item-value">{currentCompany || "Ko‘rsatilmagan"}</span>
                    </div>
                    <div className="preview-key-val-item">
                      <span className="preview-item-label">Lavozimi</span>
                      <span className="preview-item-value">{position || "Ko‘rsatilmagan"}</span>
                    </div>
                    <div className="preview-key-val-item">
                      <span className="preview-item-label">Faoliyat sohasi</span>
                      <span className="preview-item-value">{industry || "Ko‘rsatilmagan"}</span>
                    </div>
                    <div className="preview-key-val-item">
                      <span className="preview-item-label">Hudud (Shahar / Tuman)</span>
                      <span className="preview-item-value">{city || "Ko‘rsatilmagan"}</span>
                    </div>
                  </div>
                </div>

                {/* Ta'lim ma'lumotlari */}
                <div className="preview-section-card">
                  <div className="preview-section-title-row">
                    <GraduationCap size={16} className="preview-section-icon" />
                    <h5 className="preview-section-title">Ta’lim ma’lumotlari</h5>
                  </div>
                  <div className="preview-key-val-list">
                    <div className="preview-key-val-item">
                      <span className="preview-item-label">Oliy ta’lim muassasasi</span>
                      <span className="preview-item-value">Qarshi davlat universiteti</span>
                    </div>
                    {faculty && (
                      <div className="preview-key-val-item">
                        <span className="preview-item-label">Fakultet</span>
                        <span className="preview-item-value">{faculty}</span>
                      </div>
                    )}
                    {specialty && (
                      <div className="preview-key-val-item">
                        <span className="preview-item-label">Yo‘nalish / Mutaxassislik</span>
                        <span className="preview-item-value">{specialty}</span>
                      </div>
                    )}
                    <div className="preview-key-val-item">
                      <span className="preview-item-label">Bitirgan yili & Daraja</span>
                      <span className="preview-item-value">
                        {graduationYear ? `${graduationYear}-yil` : "Ko‘rsatilmagan"} • {academicDegree}
                      </span>
                    </div>
                  </div>

                  {/* Qo'shimcha ta'lim bosqichlari bo'lsa */}
                  {educationList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="preview-item-label block mb-2">Qo‘shimcha ta’lim bosqichlari ({educationList.length})</span>
                      <div className="flex flex-col gap-2">
                        {educationList.map((edu, idx) => (
                          <div key={idx} className="preview-history-item">
                            <div className="preview-history-top">
                              <span className="preview-history-company">
                                {DEGREE_LABELS[edu.degree_level] || edu.degree_level}
                              </span>
                              {edu.graduation_year && (
                                <span className="preview-history-period">{edu.graduation_year}-yil</span>
                              )}
                            </div>
                            <span className="preview-history-role">
                              {edu.institution || "Qarshi davlat universiteti"}
                              {edu.faculty ? ` • ${edu.faculty}` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mehnat faoliyati tarixi */}
                <div className="preview-section-card full-width">
                  <div className="preview-section-title-row">
                    <Clock size={16} className="preview-section-icon" />
                    <h5 className="preview-section-title">Mehnat faoliyati tarixi ({workList.length > 0 ? workList.length : "0"})</h5>
                  </div>
                  {workList.length > 0 ? (
                    <div className="preview-history-list">
                      {workList.map((w, idx) => (
                        <div key={idx} className="preview-history-item">
                          <div className="preview-history-top">
                            <div className="flex items-center gap-2">
                              <span className="preview-history-company">{w.company}</span>
                              {w.region && (
                                <span className="text-xs text-slate-500 font-normal">({w.region})</span>
                              )}
                            </div>
                            <span className="preview-history-period">
                              {w.start_year || ""}{w.end_year ? ` — ${w.end_year}-yil` : " — Hozirgacha"}
                            </span>
                          </div>
                          <div className="preview-history-role">
                            <span className="font-medium text-slate-700">{w.position}</span>
                            {w.industry && <span className="text-slate-500"> • {w.industry}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="preview-empty-hint">
                      Oldingi yoki qo‘shimcha ish joylari tarixi kiritilmagan.
                    </p>
                  )}
                </div>

                {/* Aloqa ma'lumotlari */}
                {email && (
                  <div className="preview-section-card full-width">
                    <div className="preview-section-title-row">
                      <Mail size={16} className="preview-section-icon" />
                      <h5 className="preview-section-title">Ommaviy aloqa ma’lumoti</h5>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail size={14} className="text-brand-purple" />
                      <span className="font-semibold">{email}</span>
                      <span className="text-xs text-slate-500">(Boshqa bitiruvchilar siz bilan bog‘lanishlari uchun)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="preview-modal-footer-row">
              <div className="flex items-center gap-2 flex-wrap">
                {(profile.slug || profile.id) && (
                  <Link
                    href={`/alumni/${profile.slug || profile.id}`}
                    target="_blank"
                    className="profile-btn profile-btn-secondary"
                  >
                    <ExternalLink size={14} />
                    <span>Ommaviy sahifani ochish</span>
                  </Link>
                )}
                <Link
                  href="/profile/edit"
                  className="profile-btn profile-btn-secondary"
                >
                  <Edit3 size={14} />
                  <span>Ma’lumotlarni to‘ldirish / tahrirlash</span>
                </Link>
              </div>

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
      )}
    </div>
  );
}
