

'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues, NewsdataArticle } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, FieldPath, QueryConstraint, Timestamp, limit, startAfter, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getCategories } from './categories';
import { extractArticleContent } from '@/ai/flows/extract-article-content';
import { fetchAndStoreNews } from './news';
import { getDistricts } from './districts';

const articlesCollection = collection(db, 'articles');

// Helper function to serialize article data, converting Timestamps to ISO strings
async function serializeArticle(doc: any): Promise<Article> {
    const data = doc.data();
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
        district: districtName, // This is now a derived field for display
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
    
    const q = query(articlesCollection, where('sourceUrl', '==', apiArticle.link), limit(1));
    const existing = await getDocs(q);
    if (!existing.empty) {
        const doc = existing.docs[0];
        const currentData = doc.data();
        const updates: Partial<Article> = {};
        let needsUpdate = false;
        
        // Add district if it's missing
        if (districtId && !currentData.districtId) {
            updates.districtId = districtId;
            needsUpdate = true;
        }

        // Add category if it's new
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

        return doc.id;
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
    if (searchCategorySlug && searchCategorySlug !== 'general') {
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
    startAfterId?: string;
    pageSize?: number;
    category?: string; // This is a category slug
    district?: string; // This is a district ID
}): Promise<Article[]> {
    const { startAfterId, pageSize = 100, category, district } = options || {};

    try {
        // This is the most basic query that will always work without a custom index.
        const articlesSnapshot = await getDocs(query(collection(db, 'articles')));
        const allArticles = await Promise.all(articlesSnapshot.docs.map(serializeArticle));

        // Perform all filtering in-memory
        const allCategories = await getCategories();
        const categoryDoc = category ? allCategories.find(c => c.slug === category) : null;
        
        const filteredArticles = allArticles.filter(article => {
            if (article.status !== 'published') return false;
            
            const categoryMatch = categoryDoc ? article.categoryIds?.includes(categoryDoc.id) : true;
            const districtMatch = (district && district !== 'all') ? article.districtId === district : true;
            
            return categoryMatch && districtMatch;
        });

        // Sort in-memory
        const sortedArticles = filteredArticles.sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
            const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });


        // Handle pagination in-memory
        let paginatedArticles = sortedArticles;
        if (startAfterId) {
            const startIndex = sortedArticles.findIndex(a => a.id === startAfterId);
            if (startIndex !== -1) {
                paginatedArticles = sortedArticles.slice(startIndex + 1);
            }
        }

        return paginatedArticles.slice(0, pageSize);

    } catch (error: any) {
        console.error("An unexpected error occurred in getArticles:", error);
        return []; 
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


// READ (related articles with API fallback)
export async function getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
    if (!categoryId) return [];
    try {
        const q = query(
            articlesCollection,
            where('categoryIds', 'array-contains', categoryId),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(4) // Fetch a bit more to ensure we have 3 after filtering self
        );

        const snapshot = await getDocs(q);
        
        let articles = await Promise.all(snapshot.docs.map(serializeArticle));
        // Exclude the current article from the results
        articles = articles.filter(article => article.id !== currentArticleId);

        return articles.slice(0, 3);

    } catch (error: any) {
        if (error.code === 'failed-precondition') {
            const requiredIndexUrl = error.message.match(/https?:\/\/[^\s]+/);
            const readableError = `Query for related articles failed due to missing Firestore index. Please create it here: ${requiredIndexUrl ? requiredIndexUrl[0] : 'Check Firestore console.'}`;
            console.warn(readableError);
        } else {
             console.error("Error fetching related articles", error);
        }
        return [];
    }
}
