
'use client';

import { useParams } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import { Newspaper, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getArticle } from '@/services/articles';
import { useEffect, useState } from 'react';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function EditArticlePage() {
  const params = useParams();
  const { id } = params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
      if (typeof id !== 'string') return;
      
      async function fetchArticle() {
          try {
              const fetchedArticle = await getArticle(id);
              if (fetchedArticle) {
                  setArticle(fetchedArticle);
              } else {
                  toast({ title: 'Article not found', variant: 'destructive' });
              }
          } catch (error) {
               toast({ title: 'Error fetching article', variant: 'destructive' });
          } finally {
              setLoading(false);
          }
      }
      fetchArticle();
  }, [id, toast]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Loading Article...</h2>
        </div>
      );
  }

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
