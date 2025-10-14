
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    const app = admin.apps[0]!;
    db = app.firestore();
    auth = app.auth();
    return;
  }

  try {
    const serviceAccount = require('../../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.warn(
        'serviceAccountKey.json not found. Attempting to initialize with default credentials. This is expected in a deployed environment.'
      );
      admin.initializeApp();
    } else {
      console.error('Firebase Admin initialization error:', error.message);
      // In case of a severe error, we still proceed but db and auth will be undefined,
      // which will cause subsequent operations to fail with a clearer message.
      return;
    }
  }

  db = admin.firestore();
  auth = admin.auth();
}

// Call the initialization function at the module level
initializeAdmin();

export { db, auth };
