
'use server';

import { FirestorePermissionError, type SecurityRuleContext, type SecurityRuleOperation } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirebaseError } from "firebase/app";

/**
 * Wraps a Firestore operation to catch permission errors and emit a detailed custom event.
 * This provides more context for debugging Firestore security rules in development.
 * @param context - The context of the security rule being tested.
 * @param operation - The async function performing the Firestore operation.
 * @returns The result of the operation.
 * @throws {FirestorePermissionError} if a permission error occurs in development.
 */
export async function withFirestoreErrorHandling<T>(
    context: Omit<SecurityRuleContext, 'operation'>,
    operation: (op: SecurityRuleOperation) => Promise<{result: T, op: SecurityRuleOperation}>
): Promise<T> {
    let op: SecurityRuleOperation = 'get'; // Default operation
    try {
        const { result, op: determinedOp } = await operation(op);
        op = determinedOp; // Update operation based on what was performed
        return result;
    } catch (error: any) {
        if (error instanceof FirebaseError && (error.code === 'permission-denied' || error.code === 'unavailable')) {
            const permissionError = new FirestorePermissionError({ ...context, operation: op });
            
            // In a server component environment, we might not have a long-lived process to listen to events.
            // For Next.js dev server, this can still be useful.
            if (process.env.NODE_ENV === 'development') {
                errorEmitter.emit('permission-error', permissionError);
            }
            
            // We still throw the original error to ensure the calling code can handle it.
            // The emitted event is for enhanced developer logging via FirebaseErrorListener.
            // Re-throwing the original error to not break existing catch blocks.
            throw new Error(`Firestore permission denied for operation '${op}' on path '${context.path}'. Check your security rules and indexes.`);

        }
        // Re-throw other errors
        throw error;
    }
}
