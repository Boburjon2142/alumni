export type Recognition = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  year?: number;
};

export type Achievement = {
  id: number;
  title: string;
  description?: string;
  year?: number;
  category: string;
  order: number;
};

export type TimelineItem = {
  id: number;
  year: number;
  title: string;
  organization?: string;
  description?: string;
  type: string;
  order: number;
};

export type AlumniSource = {
  id: number;
  title: string;
  url: string;
  source_type: string;
  publisher?: string;
  published_date?: string;
  is_verified: boolean;
};

export type Advice = {
  id: number;
  category: string;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  content_uz: string;
  content_ru?: string;
  content_en?: string;
  published_at?: string;
  is_featured: boolean;
  alumnus: {
    full_name: string;
    slug: string;
    avatar?: string;
    image_url?: string;
    image_alt?: string;
    position?: string;
    current_company?: string;
    faculty?: string;
  };
};

export type EducationExperience = {
  id?: number;
  degree_level: "bachelor" | "master" | "phd" | "dsc" | "residency" | "second_degree" | "other" | string;
  degree_level_display?: string;
  institution: string;
  faculty?: string;
  specialty?: string;
  start_year?: number | null;
  graduation_year: number;
  order?: number;
};

export type WorkExperience = {
  id?: number;
  region: string;
  company: string;
  position: string;
  start_year: number;
  end_year?: number | null;
  is_current?: boolean;
  order?: number;
};

export type GraduationYearChangeRequest = {
  id?: number;
  old_year?: number | null;
  requested_year: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  status_display?: string;
  admin_note?: string;
  created_at?: string;
};

export type Alumni = {
  id: number;
  slug: string;
  email?: string;
  avatar?: string;
  image_url?: string;
  image_alt?: string;
  image_credit?: string;
  image_source_url?: string;
  full_name: string;
  faculty?: string;
  faculty_name?: string;
  specialty?: string;
  graduation_year?: number;
  is_graduation_year_locked?: boolean;
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
  is_featured: boolean;
  is_honorary?: boolean;
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
  achievements?: Achievement[];
  timeline?: TimelineItem[];
  educations?: EducationExperience[];
  work_experiences?: WorkExperience[];
  pending_graduation_request?: GraduationYearChangeRequest | null;
  sources?: AlumniSource[];
  advice?: Advice[];
  verified?: boolean;
  approval_status?: "pending" | "approved" | "rejected" | string;
  approved_at?: string;
  approved_by_name?: string;
  recognitions?: Recognition[];
};

export type AlumniPreview = Alumni;

export type GraduationGroup = {
  year: number;
  members_count: number;
  title: string;
  subtitle: string;
  description: string;
};

export type AlumniSubmissionPayload = {
  full_name: string;
  graduation_year: number;
  contact_email: string;
  academic_degree?: string;
  academic_title?: string;
  current_activity?: string;
  bio?: string;
  consent_accepted: boolean;
};

export type AlumniSubmissionResponse = {
  success: boolean;
  message: string;
  data?: {
    id: number;
    full_name: string;
    graduation_year: number;
    approval_status: string;
  };
};

export type Featured = {
  id: number;
  title: string;
  short_description: string;
  display_order: number;
  alumni: Alumni;
};

export type Specialty = {
  id: number;
  name: string;
};

export type Faculty = {
  id: number;
  name: string;
  specialties?: Specialty[];
};

export type Page<T> = {
  success: boolean;
  data: T[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    next: string | null;
    previous: string | null;
  };
};

export type FeedbackPayload = {
  type: "proposal" | "question" | "error_report" | "additional_info" | "other";
  name?: string;
  contact?: string;
  message: string;
  page_url?: string;
  page_type?: string;
  alumni?: number | null;
  story?: number | null;
};

export type FeedbackResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    type: string;
    name: string;
    contact: string;
    message: string;
    page_type: string;
    page_url: string;
    alumni: number | null;
    story: number | null;
    created_at: string;
  };
};

