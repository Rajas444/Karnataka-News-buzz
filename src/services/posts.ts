'use server';

import { db } from '@/lib/firebase';
import type { Post, PostFormValues } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

// CREATE a new post
export async function createPost(
  data: PostFormValues,
  author: { uid: string; displayName: string | null; photoURL: string | null }
): Promise<Post> {
  if (!db) throw new Error("Firestore is not initialized.");

  let imageUrl = data.imageUrl || null;
  let imagePath = '';

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    try {
      const { secure_url, public_id } = await uploadToCloudinary(
        data.imageUrl,
        'community_posts'
      );
      imageUrl = secure_url;
      imagePath = public_id;
    } catch (error) {
      console.error('Failed to upload post image:', error);
      // Proceed without an image if upload fails
      imageUrl = null;
      imagePath = '';
    }
  }

  const newPostData = {
    ...data,
    imageUrl,
    imagePath,
    authorId: author.uid,
    authorName: author.displayName || 'Anonymous',
    authorPhotoURL: author.photoURL || '',
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'posts'), newPostData);
  
  const docSnap = { ...newPostData, id: docRef.id, createdAt: new Date() };

  return docSnap as Post;
}

// READ all posts, ordered by creation date
export async function getPosts(count?: number): Promise<Post[]> {
  if (!db) return [];
  
  const postsCollection = collection(db, 'posts');
  const constraints = [orderBy('createdAt', 'desc')];
  if (count) {
    constraints.push(limit(count));
  }
  
  const q = query(postsCollection, ...constraints);
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
      } as Post;
  });
}

// READ recent posts for highlights
export async function getRecentPosts(count: number): Promise<Post[]> {
    return getPosts(count);
}
