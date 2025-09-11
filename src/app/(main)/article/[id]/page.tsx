
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getArticle } from '@/services/articles';
import type { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, Languages, Undo2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { translateArticle } from '@/ai/flows/translate-article';

export default function ArticlePage() {
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{ title: string; content: string } | null>(null);

  const articleId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  useEffect(() => {
    if (!articleId) return;

    async function fetchArticle() {
      try {
        setLoading(true);
        const fetchedArticle = await getArticle(articleId);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          toast({ title: 'Article not found', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({ title: 'Error fetching article', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [articleId, toast]);

  const handleTranslate = async () => {
    if (!article) return;

    setIsTranslating(true);
    try {
      const result = await translateArticle({
        title: article.title,
        content: article.content,
        targetLanguage: 'English',
      });
      setTranslatedContent(result);
    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        title: 'Translation Failed',
        description: 'Could not translate the article at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };
  
  const handleRevert = () => {
    setTranslatedContent(null);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground">
          The article you are looking for does not exist or could not be loaded.
        </p>
      </div>
    );
  }

  const displayTitle = translatedContent ? translatedContent.title : article.title;
  const displayContent = translatedContent ? translatedContent.content : article.content;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter font-headline font-kannada">
                {displayTitle}
            </h1>
            {translatedContent ? (
                 <Button variant="outline" onClick={handleRevert}>
                    <Undo2 className="mr-2 h-4 w-4" /> Revert
                </Button>
            ) : (
                <Button onClick={handleTranslate} disabled={isTranslating}>
                {isTranslating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Languages className="mr-2 h-4 w-4" />
                )}
                {isTranslating ? 'Translating...' : 'Translate to English'}
                </Button>
            )}
          </div>
         
          <p className="text-muted-foreground">
            By {article.author} &bull; Published on {new Date(article.publishedAt).toLocaleDateString()}
          </p>
        </header>

        {article.imageUrl && (
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              data-ai-hint={article['data-ai-hint']}
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="prose prose-lg max-w-none font-kannada" dangerouslySetInnerHTML={{ __html: displayContent.replace(/\n/g, '<br />') }} />
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
