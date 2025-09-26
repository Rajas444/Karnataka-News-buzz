
'use server';

import { db } from '@/lib/firebase';
import type { Post, PostFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

const postsCollection = collection(db, 'posts');

export async function createPost(data: PostFormValues, author: { uid: string, displayName: string | null, photoURL: string | null }): Promise<Post> {
  let imageUrl = data.imageUrl || null;
  let imagePath = ''; // This will store the Cloudinary public_id

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    const { secure_url, public_id } = await uploadToCloudinary(data.imageUrl, 'posts');
    imageUrl = secure_url;
    imagePath = public_id;
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

export async function getRecentPosts(count: number): Promise<Post[]> {
    const q = query(postsCollection, orderBy('createdAt', 'desc'), firestoreLimit(count));
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