export type StorySection = {
  id: number;
  heading_uz: string;
  heading_en?: string;
  content_uz: string;
  content_en?: string;
  order: number;
};

export type SuccessStory = {
  id: number;
  slug: string;
  title: string;
  title_uz: string;
  title_en?: string;
  title_ru?: string;
  excerpt?: string;
  summary?: string;
  summary_uz?: string;
  summary_en?: string;
  summary_ru?: string;
  cover_image?: string;
  cover_alt?: string;
  hero_image?: string;
  hero_image_url?: string;
  hero_image_alt?: string;
  published_at?: string;
  is_featured?: boolean;
  sections?: StorySection[];
  student_takeaway_uz?: string;
  student_takeaway_en?: string;
  takeaway?: string;
  alumnus?: {
    full_name: string;
    slug: string;
    avatar?: string;
    image_url?: string;
    position?: string;
    current_company?: string;
    faculty?: string;
    graduation_year?: number;
  };
};

export type InterviewItem = {
  id: number;
  question_uz: string;
  question_en?: string;
  question_ru?: string;
  answer_uz: string;
  answer_en?: string;
  answer_ru?: string;
  order: number;
};

export type Interview = {
  id: number;
  slug: string;
  title_uz: string;
  title_en?: string;
  title_ru?: string;
  intro_uz: string;
  intro_en?: string;
  intro_ru?: string;
  pull_quote_uz?: string;
  pull_quote_en?: string;
  pull_quote_ru?: string;
  published_at?: string;
  is_featured: boolean;
  video_url?: string;
  video_duration?: string;
  items_count?: number;
  alumnus: {
    full_name: string;
    slug: string;
    avatar?: string;
    image_url?: string;
    image_alt?: string;
    position?: string;
    current_company?: string;
    faculty?: string;
    graduation_year?: number;
  };
  items?: InterviewItem[];
};

export type ImpactCategory = "career" | "mentorship" | "university" | "community";

export type ImpactContributionStatus = "pending" | "verified" | "rejected" | "revoked";

export type ImpactAchievement = {
  id: number;
  slug: string;
  title_uz: string;
  title_en?: string;
  title_ru?: string;
  description_uz: string;
  description_en?: string;
  description_ru?: string;
  category: string;
  icon: string;
  awarded_at?: string;
};

export type ImpactContribution = {
  id: number;
  category: ImpactCategory;
  category_display?: string;
  action_type: string;
  title: string;
  description: string;
  date_occurred: string;
  verified_at?: string;
  points_awarded?: number;
  evidence_url?: string;
  financial_tier?: string;
  status?: ImpactContributionStatus;
  rejection_reason?: string;
};

export type ImpactRankingEntry = {
  rank: number;
  alumni: {
    id: number;
    slug: string;
    full_name: string;
    avatar?: string;
    image_url?: string;
    graduation_year: number;
    faculty?: string;
    position?: string;
    current_company?: string;
  };
  total_score: number;
  annual_score: number;
  lifetime_score: number;
  top_category: ImpactCategory;
  category_breakdown: {
    career: number;
    mentorship: number;
    university: number;
    community: number;
  };
  badges_count: number;
  verified_contributions_count: number;
  top_badge?: {
    title_uz: string;
    title_en?: string;
    title_ru?: string;
    icon: string;
    category: string;
  } | null;
};

export type ImpactSummary = {
  total_score: number;
  annual_score: number;
  lifetime_score: number;
  annual_rank: number | null;
  lifetime_rank: number | null;
  category_breakdown: {
    career: number;
    mentorship: number;
    university: number;
    community: number;
  };
  verified_count: number;
  achievements: ImpactAchievement[];
  recent_contributions: ImpactContribution[];
};

export type ImpactContributionPayload = {
  category: ImpactCategory;
  action_type: string;
  title: string;
  description: string;
  date_occurred: string;
  evidence_url?: string;
  financial_amount?: number;
  supporting_notes?: string;
};

