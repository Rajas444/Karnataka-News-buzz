
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


// Types for Jobs
export type JobType = 'Government' | 'Private' | 'Fresher' | 'Internship';

export const jobFormSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    company: z.string().min(2, 'Company must be at least 2 characters.'),
    location: z.string().min(2, 'Location must be at least 2 characters.'),
    description: z.string().min(20, 'Description must be at least 20 characters.'),
    applyLink: z.string().url('Please enter a valid URL.'),
    jobType: z.enum(['Government', 'Private', 'Fresher', 'Internship']),
    lastDateToApply: z.date({
        required_error: 'Last date to apply is required.',
    }),
});
export type JobFormValues = z.infer<typeof jobFormSchema>;


export interface Job extends JobFormValues {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'expired';
}
