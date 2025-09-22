

'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues, NewsdataArticle, Category } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, FieldPath, QueryConstraint, Timestamp, limit, startAfter, writeBatch, DocumentSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getCategories } from './categories';
import { extractArticleContent } from '@/ai/flows/extract-article-content';
import { fetchAndStoreNews } from './news';
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


// STORE (from external API)
export async function storeCollectedArticle(apiArticle: NewsdataArticle, districtId?: string, searchCategorySlug?: string): Promise<string | null> {
    
    // Check if an article with the same source URL already exists.
    const q = query(articlesCollection, where('sourceUrl', '==', apiArticle.link), limit(1));
    const existing = await getDocs(q);
    if (!existing.empty) {
        // Article already exists. We don't need to create a new one.
        // We can optionally update it if new information (like a district) is found.
        const doc = existing.docs[0];
        const currentData = doc.data();
        const updates: Partial<any> = {};
        let needsUpdate = false;
        
        // Add district if it's missing from the existing document
        if (districtId && !currentData.districtId) {
            updates.districtId = districtId;
            needsUpdate = true;
        }

        // Add category if the article was found via a new category search
        if (searchCategorySlug) {
             const allCategories = await getCategories();
             const searchCatId = allCategories.find(c => c.slug === searchCategorySlug)?.id;
             if (searchCatId && !currentData.categoryIds?.includes(searchCatId)) {
                 updates.categoryIds = [...(currentData.categoryIds || []), searchCatId];
                 needsUpdate = true;
             }
        }

        if (needsUpdate) {
            await updateDoc(doc.ref, updates);
        }

        return null; // Return null to indicate no new article was created.
    }

    const allCategories = await getCategories();
    
    const apiCategoryIds = new Set<string>();
    const normalize = (str: string) => str.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');


    // Match API categories to our DB categories
    if (apiArticle.category) {
        apiArticle.category.forEach(apiCat => {
            const normalizedApiCat = normalize(apiCat);
            const found = allCategories.find(c => normalize(c.slug) === normalizedApiCat || normalize(c.name) === normalizedApiCat);
            if (found) {
                apiCategoryIds.add(found.id);
            }
        });
    }

    // Ensure the category used for the search is included
    if (searchCategorySlug && searchCategorySlug !== 'all' && searchCategorySlug !== 'general') {
        const searchCatId = allCategories.find(c => c.slug === searchCategorySlug)?.id;
        if (searchCatId) {
            apiCategoryIds.add(searchCatId);
        }
    }
    
    let finalCategoryIds = Array.from(apiCategoryIds);

    // If no categories were matched, default to "General"
    if (finalCategoryIds.length === 0) {
        const generalCatId = allCategories.find(c => c.slug === 'general')?.id;
        if (generalCatId) {
            finalCategoryIds.push(generalCatId);
        } else if (allCategories.length > 0) {
            // Fallback to the first available category if 'general' doesn't exist
            finalCategoryIds.push(allCategories[0].id);
        }
    }


    const newArticleData = {
        title: apiArticle.title,
        content: apiArticle.content || apiArticle.description || '',
        imageUrl: apiArticle.image_url,
        author: apiArticle.creator?.join(', ') || apiArticle.source_id,
        authorId: apiArticle.source_id,
        categoryIds: finalCategoryIds,
        status: 'published' as const,
        publishedAt: Timestamp.fromDate(new Date(apiArticle.pubDate)),
        sourceUrl: apiArticle.link,
        seo: {
            keywords: apiArticle.keywords || [],
            metaDescription: apiArticle.description || '',
        },
        views: 0,
        districtId: districtId && districtId !== 'all' ? districtId : null,
    };

    try {
        const docRef = await addDoc(articlesCollection, {
            ...newArticleData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error storing collected article:", error);
        return null;
    }
}


// READ (all with pagination and filters)
export async function getArticles(options?: {
    pageSize?: number;
    startAfterDocId?: string;
    category?: string; // slug
    district?: string; // id
}): Promise<{articles: Article[], lastVisibleDocId: string | null}> {
    const { pageSize = 10, startAfterDocId, category, district } = options || {};

    let constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
    ];

    try {
        // Add filters if they are provided and not 'all'
        if (category && category !== 'all') {
            const allCategories = await getCategories();
            const categoryId = allCategories.find(c => c.slug === category)?.id;
            if (categoryId) {
                constraints.push(where('categoryIds', 'array-contains', categoryId));
            }
        }

        if (district && district !== 'all') {
            constraints.push(where('districtId', '==', district));
        }

        if (startAfterDocId) {
            const startAfterDoc = await getDoc(doc(db, 'articles', startAfterDocId));
            if (startAfterDoc.exists()) {
                constraints.push(startAfter(startAfterDoc));
            }
        }
        
        constraints.push(limit(pageSize));
    
        const q = query(collection(db, 'articles'), ...constraints);
        const snapshot = await getDocs(q);
        
        const articles = await Promise.all(snapshot.docs.map(serializeArticle));
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

        return { articles, lastVisibleDocId: lastVisibleDoc ? lastVisibleDoc.id : null };

    } catch (error: any) {
        // This is the crucial part: catch the "missing index" error and fail gracefully.
        if (error.code === 'failed-precondition') {
             console.error(`
                **********************************************************************************
                * FIRESTORE ERROR: A composite index is required for this query.
                * Message: ${error.message}
                * To fix this, create the index in your Firebase console. The link is usually
                * provided in the error message in your browser's developer console.
                * The app will not crash, but the query returned no results.
                **********************************************************************************
            `);
             return { articles: [], lastVisibleDocId: null };
        }
        // Re-throw other unexpected errors
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
