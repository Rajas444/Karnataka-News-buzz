
import { z } from 'zod';

export type UserRole = 'admin' | 'editor' | 'user';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
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
  status: z.enum(['published', 'draft', 'scheduled', 'archived']),
  publishedAt: z.any(), // Can be Date or Firebase Timestamp
  createdAt: z.any(),
  updatedAt: z.any(),
  source: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  seo: z.object({
    keywords: z.array(z.string()),
    metaDescription: z.string(),
  }),
  views: z.number(),
  districtId: z.string().optional().nullable(), // Stored in DB
  district: z.string().optional().nullable(), // For display only
});

export type Article = z.infer<typeof articleSchema>;


export const articleFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.'),
  content: z.string().min(50, 'Content must be at least 50 characters long.'),
  status: z.enum(['draft', 'published', 'scheduled']),
  categoryId: z.string().nonempty('Please select a category.'),
  districtId: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  publishedAt: z.date().optional(),
  imageUrl: z.string().nullable().optional(),
  imagePath: z.string().optional(),
  seoMetaDescription: z.string().max(160).optional(),
  seoKeywords: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

// Types for Jobs
export type JobType = 'Government' | 'Private' | 'Fresher' | 'Internship';

export const jobFormSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    company: z.string().min(2, 'Company must be at least 2 characters.'),
    location: z.string().min(2, 'Location must be at least 2 characters.'),
    qualification: z.string().min(2, 'Qualification is required.'),
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

// User-generated Posts
export const postCategories = ["Incident", "Event", "Alert", "Local News"] as const;
export type PostCategory = typeof postCategories[number];

export const postFormSchema = z.object({
  title: z.string().min(5, 'Please provide a brief headline or title.'),
  description: z.string().min(10, 'Please provide more details.'),
  category: z.enum(postCategories),
  location: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  imagePath: z.string().optional(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export interface Post extends PostFormValues {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  createdAt: Date;
}
