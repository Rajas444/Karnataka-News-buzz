
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateUserReport } from '@/ai/flows/generate-user-report-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsLoading(true);
    toast({
      title: 'Generating Report...',
      description: 'Fetching live user data. This might take a moment.',
    });

    try {
      const result = await generateUserReport();
      
      const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-t-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'user_last_login_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Live Report Generated',
        description: `Successfully generated a report for ${result.userCount} users.`,
      });
    } catch (error: any) {
      console.error('Report generation failed:', error);
      toast({
        title: 'Report Generation Failed',
        description: error.message || 'An unknown error occurred. Ensure service account is correctly set.',
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

       <Alert variant="destructive">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Live Data Enabled</AlertTitle>
        <AlertDescription>
          The Firebase Admin SDK is configured. This report will now generate a CSV file with live data from your Firebase Authentication users.
        </AlertDescription>
      </Alert>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>User Login Report</CardTitle>
          <CardDescription>
            Download a CSV file containing the last login time for each user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Generating...' : 'Download Live User Report (CSV)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
