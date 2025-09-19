
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Article } from '@/lib/types';
import { getArticles } from '@/services/articles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateNewsImage } from '@/ai/flows/generate-news-image-flow';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface Reel extends Article {
  imageUrl?: string;
  isGenerating?: boolean;
  error?: string;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchInitialArticles() {
      try {
        const articles = await getArticles({ pageSize: 5 });
        setReels(articles.map(a => ({...a, imageUrl: a.imageUrl || undefined })));
      } catch (error) {
        console.error("Failed to fetch articles for reels:", error);
        toast({ title: 'Could not load news content.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchInitialArticles();
  }, [toast]);

  const handleGenerateImage = async (reelId: string) => {
    const reelIndex = reels.findIndex(r => r.id === reelId);
    if (reelIndex === -1) return;

    const reel = reels[reelIndex];

    setReels(prev => prev.map(r => r.id === reelId ? { ...r, isGenerating: true, error: undefined } : r));

    try {
      const result = await generateNewsImage({ 
        title: reel.title,
        summary: reel.seo.metaDescription || reel.content.substring(0, 200)
      });
      
      if (result.error) {
        throw new Error(result.error);
      }

      setReels(prev => prev.map(r => r.id === reelId ? { ...r, isGenerating: false, imageUrl: result.imageDataUri } : r));

    } catch (error: any) {
      console.error("Image generation failed:", error);
      const errorMessage = error.message || 'An unknown error occurred during image generation.';
      setReels(prev => prev.map(r => r.id === reelId ? { ...r, isGenerating: false, error: errorMessage } : r));
      toast({
        title: 'Image Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-sm space-y-8">
            <Skeleton className="h-[70vh] w-full" />
            <Skeleton className="h-[70vh] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3">
          <Video /> News Reels
        </h1>
        <p className="text-muted-foreground text-lg">AI-generated visuals for the latest news.</p>
      </header>

      <div className="flex flex-col items-center space-y-12">
        {reels.map((reel) => (
          <Card key={reel.id} className="w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="relative aspect-[9/16] bg-black">
              {reel.imageUrl ? (
                <Image
                  src={reel.imageUrl}
                  alt={reel.title}
                  fill
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-muted">
                  {reel.isGenerating ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="mt-4 text-muted-foreground">Generating your image... This may take a moment.</p>
                    </>
                  ) : reel.error ? (
                    <div className="text-destructive">
                        <AlertCircle className="h-12 w-12 mx-auto" />
                        <p className="mt-4 font-semibold">Generation Failed</p>
                        <p className="text-xs mt-2">{reel.error}</p>
                         <Button onClick={() => handleGenerateImage(reel.id)} size="sm" className="mt-4">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">Generate a News Image</h3>
                      <p className="text-muted-foreground text-sm">Click the button below to create an AI-powered image for this story.</p>
                      <Button onClick={() => handleGenerateImage(reel.id)} className="mt-6">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Image
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <CardTitle className="font-headline text-lg leading-tight font-kannada">{reel.title}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
