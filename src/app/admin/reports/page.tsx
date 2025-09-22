
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateUserReport } from '@/ai/flows/generate-user-report-flow';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsLoading(true);
    toast({
      title: 'Generating Report...',
      description: 'Fetching user data. This might take a moment.',
    });

    try {
      const result = await generateUserReport();
      
      // Create a Blob from the CSV string
      const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'user_last_login_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Report Generated',
        description: `Successfully generated a report for ${result.userCount} users.`,
      });
    } catch (error: any) {
      console.error('Report generation failed:', error);
      toast({
        title: 'Report Generation Failed',
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
        <h1 className="text-3xl font-bold tracking-tight font-headline">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download reports for your news portal.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>User Login Report</CardTitle>
          <CardDescription>
            Download a CSV file containing the last login time for each user.
            This report fetches data directly from Firebase Authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Generating...' : 'Download User Report (CSV)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
