
'use server';

import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const usersCollection = collection(db, 'users');

// READ (all)
export async function getUsers(): Promise<UserProfile[]> {
    const q = query(usersCollection, orderBy('displayName'));
    const snapshot = await getDocs(q).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: usersCollection.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });
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
        // Get current user data to see if an old image exists
        const userDoc = await getDoc(userDocRef);
        const currentUserData = userDoc.data() as UserProfile;

        // If there's an old public_id, delete it from Cloudinary
        if (currentUserData.imagePath) {
            await deleteFromCloudinary(currentUserData.imagePath);
        }

        // Upload the new image to Cloudinary
        const { secure_url, public_id } = await uploadToCloudinary(data.newImageDataUri, 'profile-pictures');
        
        updateData.photoURL = secure_url;
        updateData.imagePath = public_id; // Store the public_id for future deletions
    }
    
    updateDoc(userDocRef, updateData).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });
}
