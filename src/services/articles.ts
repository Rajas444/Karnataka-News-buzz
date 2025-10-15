
'use server';

import { db } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, where, Timestamp, limit, startAfter, orderBy, writeBatch } from 'firebase/firestore';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { getExternalNews } from './newsapi';
import { placeholderArticles } from '@/lib/placeholder-data';

async function serializeArticle(doc: any): Promise<Article> {
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
    
    const plainObject = {
        id: doc.id,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        imagePath: data.imagePath,
        author: data.author,
        authorId: data.authorId,
        categoryIds: data.categoryIds,
        status: data.status,
        seo: data.seo,
        views: data.views,
        source: data.source,
        sourceUrl: data.sourceUrl,
        districtId: data.districtId,
        publishedAt: data.publishedAt ? (data.publishedAt as Timestamp).toDate().toISOString() : null,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : null,
        district: districtName,
    };
    
    return plainObject as Article;
}

export async function createArticle(data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  const articlesCollection = collection(db, 'articles');
  
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
        try {
            const { secure_url, public_id } = await uploadToCloudinary(data.imageUrl, 'articles');
            imageUrl = secure_url;
            imagePath = public_id;
        } catch (uploadError: any) {
            console.error(`Fallback image upload also failed: ${uploadError.message}`);
            imageUrl = null;
            imagePath = '';
        }
    }
  }
  
  const { categoryId, ...restOfData } = data as any;

  const newArticleData = {
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
  };

  const docRef = await addDoc(articlesCollection, newArticleData);
  const docSnap = await getDoc(docRef);
  return serializeArticle(docSnap);
}

export async function getArticles(options?: {
  pageSize?: number;
  startAfterDocId?: string | null;
  categorySlug?: string;
  districtId?: string;
}): Promise<{ articles: Article[]; lastVisibleDocId: string | null }> {
    try {
        const articlesCollection = collection(db, 'articles');
        const { pageSize = 10, startAfterDocId, categorySlug, districtId } = options || {};
        
        const constraints = [];

        // Apply filters only if they are provided and not 'all'
        if (categorySlug && categorySlug !== 'all') {
            const categories = await getCategories();
            const categoryId = categories.find(c => c.slug === categorySlug)?.id;
            if (categoryId) {
                constraints.push(where('categoryIds', 'array-contains', categoryId));
            }
        }
        
        if (districtId && districtId !== 'all') {
            constraints.push(where('districtId', '==', districtId));
        }

        constraints.push(where('status', '==', 'published'));
        constraints.push(orderBy('publishedAt', 'desc'));

        if (startAfterDocId) {
            const startAfterDoc = await getDoc(doc(db, 'articles', startAfterDocId));
            if (startAfterDoc.exists()) {
                constraints.push(startAfter(startAfterDoc));
            }
        }

        constraints.push(limit(pageSize));
        
        const q = query(articlesCollection, ...constraints);
        const snapshot = await getDocs(q);

        // *** CENTRALIZED FALLBACK LOGIC ***
        // If the very first query for a page returns nothing, use placeholders.
        // This avoids complex logic in the page component.
        if (snapshot.empty && !startAfterDocId) {
            console.log("Firestore is empty or returned no results for the query. Falling back to placeholders.");
            return { articles: placeholderArticles, lastVisibleDocId: null };
        }

        const fetchedArticles = await Promise.all(snapshot.docs.map(serializeArticle));
        
        let newLastVisibleDocId: string | null = null;
        // Determine if there are more articles to load for pagination.
        if (snapshot.docs.length === pageSize) {
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            newLastVisibleDocId = lastVisible.id;
        }
    
        return {
            articles: fetchedArticles,
            lastVisibleDocId: newLastVisibleDocId
        };
    } catch(error) {
        console.warn("Failed to fetch articles from Firestore, using placeholder data as a fallback. Error:", error);
        // If any error occurs during the process, fall back to placeholders.
        return { articles: placeholderArticles, lastVisibleDocId: null };
    }
}


export async function getArticle(id: string): Promise<Article | null> {
    const isExternalId = id.startsWith('http');
    
    let article: Article | null = null;

    if (!isExternalId) {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            article = await serializeArticle(docSnap);
            // Increment view count without waiting
            updateDoc(docRef, { views: (article.views || 0) + 1 }).catch(e => console.error("Failed to update view count:", e));
        }
    } else {
        try {
            const externalNews = await getExternalNews();
            article = externalNews.find(a => a.id === id) || null;
        } catch (error: any) {
            throw new Error(`Failed to fetch external news article: ${error.message}`);
        }
    }

    if (!article && placeholderArticles.some(p => p.id === id)) {
        article = placeholderArticles.find(p => p.id === id) || null;
    }


    return article;
}


export async function updateArticle(id: string, data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  const docRef = doc(db, 'articles', id);
  let imageUrl = data.imageUrl || null;
  let imagePath = data.imagePath || ''; 

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

  const { categoryId, districtId: dataDistrictId, ...restOfData } = data as any;
  
  const updateData = {
    ...restOfData,
    districtId: dataDistrictId,
    categoryIds: data.categoryIds,
    imageUrl,
    imagePath,
    publishedAt: data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : serverTimestamp(),
    updatedAt: serverTimestamp(),
     seo: {
      keywords: data.seoKeywords?.split(',').map(k => k.trim()) || [],
      metaDescription: data.seoMetaDescription || '',
    }
  };

  await updateDoc(docRef, updateData);

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
    const articlesCollection = collection(db, 'articles');

    const q = query(articlesCollection,
        where('categoryIds', 'array-contains', categoryId),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(5));

    const snapshot = await getDocs(q);
    const articles = await Promise.all(snapshot.docs.map(serializeArticle));

    return articles
        .filter(article => article.id !== currentArticleId)
        .slice(0, 3);
}
