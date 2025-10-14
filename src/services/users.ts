
'use server';

import { db } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

// READ (all)
export async function getUsers(): Promise<UserProfile[]> {
    const usersCollection = db.collection('users');
    const q = usersCollection.orderBy('displayName');
    const snapshot = await q.get();
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

// UPDATE user profile
export async function updateUserProfile(uid: string, data: { displayName: string, phoneNumber: string, newImageDataUri?: string | null }): Promise<void> {
    const userDocRef = db.collection('users').doc(uid);
    const updateData: Partial<UserProfile> = {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
    };

    if (data.newImageDataUri) {
        const userDoc = await userDocRef.get();
        const currentUserData = userDoc.data() as UserProfile;

        if (currentUserData.imagePath) {
            await deleteFromCloudinary(currentUserData.imagePath);
        }

        const { secure_url, public_id } = await uploadToCloudinary(data.newImageDataUri, 'profile-pictures');
        
        updateData.photoURL = secure_url;
        updateData.imagePath = public_id; 
    }
    
    await userDocRef.update(updateData);
}
