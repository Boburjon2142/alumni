import { authenticatedFetch, authChanged } from "./auth";
import type {
  AdminDashboardStats,
  AdminFeedbackItem,
  AdminPaginatedResponse,
  AdminRecognition,
  AdminYearRequestItem,
  AdminAlumniPayload,
  AdminNewsItem,
  AdminNewsPayload,
} from "@/types/admin";
import type { NewsItem } from "@/types/news";
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
  Recognition,
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
export const getRecognitions = () =>
  request<Recognition[] | { data: Recognition[] }>("/alumni/recognitions/").then((res) =>
    Array.isArray(res) ? res : (res as { data: Recognition[] }).data ?? []
  );
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

export const getNews = (query = "") => request<Page<NewsItem>>(`/news/${query ? `?${query}` : ""}`);
export const getNewsBySlug = (slug: string) => request<NewsItem>(`/news/${encodeURIComponent(slug)}/`);

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

export { loginWithPassword } from "./auth";

export const sendFeedback = async (
  payload: FeedbackPayload,
  locale?: string
): Promise<FeedbackResponse> => {
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

  // Helper to escape HTML for fallback telegram notification
  const escapeHtml = (str?: string) =>
    (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 2. Direct client-side Telegram API fallback
  try {
    const typeLabels: Record<string, string> = {
      proposal: "Taklif",
      question: "Savol",
      error_report: "Xato haqida xabar",
      data_correction: "Ma’lumotni tuzatish",
      alumni_nomination: "Bitiruvchi ma’lumotini taklif qilish",
      additional_info: "Qo‘shimcha ma’lumot",
      other: "Boshqa",
    };

    const typeStr = typeLabels[payload.type] || payload.type || "Taklif";
    let text = `<b>📩 Yangi murojaat</b>\n\n`;
    text += `<b>Turi:</b> ${escapeHtml(typeStr)}\n`;
    if (payload.subject) text += `<b>Mavzu:</b> ${escapeHtml(payload.subject)}\n`;
    if (payload.name) text += `<b>Ism:</b> ${escapeHtml(payload.name)}\n`;
    if (payload.email) text += `<b>Email:</b> ${escapeHtml(payload.email)}\n`;
    if (payload.phone) text += `<b>Telefon:</b> ${escapeHtml(payload.phone)}\n`;
    if (payload.contact && !payload.email && !payload.phone) {
      text += `<b>Aloqa:</b> ${escapeHtml(payload.contact)}\n`;
    }
    if (payload.page_url) text += `<b>Sahifa:</b> ${escapeHtml(payload.page_url)}\n`;
    text += `\n<b>Xabar:</b>\n<i>${escapeHtml(payload.message.trim())}</i>\n`;
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
      subject: payload.subject,
      name: payload.name || "",
      email: payload.email || "",
      phone: payload.phone || "",
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


// ==========================================
// ADMIN API CLIENT METHODS
// ==========================================

const getAdminBase = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  }
  return API;
};

export const getAdminStats = async (): Promise<AdminDashboardStats> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/stats/`);
  if (!res.ok) throw new Error("Statistikalarni yuklab bo‘lmadi");
  return res.json();
};

export const getAdminAlumni = async (query = ""): Promise<AdminPaginatedResponse<Alumni>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/alumni/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Bitiruvchilar ro‘yxatini yuklab bo‘lmadi");
  return res.json();
};

export const getAdminAlumniById = async (idOrSlug: string): Promise<Alumni> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/alumni/${encodeURIComponent(idOrSlug)}/`);
  if (!res.ok) throw new Error("Profilni yuklab bo‘lmadi");
  return res.json();
};

export const createAdminAlumni = async (payload: AdminAlumniPayload): Promise<Alumni> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/alumni/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Profilni saqlashda xatolik yuz berdi");
  return data;
};

export const updateAdminAlumni = async (idOrSlug: string, payload: Partial<AdminAlumniPayload>): Promise<Alumni> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/alumni/${encodeURIComponent(idOrSlug)}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Profilni yangilashda xatolik yuz berdi");
  return data;
};

export const deleteAdminAlumni = async (idOrSlug: string): Promise<void> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/alumni/${encodeURIComponent(idOrSlug)}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Profilni o‘chirib bo‘lmadi");
};

export const actionAdminAlumni = async (
  id: number,
  action: "approve" | "reject" | "toggle_publish" | "toggle_featured" | "set_honorary",
  data?: any
): Promise<{ success: boolean; message: string }> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/alumni/${id}/action/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  const resData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(resData?.message || "Amalni bajarib bo‘lmadi");
  return resData;
};

