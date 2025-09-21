
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Function to check if all required Firebase config values are present
function isFirebaseConfigValid(config: typeof firebaseConfig): boolean {
  return !!(config.apiKey && config.projectId && config.appId);
}

let app, auth, db, storage;

if (isFirebaseConfigValid(firebaseConfig)) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.error("Firebase configuration is missing or invalid. Please check your .env file.");
  // Throwing an error here would prevent the app from even building,
  // so we'll allow the services to be null and they will fail at runtime,
  // which is how Firestore services behave when uninitialized.
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage };
