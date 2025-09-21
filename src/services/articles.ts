
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
export async function storeCollectedArticle(apiArticle: NewsdataArticle, districtId?: string): Promise<string | null> {
    
    const q = query(articlesCollection, where('sourceUrl', '==', apiArticle.link), limit(1));
    const existing = await getDocs(q);
    if (!existing.empty) {
        // If the article exists, check if we need to add the districtId to it.
        const doc = existing.docs[0];
        if (districtId && !doc.data().districtId) {
            await updateDoc(doc.ref, { districtId: districtId });
        }
        return doc.id;
    }

    const allCategories = await getCategories();
    const categoryIds = apiArticle.category.map(apiCat => {
        const found = allCategories.find(c => c.name.toLowerCase() === apiCat.toLowerCase() || c.slug === apiCat.toLowerCase());
        return found?.id;
    }).filter((id): id is string => !!id);

    let content = apiArticle.content || apiArticle.description || '';
    
    // AI Content extraction is disabled to prevent API errors.
    // if (!apiArticle.content && !apiArticle.description && apiArticle.link) {
    //     console.log(`Content is missing for '${apiArticle.title}'. Extracting from URL.`);
    //     try {
    //         const extracted = await extractArticleContent({ url: apiArticle.link });
    //         if (extracted.content) {
    //           content = extracted.content;
    //         }
    //     } catch (e) {
    //         console.error(`Failed to extract content for ${apiArticle.link}`, e);
    //     }
    // }

    const newArticleData = {
        title: apiArticle.title,
        content: content,
        imageUrl: apiArticle.image_url,
        author: apiArticle.creator?.join(', ') || apiArticle.source_id,
        authorId: apiArticle.source_id,
        categoryIds: categoryIds.length > 0 ? categoryIds : [allCategories.find(c => c.slug === 'general')?.id || 'general'],
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
    category?: string;
    district?: string; // This is a district ID
}): Promise<Article[]> {
    
    const { startAfterId, pageSize = 10, category, district } = options || {};
    const constraints: QueryConstraint[] = [];
    
    // Always sort by publishedAt descending
    constraints.push(orderBy('publishedAt', 'desc'));

    if (category && category !== 'general') {
        const allCategories = await getCategories();
        const categoryDoc = allCategories.find(c => c.slug === category || c.id === category);
        if (categoryDoc) {
            constraints.push(where('categoryIds', 'array-contains', categoryDoc.id));
        }
    }
    
    if (district && district !== 'all') {
        constraints.push(where('districtId', '==', district));
    }
    
    if (startAfterId) {
        const lastVisibleDoc = await getDoc(doc(articlesCollection, startAfterId));
        if (lastVisibleDoc.exists()) {
            constraints.push(startAfter(lastVisibleDoc));
        } else {
            console.warn(`Last visible document with id ${startAfterId} not found.`);
        }
    }
    
    constraints.push(limit(pageSize));
    
    const q = query(articlesCollection, ...constraints);

    try {
        const snapshot = await getDocs(q);
        const articles = await Promise.all(snapshot.docs.map(serializeArticle));
        // Remove the starting document from the results if it's included
        if (startAfterId && articles.length > 0 && articles[0].id === startAfterId) {
            return articles.slice(1);
        }
        return articles;
    } catch (error: any) {
        if (error.code === 'failed-precondition') {
             console.warn(`Query failed due to missing index. Please create it in your Firebase console. The app will fall back to client-side sorting. Error: ${error.message}`);
             // Construct a fallback query without the order by that might cause issues with inequality filters
             const fallbackConstraints = constraints.filter(c => c.type !== 'orderBy');
             const fallbackQuery = query(articlesCollection, ...fallbackConstraints);
             const fallbackSnapshot = await getDocs(fallbackQuery);
             const articles = await Promise.all(fallbackSnapshot.docs.map(serializeArticle));
            
            // Manual sort in JS as a last resort
            articles.sort((a, b) => (new Date(b.publishedAt).getTime() || 0) - (new Date(a.publishedAt).getTime() || 0));
            // Remove the starting document from the results if it's included
             if (startAfterId && articles.length > 0 && articles[0].id === startAfterId) {
                return articles.slice(1);
            }
            return articles;
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
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
        attempts++;
        
        const q = query(
            articlesCollection,
            where('categoryIds', 'array-contains', categoryId),
            orderBy('publishedAt', 'desc'),
            limit(10)
        );

        const snapshot = await getDocs(q);
        
        let articles = (await Promise.all(snapshot.docs.map(serializeArticle)))
            .filter(article => article.id !== currentArticleId);

        const finalArticles = articles.slice(0, 3);

        if (finalArticles.length >= 3 || attempts === maxAttempts) {
            return finalArticles;
        }
        
        console.log(`Found only ${finalArticles.length} related articles. Attempting to fetch more from API...`);
        const allCategories = await getCategories();
        const categorySlug = allCategories.find(c => c.id === categoryId)?.slug;
        const districtId = finalArticles[0]?.districtId; // Try to get district from existing articles
        const allDistricts = await getDistricts();
        const districtName = allDistricts.find(d => d.id === districtId)?.name;


        if (categorySlug) {
            try {
                await fetchAndStoreNews(categorySlug, districtName, districtId);
            } catch (error) {
                console.error("Failed to fetch news from API as fallback:", error);
                return finalArticles;
            }
        } else {
             return finalArticles;
        }
    }

    return [];
}
