
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues, NewsdataArticle } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, FieldPath, QueryConstraint, Timestamp, limit, startAfter, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getCategories } from './categories';
import { extractArticleContent } from '@/ai/flows/extract-article-content';
import { fetchAndStoreNews } from './news';

const articlesCollection = collection(db, 'articles');

// Helper function to serialize article data, converting Timestamps to ISO strings
function serializeArticle(doc: any): Article {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt ? (data.publishedAt as Timestamp).toDate().toISOString() : null,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : null,
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
export async function storeCollectedArticle(apiArticle: NewsdataArticle): Promise<string | null> {
    
    // 1. Check if article already exists
    const q = query(articlesCollection, where('sourceUrl', '==', apiArticle.link), limit(1));
    const existing = await getDocs(q);
    if (!existing.empty) {
        // console.log(`Article already exists: ${apiArticle.link}`);
        return existing.docs[0].id; // Return existing article ID
    }

    // 2. Map categories
    const allCategories = await getCategories();
    const categoryIds = apiArticle.category.map(apiCat => {
        const found = allCategories.find(c => c.name.toLowerCase() === apiCat.toLowerCase() || c.slug === apiCat.toLowerCase());
        return found?.id;
    }).filter((id): id is string => !!id);

    // 3. Get content
    let content = apiArticle.content || apiArticle.description || '';
    if (!content && apiArticle.link) {
        console.log(`Content is empty for ${apiArticle.title}. Extracting from URL.`);
        try {
            const extracted = await extractArticleContent({ url: apiArticle.link });
            content = extracted.content;
        } catch (e) {
            console.error(`Failed to extract content for ${apiArticle.link}`, e);
            content = apiArticle.description || 'No content available.';
        }
    }


    // 4. Create article object
    const newArticle: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
        title: apiArticle.title,
        content: content,
        imageUrl: apiArticle.image_url,
        author: apiArticle.creator?.join(', ') || apiArticle.source_id,
        authorId: apiArticle.source_id,
        categoryIds: categoryIds.length > 0 ? categoryIds : [allCategories.find(c => c.slug === 'general')?.id || 'general'],
        status: 'published',
        publishedAt: Timestamp.fromDate(new Date(apiArticle.pubDate)),
        sourceUrl: apiArticle.link,
        seo: {
            keywords: apiArticle.keywords || [],
            metaDescription: apiArticle.description || '',
        },
        views: 0,
        district: null, // This can be enhanced with location extraction
    };

    // 5. Save to Firestore
    try {
        const docRef = await addDoc(articlesCollection, {
            ...newArticle,
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
    category?: string; // This can be slug or ID
    district?: string;
}): Promise<Article[]> {
    
    const { startAfterId, pageSize = 10, category, district } = options || {};
    const constraints: QueryConstraint[] = [];
    
    let isFiltered = false;

    if (category && category !== 'general') {
        const allCategories = await getCategories();
        const categoryDoc = allCategories.find(c => c.slug === category || c.id === category);
        if (categoryDoc) {
            constraints.push(where('categoryIds', 'array-contains', categoryDoc.id));
            isFiltered = true;
        }
    } else if (district && district !== 'all') {
        constraints.push(where('district', '==', district));
        isFiltered = true;
    }
    
    if (!isFiltered) {
        constraints.push(orderBy('publishedAt', 'desc'));
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
        const articles = snapshot.docs.map(serializeArticle);

        // Manually sort if we couldn't do it in the query
        if (isFiltered) {
            articles.sort((a, b) => (new Date(b.publishedAt).getTime() || 0) - (new Date(a.publishedAt).getTime() || 0));
        }

        return articles;
    } catch (error: any) {
        if (error.code === 'failed-precondition') {
             console.warn(`Query failed due to missing index, returning unsorted results for this filter: ${error.message}`);
             const fallbackQuery = query(articlesCollection, ...constraints.filter(c => c.type !== 'orderBy'));
             const fallbackSnapshot = await getDocs(fallbackQuery);
             const articles = fallbackSnapshot.docs.map(serializeArticle);
            
            // Manual sort
            articles.sort((a, b) => (new Date(b.publishedAt).getTime() || 0) - (new Date(a.publishedAt).getTime() || 0));
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
    const article = await getArticle(id);
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
            limit(4) // Fetch 4 to have extras if current article is included
        );

        const snapshot = await getDocs(q);
        
        let articles = snapshot.docs
            .map(serializeArticle)
            .filter(article => article.id !== currentArticleId);

        // Manually sort by date
        articles.sort((a, b) => (new Date(b.publishedAt).getTime() || 0) - (new Date(a.publishedAt).getTime() || 0));

        articles = articles.slice(0, 3); // Take the top 3

        // If we have enough articles OR this is the last attempt, return them
        if (articles.length >= 3 || attempts === maxAttempts) {
            return articles;
        }
        
        // If not enough articles, try fetching from the API
        console.log(`Found only ${articles.length} related articles. Fetching from API...`);
        const allCategories = await getCategories();
        const categorySlug = allCategories.find(c => c.id === categoryId)?.slug;

        if (categorySlug) {
            try {
                await fetchAndStoreNews(categorySlug);
                // After fetching, the loop will run again to query Firestore.
            } catch (error) {
                console.error("Failed to fetch news from API as fallback:", error);
                // If API fails, return what we have to avoid infinite loops
                return articles;
            }
        } else {
             // If we can't find a slug, we can't fetch, so return what we have.
             return articles;
        }
    }

    return []; // Should be unreachable
}
