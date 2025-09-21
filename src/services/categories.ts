
'use server';

import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { placeholderCategories } from '@/lib/placeholder-data';

const categoriesCollection = collection(db, 'categories');

// CREATE
export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const docRef = await addDoc(categoriesCollection, data);
  return { id: docRef.id, ...data };
}

// READ (all)
export async function getCategories(): Promise<Category[]> {
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        console.log('No categories found in Firestore, using and sorting placeholder data.');
        return placeholderCategories.sort((a, b) => a.name.localeCompare(b.name));
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

// UPDATE
export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, data);
}

// DELETE
export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
}
