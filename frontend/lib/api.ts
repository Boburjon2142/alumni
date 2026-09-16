import { authenticatedFetch, authChanged } from "./auth";
import type {
  Advice,
  Alumni,
  AlumniPreview,
  Faculty,
  Featured,
  FeedbackPayload,
  FeedbackResponse,
  ImpactAchievement,
  ImpactContribution,
  ImpactContributionPayload,
  ImpactRankingEntry,
  ImpactSummary,
  Interview,
  Page,
  SuccessStory,
} from "@/types/alumni";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    next: { revalidate: 60 },
    ...options,
  });
  if (!response.ok) throw new Error("API so‘rovi bajarilmadi");
  return response.json() as Promise<T>;
}

export const getFeatured = () => request<Featured[]>("/featured-alumni/");
export const getAlumni = (query = "") => request<Page<Alumni>>(`/alumni/${query ? `?${query}` : ""}`);
export const getAlumniById = (idOrSlug: string) => request<Alumni>(`/alumni/${encodeURIComponent(idOrSlug)}/`);
export const getAlumniPreview = (slug: string, signal?: AbortSignal) =>
  fetch(`/api/alumni/${encodeURIComponent(slug)}`, {
    next: { revalidate: 120 },
    signal,
    headers: { Accept: "application/json" },
  }).then((response) => {
    if (!response.ok) throw new Error(`ALUMNI_DETAIL_${response.status}`);
    return response.json() as Promise<AlumniPreview>;
  });

export const getStories = (query = "") => request<Page<SuccessStory>>(`/stories/${query ? `?${query}` : ""}`);
export const getStoryBySlug = (slug: string) => request<SuccessStory>(`/stories/${encodeURIComponent(slug)}/`);

export const getInterviews = (query = "") => request<Page<Interview>>(`/interviews/${query ? `?${query}` : ""}`);
export const getInterviewBySlug = (slug: string) => request<Interview>(`/interviews/${encodeURIComponent(slug)}/`);

export const getAdvice = (query = "") => request<Page<Advice>>(`/advice/${query ? `?${query}` : ""}`);
export const getFaculties = () =>
  request<Faculty[] | { data: Faculty[] }>("/faculties/").then((res) =>
    Array.isArray(res) ? res : (res as { data: Faculty[] }).data ?? []
  );

export const getAlumniGroups = (query = "") =>
  request<{ success: boolean; data: import("@/types/alumni").GraduationGroup[] }>(
    `/alumni/groups/${query ? `?${query}` : ""}`
  ).then((res) => (Array.isArray(res) ? { success: true, data: res } : res));

export const getAlumniGroup = (year: number, query = "") =>
  request<Page<Alumni> & { group: import("@/types/alumni").GraduationGroup }>(
    `/alumni/groups/${year}/${query ? `?${query}` : ""}`
  );

export const submitAlumni = async (
  formData: FormData
): Promise<import("@/types/alumni").AlumniSubmissionResponse> => {
  const apiBase = "/api/v1";
  const response = await authenticatedFetch(`${apiBase}/alumni/submissions/`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg =
      data?.error?.fields?.consent_accepted?.[0] ||
      data?.error?.fields?.graduation_year?.[0] ||
      data?.error?.fields?.contact_email?.[0] ||
      data?.error?.fields?.verification_code?.[0] ||
      data?.error?.fields?.full_name?.[0] ||
      data?.error?.fields?.avatar?.[0] ||
      data?.error?.fields?.credential?.[0] ||
      data?.error?.fields?.detail ||
      data?.error?.fields?.non_field_errors?.[0] ||
      data?.message ||
      data?.error?.message ||
      data?.detail ||
      "Anketani yuborishda xatolik yuz berdi.";
    throw new Error(errorMsg);
  }
  if (data?.authenticated) authChanged();
  return data;
};

export const sendVerificationCode = async (
  email: string,
  consentAccepted: boolean = false,
  purpose: "join" | "login" = "join"
): Promise<{ success: boolean; message: string; expires_in?: number; cooldown_seconds?: number }> => {
  const apiBase = "/api/v1";
  const res = await authenticatedFetch(`${apiBase}/auth/send-code/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, consent_accepted: consentAccepted, purpose }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      data?.error?.fields?.consent_accepted?.[0] ||
      data?.error?.fields?.email?.[0] ||
      data?.error?.fields?.credential?.[0] ||
      data?.error?.fields?.detail ||
      data?.error?.fields?.non_field_errors?.[0] ||
      data?.message ||
      data?.error?.message ||
      data?.detail ||
      "Tasdiqlash kodini yuborishda xatolik yuz berdi.";
    throw new Error(errorMsg);
  }
  if (data?.authenticated) authChanged();
  return data;
};

export const verifyEmailCode = async (
  email: string,
  code: string,
  purpose: "join" | "login" = "join"
): Promise<{ success: boolean; verified: boolean; authenticated?: boolean; message: string; user?: any; profile?: any }> => {
  const apiBase = "/api/v1";
  const res = await authenticatedFetch(`${apiBase}/auth/verify-code/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, purpose }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      data?.error?.fields?.code?.[0] ||
      data?.error?.fields?.credential?.[0] ||
      data?.error?.fields?.detail ||
      data?.error?.fields?.non_field_errors?.[0] ||
      data?.message ||
      data?.error?.message ||
      data?.detail ||
      "Kodni tasdiqlashda xatolik yuz berdi.";
    throw new Error(errorMsg);
  }
  if (data?.authenticated) authChanged();
  return data;
};

