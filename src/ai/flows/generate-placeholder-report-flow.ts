
'use server';
/**
 * @fileOverview A placeholder Genkit flow for generating a CSV report of user last login times.
 *
 * This flow does NOT require Firebase Admin credentials and returns static sample data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateUserReportOutputSchema = z.object({
  csvData: z.string().describe('The user report data in CSV format.'),
  userCount: z.number().describe('The total number of users included in the report.'),
});
export type GenerateUserReportOutput = z.infer<typeof GenerateUserReportOutputSchema>;


export async function generatePlaceholderReport(): Promise<GenerateUserReportOutput> {
  return generatePlaceholderReportFlow();
}

const generatePlaceholderReportFlow = ai.defineFlow(
  {
    name: 'generatePlaceholderReportFlow',
    outputSchema: GenerateUserReportOutputSchema,
  },
  async () => {
    // This is sample data to return when live credentials are not available.
    const sampleData = [
        { UserID: 'user1_placeholder', LastLoginTime: new Date('2024-01-15T10:00:00Z').toISOString() },
        { UserID: 'user2_placeholder', LastLoginTime: new Date('2024-01-20T12:30:00Z').toISOString() },
        { UserID: 'user3_placeholder', LastLoginTime: new Date('2024-01-22T08:45:00Z').toISOString() },
    ];
    
    if (sampleData.length === 0) {
        return { csvData: 'UserID,LastLoginTime\n', userCount: 0 };
    }
    
    // Convert to CSV format
    const csvHeader = Object.keys(sampleData[0]).join(',');
    const csvRows = sampleData.map(row => Object.values(row).join(','));
    const csvData = [csvHeader, ...csvRows].join('\n');

    return {
        csvData,
        userCount: sampleData.length,
    };
  }
);
