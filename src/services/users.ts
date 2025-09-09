
'use server';

import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const usersCollection = collection(db, 'users');

// READ (all)
export async function getUsers(): Promise<UserProfile[]> {
    const q = query(usersCollection, orderBy('displayName'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}
