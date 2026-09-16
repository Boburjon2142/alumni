"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthModal } from "./auth-modal";
import { signOut } from "@/lib/auth";
import type { Alumni } from "@/types/alumni";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Edit3, GraduationCap, LogOut, Mail, User, Building, MapPin } from "lucide-react";

import { AlumniProfileView } from "@/components/alumni/alumni-profile-view";

export function AccountProfile({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [profile, setProfile] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/v1/alumni/me/", { credentials: "same-origin", cache: "no-store" });
        if ([401, 403].includes(response.status)) { if (!cancelled) setProfile(null); return; }
        if (!response.ok) throw new Error("Profilni yuklab bo'lmadi.");
        const data = await response.json();
        if (!cancelled) setProfile(data.data);
      } catch (error) { if (!cancelled) setError(error instanceof Error ? error.message : "Xatolik yuz berdi."); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    window.addEventListener("auth-changed", load);
    return () => { cancelled = true; window.removeEventListener("auth-changed", load); };
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

  if (!profile) {
    return (
      <div className="auth-modal-standalone-wrap">
        <AuthModal locale={locale} t={t} />
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {error && (
        <div className="profile-error-alert" role="alert">
          <span>{error}</span>
        </div>
      )}
      <AlumniProfileView profile={profile} locale={locale} t={t} />
    </div>
  );
}
