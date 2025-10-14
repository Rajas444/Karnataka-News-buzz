
'use server';

import { db } from '@/lib/firebase-admin';
import type { Job, JobFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';


// CREATE
export async function createJob(data: JobFormValues): Promise<Job> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const jobsCollection = collection(db, 'jobs');
  const jobData = {
    ...data,
    lastDateToApply: Timestamp.fromDate(new Date(data.lastDateToApply)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(jobsCollection, jobData);
  
  const docSnap = await getDoc(docRef);
  const newJobData = docSnap.data();

  return { 
      id: docRef.id, 
      ...newJobData,
      lastDateToApply: (newJobData?.lastDateToApply as Timestamp).toDate(),
      createdAt: (newJobData?.createdAt as Timestamp).toDate(),
      updatedAt: (newJobData?.updatedAt as Timestamp).toDate(),
    } as Job;
}

// READ (all)
export async function getJobs(): Promise<Job[]> {
    if (!db) {
      console.error("Firestore is not initialized, returning empty jobs array.");
      return [];
    }
    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, orderBy('lastDateToApply', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            lastDateToApply: (data.lastDateToApply as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as Job;
    });
}

// READ (one)
export async function getJob(id: string): Promise<Job | null> {
  if (!db) {
    console.error("Firestore is not initialized, cannot get job.");
    return null;
  }
  const docRef = doc(db, 'jobs', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
      const data = docSnap.data();
      return {
          id: docSnap.id,
          ...data,
          lastDateToApply: (data.lastDateToApply as Timestamp).toDate(),
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as Job;
  } else {
      return null;
  }
}

// UPDATE
export async function updateJob(id: string, data: JobFormValues): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, 'jobs', id);
  const updateData = {
    ...data,
    lastDateToApply: Timestamp.fromDate(new Date(data.lastDateToApply)),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updateData);
}


// DELETE
export async function deleteJob(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, 'jobs', id);
  await deleteDoc(docRef);
}
