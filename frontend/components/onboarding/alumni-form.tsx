"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TermsContent } from "./terms-content";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  RotateCw,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { authWithGoogle, sendVerificationCode, submitAlumni, verifyEmailCode } from "@/lib/api";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AlumniForm({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary;
}) {
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Form State - basic info: Full name and Email
  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // OTP Verification State
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [consentAlert, setConsentAlert] = useState<string | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Status & Error States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: number; fullName: string; email: string } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    setCodeError(null);
    setGeneralError(null);
    setConsentAlert(null);

    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errors.fullName =
        locale === "en"
          ? "Full name must be at least 3 characters."
          : locale === "ru"
          ? "Введите полное имя (не менее 3 символов)."
          : "F.I.Sh. kamida 3 ta belgidan iborat bo‘lishi kerak.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim() || !emailRegex.test(contactEmail.trim())) {
      errors.contactEmail =
        locale === "en"
          ? "Please enter a valid email address."
          : locale === "ru"
          ? "Введите корректный адрес электронной почты."
          : "Iltimos, to‘g‘ri elektron pochta manzilini kiriting.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    setFieldErrors({});
    if (!consentAccepted) {
      setIsVerifyModalOpen(true);
      return;
    }

    setSendingCode(true);
    try {
      const res = await sendVerificationCode(contactEmail.trim().toLowerCase(), true, "join");
      if (res.success) {
        setCodeSent(true);
        setCountdown(res.cooldown_seconds || 60);
        setIsVerifyModalOpen(true);
      } else {
        setCodeError(res.message || "Kodni yuborishda xatolik yuz berdi.");
        setIsVerifyModalOpen(true);
      }
    } catch (err: any) {
      setCodeError(err.message || "Tasdiqlash kodini yuborishda xatolik yuz berdi.");
      setIsVerifyModalOpen(true);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setCodeError(null);
    if (!consentAccepted) {
      setCodeError(
        locale === "en"
          ? "Please accept the personal data processing terms."
          : locale === "ru"
          ? "Пожалуйста, подтвердите согласие на обработку персональных данных."
          : "Iltimos, shaxsiy ma’lumotlarni qayta ishlash shartlariga rozilik bildiring."
      );
      return;
    }
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setCodeError(
        locale === "en"
          ? "Enter a valid 6-digit code."
          : locale === "ru"
          ? "Введите 6-значный код."
          : "6 xonali tasdiqlash kodini kiriting."
      );
      return;
    }

    setVerifyingCode(true);
    try {
      const res = isEmailVerified ? { verified: true, message: "" } : await verifyEmailCode(
        contactEmail.trim().toLowerCase(),
        verificationCode.trim(),
        "join"
      );
      if (res.verified) {
        setIsEmailVerified(true);
        // Avtomatik ro'yxatdan o'tish (anketani topshirish)
        try {
          const formData = new FormData();
          formData.append("full_name", fullName.trim());
          formData.append("contact_email", contactEmail.trim().toLowerCase());
          formData.append("consent_accepted", "true");
          formData.append("verification_code", verificationCode.trim());

          const subRes = await submitAlumni(formData);
          if (subRes.success && subRes.data) {
            setIsVerifyModalOpen(false);
            setSuccessData({
              id: subRes.data.id,
              fullName: subRes.data.full_name,
              email: contactEmail.trim().toLowerCase(),
            });
            return;
          } else {
            setCodeError("Ro‘yxatdan o‘tishda xatolik yuz berdi.");
          }
        } catch (subErr: any) {
          setCodeError(subErr.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi.");
        }
      } else {
        setCodeError(res.message || "Tasdiqlash kodi noto‘g‘ri.");
      }
    } catch (err: any) {
      setCodeError(err.message || "Kodni tekshirishda xatolik yuz berdi.");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleGoogleAuth = () => {
    setConsentAlert(null);
    setGeneralError(null);
    setConsentAccepted(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errors.fullName =
        locale === "en"
          ? "Full name must be at least 3 characters."
          : locale === "ru"
          ? "Введите полное имя (не менее 3 символов)."
          : "F.I.Sh. kamida 3 ta belgidan iborat bo‘lishi kerak.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim() || !emailRegex.test(contactEmail.trim())) {
      errors.contactEmail =
        locale === "en"
          ? "Please enter a valid email address."
          : locale === "ru"
          ? "Введите корректный адрес электронной почты."
          : "Iltimos, to‘g‘ri elektron pochta manzilini kiriting.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    if (isEmailVerified) {
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("full_name", fullName.trim());
        formData.append("contact_email", contactEmail.trim().toLowerCase());
        formData.append("consent_accepted", "true");
        if (verificationCode) {
          formData.append("verification_code", verificationCode.trim());
        }

        const res = await submitAlumni(formData);
        if (res.success && res.data) {
          setSuccessData({
            id: res.data.id,
            fullName: res.data.full_name,
            email: contactEmail.trim().toLowerCase(),
          });
        }
      } catch (err: any) {
        setGeneralError(err.message || "Xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (codeSent) {
      setIsVerifyModalOpen(true);
      return;
    }

    await handleSendCode();
  };

  // SUCCESS STATE
  if (successData) {
    return (
      <div className="onboarding-card success-card" role="status">
        <div className="success-icon-badge">
          <CheckCircle2 size={40} className="success-green" />
        </div>
        <h2>{t.submissionSuccessTitle}</h2>
        <p className="success-lead-text">
          {locale === "en"
            ? "Your application has been received and your profile is now active! Existing alumni have been notified and your profile has been added to our community."
            : locale === "ru"
            ? "Ваша анкета принята, профиль опубликован и активен! Выпускники получили уведомление, и ваш профиль добавлен в каталог."
            : "Anketangiz muvaffaqiyatli qabul qilindi va profilingiz e’lon qilindi! Mavjud bitiruvchilarga xabar berildi hamda profilingiz darhol faollashtirildi."}
        </p>

        <div className="submission-summary-box">
          <div className="summary-row">
            <span className="summary-label">{t.formFullNameLabel}:</span>
            <strong className="summary-value">{successData.fullName}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t.formEmailLabel}:</span>
            <strong className="summary-value">{successData.email}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-label">Holati:</span>
            <span className="status-pill verified-pill" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <CheckCircle2 size={13} /> {t.submissionPendingBadge}
            </span>
          </div>
        </div>

        <div
          className="safety-precaution-note"
          style={{
            margin: "16px 0 20px 0",
            padding: "12px 16px",
            background: "rgba(0, 43, 73, 0.04)",
            borderRadius: "10px",
            fontSize: "13px",
            lineHeight: "1.5",
            color: "var(--color-text-muted, #475569)",
            borderLeft: "3px solid #C59B27",
            textAlign: "left",
          }}
        >
          💡 <strong>{locale === "en" ? "Note:" : locale === "ru" ? "Примечание:" : "Eslatma:"}</strong>{" "}
          {locale === "en"
            ? "Your profile is immediately active. Additional peer or university confirmation is purely a precautionary safety measure — no action is required from you."
            : locale === "ru"
            ? "Ваш профиль сразу активен. Подтверждение другими выпускниками или университетом является лишь мерой предосторожности — никаких действий от вас не требуется."
            : "Profilingiz darhol faol holatda. Boshqa bitiruvchilar yoki universitet tomonidan tasdiqlanishi faqatgina ehtiyot chorasi uchun xizmat qiladi — sizdan hech qanday amal yoki kutish talab etilmaydi."}
        </div>

        <div className="success-actions">
          <Link href="/profile" className="button button-primary">{locale === "en" ? "My profile" : locale === "ru" ? "Мой профиль" : "Profilim"}</Link>
          <Link href="/alumni" className="button button-primary">
            <Users size={16} /> {locale === "en" ? "View Alumni Directory" : locale === "ru" ? "Список выпускников" : "Bitiruvchilar ro'yxati"}
          </Link>
          <Link href="/" className="button button-secondary">
            {t.submissionHomeBtn}
          </Link>
        </div>
      </div>
    );
  }

  // ANKETA FORM
  return (
    <div className="onboarding-card form-card">
      {/* MANDATORY CONSENT WARNING BANNER */}
      {consentAlert && (
        <div className="form-warning-banner" role="alert">
          <div className="warning-banner-icon">
            <AlertTriangle size={22} />
          </div>
          <div className="warning-banner-text">
            <strong>
              {locale === "en"
                ? "Terms Agreement Required"
                : locale === "ru"
                ? "Требуется согласие с условиями"
                : "Shartlarga rozilik talab qilinadi"}
            </strong>
            <p>{consentAlert}</p>
          </div>
          <button
            type="button"
            className="warning-banner-close"
            onClick={() => setConsentAlert(null)}
            aria-label="Yopish"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* General Error Banner */}
      {generalError && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="alumni-anketa-form" noValidate>
        {/* 1. BITIRUVCHI HAQIDA */}
        <div className="join-form-section">
          <h3 className="join-section-title">
            {locale === "en"
              ? "1. Alumni Information"
              : locale === "ru"
              ? "1. Сведения о выпускнике"
              : "1. Bitiruvchi haqida"}
          </h3>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="full-name-input" className="form-label required">
                {t.formFullNameLabel}
              </label>
              <input
                id="full-name-input"
                type="text"
                className={`form-input ${fieldErrors.fullName ? "input-error" : ""}`}
                placeholder={t.formFullNamePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={160}
              />
              {fieldErrors.fullName && <p className="field-error" role="alert">{fieldErrors.fullName}</p>}
            </div>

          <div className="form-group flex-1">
            <label htmlFor="contact-email-input" className="form-label required">
              {t.formEmailLabel}
            </label>
            <div className="input-with-button">
              <input
                id="contact-email-input"
                type="email"
                className={`form-input ${fieldErrors.contactEmail ? "input-error" : ""} ${
                  isEmailVerified ? "input-verified" : ""
                }`}
                placeholder={t.formEmailPlaceholder}
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  setIsEmailVerified(false);
                  setCodeSent(false);
                  setVerificationCode("");
                  setCodeError(null);
                }}
                required
                maxLength={254}
                disabled={sendingCode || verifyingCode}
                aria-describedby={codeError ? "email-code-error" : undefined}
              />
              <button
                type="button"
                className={`button ${
                  isEmailVerified ? "button-verified" : "button-secondary"
                } send-code-btn`}
                onClick={() => {
                  if (isEmailVerified) return;
                  if (codeSent && !isEmailVerified) {
                    setIsVerifyModalOpen(true);
                    return;
                  }
                  handleSendCode();
                }}
                disabled={sendingCode || isEmailVerified}
                title={isEmailVerified ? "Email tasdiqlangan" : "Tasdiqlash kodini yuborish"}
              >
                {sendingCode ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Yuborilmoqda...
                  </>
                ) : isEmailVerified ? (
                  <>
                    <CheckCircle2 size={16} /> Tasdiqlangan
                  </>
                ) : codeSent ? (
                  countdown > 0 ? (
                    `Kodni kiritish (${countdown}s)`
                  ) : (
                    "Kodni kiritish"
                  )
                ) : (
                  "Kodni olish"
                )}
              </button>
            </div>
            {fieldErrors.contactEmail && (
              <p className="field-error" role="alert">{fieldErrors.contactEmail}</p>
            )}
            {codeError && !isVerifyModalOpen && <p id="email-code-error" className="field-error" role="alert">{codeError}</p>}
          </div>
        </div>
      </div>

      {/* 2. EMAIL TASDIG'I VA ROZILIK MODAL OYNASI */}
      <Dialog.Root open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="terms-dialog-overlay" />
          <Dialog.Content className="terms-dialog auth-modal-content" aria-describedby={undefined}>
            <div className="terms-dialog-heading">
              <div className="auth-dialog-title-wrapper">
                <Dialog.Title className="auth-dialog-title">
                  {locale === "en"
                    ? "2. Verification & Consent"
                    : locale === "ru"
                    ? "2. Подтверждение и согласие"
                    : "2. Email tasdig‘i va rozilik"}
                </Dialog.Title>
                <p className="auth-dialog-subtitle">
                  {contactEmail && codeSent ? (
                    <>
                      <strong>{contactEmail}</strong> manziliga 6 xonali tasdiqlash kodi yuborildi.
                    </>
                  ) : (
                    "Shartlarga rozilik bildiring va tasdiqlash kodini oling."
                  )}
                </p>
              </div>
              <Dialog.Close
                className="terms-dialog-close"
                aria-label={locale === "en" ? "Close" : locale === "ru" ? "Закрыть" : "Yopish"}
                onClick={() => setIsVerifyModalOpen(false)}
              >
                <X aria-hidden="true" />
              </Dialog.Close>
            </div>

            <div className="auth-modal-body">
              {codeError && (
                <div
                  className="auth-modal-error"
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#fef2f2",
                    border: "1px solid #fee2e2",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#b91c1c",
                    fontSize: "13.5px",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{codeError}</span>
                </div>
              )}

              {/* OTP Input and Verify Button */}
              <div className="otp-card-input-row" style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                {codeSent && <input
                  id="modal-verification-code-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="form-input otp-code-input"
                  placeholder="123456"
                  value={verificationCode}
                  autoFocus
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(val);
                    setCodeError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && verificationCode.length === 6 && !verifyingCode) {
                      e.preventDefault();
                      handleVerifyCode();
                    }
                  }}
                  aria-label="Tasdiqlash kodi"
                />}
                <button
                  type="button"
                  className="button button-primary otp-verify-button"
                  onClick={codeSent ? handleVerifyCode : handleSendCode}
                  disabled={verifyingCode || sendingCode || !consentAccepted || (codeSent && verificationCode.length !== 6)}
                >
                  {verifyingCode ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Tekshirilmoqda...
                    </>
                  ) : (
                    codeSent ? "Kodni tasdiqlash" : "Kodni olish"
                  )}
                </button>
              </div>

              {codeSent && <div className="otp-resend-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                {countdown > 0 ? (
                  <span className="otp-countdown-text" style={{ color: "#64748b" }}>
                    Kodni qayta yuborish: <strong>{countdown} soniya</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-link-btn"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0d1667",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <RotateCw size={13} /> Kodni qayta yuborish
                  </button>
                )}
              </div>}

              {/* Consent Section inside Modal */}
              <div className="anketa-consent" style={{ marginTop: "6px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
                <div className={`consent-checkbox-label ${fieldErrors.consent ? "has-error" : ""}`}>
                  <input
                    id="modal-consent-checkbox-input"
                    type="checkbox"
                    checked={consentAccepted}
                    disabled={submitting}
                    aria-invalid={!!fieldErrors.consent}
                    onChange={(event) => {
                      setConsentAccepted(event.target.checked);
                      setFieldErrors((previous) => ({ ...previous, consent: "" }));
                    }}
                  />
                  <span className="checkbox-text" style={{ fontSize: "13px" }}>
                    {locale === "en" ? (
                      <>
                        <label htmlFor="modal-consent-checkbox-input" className="checkbox-label-text">
                          I agree to the personal data processing{" "}
                        </label>
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button type="button" className="terms-inline-link">terms</button>
                          </Dialog.Trigger>
                          <Dialog.Portal>
                            <Dialog.Overlay className="terms-dialog-overlay" />
                            <Dialog.Content className="terms-dialog" aria-describedby={undefined}>
                              <div className="terms-dialog-heading">
                                <Dialog.Title>{t.consentTitle}</Dialog.Title>
                                <Dialog.Close className="terms-dialog-close"><X aria-hidden="true" /></Dialog.Close>
                              </div>
                              <div className="terms-dialog-body"><TermsContent locale={locale} /></div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>
                        .
                      </>
                    ) : locale === "ru" ? (
                      <>
                        <label htmlFor="modal-consent-checkbox-input" className="checkbox-label-text">
                          Я даю согласие на обработку моих персональных данных на указанных{" "}
                        </label>
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button type="button" className="terms-inline-link">условиях</button>
                          </Dialog.Trigger>
                          <Dialog.Portal>
                            <Dialog.Overlay className="terms-dialog-overlay" />
                            <Dialog.Content className="terms-dialog" aria-describedby={undefined}>
                              <div className="terms-dialog-heading">
                                <Dialog.Title>{t.consentTitle}</Dialog.Title>
                                <Dialog.Close className="terms-dialog-close"><X aria-hidden="true" /></Dialog.Close>
                              </div>
                              <div className="terms-dialog-body"><TermsContent locale={locale} /></div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>
                        .
                      </>
                    ) : (
                      <>
                        <label htmlFor="modal-consent-checkbox-input" className="checkbox-label-text">
                          Shaxsiy ma’lumotlarimni{" "}
                        </label>
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button type="button" className="terms-inline-link">shartlar</button>
                          </Dialog.Trigger>
                          <Dialog.Portal>
                            <Dialog.Overlay className="terms-dialog-overlay" />
                            <Dialog.Content className="terms-dialog" aria-describedby={undefined}>
                              <div className="terms-dialog-heading">
                                <Dialog.Title>{t.consentTitle}</Dialog.Title>
                                <Dialog.Close className="terms-dialog-close"><X aria-hidden="true" /></Dialog.Close>
                              </div>
                              <div className="terms-dialog-body"><TermsContent locale={locale} /></div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>
                        {" "}asosida qayta ishlanishiga rozilik bildiraman.
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Submit Actions */}
      <div className="form-actions-row">
          <button
            type="submit"
            className="button button-primary submit-anketa-btn"
            disabled={submitting || sendingCode}
          >
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true" /> {t.formSubmittingBtn}
              </>
            ) : sendingCode ? (
              <>
                <span className="spinner" aria-hidden="true" /> Yuborilmoqda...
              </>
            ) : codeSent && !isEmailVerified ? (
              <>
                Kodni kiritish va ro‘yxatdan o‘tish <ArrowRight size={16} />
              </>
            ) : (
              <>
                {t.formSubmitBtn} <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="auth-separator-inline">
            <span>
              {locale === "en" ? "or" : locale === "ru" ? "или" : "yoki"}
            </span>
          </div>

          <GoogleSignInButton locale={locale} onSuccess={(userData) => setSuccessData(userData)} />
        </div>
      </form>


    </div>
  );
}
