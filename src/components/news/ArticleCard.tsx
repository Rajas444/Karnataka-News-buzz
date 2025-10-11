
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article, Category } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, ArrowRight, MapPin } from 'lucide-react';
import { useArticleModal } from '@/components/providers/article-modal-provider';

interface ArticleCardProps {
  article: Article;
  allCategories?: Category[];
}

export default function ArticleCard({ article, allCategories = [] }: ArticleCardProps) {
  const { onOpen } = useArticleModal();
  
  const categories = article.categoryIds?.map(catId => {
      return allCategories.find(c => c.id === catId)?.name || catId;
  }).filter(name => name !== 'General' && name !== 'Gaming & Esports') || [];

  const handleCardClick = (e: React.MouseEvent) => {
    if (article.id) {
       e.preventDefault();
       onOpen(article.id);
    } else if (article.sourceUrl) {
       // For articles from external sources without an ID, open in a new tab.
       window.open(article.sourceUrl, '_blank');
    }
  };

  const getPublishedDate = () => {
    if (!article.publishedAt) return 'Just now';
    
    // Handle both ISO string from server and Firebase Timestamp from client-side updates
    const date = typeof article.publishedAt === 'string' 
        ? new Date(article.publishedAt)
        : (article.publishedAt as any).toDate();
        
    return formatDistanceToNow(date, { addSuffix: true });
  }

  const articleContent = (
     <Card 
      className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            <Image
              src={article.imageUrl || `https://picsum.photos/seed/${article.id || 'placeholder'}/400/250`}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              data-ai-hint={article['data-ai-hint']}
            />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        {categories.length > 0 && 
            <div className="flex flex-wrap gap-2 mb-2">
               {categories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
            </div>
        }
        <CardTitle className="mb-2 text-xl leading-tight font-headline font-kannada">
            {article.title}
        </CardTitle>
        <p className="text-muted-foreground text-sm font-kannada">
           {(article.seo?.metaDescription || article.content || '').substring(0, 100)}...
        </p>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 text-xs text-muted-foreground flex justify-between items-center flex-wrap gap-y-2">
         <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{getPublishedDate()}</span>
            </div>
            {article.district && (
                 <div className="flex items-center gap-1 font-kannada">
                    <MapPin className="h-3 w-3" />
                    <span>{article.district}</span>
                </div>
            )}
        </div>
        <div className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 font-kannada">
          ಮುಂದೆ ಓದಿ <ArrowRight className="h-3 w-3" />
        </div>
      </CardFooter>
    </Card>
  );

  if (article.id) {
    return (
        <div onClick={handleCardClick} className="h-full">
            {articleContent}
        </div>
    );
  }

  return (
     <div onClick={handleCardClick} className="h-full">
        <Card 
        className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
        <CardHeader className="p-0">
            <div className="relative h-48 w-full">
                <Image
                src={article.imageUrl || `https://picsum.photos/seed/${article.sourceUrl || 'placeholder'}/400/250`}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
            </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
            {categories.length > 0 && 
                <div className="flex flex-wrap gap-2 mb-2">
                {categories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                </div>
            }
            <CardTitle className="mb-2 text-xl leading-tight font-headline font-kannada">
                {article.title}
            </CardTitle>
        </CardContent>
        <CardFooter className="p-4 bg-muted/50 text-xs text-muted-foreground flex justify-between items-center flex-wrap gap-y-2">
            <div className="flex items-center gap-2">
                {article.district && (
                    <div className="flex items-center gap-1 font-kannada">
                        <MapPin className="h-3 w-3" />
                        <span>{article.district}</span>
                    </div>
                )}
                 {article.source && (
                    <div className="flex items-center gap-1">
                        <span>{article.source}</span>
                    </div>
                )}
            </div>
            <div className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 font-kannada">
            ಮುಂದೆ ಓದಿ <ArrowRight className="h-3 w-3" />
            </div>
        </CardFooter>
        </Card>
    </div>
  );
}
