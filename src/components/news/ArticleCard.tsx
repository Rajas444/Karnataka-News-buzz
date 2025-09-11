
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NewsdataArticle } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Globe } from 'lucide-react';

interface ArticleCardProps {
  article: NewsdataArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={article.link} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative h-48 w-full">
            <Image
              src={article.image_url || 'https://picsum.photos/seed/' + article.article_id + '/400/250'}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        {article.category?.length > 0 && 
            <div className="flex flex-wrap gap-2 mb-2">
                {article.category.map(cat => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
            </div>
        }
        <CardTitle className="mb-2 text-xl leading-tight font-headline font-kannada">
          <Link href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {article.title}
          </Link>
        </CardTitle>
        <p className="text-muted-foreground text-sm font-kannada">
          {article.description?.substring(0, 100) ?? 'No description available.'}...
        </p>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 text-xs text-muted-foreground flex justify-between">
        <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>{article.source_id}</span>
        </div>
        <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