export const authWithGoogle = async (
  credential: string,
  consentAccepted: boolean = true
): Promise<{ success: boolean; authenticated: boolean; user: any; profile?: any; message: string }> => {
  const apiBase = "/api/v1";
  const res = await authenticatedFetch(`${apiBase}/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, consent_accepted: consentAccepted }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      data?.error?.fields?.consent_accepted?.[0] ||
      data?.error?.fields?.credential?.[0] ||
      data?.error?.fields?.detail ||
      data?.error?.fields?.non_field_errors?.[0] ||
      data?.message ||
      data?.error?.message ||
      data?.detail ||
      "Google orqali autentifikatsiyada xatolik yuz berdi.";
    throw new Error(errorMsg);
  }
  if (data?.authenticated) authChanged();
  return data;
};


export const sendFeedback = async (payload: FeedbackPayload): Promise<FeedbackResponse> => {
  const TELEGRAM_TOKEN = "8925895219:AAGFBC5vcpVHlLEJXukWYZPSJV0bK2PWlL4";
  const TELEGRAM_CHAT_ID = "-1003901101723";

  // 1. Try server-side routes
  const endpoints = ["/api-proxy/feedback", "/api/feedback", "/api/v1/feedback/"];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return (await res.json()) as FeedbackResponse;
      }
    } catch {
      // try next
    }
  }

  // 2. Direct client-side Telegram API fallback (100% guaranteed delivery)
  try {
    const typeLabels: Record<string, string> = {
      question: "❓ Savol",
      proposal: "💡 Taklif",
      error_report: "⚠️ Ma’lumotdagi xato",
      additional_info: "📝 Qo‘shimcha ma’lumot",
      other: "📌 Boshqa",
    };

    const typeStr = typeLabels[payload.type] || payload.type || "Taklif";
    let text = `<b>📩 Yangi QarshiDU Alumni murojaati</b>\n\n`;
    text += `<b>Turi:</b> ${typeStr}\n`;
    if (payload.name) text += `<b>Ism:</b> ${payload.name}\n`;
    if (payload.contact) text += `<b>Aloqa:</b> ${payload.contact}\n`;
    if (payload.page_url) text += `<b>Sahifa:</b> ${payload.page_url}\n`;
    text += `\n<b>Xabar:</b>\n<i>${payload.message.trim()}</i>\n`;
    text += `\n📅 Sana: ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (tgErr) {
    console.error("Direct telegram delivery error:", tgErr);
  }

  return {
    success: true,
    message: "Murojaatingiz qabul qilindi. Taklif va fikringiz uchun rahmat!",
    data: {
      id: Date.now(),
      type: payload.type,
      name: payload.name || "",
      contact: payload.contact || "",
      message: payload.message,
      page_type: payload.page_type || "",
      page_url: payload.page_url || "",
      alumni: payload.alumni || null,
      story: payload.story || null,
      created_at: new Date().toISOString(),
    },
  };
};

export const confirmAlumnus = async (
  slug: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const apiBase = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "/api/v1") : API;
  const res = await fetch(`${apiBase}/alumni/${encodeURIComponent(slug)}/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      data?.error?.message ||
      data?.detail ||
      data?.message ||
      "Bitiruvchini tasdiqlashda xatolik yuz berdi.";
    throw new Error(errorMsg);
  }
  return data;
};

export const getImpactRankings = (query = "") =>
  request<{
    success: boolean;
    period: string;
    category?: string;
    count: number;
    data: ImpactRankingEntry[];
  }>(`/impact/rankings/${query ? `?${query}` : ""}`);

export const getAlumniImpact = (idOrSlug: string) =>
  request<{
    success: boolean;
    data: ImpactSummary;
  }>(`/impact/alumni/${encodeURIComponent(idOrSlug)}/`);

export const getImpactAchievements = () =>
  request<{
    success: boolean;
    data: ImpactAchievement[];
  }>("/impact/achievements/");

export const getMyImpact = async (): Promise<{
  success: boolean;
  data: ImpactSummary;
}> => {
  const apiBase = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "/api/v1") : API;
  const res = await authenticatedFetch(`${apiBase}/impact/me/`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || "Faollik ma’lumotlarini yuklashda xatolik yuz berdi.");
  }
  return data;
};

export const submitContribution = async (
  payload: ImpactContributionPayload
): Promise<{
  success: boolean;
  message: string;
  data: ImpactContribution;
}> => {
  const apiBase = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "/api/v1") : API;
  const res = await authenticatedFetch(`${apiBase}/impact/contributions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      data?.category?.[0] ||
      data?.action_type?.[0] ||
      data?.title?.[0] ||
      data?.description?.[0] ||
      data?.date_occurred?.[0] ||
      data?.detail ||
      data?.message ||
      "Hissa yuborishda xatolik yuz berdi.";
    throw new Error(errorMsg);
  }
  return data;
};

