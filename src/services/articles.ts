
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues, Category } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, FieldPath, QueryConstraint, Timestamp, limit, startAfter, writeBatch, DocumentSnapshot, Query } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getCategories } from './categories';
import { extractArticleContent } from '@/ai/flows/extract-article-content';
import { getDistricts } from './districts';

const articlesCollection = collection(db, 'articles');

// Helper function to serialize article data, converting Timestamps to ISO strings
async function serializeArticle(doc: DocumentSnapshot): Promise<Article> {
    const data = doc.data();
    if (!data) throw new Error("Document data is undefined.");

    let districtName: string | undefined = undefined;
    if (data.districtId) {
        const districts = await getDistricts();
        districtName = districts.find(d => d.id === data.districtId)?.name;
    }

    return {
        id: doc.id,
        title: data.title,
        content: data.content, // Ensure content is explicitly included
        imageUrl: data.imageUrl,
        imagePath: data.imagePath,
        author: data.author,
        authorId: data.authorId,
        categoryIds: data.categoryIds,
        status: data.status,
        seo: data.seo,
        views: data.views,
        sourceUrl: data.sourceUrl,
        districtId: data.districtId,
        publishedAt: data.publishedAt ? (data.publishedAt as Timestamp).toDate().toISOString() : null,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : null,
        district: districtName,
    } as Article;
}


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
  
  const { categoryId, ...restOfData } = data as any;

  const docRef = await addDoc(articlesCollection, {
    ...restOfData,
    categoryIds: data.categoryIds,
    imageUrl,
    imagePath,
    status: data.status || 'draft',
    publishedAt: data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : serverTimestamp(),
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

  const docSnap = await getDoc(docRef);
  return serializeArticle(docSnap);
}

// READ (all with pagination and filters)
export async function getArticles(options?: {
  pageSize?: number;
  startAfterDocId?: string | null;
  categorySlug?: string;
  districtId?: string;
}): Promise<{ articles: Article[]; lastVisibleDocId: string | null }> {
    const { pageSize = 1000, startAfterDocId, categorySlug, districtId } = options || {}; // Fetch all by default now

    try {
        const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
        const snapshot = await getDocs(q);

        let allArticles = await Promise.all(snapshot.docs.map(serializeArticle));

        // Filter in-code to avoid index dependency
        let filteredArticles = allArticles.filter(article => article.status === 'published');
        
        if (categorySlug && categorySlug !== 'all') {
            const categories = await getCategories();
            const categoryId = categories.find(c => c.slug === categorySlug)?.id;
            if (categoryId) {
                filteredArticles = filteredArticles.filter(article => article.categoryIds.includes(categoryId));
            }
        }

        if (districtId && districtId !== 'all') {
            filteredArticles = filteredArticles.filter(article => article.districtId === districtId);
        }
        
        // Manual pagination on the filtered list
        const startIndex = startAfterDocId ? filteredArticles.findIndex(a => a.id === startAfterDocId) + 1 : 0;
        const paginatedArticles = filteredArticles.slice(startIndex, startIndex + (options?.pageSize || 10));

        let newLastVisibleDocId: string | null = null;
        if (filteredArticles.length > startIndex + (options?.pageSize || 10)) {
            newLastVisibleDocId = paginatedArticles[paginatedArticles.length - 1]?.id;
        }

        return {
            articles: paginatedArticles,
            lastVisibleDocId: newLastVisibleDocId,
        };
    } catch (error: any) {
        console.error("An unexpected error occurred in getArticles:", error);
        if (error.code === 'failed-precondition') {
             const devError = new Error(`[DEVELOPER INFO] A Firestore composite index is required for this query to work. The app will not crash, but no articles were returned. Please create the index using the link from the browser console, or by inspecting the full error object: ${error.message}`);
            console.error(devError);
            throw devError;
        }
        throw error;
    }
}


// READ (one)
export async function getArticle(id: string): Promise<Article | null> {
  const docRef = doc(db, 'articles', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Increment view count
    updateDoc(docRef, { views: (docSnap.data().views || 0) + 1 });
    return serializeArticle(docSnap);
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
      const oldImageRef = ref(storage, imagePath);
      await deleteObject(oldImageRef).catch(e => console.warn("Old image not found, could not delete:", e.message));
    }
    const storageRef = ref(storage, `articles/${Date.now()}_${Math.random().toString(36).substring(2)}`);
    const snapshot = await uploadString(storageRef, watermarkedImageDataUri, 'data_url');
    imageUrl = await getDownloadURL(snapshot.ref);
    imagePath = snapshot.ref.fullPath;
  }

  const { categoryId, districtId, ...restOfData } = data as any;
  
  await updateDoc(docRef, {
    ...restOfData,
    districtId: districtId,
    categoryIds: data.categoryIds,
    imageUrl,
    imagePath,
    publishedAt: data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : serverTimestamp(),
    updatedAt: serverTimestamp(),
     seo: {
      keywords: data.seoKeywords?.split(',').map(k => k.trim()) || [],
      metaDescription: data.seoMetaDescription || '',
    }
  });

  const updatedDoc = await getDoc(docRef);
  return serializeArticle(updatedDoc);
}


// DELETE
export async function deleteArticle(id: string): Promise<void> {
    const docRef = doc(db, 'articles', id);
    const docSnap = await getDoc(docRef);
    const article = docSnap.exists() ? docSnap.data() : null;
    
    if (article?.imagePath) {
        const imageRef = ref(storage, article.imagePath);
        await deleteObject(imageRef).catch(e => console.error("Error deleting image:", e));
    }
    await deleteDoc(docRef);
}


// READ (related articles)
export async function getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
    if (!categoryId) return [];
    try {
        const q = query(
            articlesCollection,
            where('categoryIds', 'array-contains', categoryId),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(4) // Fetch 4 to have a replacement if the current article is in the results
        );

        const snapshot = await getDocs(q);
        const articles = await Promise.all(snapshot.docs.map(serializeArticle));

        // Filter out the current article and take the top 3
        return articles.filter(article => article.id !== currentArticleId).slice(0, 3);

    } catch (error: any) {
        // This can happen if the composite index (categoryIds, publishedAt) doesn't exist
        console.warn(
            `Query for related articles failed. This likely requires a Firestore index. 
            Falling back to a simpler query. Error: ${error.message}`
        );

        try {
             // Fallback: Fetch by category only, sorting is lost but it won't crash
            const fallbackQuery = query(
                articlesCollection,
                where('categoryIds', 'array-contains', categoryId),
                 where('status', '==', 'published'),
                limit(4)
            );
            const snapshot = await getDocs(fallbackQuery);
            const articles = await Promise.all(snapshot.docs.map(serializeArticle));
            return articles.filter(article => article.id !== currentArticleId).slice(0,3);

        } catch (fallbackError) {
            console.error("Fallback query for related articles also failed:", fallbackError);
            return [];
        }
    }
}
