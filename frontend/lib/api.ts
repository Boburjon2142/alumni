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
  const endpoints = ["/api-proxy/feedback", "/api/feedback", "/api/v1/feedback/"];
  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return (await res.json()) as FeedbackResponse;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(lastError?.message || "Murojaatni yuborib bo‘lmadi");
};
