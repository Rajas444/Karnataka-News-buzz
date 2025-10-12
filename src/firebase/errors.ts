
'use client';

export type SecurityRuleOperation = 'get' | 'list' | 'create' | 'update' | 'delete';

export type SecurityRuleContext = {
  path: string;
  operation: SecurityRuleOperation;
  requestResourceData?: any;
};

/**
 * A custom error class to capture detailed context about a Firestore permission error.
 * This error is intended for development-time debugging and should not be shown directly to end-users.
 */
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(context, null, 2)}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to ensure the stack trace is captured correctly in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
