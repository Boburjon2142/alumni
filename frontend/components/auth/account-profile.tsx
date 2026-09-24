"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthModal } from "./auth-modal";
import { authSession, signOut } from "@/lib/auth";
import type { Alumni } from "@/types/alumni";
import type { Dictionary, Locale } from "@/lib/i18n";
import { AlertCircle, LogIn, RefreshCw, User } from "lucide-react";

import { AlumniProfileView } from "@/components/alumni/alumni-profile-view";

export function AccountProfile({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [profile, setProfile] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const session = await authSession().catch(() => null);
      if (!session?.authenticated) {
        setIsAuthenticated(false);
        setProfile(null);
        return;
      }
      setIsAuthenticated(true);

      const response = await fetch("/api/v1/alumni/me/", { credentials: "same-origin", cache: "no-store" });
      if ([401, 403].includes(response.status)) {
        setIsAuthenticated(false);
        setProfile(null);
        return;
      }
      if (!response.ok) {
        throw new Error(locale === "en" ? "Failed to load profile data." : locale === "ru" ? "Не удалось загрузить данные профиля." : "Profil ma’lumotlarini yuklab bo‘lmadi.");
      }
      const data = await response.json();
      setProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === "en" ? "An error occurred." : locale === "ru" ? "Произошла ошибка." : "Xatolik yuz berdi."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.addEventListener("auth-changed", load);
    return () => {
      window.removeEventListener("auth-changed", load);
    };
  }, []);

  if (loading) {
    return (
      <div className="profile-loading-skeleton" role="status">
        <div className="skeleton-hero-box animate-pulse" />
        <div className="skeleton-tabs-bar animate-pulse" />
        <div className="skeleton-grid-layout">
          <div className="skeleton-main-card animate-pulse" />
          <div className="skeleton-sidebar-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="profile-auth-prompt-card">
        <div className="profile-auth-prompt-icon">
          <User size={32} />
        </div>
        <h2>
          {locale === "en" ? "Sign In to Your Profile" : locale === "ru" ? "Войдите в свой профиль" : "Shaxsiy kabinetga kirish"}
        </h2>
        <p>
          {locale === "en"
            ? "Sign in to view, edit, and manage your alumni profile."
            : locale === "ru"
            ? "Войдите в систему для просмотра и редактирования своего профиля."
            : "Profil ma’lumotlaringizni ko‘rish, to‘ldirish va tahrirlash uchun tizimga kiring."}
        </p>
        <div style={{ marginTop: "1.25rem" }}>
          <AuthModal
            locale={locale}
            t={t}
            trigger={
              <button type="button" className="button button-primary">
                <LogIn size={16} />
                <span>{locale === "en" ? "Sign In" : locale === "ru" ? "Войти" : "Tizimga kirish"}</span>
              </button>
            }
          />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-auth-prompt-card">
        <div className="profile-auth-prompt-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
          <AlertCircle size={32} />
        </div>
        <h2>
          {locale === "en"
            ? "Could not load profile"
            : locale === "ru"
            ? "Не удалось загрузить профиль"
            : "Profilni yuklab bo‘lmadi"}
        </h2>
        <p>
          {error ||
            (locale === "en"
              ? "Profile data is empty."
              : locale === "ru"
              ? "Данные профиля отсутствуют."
              : "Profil ma’lumotlari topilmadi.")}
        </p>
        <div style={{ marginTop: "1.25rem" }}>
          <button type="button" onClick={load} className="button button-primary">
            <RefreshCw size={16} />
            <span>{locale === "en" ? "Retry" : locale === "ru" ? "Повторить" : "Qayta urinish"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <AlumniProfileView profile={profile} locale={locale} t={t} />
    </div>
  );
}
