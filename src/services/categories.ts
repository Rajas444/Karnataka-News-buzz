
'use server';

import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { placeholderCategories } from '@/lib/placeholder-data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const categoriesCollection = collection(db, 'categories');

// CREATE
export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const docRef = await addDoc(categoriesCollection, data).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: categoriesCollection.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
  return { id: docRef.id, ...data };
}

// READ (all)
export async function getCategories(): Promise<Category[]> {
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    
    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return placeholderCategories.sort((a, b) => a.name.localeCompare(b.name));
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: categoriesCollection.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

// UPDATE
export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
  const docRef = doc(db, 'categories', id);
  updateDoc(docRef, data).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}

// DELETE
export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, 'categories', id);
  deleteDoc(docRef).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}
