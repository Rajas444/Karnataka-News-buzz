
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
    try {
      const result = await collectNewsForDate({ date: date.toISOString() });
      toast({
        title: 'News Collection Complete',
        description: `Successfully collected and stored ${result.articlesStored} new articles for ${format(date, 'PPP')}.`,
      });
    } catch (error) {
      console.error('Failed to collect news:', error);
      toast({
        title: 'News Collection Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
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
          Fetch news articles from a specific date and store them in your database.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
          <CardDescription>
            Choose a date to fetch news from. The collector will scan for articles and save new ones to your database.
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
          <Button onClick={handleCollectNews} disabled={isLoading || !date} className="w-full" size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <DownloadCloud className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Collecting News...' : `Collect News for ${date ? format(date, 'PPP') : ''}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
