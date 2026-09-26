"use client";

import { authenticatedFetch, authSession } from "@/lib/auth";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Lock, AlertCircle, CheckCircle2, Edit3, X } from "lucide-react";
import type { Alumni } from "@/types/alumni";

interface EditProfileModalProps {
  alumnus: Alumni;
  locale?: string;
  trigger?: React.ReactNode;
  canEdit?: boolean;
  onProfileUpdated?: (updated: Partial<Alumni>) => void;
}

export function EditProfileModal({
  alumnus,
  locale = "uz",
  trigger,
  canEdit: canEditProp,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [canEditState, setCanEditState] = useState<boolean | null>(canEditProp ?? null);

  useEffect(() => {
    if (canEditProp !== undefined) {
      setCanEditState(canEditProp);
      return;
    }

    let active = true;
    authSession()
      .then((session) => {
        if (!active) return;
        if (!session?.authenticated || !session?.user) {
          setCanEditState(false);
          return;
        }
        const user = session.user;
        const isOwner =
          user.slug === alumnus.slug ||
          (alumnus.contact_email && user.email && user.email.toLowerCase() === alumnus.contact_email.toLowerCase()) ||
          user.role === "admin" ||
          user.role === "staff" ||
          Boolean(user.is_staff) ||
          Boolean(user.is_superuser);

        setCanEditState(Boolean(isOwner));
      })
      .catch(() => {
        if (active) setCanEditState(false);
      });

    return () => {
      active = false;
    };
  }, [canEditProp, alumnus.slug, alumnus.contact_email]);

  // Profile fields
  const [fullName, setFullName] = useState(alumnus.full_name || "");
  const [currentPosition, setCurrentPosition] = useState(alumnus.position || "");
  const [currentCompany, setCurrentCompany] = useState(alumnus.current_company || "");
  const [currentActivity, setCurrentActivity] = useState(alumnus.current_activity || "");
  const [bio, setBio] = useState(alumnus.bio || "");

  // Graduation year handling (One-time selection rule)
  const isYearAlreadySet = alumnus.graduation_year !== null && alumnus.graduation_year !== undefined && Number(alumnus.graduation_year) > 0;
  const [isYearLocked, setIsYearLocked] = useState(isYearAlreadySet);
  const [graduationYear, setGraduationYear] = useState<number | "">(alumnus.graduation_year || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1956 + 1 }, (_, i) => currentYear - i);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError(
        locale === "en"
          ? "Full name must be at least 3 characters."
          : locale === "ru"
          ? "Введите Ф.И.О. (не менее 3 символов)."
          : "F.I.Sh. kamida 3 ta belgidan iborat bo‘lishi kerak."
      );
      return;
    }

    // Graduation year check: if already locked and someone tries to change it
    if (isYearAlreadySet && graduationYear !== alumnus.graduation_year) {
      setError(
        locale === "en"
          ? "Graduation year has already been set. It can only be selected once and cannot be changed."
          : locale === "ru"
          ? "Год выпуска уже установлен. Его можно выбрать только один раз и нельзя изменить."
          : "Bitirgan yil allaqachon tanlangan. Uni faqat bir marotaba tanlash mumkin va qayta o‘zgartirib bo‘lmaydi."
      );
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        full_name: fullName.trim(),
        position: currentPosition.trim(),
        current_company: currentCompany.trim(),
        current_activity: currentActivity.trim(),
        bio: bio.trim(),
      };

      if (!isYearAlreadySet && graduationYear) {
        payload.graduation_year = Number(graduationYear);
      }

      const response = await authenticatedFetch("/api/v1/alumni/me/", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        const fields = result?.error?.fields;
        throw new Error(fields ? Object.values(fields).flat().join(" ") : "Profilni saqlab bo'lmadi.");
      }

      // Lock graduation year once set
      if (graduationYear) {
        setIsYearLocked(true);
      }

      setSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated({
          full_name: fullName.trim(),
          position: currentPosition.trim(),
          current_company: currentCompany.trim(),
          current_activity: currentActivity.trim(),
          bio: bio.trim(),
          ...(graduationYear ? { graduation_year: Number(graduationYear) } : {}),
        });
      }

      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.");
    } finally {
      setSaving(false);
    }
  };

  if (canEditState === false) {
    return null;
  }
  if (canEditState === null && !trigger) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button type="button" className="button button-secondary edit-profile-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Edit3 size={16} />
            <span>{locale === "en" ? "Edit Profile" : locale === "ru" ? "Редактировать профиль" : "Profilni tahrirlash"}</span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="about-dialog-overlay" />
        <Dialog.Content className="about-dialog edit-profile-dialog" aria-describedby="edit-profile-desc" style={{ maxWidth: "580px" }}>
          {/* Header */}
          <div className="about-dialog-heading">
            <div className="about-dialog-heading-content">
              <span className="eyebrow gold">QARSHI DAVLAT UNIVERSITETI BITIRUVCHISI</span>
              <Dialog.Title style={{ fontSize: "1.35rem", fontWeight: 700, color: "#002B49" }}>
                {locale === "en" ? "Edit Profile" : locale === "ru" ? "Редактирование профиля" : "Profilni tahrirlash"}
              </Dialog.Title>
            </div>
            <Dialog.Close className="about-dialog-close" aria-label="Yopish">
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="about-dialog-body" id="edit-profile-desc" style={{ padding: "1.5rem" }}>
            {error && (
              <div className="form-error-banner" role="alert" style={{ marginBottom: "1rem" }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="form-success-banner" role="status" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#ecfdf5", color: "#065f46", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #a7f3d0" }}>
                <CheckCircle2 size={18} />
                <span>{locale === "en" ? "Profile updated successfully!" : locale === "ru" ? "Профиль успешно обновлен!" : "Profil ma’lumotlari muvaffaqiyatli saqlandi!"}</span>
              </div>
            )}

            <form onSubmit={handleSave} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* 1. Full Name */}
              <div className="form-group">
                <label htmlFor="edit-full-name" className="form-label required" style={{ display: "block", marginBottom: "0.35rem", fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>
                  F.I.Sh. *
                </label>
                <input
                  id="edit-full-name"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={160}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.95rem" }}
                />
              </div>

              {/* 2. Graduation Year - KEY BUSINESS RULE: One-time selection only! */}
              <div className="form-group" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label htmlFor="edit-graduation-year" style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>
                    Bitirgan yil
                  </label>
                  {isYearLocked ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", background: "#fef3c7", color: "#92400e", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600, border: "1px solid #fde68a" }}>
                      <Lock size={12} /> Faqat bir marotaba tanlanadi (Qulflangan)
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", background: "#e0f2fe", color: "#075985", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600, border: "1px solid #bae6fd" }}>
                      Bir marotaba tanlash imkoniyati
                    </span>
                  )}
                </div>

                {isYearLocked ? (
                  <div>
                    <input
                      id="edit-graduation-year"
                      type="text"
                      value={`${graduationYear || alumnus.graduation_year}-yil bitiruvchisi`}
                      disabled
                      readOnly
                      style={{ width: "100%", padding: "0.65rem 0.85rem", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.95rem", cursor: "not-allowed" }}
                    />
                    <p style={{ marginTop: "0.35rem", fontSize: "0.78rem", color: "#64748b" }}>
                      🔒 Bitirgan yilingiz allaqachon belgilangan. Tizim qoidasiga ko‘ra, bitiruv yili faqat bir marta tanlanadi va keyinchalik o‘zgartirib bo‘lmaydi.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: "0.5rem", fontSize: "0.8rem", color: "#b45309", background: "#fffbeb", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #fef3c7" }}>
                      ⚠️ <strong>Muhim:</strong> Bitirgan yilni faqatgina bir marotaba tanlay olasiz. Saqlangandan so‘ng uni qayta o‘zgartirib bo‘lmaydi!
                    </p>
                    <div className="select-wrapper" style={{ width: "100%" }}>
                      <select
                        id="edit-graduation-year"
                        className="form-select"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value ? Number(e.target.value) : "")}
                        style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.95rem", background: "#ffffff" }}
                      >
                        <option value="">Bitirgan yilingiz</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}-yil
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Current Position & Company */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label htmlFor="edit-position" style={{ display: "block", marginBottom: "0.35rem", fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>
                    Lavozim
                  </label>
                  <input
                    id="edit-position"
                    type="text"
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    placeholder="Masalan: Bosh mutaxassis"
                    style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.9rem" }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-company" style={{ display: "block", marginBottom: "0.35rem", fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>
                    Ish joyi / Tashkilot
                  </label>
                  <input
                    id="edit-company"
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="Masalan: IT Park"
                    style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              {/* 4. Current Activity */}
              <div className="form-group">
                <label htmlFor="edit-activity" style={{ display: "block", marginBottom: "0.35rem", fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>
                  Hozirgi faoliyat
                </label>
                <input
                  id="edit-activity"
                  type="text"
                  value={currentActivity}
                  onChange={(e) => setCurrentActivity(e.target.value)}
                  placeholder="Hozirgi asosiy ilmiy yoki kasbiy faoliyatingiz"
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.9rem" }}
                />
              </div>

              {/* 5. Bio */}
              <div className="form-group">
                <label htmlFor="edit-bio" style={{ display: "block", marginBottom: "0.35rem", fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>
                  Qisqacha ma’lumot (Bio)
                </label>
                <textarea
                  id="edit-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="O‘zingiz haqingizda qisqacha ma’lumot qoldiring"
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.9rem", resize: "vertical" }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Dialog.Close asChild>
                  <button type="button" className="button button-secondary" disabled={saving}>
                    Bekor qilish
                  </button>
                </Dialog.Close>
                <button type="submit" className="button button-primary" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
