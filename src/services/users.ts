
'use server';

import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

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

        // If there's an old public_id, delete it from Cloudinary
        if (currentUserData.imagePath) {
            await deleteFromCloudinary(currentUserData.imagePath);
        }

        // Convert file to data URI to upload
        const reader = new FileReader();
        const fileAsDataUri = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(data.newImage!);
        });

        // Upload the new image to Cloudinary
        const { secure_url, public_id } = await uploadToCloudinary(fileAsDataUri, 'profile-pictures');
        
        updateData.photoURL = secure_url;
        updateData.imagePath = public_id; // Store the public_id for future deletions
    }
    
    await updateDoc(userDocRef, updateData);
}

// This is a helper function to be used on the client-side for updateUserProfile
// because File objects can't be passed from client to server components directly.
export const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
};
