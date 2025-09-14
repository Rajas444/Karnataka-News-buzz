
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues, NewsdataArticle } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, FieldPath, QueryConstraint, Timestamp, limit, startAfter, getCountFromServer, and } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getCategories } from './categories';

const articlesCollection = collection(db, 'articles');

// NOTE: If you are seeing "Firebase storage/unknown" errors when uploading images,
// it is likely due to missing CORS configuration on your Firebase Storage bucket.
// Please see the instructions in `storage.cors.json` at the root of the project
// or run the following gcloud command:
// gcloud storage buckets update gs://<your-storage-bucket-url> --cors-file=storage.cors.json


// CREATE (from Article Form)
export async function createArticle(data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  let imageUrl = data.imageUrl || null;
  let imagePath = '';

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {

    const watermarkedImageResult = await watermarkImage({
      imageDataUri: data.imageUrl,
      watermarkText: 'Karnataka News Pulse',
    });
    
    const watermarkedImageDataUri = watermarkedImageResult.imageDataUri;

    const storageRef = ref(storage, `articles/${Date.now()}_${Math.random().toString(36).substring(2)}`);
    const snapshot = await uploadString(storageRef, watermarkedImageDataUri, 'data_url');
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

// CREATE (from News Collector)
export async function storeCollectedArticle(articleData: NewsdataArticle, collectedDate: Date, categoryId?: string): Promise<string> {
    const docRef = await addDoc(articlesCollection, {
        title: articleData.title,
        content: articleData.description || 'No content available.',
        imageUrl: articleData.image_url,
        sourceUrl: articleData.link,
        status: 'published',
        publishedAt: new Date(articleData.pubDate),
        collectedDate: Timestamp.fromDate(collectedDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        author: articleData.source_id,
        authorId: articleData.source_id,
        categoryIds: categoryId ? [categoryId] : [],
        views: 0,
        seo: { keywords: [], metaDescription: '' },
    });
    return docRef.id;
}


// READ (all with pagination)
export async function getArticles(options?: { categoryId?: string; date?: Date; lastVisible?: any; pageSize?: number }): Promise<{ articles: Article[], lastVisible: any | null }> {
    
    const constraints: QueryConstraint[] = [];
    const pageSize = options?.pageSize || 10;

    let q = query(articlesCollection, orderBy('publishedAt', 'desc'), limit(pageSize));

    if (options?.date) {
        const startOfDay = new Date(options.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(options.date);
        endOfDay.setHours(23, 59, 59, 999);
        constraints.push(where('collectedDate', '>=', startOfDay));
        constraints.push(where('collectedDate', '<=', endOfDay));
    }
    
    if (options?.categoryId && options.categoryId !== 'general') {
        constraints.push(where('categoryIds', 'array-contains', options.categoryId));
    }

    if (options?.lastVisible) {
        constraints.push(startAfter(options.lastVisible));
    }
    
    q = query(articlesCollection, ...constraints, orderBy('publishedAt', 'desc'), limit(pageSize));

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            publishedAt: data.publishedAt?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            collectedDate: data.collectedDate?.toDate(),
        } as Article;
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { articles, lastVisible };
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
        collectedDate: data.collectedDate?.toDate(),
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
    
    const watermarkedImageResult = await watermarkImage({
      imageDataUri: data.imageUrl,
      watermarkText: 'Karnataka News Pulse',
    });
    const watermarkedImageDataUri = watermarkedImageResult.imageDataUri;
    
    if (imagePath) {
      // Delete old image
      const oldImageRef = ref(storage, imagePath);
      await deleteObject(oldImageRef).catch(e => console.warn("Old image not found, could not delete:", e.message));
    }
    const storageRef = ref(storage, `articles/${Date.now()}_${Math.random().toString(36).substring(2)}`);
    const snapshot = await uploadString(storageRef, watermarkedImageDataUri, 'data_url');
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

// Check if an article with a given source URL already exists
export async function articleExists(sourceUrl: string): Promise<boolean> {
  const q = query(collection(db, 'articles'), where('sourceUrl', '==', sourceUrl), limit(1));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count > 0;
}
