
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { FirebaseError } from 'firebase/app';


/**
 * Fetches a user profile from the client, with detailed error handling for permission issues.
 * This should be called from client components.
 * @param uid The user's unique ID.
 * @returns The user profile or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    'use client';
    const docRef = doc(db, 'users', uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        if (error instanceof FirebaseError && error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        // Re-throw the error to be caught by the calling function's catch block
        throw error;
    }
}


// READ (all)
export async function getUsers(): Promise<UserProfile[]> {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('displayName'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

// UPDATE user profile
export async function updateUserProfile(uid: string, data: { displayName: string, phoneNumber: string, newImageDataUri?: string | null }): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const updateData: Partial<UserProfile> = {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
    };

    if (data.newImageDataUri) {
        const userDoc = await getDoc(userDocRef);
        const currentUserData = userDoc.data() as UserProfile;

        if (currentUserData.imagePath) {
            await deleteFromCloudinary(currentUserData.imagePath);
        }

        const { secure_url, public_id } = await uploadToCloudinary(data.newImageDataUri, 'profile-pictures');
        
        updateData.photoURL = secure_url;
        updateData.imagePath = public_id; 
    }
    
    // Use .catch() block for non-blocking mutation with error handling
    updateDoc(userDocRef, updateData).catch((serverError) => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            // Handle other potential errors if necessary
            console.error("Failed to update user profile:", serverError);
        }
    });
}
