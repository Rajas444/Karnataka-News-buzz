
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig: FirebaseOptions = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const allConfigKeysPresent = Object.values(firebaseConfig).every(key => !!key);

let app, auth, db, storage;

if (!allConfigKeysPresent) {
    console.error("Firebase configuration is missing or incomplete. Please check your environment variables.");
    app = null;
    auth = null;
    db = null;
    storage = null;
} else {
    try {
      app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (error) {
        console.error("Firebase initialization error:", error);
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
}

export { app, auth, db, storage };
