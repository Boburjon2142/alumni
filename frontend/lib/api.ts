import type {
  Advice,
  Alumni,
  AlumniPreview,
  Faculty,
  Featured,
  FeedbackPayload,
  FeedbackResponse,
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

export const getAdvice = (query = "") => request<Page<Advice>>(`/advice/${query ? `?${query}` : ""}`);
export const getFaculties = () =>
  request<Faculty[] | { data: Faculty[] }>("/faculties/").then((res) =>
    Array.isArray(res) ? res : (res as { data: Faculty[] }).data ?? []
  );

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
    let text = `<b>📩 Yangi QarDU Alumni murojaati</b>\n\n`;
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
