
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useArticleModal } from '@/components/providers/article-modal-provider';
import { getArticle } from '@/services/articles';
import type { Article, Category } from '@/lib/types';
import { Loader2, MapPin, X, User, ExternalLink, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import ShareButtons from '@/components/shared/ShareButtons';
import RelatedArticles from './RelatedArticles';
import { getCategories } from '@/services/categories';
import Link from 'next/link';

export default function ArticleModal() {
  const { isOpen, onClose, articleId } = useArticleModal();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
        try {
            const fetchedCategories = await getCategories();
            setAllCategories(fetchedCategories);
        } catch (e) {
            console.error("Failed to fetch categories for modal", e);
        }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      if (articleId) {
        setLoading(true);
        setArticle(null); // Clear previous article
        try {
          const fetchedArticle = await getArticle(articleId);
          setArticle(fetchedArticle);
        } catch (error) {
          console.error("Failed to fetch article:", error);
          // Optionally show a toast error
          onClose(); // Close modal on error
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchArticle();
    }
  }, [articleId, isOpen, onClose]);
  
  const handleClose = () => {
      setArticle(null);
      onClose();
  }

  const articleCategories = article?.categoryIds?.map(catId => 
      allCategories.find(c => c.id === catId)
  ).filter((c): c is Category => !!c) || [];


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 relative flex-shrink-0">
            <DialogTitle className="text-2xl md:text-3xl font-headline font-bold leading-tight mb-2 font-kannada">
              {article?.title || <>&nbsp;</>}
            </DialogTitle>
            {article && (
              <DialogDescription asChild>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 items-center">
                  <span>{article.publishedAt ? format(new Date(article.publishedAt), 'PPP') : ''}</span>
                  {article.district && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {article.district}
                    </span>
                  )}
                  {article.author && (
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {article.author}
                    </span>
                  )}
                </div>
              </DialogDescription>
            )}
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={handleClose}>
              <X className="h-5 w-5"/>
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          
          {loading && (
              <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          )}

          {article && !loading && (
            <>
                 <div className="overflow-y-auto px-6 pb-6 flex-grow">
                     {article.imageUrl && (
                        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden my-4">
                            <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                             <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-md">
                                Karnataka News Pulse
                            </div>
                        </div>
                    )}
                    
                    <div 
                        className="prose dark:prose-invert max-w-none font-kannada"
                        dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<p>') }} 
                    />

                    <div className="mt-8 space-y-4">
                        {articleCategories.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold flex items-center gap-1.5"><Tag className="h-4 w-4"/> Categories:</h4>
                                {articleCategories.map(cat => (
                                    <Badge key={cat.id} variant="secondary">{cat.name}</Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {article.categoryIds?.[0] && (
                        <RelatedArticles
                            categoryId={article.categoryIds[0]}
                            currentArticleId={article.id}
                        />
                    )}
                </div>
                <div className="border-t p-4 flex-shrink-0 flex justify-between items-center bg-muted/50">
                    <ShareButtons url={typeof window !== 'undefined' ? `${window.location.origin}/article/${article.id}` : ''} title={article.title} />
                </div>
            </>
          )}
      </DialogContent>
    </Dialog>
  );
}
