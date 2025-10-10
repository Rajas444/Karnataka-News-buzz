
'use server';

import { db } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, where, QueryConstraint, Timestamp, limit, startAfter, DocumentSnapshot, orderBy } from 'firebase/firestore';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { getExternalNews } from './newsapi';

const articlesCollection = collection(db, 'articles');

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

export async function createArticle(data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  let imageUrl = data.imageUrl || null;
  let imagePath = ''; // Using imagePath to store the Cloudinary public_id

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    try {
        const watermarkedImageResult = await watermarkImage({
            imageDataUri: data.imageUrl,
            watermarkText: 'Karnataka News Pulse',
        });
        const { secure_url, public_id } = await uploadToCloudinary(watermarkedImageResult.imageDataUri, 'articles');
        imageUrl = secure_url;
        imagePath = public_id;
    } catch (error: any) {
        console.warn(`Watermarking or upload failed, proceeding with original image. Error: ${error.message}`);
        // If watermarking or the first upload attempt fails, just upload the original.
        try {
            const { secure_url, public_id } = await uploadToCloudinary(data.imageUrl, 'articles');
            imageUrl = secure_url;
            imagePath = public_id;
        } catch (uploadError: any) {
            console.error(`Fallback image upload also failed: ${uploadError.message}`);
            // If the fallback also fails, we proceed without an image.
            imageUrl = null;
            imagePath = '';
        }
    }
  }
  
  const { categoryId, ...restOfData } = data as any;

  const docRef = await addDoc(articlesCollection, {
    ...restOfData,
    categoryIds: data.categoryIds,
    imageUrl,
    imagePath,
    status: data.status || 'draft',
    publishedAt: data.status === 'published' ? serverTimestamp() : (data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : null),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    author: 'Admin User',
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
    const { pageSize = 10, startAfterDocId, categorySlug, districtId } = options || {};

    try {
        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(pageSize),
        ];

        if (startAfterDocId) {
            const startAfterDoc = await getDoc(doc(db, 'articles', startAfterDocId));
            if (startAfterDoc.exists()) {
                constraints.push(startAfter(startAfterDoc));
            }
        }

        let finalConstraints = constraints;
        let queryToRun: any = collection(db, 'articles');

        if (categorySlug && categorySlug !== 'all') {
            const categories = await getCategories();
            const categoryId = categories.find(c => c.slug === categorySlug)?.id;
            if (categoryId) {
                finalConstraints.push(where('categoryIds', 'array-contains', categoryId));
            }
        }

        if (districtId && districtId !== 'all') {
            finalConstraints.push(where('districtId', '==', districtId));
        }

        const q = query(queryToRun, ...finalConstraints);
        const snapshot = await getDocs(q);

        const articles = await Promise.all(snapshot.docs.map(serializeArticle));
        
        const lastVisible = snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null;
        
        let newLastVisibleDocId = null;
        if (lastVisible) {
            newLastVisibleDocId = lastVisible.id;
        }

        return {
            articles,
            lastVisibleDocId: newLastVisibleDocId,
        };
        
    } catch (error: any) {
        console.error("An unexpected error occurred in getArticles:", error);
        if (error.code === 'failed-precondition' && options?.pageSize) {
            console.warn(`[DEVELOPER INFO] Firestore composite index might be required. Falling back to client-side filtering for this query.`);
            // Fallback for development: fetch all and filter client-side. NOT FOR PRODUCTION.
            const allArticles = await getArticles(); // No pagination
            
            let filteredArticles = allArticles.articles;

            if (categorySlug && categorySlug !== 'all') {
                 const categories = await getCategories();
                const categoryId = categories.find(c => c.slug === categorySlug)?.id;
                if (categoryId) {
                    filteredArticles = filteredArticles.filter(a => a.categoryIds.includes(categoryId));
                }
            }

            if (districtId && districtId !== 'all') {
                filteredArticles = filteredArticles.filter(a => a.districtId === districtId);
            }

            const startIndex = startAfterDocId ? filteredArticles.findIndex(a => a.id === startAfterDocId) + 1 : 0;
            const paginatedArticles = filteredArticles.slice(startIndex, startIndex + pageSize);

            let newLastVisibleDocId: string | null = null;
            if (filteredArticles.length > startIndex + pageSize) {
                newLastVisibleDocId = paginatedArticles[paginatedArticles.length - 1]?.id;
            }
            
            return {
                articles: paginatedArticles,
                lastVisibleDocId: newLastVisibleDocId,
            };
        }
        
        throw error;
    }
}


export async function getArticle(id: string): Promise<Article | null> {
    const isExternalId = id.startsWith('http');
    
    let article: Article | null = null;

    if (!isExternalId) {
        // Fetch from local Firestore DB
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            article = await serializeArticle(docSnap);
            // Increment view count for local articles
            const currentViews = docSnap.data().views || 0;
            await updateDoc(docRef, { views: currentViews + 1 });
        }
    } else {
        // If not found locally, try fetching from the external NewsAPI
        // We use the URL as the ID for external articles
        const externalNews = await getExternalNews();
        article = externalNews.find(a => a.id === id) || null;
    }

    return article;
}


export async function updateArticle(id: string, data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  const docRef = doc(db, 'articles', id);
  let imageUrl = data.imageUrl || null;
  let imagePath = data.imagePath || ''; // imagePath is the Cloudinary public_id

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    if (imagePath) {
      await deleteFromCloudinary(imagePath);
    }
    try {
        const watermarkedImageResult = await watermarkImage({
          imageDataUri: data.imageUrl,
          watermarkText: 'Karnataka News Pulse',
        });
        const { secure_url, public_id } = await uploadToCloudinary(watermarkedImageResult.imageDataUri, 'articles');
        imageUrl = secure_url;
        imagePath = public_id;
    } catch (error: any) {
        console.warn(`Watermarking or upload failed, proceeding with original image. Error: ${error.message}`);
        try {
            const { secure_url, public_id } = await uploadToCloudinary(data.imageUrl, 'articles');
            imageUrl = secure_url;
            imagePath = public_id;
        } catch (uploadError: any) {
            console.error(`Fallback image upload also failed: ${uploadError.message}`);
        }
    }
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

export async function deleteArticle(id: string): Promise<void> {
    const docRef = doc(db, 'articles', id);
    const docSnap = await getDoc(docRef);
    const article = docSnap.exists() ? docSnap.data() : null;
    
    if (article?.imagePath) {
        await deleteFromCloudinary(article.imagePath);
    }
    await deleteDoc(docRef);
}

export async function getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
    if (!categoryId) return [];

    let articles: Article[] = [];
    try {
        const q = query(
            articlesCollection,
            where('categoryIds', 'array-contains', categoryId),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(4) // Fetch 4 to have a replacement if the current article is in the results
        );

        const snapshot = await getDocs(q);
        articles = await Promise.all(snapshot.docs.map(serializeArticle));

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
    
    return articles.filter(article => article.id !== currentArticleId).slice(0, 3);
}

    

    



