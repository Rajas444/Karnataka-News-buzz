
'use server';

import * as admin from 'firebase-admin';

// The path to the service account key file
const serviceAccountPath = './serviceAccountKey.json';

try {
  // Check if the app is already initialized
  if (!admin.apps.length) {
    // If not, initialize it with service account credentials
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
  }
} catch (error: any) {
  // Log a more descriptive error if initialization fails
  if (error.code === 'ENOENT') {
    console.error('Firebase Admin initialization failed: Could not find the serviceAccountKey.json file. Please ensure it is in the root directory of your project.');
  } else {
    console.error('Firebase Admin initialization error:', error.message);
  }
  // We don't re-throw here to avoid crashing the server on startup,
  // but subsequent db calls will fail.
}

// Export the initialized Firestore database instance and auth instance
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
export default admin;
