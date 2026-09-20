import type {
  Achievement,
  Advice,
  Alumni,
  EducationExperience,
  GraduationYearChangeRequest,
  Interview,
  Recognition,
  StorySection,
  SuccessStory,
  TimelineItem,
  WorkExperience,
} from "./alumni";

export type AdminDashboardStats = {
  counts: {
    total_alumni: number;
    pending_alumni: number;
    approved_alumni: number;
    honorary_alumni: number;
    pending_year_requests: number;
    new_feedbacks: number;
    pending_contributions: number;
    published_stories: number;
    published_interviews: number;
    total_recognitions: number;
  };
  recent_profiles: {
    id: number;
    full_name: string;
    slug: string;
    created_at: string;
    approval_status: string;
    is_honorary: boolean;
  }[];
  recent_feedbacks: {
    id: number;
    name: string;
    type: string;
    message: string;
    status: string;
    created_at: string;
  }[];
  recent_requests: {
    id: number;
    alumnus__full_name: string;
    old_year: number | null;
    requested_year: number;
    status: string;
    created_at: string;
  }[];
};

export type AdminPaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type AdminRecognition = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  is_active: boolean;
  order: number;
  alumni_count?: number;
};

export type AdminFeedbackItem = {
  id: number;
  type: string;
  type_display: string;
  name: string;
  contact: string;
  message: string;
  page_type: string;
  page_url: string;
  alumni_id: number | null;
  alumni_name: string | null;
  story_id: number | null;
  story_title: string | null;
  status: "new" | "reviewing" | "resolved" | "spam";
  status_display: string;
  telegram_delivery_status?: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string;
};

export type AdminYearRequestItem = {
  id: number;
  alumni_id: number;
  alumni_name: string;
  alumni_slug: string;
  old_year: number | null;
  requested_year: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  status_display: string;
  admin_note: string;
  created_at: string;
  reviewed_at: string | null;
};

export type AdminAlumniPayload = {
  full_name: string;
  faculty_name?: string;
  specialty_name?: string;
  graduation_year?: number | null;
  degree?: string;
  academic_degree?: string;
  academic_title?: string;
  current_company?: string;
  position?: string;
  current_activity?: string;
  industry?: string;
  city?: string;
  country?: string;
  skills?: string[];
  bio?: string;
  biography_uz?: string;
  biography_en?: string;
  career_story_uz?: string;
  career_story_en?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  phone?: string;
  contact_email?: string;
  image_url?: string;
  image_alt?: string;
  image_credit?: string;
  image_source_url?: string;
  is_honorary?: boolean;
  is_featured?: boolean;
  is_published?: boolean;
  approval_status?: "pending" | "approved" | "rejected";
  recognition_ids?: number[];
  achievements?: {
    title: string;
    description?: string;
    year?: number | null;
    category?: string;
  }[];
  timeline?: {
    year: number;
    title: string;
    organization?: string;
    description?: string;
    type?: string;
  }[];
};

