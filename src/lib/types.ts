export type UserRole = 'admin' | 'editor' | 'user';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
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

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  "data-ai-hint"?: string;
  author: string;
  authorId: string;
  categoryIds: string[];
  districtId: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  seo: {
    keywords: string[];
    metaDescription: string;
  };
  views: number;
}
