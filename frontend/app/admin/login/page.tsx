"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { sendVerificationCode, verifyEmailCode } from "@/lib/api";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authChanged, loginWithPassword } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";

  const [authMode, setAuthMode] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codeStep, setCodeStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Iltimos, email va parolni to‘liq kiriting.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await loginWithPassword(email.trim().toLowerCase(), password);
      if (res.success) {
        authChanged();
        router.push(nextUrl);
      }
    } catch (err: any) {
      setError(err.message || "Email yoki parol noto‘g‘ri kiritildi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Iltimos, universitet admin email manzilingizni kiriting.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await sendVerificationCode(email.trim().toLowerCase(), false, "login");
      if (res.success) {
        setCodeStep("code");
        setSuccessMsg("Bir martalik tasdiqlash kodi emailingizga yuborildi.");
      }
    } catch (err: any) {
      setError(err.message || "Tasdiqlash kodini yuborishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setError("Iltimos, 6 xonali tasdiqlash kodini to‘liq kiriting.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await verifyEmailCode(email.trim().toLowerCase(), code.trim(), "login");
      if (res.success && res.authenticated) {
        authChanged();
        router.push(nextUrl);
      } else {
        setError(res.message || "Kodni tasdiqlab bo‘lmadi.");
      }
    } catch (err: any) {
      setError(err.message || "Tasdiqlash kodi noto‘g‘ri yoki muddati o‘tgan.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    authChanged();
    router.push(nextUrl);
  };

  return (
    <div className="admin-login-layout-wrapper">
      <div className="admin-login-card">
        {/* Top Decorative Banner */}
        <div className="admin-login-banner" />

        {/* Header Branding */}
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <GraduationCap className="w-8 h-8 text-[#D38E4F]" />
          </div>
          <h2 className="admin-login-title">QarDU ALUMNI</h2>
          <p className="admin-login-subtitle">
            Boshqaruv Tizimiga Kirish
          </p>
          <p className="admin-login-desc">
            Faqat universitet ma’murlari va mas’ul moderatorlar uchun
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="admin-auth-tabs">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError("");
              setSuccessMsg("");
            }}
            className={`admin-auth-tab ${authMode === "password" ? "active" : ""}`}
          >
            <Lock className="w-3.5 h-3.5" />
            Parol orqali kirish
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("code");
              setError("");
              setSuccessMsg("");
            }}
            className={`admin-auth-tab ${authMode === "code" ? "active" : ""}`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Email kod orqali
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="admin-alert admin-alert-error">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && !error && (
          <div className="admin-alert admin-alert-success">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Password Login Form */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="admin-form-group">
              <label className="admin-label">
                Administrator Email
              </label>
              <div className="admin-input-icon-wrap">
                <Mail className="admin-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@qarshidu.uz"
                  className="admin-input-field"
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">
                Parol
              </label>
              <div className="admin-input-icon-wrap">
                <Lock className="admin-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input-field has-eye"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-input-eye-btn"
                  title={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tizimga kirish</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* OTP Code Login Form */}
        {authMode === "code" && (
          <>
            {codeStep === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label">
                    Administrator Email
                  </label>
                  <div className="admin-input-icon-wrap">
                    <Mail className="admin-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@qarshidu.uz"
                      className="admin-input-field"
                      required
                    />
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-1.5">
                    Email manzilingizga 6 xonali bir martalik tasdiqlash kodi yuboriladi.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Kod yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Kodni yuborish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="admin-form-group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="admin-label !mb-0">
                      6 xonali tasdiqlash kodi
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeStep("email");
                        setCode("");
                      }}
                      className="text-xs text-[#0D1667] hover:underline font-semibold"
                    >
                      Emailni o‘zgartirish
                    </button>
                  </div>
                  <div className="admin-input-icon-wrap">
                    <KeyRound className="admin-input-icon" />
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="admin-input-field text-center tracking-[6px] font-mono text-base font-bold"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    Kod <strong>{email}</strong> manziliga yuborildi
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="admin-btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Tekshirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Boshqaruv paneliga kirish</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* Divider and Google Sign-in */}
        <div className="admin-divider">
          <span>yoki</span>
        </div>

        <GoogleSignInButton
          locale="uz"
          onSuccess={handleGoogleSuccess}
        />

        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Qarshi davlat universiteti &copy; {new Date().getFullYear()} ALUMNI Tizimi
          </p>
        </div>
      </div>
    </div>
  );
}
