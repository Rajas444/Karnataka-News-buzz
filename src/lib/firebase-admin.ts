
import * as admin from 'firebase-admin';

let app: admin.app.App;

function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    try {
        // When deployed to a Google Cloud environment, the SDK can auto-discover credentials
        // and project ID. For local development, `serviceAccountKey.json` is needed.
        const serviceAccount = require('../../serviceAccountKey.json');
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        return app;
    } catch (error: any) {
         if (error.code === 'MODULE_NOT_FOUND') {
            console.warn('serviceAccountKey.json not found. Falling back to default credentials. This is expected in a deployed environment.');
            app = admin.initializeApp();
            return app;
        }
        console.error('Firebase Admin initialization error:', error.message);
        throw error;
    }
}


const db = getAdminApp().firestore();
const auth = getAdminApp().auth();

export { db, auth };
