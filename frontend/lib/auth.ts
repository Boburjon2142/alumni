import { apiErrorMessage } from "./api-error";
export async function authSession() {
  const response = await fetch("/api/v1/auth/session/", { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error("Kirish xizmatiga ulanib bo'lmadi.");
  return response.json();
}

export async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return fetch(path, { ...options, credentials: "same-origin", cache: "no-store" });
  }
  const session = await authSession();
  const headers = new Headers(options.headers);
  headers.set("X-CSRFToken", session.csrf_token);
  const response = await fetch(path, { ...options, headers, credentials: "same-origin", cache: "no-store" });
  if (response.ok && path.startsWith("/api/v1/admin/")) {
    window.dispatchEvent(new Event("site-content-changed"));
    try { localStorage.setItem("site-content-changed", `${Date.now()}-${Math.random()}`); } catch { /* Storage may be disabled. */ }
  }
  return response;
}

export function authChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
}

export async function loginWithPassword(email: string, password: string) {
  const res = await authenticatedFetch("/api/v1/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = apiErrorMessage(data, "Email yoki parol noto‘g‘ri.");
    throw new Error(errorMsg);
  }
  authChanged();
  return data;
}

export async function signOut() {
  const response = await authenticatedFetch("/api/v1/auth/logout/", { method: "POST" });
  if (!response.ok) throw new Error("Chiqishda xatolik yuz berdi.");
  authChanged();
}
