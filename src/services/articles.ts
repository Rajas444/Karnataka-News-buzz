
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, QueryConstraint, Timestamp, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';

const articlesCollection = collection(db, 'articles');

// Helper function to serialize article data, converting Timestamps to ISO strings
async function serializeArticle(doc: DocumentSnapshot): Promise<Article> {
    const data = doc.data();
    if (!data) throw new Error("Document data is undefined.");

    let districtName: string | undefined = undefined;
    if (data.districtId) {
        try {
            const districts = await getDistricts();
            districtName = districts.find(d => d.id === data.districtId)?.name;
        } catch (e) {
            console.error("Failed to get districts for article serialization", e);
        }
    }

    return {
        id: doc.id,
        ...data,
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

  const { categoryId, ...restOfData } = data;

  const docRef = await addDoc(articlesCollection, {
    ...restOfData,
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
export async function getArticles(options: {
    pageSize?: number;
    startAfterDocId?: string | null;
    categorySlug?: string;
    districtId?: string;
} = {}): Promise<{ articles: Article[], lastVisibleDocId: string | null }> {
    const { pageSize = 10, startAfterDocId, categorySlug, districtId } = options;

    let startAfterDoc: DocumentSnapshot | null = null;
    if (startAfterDocId) {
        try {
            const docRef = doc(db, 'articles', startAfterDocId);
            startAfterDoc = await getDoc(docRef);
        } catch (e) {
            console.error("Error fetching startAfter document:", e);
            return { articles: [], lastVisibleDocId: null };
        }
    }

    const executeAndFilterQuery = async (q: any): Promise<{ articles: Article[], lastVisibleDocId: string | null }> => {
        const querySnapshot = await getDocs(q);
        const articles = await Promise.all(querySnapshot.docs.map(serializeArticle));
        
        let filteredArticles = articles;

        // Apply district filter in code after fetching
        if (districtId) {
            filteredArticles = filteredArticles.filter(article => article.districtId === districtId);
        }
        
        const lastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

        return {
            articles: filteredArticles,
            lastVisibleDocId: lastVisible ? lastVisible.id : null,
        };
    };

    const baseConstraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
    ];

    const finalConstraints = [...baseConstraints];

    if (categorySlug) {
        finalConstraints.unshift(where('categoryIds', 'array-contains', categorySlug));
    }
    
    if (startAfterDoc) {
        finalConstraints.push(startAfter(startAfterDoc));
    }

    finalConstraints.push(limit(pageSize));

    const finalQuery = query(articlesCollection, ...finalConstraints);

    try {
        // Attempt the ideal, efficient query first.
        return await executeAndFilterQuery(finalQuery);
    } catch (error: any) {
        // This is the critical fallback logic.
        if (error.code === 'failed-precondition') {
            console.warn(
                `A Firestore index is required for this query, but it is missing.
                This is not a crash. The app is gracefully falling back to a simpler query.
                To enable more efficient filtering, please create the composite index in your Firebase console.
                Error: ${error.message}`
            );
            
            // Fallback query: Remove the category filter that requires the index.
            const fallbackConstraints = [...baseConstraints];
            if (startAfterDoc) {
                fallbackConstraints.push(startAfter(startAfterDoc));
            }
            fallbackConstraints.push(limit(pageSize));
            const fallbackQuery = query(articlesCollection, ...fallbackConstraints);
            
            // Execute fallback and then filter in code.
            const fallbackResult = await executeAndFilterQuery(fallbackQuery);
            let finalArticles = fallbackResult.articles;

            if (categorySlug) {
                finalArticles = finalArticles.filter(a => a.categoryIds?.includes(categorySlug));
            }
            // District is already filtered in executeAndFilterQuery, but we do it again to be safe.
            if (districtId) {
                finalArticles = finalArticles.filter(a => a.districtId === districtId);
            }

            return {
                articles: finalArticles,
                lastVisibleDocId: fallbackResult.lastVisibleDocId
            };
        }
        // For any other errors, re-throw them.
        console.error("An unexpected error occurred while fetching articles:", error);
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

  const { categoryId, ...restOfData } = data;
  
  await updateDoc(docRef, {
    ...restOfData,
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
            where('status', '==', 'published'),
            where('categoryIds', 'array-contains', categoryId),
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
                where('status', '==', 'published'),
                where('categoryIds', 'array-contains', categoryId),
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
