
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, FieldPath, QueryConstraint } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

const articlesCollection = collection(db, 'articles');

// NOTE: If you are seeing "Firebase storage/unknown" errors when uploading images,
// it is likely due to missing CORS configuration on your Firebase Storage bucket.
// Please see the instructions in `storage.cors.json` at the root of the project
// or run the following gcloud command:
// gcloud storage buckets update gs://<your-storage-bucket-url> --cors-file=storage.cors.json

// CREATE
export async function createArticle(data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  let imageUrl = data.imageUrl || null;
  let imagePath = '';

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    const storageRef = ref(storage, `articles/${Date.now()}_${Math.random().toString(36).substring(2)}`);
    const snapshot = await uploadString(storageRef, data.imageUrl, 'data_url');
    imageUrl = await getDownloadURL(snapshot.ref);
    imagePath = snapshot.ref.fullPath;
  }

  const { categoryId, ...restOfData } = data;

  const docRef = await addDoc(articlesCollection, {
    ...restOfData,
    imageUrl,
    imagePath,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    author: 'Admin User', // Replace with actual user data
    authorId: 'admin1',
    seo: {
      keywords: data.seoKeywords?.split(',').map(k => k.trim()) || [],
      metaDescription: data.seoMetaDescription || '',
    }
  });

  return { id: docRef.id, ...data, imageUrl, publishedAt: new Date() } as Article;
}

// READ (all)
export async function getArticles(options?: { categoryId?: string; language?: string }): Promise<Article[]> {
    
    const constraints: QueryConstraint[] = [];

    // Don't apply sorting if filtering by category or language to avoid needing composite indexes by default
    const shouldSort = !options?.categoryId && !options?.language;

    if (shouldSort) {
      constraints.push(orderBy('publishedAt', 'desc'));
    }

    if (options?.language) {
        constraints.push(where('language', '==', options.language));
    }
    
    if (options?.categoryId) {
        constraints.push(where('categoryIds', 'array-contains', options.categoryId));
    }

    const q = query(articlesCollection, ...constraints);

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            publishedAt: data.publishedAt?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as Article;
    });
}

// READ (one)
export async function getArticle(id: string): Promise<Article | null> {
  const docRef = doc(db, 'articles', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as Article;
  } else {
    return null;
  }
}

// UPDATE
export async function updateArticle(id: string, data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  const docRef = doc(db, 'articles', id);
  let imageUrl = data.imageUrl || null;
  let imagePath = data.imagePath || '';

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    if (imagePath) {
      // Delete old image
      const oldImageRef = ref(storage, imagePath);
      await deleteObject(oldImageRef).catch(e => console.warn("Old image not found, could not delete:", e.message));
    }
    const storageRef = ref(storage, `articles/${Date.now()}_${Math.random().toString(36).substring(2)}`);
    const snapshot = await uploadString(storageRef, data.imageUrl, 'data_url');
    imageUrl = await getDownloadURL(snapshot.ref);
    imagePath = snapshot.ref.fullPath;
  }

  const { categoryId, ...restOfData } = data;
  
  await updateDoc(docRef, {
    ...restOfData,
    imageUrl,
    imagePath,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
     seo: {
      keywords: data.seoKeywords?.split(',').map(k => k.trim()) || [],
      metaDescription: data.seoMetaDescription || '',
    }
  });

  return { id, ...data, imageUrl } as Article;
}


// DELETE
export async function deleteArticle(id: string): Promise<void> {
    const docRef = doc(db, 'articles', id);
    const article = await getArticle(id);
    if (article?.imagePath) {
        const imageRef = ref(storage, article.imagePath);
        await deleteObject(imageRef).catch(e => console.error("Error deleting image:", e));
    }
    await deleteDoc(docRef);
}
