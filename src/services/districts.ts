
'use server';

import type { District } from '@/lib/types';
import districtsData from '@/lib/placeholder-districts.json';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Fetches the list of all districts from Firestore, falling back to local JSON.
 */
export async function getDistricts(): Promise<District[]> {
  try {
    const districtsCollection = collection(db, 'districts');
    const q = query(districtsCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        // If Firestore has no districts, use the local JSON as a fallback.
        console.log("No districts found in Firestore, falling back to local data.");
        return districtsData;
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District));

  } catch (error) {
    console.warn("Could not fetch districts from Firestore, using local data as fallback. Error:", error);
    return districtsData;
  }
}
