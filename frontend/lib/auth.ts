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
export function authChanged() { window.dispatchEvent(new Event("auth-changed")); }
export async function signOut() {
  const response = await authenticatedFetch("/api/v1/auth/logout/", { method: "POST" });
  if (!response.ok) throw new Error("Chiqishda xatolik yuz berdi.");
  authChanged();
}
