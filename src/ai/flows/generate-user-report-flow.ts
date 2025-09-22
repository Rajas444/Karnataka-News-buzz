
'use server';
/**
 * @fileOverview A Genkit flow for generating a CSV report of user last login times.
 *
 * This flow requires Firebase Admin SDK credentials to be configured in the environment.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

const GenerateUserReportOutputSchema = z.object({
  csvData: z.string().describe('The user report data in CSV format.'),
  userCount: z.number().describe('The total number of users included in the report.'),
});
export type GenerateUserReportOutput = z.infer<typeof GenerateUserReportOutputSchema>;

// Initialize Firebase Admin SDK
function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (!serviceAccount) {
    throw new Error('Firebase Admin SDK service account credentials are not configured. Please set FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

// Fetches all users from Firebase Auth recursively
async function listAllUsers(nextPageToken?: string): Promise<UserRecord[]> {
  const adminApp = getFirebaseAdminApp();
  const auth = getAuth(adminApp);
  
  const listUsersResult = await auth.listUsers(1000, nextPageToken);
  const users = listUsersResult.users;
  if (listUsersResult.pageToken) {
    const nextUsers = await listAllUsers(listUsersResult.pageToken);
    users.push(...nextUsers);
  }
  return users;
}

export async function generateUserReport(): Promise<GenerateUserReportOutput> {
  return generateUserReportFlow();
}

const generateUserReportFlow = ai.defineFlow(
  {
    name: 'generateUserReportFlow',
    outputSchema: GenerateUserReportOutputSchema,
  },
  async () => {
    try {
      const allUsers = await listAllUsers();

      // Filter users who have logged in and format the data
      const reportData = allUsers
        .filter(user => user.metadata.lastSignInTime)
        .map(user => ({
          UserID: user.uid,
          LastLoginTime: new Date(user.metadata.lastSignInTime).toISOString(),
        }));
      
      if (reportData.length === 0) {
        return { csvData: 'UserID,LastLoginTime\n', userCount: 0 };
      }

      // Convert to CSV format
      const csvHeader = Object.keys(reportData[0]).join(',');
      const csvRows = reportData.map(row => Object.values(row).join(','));
      const csvData = [csvHeader, ...csvRows].join('\n');

      return {
        csvData,
        userCount: reportData.length,
      };

    } catch (error: any) {
        console.error("Error in generateUserReportFlow:", error);
        // Provide a more specific error message if it's a credentials issue
        if (error.code === 'app/invalid-credential' || error.message.includes('credential')) {
             throw new Error('Failed to generate report: Firebase Admin credentials are not set up correctly.');
        }
        throw new Error(`Failed to generate user report: ${error.message}`);
    }
  }
);
