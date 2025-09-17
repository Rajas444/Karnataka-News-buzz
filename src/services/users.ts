
'use server';

import { db, storage } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const usersCollection = collection(db, 'users');

// READ (all)
export async function getUsers(): Promise<UserProfile[]> {
    const q = query(usersCollection, orderBy('displayName'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

// UPDATE user profile
export async function updateUserProfile(uid: string, data: { displayName: string, phoneNumber: string, newImage?: File | null }): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const updateData: Partial<UserProfile> = {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
    };

    if (data.newImage) {
        // Get current user data to see if an old image exists
        const userDoc = await getDoc(userDocRef);
        const currentUserData = userDoc.data() as UserProfile;

        // If there's an old photoURL, construct the ref and try to delete it.
        if (currentUserData.photoURL) {
            try {
                // Firebase Storage URLs have a specific format. We extract the path from it.
                const oldImageRef = ref(storage, currentUserData.photoURL);
                await deleteObject(oldImageRef);
            } catch (error: any) {
                // It's okay if deletion fails (e.g., file doesn't exist); we can still upload the new one.
                if (error.code !== 'storage/object-not-found') {
                    console.warn("Could not delete old profile picture:", error);
                }
            }
        }

        // Upload the new image
        const filePath = `profile-pictures/${uid}/${data.newImage.name}`;
        const newImageRef = ref(storage, filePath);
        await uploadBytes(newImageRef, data.newImage);
        
        // Get the new URL and add it to the update data
        updateData.photoURL = await getDownloadURL(newImageRef);
    }
    
    await updateDoc(userDocRef, updateData);
}
