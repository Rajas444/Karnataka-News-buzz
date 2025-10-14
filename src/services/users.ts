
'use server';

import { db } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

// READ (all)
export async function getUsers(): Promise<UserProfile[]> {
    if (!db) {
        console.error("Firestore is not initialized, returning empty users array.");
        return [];
    }
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('displayName'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

// UPDATE user profile
export async function updateUserProfile(uid: string, data: { displayName: string, phoneNumber: string, newImageDataUri?: string | null }): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
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
    
    await updateDoc(userDocRef, updateData);
}
