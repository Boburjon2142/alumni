export async function authSession() {
  const response = await fetch("/api/v1/auth/session/", { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error("Kirish xizmatiga ulanib bo'lmadi.");
  return response.json();
}

export async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const session = await authSession();
  const headers = new Headers(options.headers);
  headers.set("X-CSRFToken", session.csrf_token);
  return fetch(path, { ...options, headers, credentials: "same-origin", cache: "no-store" });
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
    const errorMsg =
      data?.error?.fields?.non_field_errors?.[0] ||
      data?.error?.fields?.email?.[0] ||
      data?.error?.fields?.password?.[0] ||
      data?.error?.fields?.detail ||
      data?.non_field_errors?.[0] ||
      data?.email?.[0] ||
      data?.password?.[0] ||
      data?.message ||
      data?.error?.message ||
      data?.detail ||
      "Email yoki parol noto‘g‘ri.";
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
