"use client";

import { useEffect, useRef, useState } from "react";
import { authWithGoogle } from "@/lib/api";

type GoogleIdentity = {
  initialize: (options: { client_id: string; nonce: string; callback: (response: { credential: string }) => void }) => void;
  renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string; width: number; locale: string }) => void;
};
declare global { interface Window { google?: { accounts: { id: GoogleIdentity } } } }
let googleScript: Promise<void> | undefined;
function loadGoogle() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (!googleScript) {
    googleScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => fail(), 15000);
      const fail = () => { clearTimeout(timeout); script.remove(); googleScript = undefined; reject(new Error("Google xizmatiga ulanib bo'lmadi. Sahifani yangilang yoki email orqali kiring.")); };
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => { clearTimeout(timeout); resolve(); };
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return googleScript;
}
type Props = {
  onSuccess: (user: { id: number; email: string; fullName: string }) => void;
  locale?: string;
};
export function GoogleSignInButton({ onSuccess, locale }: Pick<Props, "onSuccess" | "locale">) {
  const container = useRef<HTMLDivElement>(null);
  const success = useRef(onSuccess);
  success.current = onSuccess;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const busy = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const response = await fetch("/api/v1/auth/google/config/", { credentials: "same-origin", cache: "no-store" });
        if (!response.ok) throw new Error("Kirish xizmatiga ulanib bo'lmadi.");
        const config = await response.json();
        if (!config.client_id) throw new Error("Google orqali kirish hali sozlanmagan. Hozircha email orqali kiring.");
        await loadGoogle();
        if (cancelled || !container.current) return;
        const google = window.google?.accounts.id;
        if (!google) throw new Error("Google xizmati yuklanmadi. Qayta urinib ko'ring.");
        google.initialize({ client_id: config.client_id, nonce: config.nonce, callback: async ({ credential }) => {
          if (cancelled || busy.current) return;
          busy.current = true;
          setLoading(true);
          setError("");
          try {
            const result = await authWithGoogle(credential, true);
            if (!result.authenticated || !result.user?.id) throw new Error("Kirish tasdiqlanmadi.");
            if (!cancelled) success.current({ id: result.user.id, email: result.user.email, fullName: result.profile?.full_name || result.user.email });
          } catch (error) {
            if (!cancelled) setError(error instanceof Error ? error.message : "Kirishda xatolik yuz berdi.");
          } finally { busy.current = false; if (!cancelled) setLoading(false); }
        } });
        google.renderButton(container.current, { theme: "outline", size: "large", text: "continue_with", width: Math.min(360, container.current.clientWidth || 280), locale: locale === "uz" ? "en" : (locale || "en") });
        setLoading(false);
      } catch (error) {
        if (!cancelled) { setError(error instanceof Error ? error.message : "Google orqali kirishda xatolik yuz berdi."); setLoading(false); }
      }
    }
    initialize();
    return () => { cancelled = true; };
  }, [locale]);
  return <div className="google-signin-body" aria-busy={loading}>
    {loading && <p role="status">{locale === "en" ? "Loading..." : locale === "ru" ? "Загрузка..." : "Yuklanmoqda..."}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div ref={container} />
  </div>;
}
