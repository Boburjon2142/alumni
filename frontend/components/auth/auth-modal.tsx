"use client";

import { useState, useEffect } from "react";
import { authSession, signOut } from "@/lib/auth";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  LogIn,
  Mail,
  RotateCw,
  ShieldCheck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { authWithGoogle, sendVerificationCode, verifyEmailCode } from "@/lib/api";
import { TermsContent } from "../onboarding/terms-content";
import { GoogleSignInButton } from "./google-sign-in-button";

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

export function AuthModal({
  locale,
  t,
  trigger,
}: {
  locale: Locale;
  t: Dictionary;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"otp" | "google">("otp");

  // Email OTP state
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<{
    id: number;
    email: string;
    fullName?: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const sync = () => authSession().then((session) => {
      setLoggedInUser(
        session.authenticated && session.user
          ? {
              id: session.user.id,
              email: session.user.email,
              fullName: session.user.full_name,
              avatar: session.user.avatar,
            }
          : null
      );
    }).catch(() => {});
    sync();
    window.addEventListener("auth-changed", sync);
    return () => window.removeEventListener("auth-changed", sync);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError(
        locale === "en"
          ? "Please enter a valid email address."
          : locale === "ru"
          ? "Введите корректный адрес электронной почты."
          : "Iltimos, to‘g‘ri elektron pochta manzilini kiriting."
      );
      return;
    }

    setSendingCode(true);
    setError(null);
    try {
      const res = await sendVerificationCode(email.trim().toLowerCase(), false, "login");
      if (res.success) {
        setCodeSent(true);
        setCountdown(res.cooldown_seconds || 60);
      }
    } catch (err: any) {
      setError(err.message || "Kod yuborishda xatolik yuz berdi.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      setError("Iltimos, 6 xonali tasdiqlash kodini to‘liq kiriting.");
      return;
    }

    setVerifyingCode(true);
    setError(null);
    try {
      const res = await verifyEmailCode(email.trim().toLowerCase(), code.trim(), "login");
      if (res.verified && res.authenticated && res.user?.id) {
        setLoggedInUser({
          id: res.user.id,
          email: email.trim().toLowerCase(),
          fullName: res.user?.full_name || res.profile?.full_name || res.user?.username || email.split("@")[0],
          avatar: res.user?.avatar || res.profile?.avatar,
        });
      }
    } catch (err: any) {
      setError(err.message || "Kod noto‘g‘ri yoki muddati o‘tgan.");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  if (loggedInUser && !open) {
    const profileLabel = locale === "en" ? "My profile" : locale === "ru" ? "Мой профиль" : "Profilim";
    return (
      <Link
        href="/profile"
        className="header-profile-avatar-link"
        title={loggedInUser.fullName ? `${loggedInUser.fullName} (${profileLabel})` : profileLabel}
        aria-label={profileLabel}
      >
        {loggedInUser.avatar ? (
          <img
            src={loggedInUser.avatar}
            alt={loggedInUser.fullName || profileLabel}
            className="header-avatar-circle-img"
          />
        ) : (
          <div className="header-avatar-circle-fallback">
            <User size={19} className="header-avatar-icon" />
          </div>
        )}
      </Link>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button type="button" className="button button-outline header-auth-btn">
            <LogIn size={15} />
            <span>{locale === "en" ? "Sign In" : locale === "ru" ? "Вход" : "Kirish"}</span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="terms-dialog-overlay" />
        <Dialog.Content className="terms-dialog auth-modal-content" aria-describedby={undefined}>
          <div className="terms-dialog-heading">
            <div className="auth-dialog-title-wrapper">
              <Dialog.Title className="auth-dialog-title">
                {loggedInUser
                  ? locale === "en"
                    ? "Welcome"
                    : locale === "ru"
                    ? "Добро пожаловать"
                    : "Xush kelibsiz"
                  : locale === "en"
                  ? "Sign in to QarshiDU Alumni"
                  : locale === "ru"
                  ? "Вход в QarshiDU Alumni"
                  : "QarshiDU bitiruvchilar tizimiga kirish"}
              </Dialog.Title>
              <p className="auth-dialog-subtitle">
                {loggedInUser
                  ? "Siz tizimga muvaffaqiyatli kirdingiz"
                  : "Email tasdiqlash kodi yoki Google hisobi orqali kiring"}
              </p>
            </div>
            <Dialog.Close
              className="terms-dialog-close"
              aria-label={locale === "en" ? "Close" : locale === "ru" ? "Закрыть" : "Yopish"}
              onClick={handleClose}
            >
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="terms-dialog-body auth-modal-body">
            {/* Logged in success state */}
            {loggedInUser ? (
              <div className="auth-success-box" role="status">
                <div className="auth-success-icon">
                  <UserCheck size={40} className="text-emerald-600" />
                </div>
                <h3>{loggedInUser.fullName || loggedInUser.email}</h3>
                <p className="auth-success-email">{loggedInUser.email}</p>
                <div className="auth-success-badge">
                  <ShieldCheck size={16} />
                  <span>{locale === "en" ? "Authenticated" : locale === "ru" ? "Авторизован" : "Tizimga kirdi"}</span>
                </div>
                <div className="auth-success-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      setOpen(false);
                      window.location.href = "/profile";
                    }}
                  >
                    {locale === "en" ? "My profile" : locale === "ru" ? "Мой профиль" : "Profilim"}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={async () => { try { await signOut(); setLoggedInUser(null); } catch (error) { setError(error instanceof Error ? error.message : "Chiqishda xatolik yuz berdi."); } }}
                  >
                    {locale === "en" ? "Sign Out" : locale === "ru" ? "Выйти" : "Chiqish"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Error Banner */}
                {error && (
                  <div className="form-error-banner" role="alert">
                    <X size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Tabs */}
                <div className="auth-tabs">
                  <button
                    type="button"
                    className={`auth-tab-btn ${activeTab === "otp" ? "active" : ""}`}
                    onClick={() => setActiveTab("otp")}
                  >
                    <Mail size={16} /> Email tasdiqlash kodi
                  </button>
                  <button
                    type="button"
                    className={`auth-tab-btn ${activeTab === "google" ? "active" : ""}`}
                    onClick={() => setActiveTab("google")}
                  >
                    <GoogleIcon /> Google orqali
                  </button>
                </div>

                {activeTab === "google" ? (
                  <div className="auth-tab-pane">
                    <p className="auth-pane-desc">
                      Google profilingiz orqali bir bosqichda xavfsiz tizimga kiring.
                    </p>
                    <GoogleSignInButton locale={locale} onSuccess={(userData) => setLoggedInUser(userData)} />
                  </div>
                ) : (
                  <div className="auth-tab-pane">
                    <div className="form-group">
                      <label htmlFor="modal-email-input" className="form-label required">
                        Email manzilingiz
                      </label>
                      <div className="input-with-button">
                        <input
                          id="modal-email-input"
                          type="email"
                          className="form-input"
                          placeholder="alumni@qarshidu.uz"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setCodeSent(false);
                            setCode("");
                          }}
                        />
                        <button
                          type="button"
                          className="button button-secondary send-code-btn"
                          onClick={handleSendCode}
                          disabled={sendingCode || countdown > 0}
                        >
                          {sendingCode
                            ? "Yuborilmoqda..."
                            : countdown > 0
                            ? `${countdown}s`
                            : codeSent
                            ? "Qayta yuborish"
                            : "Kodni olish"}
                        </button>
                      </div>
                    </div>

                    {codeSent && (
                      <div className="otp-verification-card">
                        <div className="otp-card-header">
                          <KeyRound size={18} className="otp-card-icon" />
                          <div>
                            <h4 className="otp-card-title">Tasdiqlash kodini kiriting</h4>
                            <p className="otp-card-desc">
                              <strong>{email}</strong> manziliga 6 xonali kod yuborildi.
                            </p>
                          </div>
                        </div>
                        <div className="otp-card-input-row">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            className="form-input otp-code-input"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          />
                          <button
                            type="button"
                            className="button button-primary otp-verify-button"
                            onClick={handleVerifyCode}
                            disabled={verifyingCode || code.length !== 6}
                          >
                            {verifyingCode ? "Tekshirilmoqda..." : "Kirish"}
                          </button>
                        </div>
                        <div className="otp-resend-row">
                          {countdown > 0 ? (
                            <span className="otp-countdown-text">Qayta yuborish: {countdown}s</span>
                          ) : (
                            <button
                              type="button"
                              className="text-link-btn"
                              onClick={handleSendCode}
                              disabled={sendingCode}
                            >
                              <RotateCw size={13} /> Kodni qayta yuborish
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
