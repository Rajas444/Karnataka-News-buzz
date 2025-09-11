
import { z } from 'zod';

export type UserRole = 'admin' | 'editor' | 'user';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface District {
  id: string;
  name: string;
}

const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().nullable(),
  imagePath: z.string().optional(),
  "data-ai-hint": z.string().optional(),
  author: z.string(),
  authorId: z.string(),
  categoryIds: z.array(z.string()),
  districtId: z.string(),
  status: z.enum(['published', 'draft', 'scheduled']),
  publishedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  seo: z.object({
    keywords: z.array(z.string()),
    metaDescription: z.string(),
  }),
  views: z.number(),
});

export type Article = z.infer<typeof articleSchema>;


export const articleFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.'),
  content: z.string().min(50, 'Content must be at least 50 characters long.'),
  status: z.enum(['draft', 'published', 'scheduled']),
  categoryId: z.string().nonempty('Please select a category.'),
  districtId: z.string().nonempty('Please select a district.'),
  publishedAt: z.date().optional(),
  imageUrl: z.string().nullable().optional(),
  imagePath: z.string().optional(),
  seoMetaDescription: z.string().max(160).optional(),
  seoKeywords: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

// Types for Newsdata.io
export interface NewsdataArticle {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  pubDate: string;
  source_id: string;
  category: string[];
}

export interface NewsdataResponse {
  status: string;
  totalResults: number;
  results: NewsdataArticle[];
  nextPage: string | null;
}
