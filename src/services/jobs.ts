
'use server';

import { db } from '@/lib/firebase-admin';
import type { Job, JobFormValues } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

// CREATE
export async function createJob(data: JobFormValues): Promise<Job> {
  const jobsCollection = db.collection('jobs');
  const jobData = {
    ...data,
    lastDateToApply: Timestamp.fromDate(new Date(data.lastDateToApply)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await jobsCollection.add(jobData);
  const docSnap = await docRef.get();
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
    const jobsCollection = db.collection('jobs');
    const q = jobsCollection.orderBy('lastDateToApply', 'desc');
    const snapshot = await q.get();
    
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
  const docRef = db.collection('jobs').doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
      const data = docSnap.data()!;
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
  const docRef = db.collection('jobs').doc(id);
  const updateData = {
    ...data,
    lastDateToApply: Timestamp.fromDate(new Date(data.lastDateToApply)),
    updatedAt: Timestamp.now(),
  };

  await docRef.update(updateData);
}


// DELETE
export async function deleteJob(id: string): Promise<void> {
  const docRef = db.collection('jobs').doc(id);
  await docRef.delete();
}
