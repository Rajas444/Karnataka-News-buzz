
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
        title: 'Feature Not Active',
        description: 'The news collection feature is currently disabled.',
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">News Collector</h1>
        <p className="text-muted-foreground">
          This feature for collecting news articles is currently disabled.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
          <CardDescription>
            Choose a date to fetch news from.
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
          <Button onClick={handleCollectNews} disabled={true} className="w-full" size="lg">
            <DownloadCloud className="mr-2 h-5 w-5" />
            Collect News
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
