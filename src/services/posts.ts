
'use server';

import { db, storage } from '@/lib/firebase';
import type { Post, PostFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth } from '@/lib/firebase';

const postsCollection = collection(db, 'posts');

// CREATE
export async function createPost(data: PostFormValues, author: { uid: string, displayName: string | null, photoURL: string | null }): Promise<Post> {
  let imageUrl = data.imageUrl || null;
  let imagePath = '';

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    const storageRef = ref(storage, `posts/${Date.now()}_${author.uid}`);
    const snapshot = await uploadString(storageRef, data.imageUrl, 'data_url');
    imageUrl = await getDownloadURL(snapshot.ref);
    imagePath = snapshot.ref.fullPath;
  }

  const newPost = {
    ...data,
    imageUrl,
    imagePath,
    authorId: author.uid,
    authorName: author.displayName || 'Anonymous',
    authorPhotoURL: author.photoURL || '',
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(postsCollection, newPost);

  const docSnap = await getDoc(docRef);
  const createdData = docSnap.data();


  return { 
    id: docRef.id, 
    ...createdData,
    createdAt: createdData?.createdAt.toDate(),
   } as Post;
}

// READ (all)
export async function getPosts(): Promise<Post[]> {
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
        } as Post;
    });
}
