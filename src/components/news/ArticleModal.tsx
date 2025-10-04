
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useArticleModal } from '@/components/providers/article-modal-provider';
import { getArticle } from '@/services/articles';
import type { Article } from '@/lib/types';
import { Loader2, MapPin, X, User, Newspaper as NewspaperIcon, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import ShareButtons from '@/components/shared/ShareButtons';
import { ScrollArea } from '../ui/scroll-area';

export default function ArticleModal() {
  const { isOpen, onClose, articleId } = useArticleModal();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);

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
          onClose(); // Close modal on error
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchArticle();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [articleId, isOpen, onClose]);
  
  const handleClose = () => {
      setArticle(null);
      onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl md:text-2xl font-headline font-bold leading-tight mb-2 font-kannada">
                  {loading ? 'Loading...' : article?.title}
                </DialogTitle>
                {article && !loading && (
                  <DialogDescription asChild>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 items-center">
                      {article.publishedAt && <span>{format(new Date(article.publishedAt), 'PPP')}</span>}
                      {article.district && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {article.district}
                        </span>
                      )}
                       {article.source && (
                          <span className="flex items-center gap-1">
                            <NewspaperIcon className="h-3 w-3" />
                            {article.sourceUrl ? (
                              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary flex items-center gap-1">
                                {article.source} <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              article.source
                            )}
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
              </div>
              <DialogClose asChild>
                  <Button variant="ghost" size="icon">
                      <X className="h-4 w-4"/>
                      <span className="sr-only">Close</span>
                  </Button>
              </DialogClose>
             </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {loading && (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}

            {article && !loading && (
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6 space-y-4">
                    {article.imageUrl && (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                          <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                          />
                      </div>
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-kannada text-base leading-relaxed text-foreground">
                      {article.content}
                    </div>

                </div>
              </ScrollArea>
            )}
          </div>
        
          {article && !loading && (
            <div className="border-t p-3 flex justify-between items-center bg-muted/50">
                <ShareButtons url={typeof window !== 'undefined' ? `${window.location.origin}/article/${article.id}` : ''} title={article.title} />
                 <Button variant="outline" size="sm" asChild>
                    <a href={article.sourceUrl || '#'} target="_blank" rel="noopener noreferrer">Read Full Story</a>
                </Button>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}
