
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, QueryConstraint, Timestamp, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';

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
    publishedAt: data.status === 'published' ? serverTimestamp() : (data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : null),
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
    
    const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
    ];

    const isFiltered = (categorySlug && categorySlug !== 'all') || (districtId && districtId !== 'all');

    if (!isFiltered) {
        constraints.push(orderBy('publishedAt', 'desc'));
    }

    if (categorySlug && categorySlug !== 'all') {
        const categories = await getCategories();
        const category = categories.find(c => c.slug === categorySlug);
        if (category) {
            constraints.push(where('categoryIds', 'array-contains', category.id));
        }
    }

    if (districtId && districtId !== 'all') {
        constraints.push(where('districtId', '==', districtId));
    }
    
    if (startAfterDocId) {
        const startDoc = await getDoc(doc(db, 'articles', startAfterDocId));
        if (startDoc.exists()) {
            constraints.push(startAfter(startDoc));
        }
    }

    constraints.push(limit(pageSize));

    try {
        const q = query(articlesCollection, ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { articles: [], lastVisibleDocId: null };
        }
        
        const articles = await Promise.all(snapshot.docs.map(serializeArticle));
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

        // To determine if there are more articles, we fetch one more than needed
        const nextQueryConstraints: QueryConstraint[] = [...constraints];
        nextQueryConstraints.pop(); // remove limit
        nextQueryConstraints.push(startAfter(lastVisibleDoc), limit(1));
        const nextQuery = query(articlesCollection, ...nextQueryConstraints);
        const nextSnapshot = await getDocs(nextQuery);

        return {
            articles,
            lastVisibleDocId: nextSnapshot.empty ? null : lastVisibleDoc.id,
        };
        
    } catch (error: any) {
        console.error(`Error fetching articles:`, error.message);
        if (error.code === 'failed-precondition') {
            console.error("Firestore query failed. This is likely due to a missing composite index. Please create the required index in your Firebase console based on the error message in the server logs.");
        }
        // Return empty on error to prevent app crash
        return { articles: [], lastVisibleDocId: null };
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

    let articles: Article[] = [];
    try {
        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            where('categoryIds', 'array-contains', categoryId),
            orderBy('publishedAt', 'desc'),
            limit(4) // Fetch 4 to have a replacement if the current article is in the results
        ];
        
        const q = query(articlesCollection, ...constraints);
        const snapshot = await getDocs(q);
        articles = await Promise.all(snapshot.docs.map(serializeArticle));

    } catch (error: any) {
        // This can happen if the composite index (categoryIds, publishedAt) doesn't exist
        console.warn(
            `[getRelatedArticles] Query failed. This likely requires a Firestore index. Falling back to a simpler query. Error: ${error.message}`
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
            articles = await Promise.all(snapshot.docs.map(serializeArticle));
        } catch (fallbackError) {
            console.error("Fallback query for related articles also failed:", fallbackError);
            return [];
        }
    }
    
    // Filter out the current article and take the top 3
    return articles.filter(article => article.id !== currentArticleId).slice(0, 3);
}
