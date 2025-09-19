
'use client';

import { useState, useEffect } from 'react';
import type { Article } from '@/lib/types';
import { getArticles } from '@/services/articles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video, Sparkles, AlertCircle, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVideoReel } from '@/ai/flows/generate-video-reel-flow';
import { Skeleton } from '@/components/ui/skeleton';

export const maxDuration = 120; // 2 minutes

interface Reel extends Article {
  videoUrl?: string;
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
        setReels(articles.map(a => ({ ...a, videoUrl: undefined })));
      } catch (error) {
        console.error("Failed to fetch articles for reels:", error);
        toast({ title: 'Could not load news content.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchInitialArticles();
  }, [toast]);

  const handleGenerateVideo = async (reelId: string) => {
    const reelIndex = reels.findIndex(r => r.id === reelId);
    if (reelIndex === -1) return;

    const reel = reels[reelIndex];

    setReels(prev => prev.map(r => r.id === reelId ? { ...r, isGenerating: true, error: undefined } : r));
    toast({
        title: 'Video Generation Started',
        description: 'Your news reel is being created. This may take up to a minute.',
    });

    try {
      const result = await generateVideoReel({
        title: reel.title,
        summary: reel.seo.metaDescription || reel.content.substring(0, 200)
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setReels(prev => prev.map(r => r.id === reelId ? { ...r, isGenerating: false, videoUrl: result.videoDataUri } : r));

    } catch (error: any) {
      console.error("Video generation failed:", error);
      const errorMessage = error.message || 'An unknown error occurred during video generation.';
      setReels(prev => prev.map(r => r.id === reelId ? { ...r, isGenerating: false, error: errorMessage } : r));
      toast({
        title: 'Video Generation Failed',
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
        <p className="text-muted-foreground text-lg">AI-generated videos for the latest news.</p>
      </header>

      <div className="flex flex-col items-center space-y-12">
        {reels.map((reel) => (
          <Card key={reel.id} className="w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="relative aspect-[9/16] bg-black">
              {reel.videoUrl ? (
                <video
                  src={reel.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-muted">
                  {reel.isGenerating ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="mt-4 text-muted-foreground">Generating your video... This may take up to a minute.</p>
                    </>
                  ) : reel.error ? (
                    <div className="text-destructive">
                      <AlertCircle className="h-12 w-12 mx-auto" />
                      <p className="mt-4 font-semibold">Generation Failed</p>
                      <p className="text-xs mt-2">{reel.error}</p>
                      <Button onClick={() => handleGenerateVideo(reel.id)} size="sm" className="mt-4">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <PlayCircle className="h-16 w-16 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">Generate a News Reel</h3>
                      <p className="text-muted-foreground text-sm">Click the button below to create an AI-powered video for this story.</p>
                      <Button onClick={() => handleGenerateVideo(reel.id)} className="mt-6">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Video
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
