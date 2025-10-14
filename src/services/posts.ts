
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { Post, PostFormValues } from '@/lib/types';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function createPost(data: PostFormValues, author: { uid: string, displayName: string | null, photoURL: string | null }): Promise<Post> {
  const postsCollection = collection(db, 'posts');
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
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(postsCollection, newPost);
  const createdData = { ...newPost, id: docRef.id };

  return { 
    ...createdData,
    createdAt: createdData.createdAt.toDate(),
   } as Post;
}

export async function getPosts(): Promise<Post[]> {
    const postsCollection = collection(db, 'posts');
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
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'), limit(count));
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
