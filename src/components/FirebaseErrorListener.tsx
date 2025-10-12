
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

/**
 * This component listens for custom Firestore permission errors and throws them.
 * In a Next.js development environment, this will display the rich error
 * information in the dev overlay, aiding in debugging security rules.
 * It does nothing in production.
 */
export default function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In development, this will be caught by the Next.js error overlay.
      // In production, it will be caught by the nearest Error Boundary.
      throw error;
    };

    if (process.env.NODE_ENV === 'development') {
      errorEmitter.on('permission-error', handleError);
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        errorEmitter.removeListener('permission-error', handleError);
      }
    };
  }, []);

  return null;
}
