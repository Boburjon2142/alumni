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

export type Alumni = {
  id: number;
  slug: string;
  avatar?: string;
  image_url?: string;
  image_alt?: string;
  image_credit?: string;
  image_source_url?: string;
  full_name: string;
  faculty?: string;
  specialty?: string;
  graduation_year?: number;
  degree?: string;
  current_company?: string;
  position?: string;
  industry?: string;
  city?: string;
  country?: string;
  skills?: string[];
  bio?: string;
  biography_uz?: string;
  biography_en?: string;
  career_story_uz?: string;
  career_story_en?: string;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
  achievements?: Achievement[];
  timeline?: TimelineItem[];
  sources?: AlumniSource[];
  advice?: Advice[];
  verified?: boolean;
};

export type AlumniPreview = Alumni;

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
  type: string;
  name?: string;
  contact?: string;
  message: string;
  page_url?: string;
  page_type?: string;
};

export type FeedbackResponse = {
  id: number;
  status: string;
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
