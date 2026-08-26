import type { Alumni } from "./alumni";

export type AlumnusSummary = Pick<Alumni,"full_name"|"slug"|"avatar"|"image_url"|"image_alt"|"position"|"current_company">;
export type StorySection = { id:number; kind:string; heading_uz:string; heading_en:string; content_uz:string; content_en:string; order:number };
export type Story = { id:number; slug:string; title_uz:string; title_en:string; summary_uz:string; summary_en:string; hero_image?:string; hero_image_url?:string; hero_image_alt?:string; hero_image_credit?:string; hero_image_source_url?:string; published_at:string; is_featured:boolean; alumnus:AlumnusSummary; student_takeaway_uz?:string; student_takeaway_en?:string; sections?:StorySection[] };
export type InterviewItem = { id:number; question_uz:string; question_en:string; answer_uz:string; answer_en:string; order:number };
export type Interview = { id:number; slug:string; title_uz:string; title_en:string; intro_uz:string; intro_en:string; pull_quote_uz?:string; pull_quote_en?:string; published_at:string; is_featured:boolean; alumnus:AlumnusSummary; items?:InterviewItem[] };
export type Advice = { id:number; category:string; title_uz:string; title_en:string; content_uz:string; content_en:string; published_at:string; is_featured:boolean; alumnus:AlumnusSummary };
export type EventSpeaker = { id:number; display_name:string; alumnus?:AlumnusSummary; role_uz:string; role_en:string; order:number };
export type AlumniEvent = { id:number; slug:string; title_uz:string; title_en:string; summary_uz:string; summary_en:string; description_uz?:string; description_en?:string; event_type:string; cover_image?:string; cover_image_url?:string; cover_image_alt?:string; cover_image_credit?:string; cover_image_source_url?:string; start_at:string; end_at?:string; location_type:string; location_uz:string; location_en:string; external_url?:string; status:"upcoming"|"ongoing"|"past"; is_featured:boolean; speakers?:EventSpeaker[] };
