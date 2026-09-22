export type NewsCategory = "university" | "alumni" | "event" | "achievement" | "general";

export interface NewsItem {
  id: number;
  slug: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  summary_uz: string;
  summary_ru?: string;
  summary_en?: string;
  content_uz?: string;
  content_ru?: string;
  content_en?: string;
  category: NewsCategory;
  cover_image?: string | null;
  cover_image_url?: string;
  cover_image_alt?: string;
  cover_image_credit?: string;
  cover_image_source_url?: string;
  views_count: number;
  author_name?: string;
  published_at?: string | null;
  is_featured: boolean;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}
