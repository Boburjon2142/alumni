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
  const response = await fetch(`${API}${path}`, { cache: "no-store", ...options });
  if (!response.ok) throw new Error("API so‘rovi bajarilmadi");
  return response.json() as Promise<T>;
}

export const getFeatured = () => request<Featured[]>("/featured-alumni/");
export const getAlumni = (query = "") => request<Page<Alumni>>(`/alumni/${query ? `?${query}` : ""}`);
export const getAlumniById = (idOrSlug: string) => request<Alumni>(`/alumni/${encodeURIComponent(idOrSlug)}/`);
export const getAlumniPreview = (slug: string, signal?: AbortSignal) =>
  fetch(`/api/alumni/${encodeURIComponent(slug)}`, {
    cache: "no-store",
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

export const sendFeedback = (payload: FeedbackPayload) =>
  fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => {
    if (!res.ok) throw new Error("Feedback request failed");
    return res.json() as Promise<FeedbackResponse>;
  });
