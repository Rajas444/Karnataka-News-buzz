
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, ArrowRight } from 'lucide-react';
import { useArticleModal } from '@/components/providers/article-modal-provider';
import Link from 'next/link';

interface ArticleCardProps {
  article: Article;
  allCategories?: { id: string, name: string }[];
}

export default function ArticleCard({ article, allCategories = [] }: ArticleCardProps) {
  const { onOpen } = useArticleModal();
  
  const categories = article.categoryIds?.map(catId => {
      return allCategories.find(c => c.id === catId)?.name || catId;
  }) || [];

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent default if it's a link, but we want the modal
    if (article.id) {
       e.preventDefault();
       onOpen(article.id);
    }
  };

  const articleContent = (
     <Card 
      className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            <Image
              src={article.imageUrl || `https://picsum.photos/seed/${article.id || article.sourceUrl}/400/250`}
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
      <CardFooter className="p-4 bg-muted/50 text-xs text-muted-foreground flex justify-between items-center">
         <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : 'Just now'}</span>
        </div>
        <div className="text-primary hover:underline text-xs font-semibold flex items-center gap-1">
          Read More <ArrowRight className="h-3 w-3" />
        </div>
      </CardFooter>
    </Card>
  );

  // If the article is from Firestore (has an ID), wrap it with a click handler for the modal.
  // If it's an external article, wrap it in a link.
  if (article.id) {
    return (
        <div onClick={handleCardClick} className="h-full">
            {articleContent}
        </div>
    );
  }

  return (
    <Link href={article.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="h-full">
        {articleContent}
    </Link>
  )
}

    
