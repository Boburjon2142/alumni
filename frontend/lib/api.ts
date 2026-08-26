import type { Alumni, Featured, Page } from "@/types/alumni";
import type { Advice, AlumniEvent, Interview, Story } from "@/types/editorial";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
async function request<T>(path:string):Promise<T>{
  const response=await fetch(`${API}${path}`,{cache:"no-store"});
  if(!response.ok) throw new Error("API so‘rovi bajarilmadi");
  return response.json() as Promise<T>;
}
export const getFeatured=()=>request<Featured[]>("/featured-alumni/");
export const getAlumni=(query="")=>request<Page<Alumni>>(`/alumni/${query?`?${query}`:""}`);
export const getAlumniById=(id:string)=>request<Alumni>(`/alumni/${id}/`);
export const getStories=(query="")=>request<Page<Story>>(`/stories/${query?`?${query}`:""}`);
export const getStory=(slug:string)=>request<Story>(`/stories/${slug}/`);
export const getInterviews=(query="")=>request<Page<Interview>>(`/interviews/${query?`?${query}`:""}`);
export const getInterview=(slug:string)=>request<Interview>(`/interviews/${slug}/`);
export const getAdvice=(query="")=>request<Page<Advice>>(`/advice/${query?`?${query}`:""}`);
export const getEvents=(query="")=>request<Page<AlumniEvent>>(`/events/${query?`?${query}`:""}`);
export const getEvent=(slug:string)=>request<AlumniEvent>(`/events/${slug}/`);
