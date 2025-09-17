
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collectNewsForDate } from '@/ai/flows/collect-news-flow';
import { format } from 'date-fns';

export default function NewsCollectorPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCollectNews = async () => {
    if (!date) {
      toast({
        title: 'No date selected',
        description: 'Please select a date to collect news for.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: 'Collecting News...',
      description: `Requesting news for ${format(date, 'PPP')}. This might take a moment.`,
    });

    try {
      // NOTE: The `collectNewsForDate` flow is a placeholder and is not active by default.
      // The primary news collection happens on the homepage automatically.
      // This button is for manual triggering if the flow were implemented.
      const result = await collectNewsForDate({ date: date.toISOString().split('T')[0] });
      if (result.articlesFetched === 0 && result.articlesStored === 0) {
         toast({
            title: 'Feature Not Active',
            description: 'The manual news collection flow is a placeholder. News is fetched automatically on the homepage.',
        });
      } else {
        toast({
            title: 'News Collection Complete',
            description: `Fetched ${result.articlesFetched} articles and stored ${result.articlesStored} new ones.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Collection Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">News Collector</h1>
        <p className="text-muted-foreground">
          Manually trigger news collection for a specific date.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
          <CardDescription>
            Choose a date to fetch news from. Note: News is also fetched automatically on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(day) => day > new Date()}
          />
          <Button onClick={handleCollectNews} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <DownloadCloud className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Collecting...' : 'Collect News'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
