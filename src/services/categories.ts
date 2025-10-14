
'use server';

import { db } from '@/lib/firebase-admin';
import type { Category } from '@/lib/types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { placeholderCategories } from '@/lib/placeholder-data';


// CREATE
export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const categoriesCollection = collection(db, 'categories');
  const docRef = await addDoc(categoriesCollection, data);
  return { id: docRef.id, ...data };
}

// READ (all)
export async function getCategories(): Promise<Category[]> {
  if (!db) {
      console.warn("Firestore is not initialized. Returning placeholder categories.");
      return placeholderCategories.sort((a, b) => a.name.localeCompare(b.name));
  }
  const categoriesCollection = collection(db, 'categories');
  const q = query(categoriesCollection, orderBy('name', 'asc'));
  
  try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
          // If the collection exists but is empty, still return placeholders for a better initial experience.
          return placeholderCategories.sort((a, b) => a.name.localeCompare(b.name));
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
      console.error("Failed to fetch categories from Firestore, returning placeholders. Error:", error);
      // Fallback to placeholder data if any error occurs (e.g., permissions, not found)
      return placeholderCategories.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// UPDATE
export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, data);
}

// DELETE
export async function deleteCategory(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
}
