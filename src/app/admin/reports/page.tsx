
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePlaceholderReport } from '@/ai/flows/generate-placeholder-report-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

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
      // Using the placeholder flow to prevent crashes when credentials are not set.
      const result = await generatePlaceholderReport();
      
      const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'placeholder_user_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Placeholder Report Generated',
        description: `Successfully generated a sample report for ${result.userCount} users.`,
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

       <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Developer Preview</AlertTitle>
        <AlertDescription>
          This report generation is a placeholder. To use live data from Firebase, you must set the 
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">FIREBASE_SERVICE_ACCOUNT</code> 
          environment variable with your project's service account credentials. The placeholder returns sample data.
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
            {isLoading ? 'Generating...' : 'Download User Report (CSV)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