export const getAdminRecognitions = async (): Promise<{ results: AdminRecognition[] }> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/recognitions/`);
  if (!res.ok) throw new Error("Faxriy unvonlarni yuklab bo‘lmadi");
  return res.json();
};

export const createAdminRecognition = async (payload: Partial<AdminRecognition>): Promise<AdminRecognition> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/recognitions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Faxriy unvon yaratib bo‘lmadi");
  return data;
};

export const updateAdminRecognition = async (id: number, payload: Partial<AdminRecognition>): Promise<AdminRecognition> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/recognitions/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Faxriy unvon yangilab bo‘lmadi");
  return data;
};

export const deleteAdminRecognition = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/recognitions/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Faxriy unvonni o‘chirib bo‘lmadi");
};

export const getAdminYearRequests = async (query = ""): Promise<AdminPaginatedResponse<AdminYearRequestItem>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/requests/graduation-year/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("So‘rovlarni yuklab bo‘lmadi");
  return res.json();
};

export const actionAdminYearRequest = async (
  id: number,
  action: "approve" | "reject",
  admin_note = ""
): Promise<{ success: boolean; message: string }> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/requests/graduation-year/${id}/action/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, admin_note }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "So‘rov holatini o‘zgartirib bo‘lmadi");
  return data;
};

export const getAdminStories = async (query = ""): Promise<AdminPaginatedResponse<SuccessStory>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/stories/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Hikoyalarni yuklab bo‘lmadi");
  return res.json();
};

export const getAdminStoryById = async (id: number): Promise<SuccessStory> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/stories/${id}/`);
  if (!res.ok) throw new Error("Hikoyani yuklab bo‘lmadi");
  return res.json();
};

export const saveAdminStory = async (id: number | null, payload: any): Promise<SuccessStory> => {
  const url = id ? `${getAdminBase()}/admin/stories/${id}/` : `${getAdminBase()}/admin/stories/`;
  const method = id ? "PUT" : "POST";
  const res = await authenticatedFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Hikoyani saqlab bo‘lmadi");
  return data;
};

export const deleteAdminStory = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/stories/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Hikoyani o‘chirib bo‘lmadi");
};

export const getAdminInterviews = async (query = ""): Promise<AdminPaginatedResponse<Interview>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/interviews/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Intervyularni yuklab bo‘lmadi");
  return res.json();
};

export const getAdminInterviewById = async (id: number): Promise<Interview> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/interviews/${id}/`);
  if (!res.ok) throw new Error("Intervyuni yuklab bo‘lmadi");
  return res.json();
};

export const saveAdminInterview = async (id: number | null, payload: any): Promise<Interview> => {
  const url = id ? `${getAdminBase()}/admin/interviews/${id}/` : `${getAdminBase()}/admin/interviews/`;
  const method = id ? "PUT" : "POST";
  const res = await authenticatedFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Intervyuni saqlab bo‘lmadi");
  return data;
};

export const deleteAdminInterview = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/interviews/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Intervyuni o‘chirib bo‘lmadi");
};

export const getAdminAdvice = async (query = ""): Promise<AdminPaginatedResponse<Advice>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/advice/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Maslahatlarni yuklab bo‘lmadi");
  return res.json();
};

export const saveAdminAdvice = async (id: number | null, payload: any): Promise<Advice> => {
  const url = id ? `${getAdminBase()}/admin/advice/${id}/` : `${getAdminBase()}/admin/advice/`;
  const method = id ? "PUT" : "POST";
  const res = await authenticatedFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Maslahatni saqlab bo‘lmadi");
  return data;
};

export const deleteAdminAdvice = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/advice/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Maslahatni o‘chirib bo‘lmadi");
};

export const getAdminFeedback = async (query = ""): Promise<AdminPaginatedResponse<AdminFeedbackItem>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/feedback/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Murojaatlarni yuklab bo‘lmadi");
  return res.json();
};

export const updateAdminFeedbackStatus = async (
  id: number,
  status: "new" | "reviewing" | "resolved" | "spam"
): Promise<{ success: boolean; message: string }> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/feedback/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Murojaat holatini yangilab bo‘lmadi");
  return data;
};

export const deleteAdminFeedback = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/feedback/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Murojaatni o‘chirib bo‘lmadi");
};

export const getAdminContributions = async (query = ""): Promise<AdminPaginatedResponse<ImpactContribution>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/impact/contributions/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Hissalarni yuklab bo‘lmadi");
  return res.json();
};

export const approveAdminContribution = async (id: number, verification_note = ""): Promise<ImpactContribution> => {
  const res = await authenticatedFetch(`${getAdminBase()}/impact/contributions/${id}/approve/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verification_note }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || "Hissani tasdiqlab bo‘lmadi");
  return data;
};

export const rejectAdminContribution = async (id: number, reason: string): Promise<ImpactContribution> => {
  const res = await authenticatedFetch(`${getAdminBase()}/impact/contributions/${id}/reject/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || "Hissani rad etib bo‘lmadi");
  return data;
};

export const getAdminNews = async (query = ""): Promise<AdminPaginatedResponse<AdminNewsItem>> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/news/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Yangiliklarni yuklab bo‘lmadi");
  return res.json();
};

export const createAdminNews = async (data: AdminNewsPayload | FormData): Promise<AdminNewsItem> => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await authenticatedFetch(`${getAdminBase()}/admin/news/`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
  const resData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(resData?.error || resData?.message || "Yangilik yaratib bo‘lmadi");
  return resData;
};

export const updateAdminNews = async (id: number, data: Partial<AdminNewsPayload> | FormData): Promise<AdminNewsItem> => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await authenticatedFetch(`${getAdminBase()}/admin/news/${id}/`, {
    method: "PUT",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
  const resData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(resData?.error || resData?.message || "Yangilikni yangilab bo‘lmadi");
  return resData;
};

export const deleteAdminNews = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${getAdminBase()}/admin/news/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Yangilikni o‘chirib bo‘lmadi");
};

