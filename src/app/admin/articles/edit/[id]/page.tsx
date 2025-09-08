'use client';

import { useParams } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import { placeholderArticles } from '@/lib/placeholder-data';
import { Newspaper } from 'lucide-react';
import Link from 'next/link';

export default function EditArticlePage() {
  const params = useParams();
  const { id } = params;

  const article = placeholderArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Newspaper className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Article not found</h2>
        <p className="mt-2 text-muted-foreground">
          The article you are looking for does not exist.
        </p>
        <Link href="/admin/articles">
          <span className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
            Back to Articles
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Edit Article</h1>
        <p className="text-muted-foreground">Make changes to the article details below.</p>
      </div>
      <ArticleForm initialData={article} />
    </div>
  );
}
