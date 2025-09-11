
'use server';

import { db } from '@/lib/firebase';
import type { District } from '@/lib/types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { placeholderDistricts } from '@/lib/placeholder-data';

const districtsCollection = collection(db, 'districts');

// CREATE
export async function createDistrict(data: Omit<District, 'id'>): Promise<District> {
  const docRef = await addDoc(districtsCollection, data);
  return { id: docRef.id, ...data };
}

// READ (all)
export async function getDistricts(): Promise<District[]> {
    const q = query(districtsCollection, orderBy('name'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log('No districts found in Firestore, using placeholder data.');
        // Ensure placeholder data is also sorted alphabetically as a safeguard.
        return [...placeholderDistricts].sort((a, b) => a.name.localeCompare(b.name));
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District));
}

// UPDATE
export async function updateDistrict(id: string, data: Partial<Omit<District, 'id'>>): Promise<void> {
  const docRef = doc(db, 'districts', id);
  await updateDoc(docRef, data);
}

// DELETE
export async function deleteDistrict(id: string): Promise<void> {
  const docRef = doc(db, 'districts', id);
  await deleteDoc(docRef);
}
