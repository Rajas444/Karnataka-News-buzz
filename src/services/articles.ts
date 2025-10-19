
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, where, Timestamp, limit, startAfter, orderBy, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';
import { getExternalNews } from './newsapi';
import { placeholderArticles } from '@/lib/placeholder-data';
import imageData from '@/app/lib/placeholder-images.json';

type ImageData = {
    [key: string]: {
        seed: string;
        hint: string;
    }
}
const typedImageData = imageData as ImageData;


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
    
    // Ensure Timestamps are converted to serializable ISO strings
    const toISOString = (date: any) => {
        if (!date) return null;
        if (date instanceof Timestamp) return date.toDate().toISOString();
        if (date instanceof Date) return date.toISOString();
        return date;
    }

    const plainObject: Partial<Article> = {
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
        publishedAt: toISOString(data.publishedAt),
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
        district: districtName,
    };
    
    return plainObject as Article;
}

const uploadImageToStorage = async (imageDataUri: string, folder: string, fileName: string): Promise<{ imageUrl: string; imagePath: string }> => {
    const imagePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, imagePath);
    await uploadString(storageRef, imageDataUri, 'data_url');
    const imageUrl = await getDownloadURL(storageRef);
    return { imageUrl, imagePath };
};

export async function createArticle(data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  const articlesCollection = collection(db, 'articles');
  
  let imageUrl = data.imageUrl || null;
  let imagePath = '';

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    try {
        const watermarkedImageResult = await watermarkImage({
            imageDataUri: data.imageUrl,
            watermarkText: 'Karnataka News Pulse',
        });
        const uploadResult = await uploadImageToStorage(watermarkedImageResult.imageDataUri, 'articles', `${Date.now()}_${Math.random().toString(36).substring(2)}`);
        imageUrl = uploadResult.imageUrl;
        imagePath = uploadResult.imagePath;
    } catch (error: any) {
        console.warn(`Watermarking or upload failed, proceeding with original image. Error: ${error.message}`);
        try {
            const uploadResult = await uploadImageToStorage(data.imageUrl, 'articles', `${Date.now()}_${Math.random().toString(36).substring(2)}`);
            imageUrl = uploadResult.imageUrl;
            imagePath = uploadResult.imagePath;
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
        
        let constraints = [];
        
        if (districtId && districtId !== 'all') {
            constraints.push(where('districtId', '==', districtId));
        }

        if (categorySlug && categorySlug !== 'all') {
            const categories = await getCategories();
            const categoryId = categories.find(c => c.slug === categorySlug)?.id;
            if (categoryId) {
                constraints.push(where('categoryIds', 'array-contains', categoryId));
            }
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

        if (snapshot.empty && !startAfterDocId) {
            console.warn("Firestore is empty or returned no results for the query. Falling back to placeholders.");
            const placeholderResult = { articles: placeholderArticles, lastVisibleDocId: null };
            // Simulate pagination for placeholders if needed, though this simple return is often enough for a fallback.
            return placeholderResult;
        }

        const fetchedArticles = await Promise.all(snapshot.docs.map(serializeArticle));
        
        let newLastVisibleDocId: string | null = null;
        if (snapshot.docs.length === pageSize) {
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            newLastVisibleDocId = lastVisible.id;
        }
    
        return {
            articles: fetchedArticles,
            lastVisibleDocId: newLastVisibleDocId
        };
    } catch(error) {
        console.warn("Using placeholder data as a fallback. Error:", (error as Error).message);
        const { districtId, categorySlug, pageSize = 10, startAfterDocId } = options || {};
        
        const processedPlaceholders = placeholderArticles.map(article => {
            const imageInfo = typedImageData[article.id as keyof typeof typedImageData];
            if (imageInfo) {
                return {
                    ...article,
                    imageUrl: `https://picsum.photos/seed/${imageInfo.seed}/800/600`,
                    'data-ai-hint': imageInfo.hint,
                };
            }
            return article;
        });

        const filteredPlaceholders = processedPlaceholders.filter(p => 
            (!districtId || districtId === 'all' || p.districtId === districtId) && 
            (!categorySlug || categorySlug === 'all' || p.categoryIds.includes(categorySlug))
        ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());


        const startIndex = startAfterDocId
            ? filteredPlaceholders.findIndex(p => p.id === startAfterDocId) + 1
            : 0;

        const newArticles = filteredPlaceholders.slice(startIndex, startIndex + pageSize);
        
        const newLastVisibleDocId =
            startIndex + newArticles.length < filteredPlaceholders.length
                ? newArticles[newArticles.length - 1]?.id ?? null
                : null;
        
        return { articles: newArticles, lastVisibleDocId: newLastVisibleDocId };
    }
}


export async function getArticle(id: string): Promise<Article | null> {
    const isExternalId = id.startsWith('http');
    
    let article: Article | null = null;

    if (!isExternalId) {
        try {
            const docRef = doc(db, 'articles', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                article = await serializeArticle(docSnap);
                // Increment view count without waiting
                updateDoc(docRef, { views: (article.views || 0) + 1 }).catch(e => console.error("Failed to update view count:", e));
            }
        } catch (e) {
            // Firestore might not be available, fallback to placeholders below
        }
    } else {
        try {
            const externalNews = await getExternalNews();
            article = externalNews.find(a => a.id === id) || null;
        } catch (error: any) {
            throw new Error(`Failed to fetch external news article: ${error.message}`);
        }
    }
    
    // If no article was found in Firestore or external API, check placeholders
    if (!article && placeholderArticles.some(p => p.id === id)) {
        const placeholder = placeholderArticles.find(p => p.id === id);
        if (placeholder) {
            const imageInfo = typedImageData[placeholder.id as keyof typeof typedImageData];
            article = {
                ...placeholder,
                imageUrl: imageInfo ? `https://picsum.photos/seed/${imageInfo.seed}/800/600` : `https://picsum.photos/seed/${placeholder.id}/800/600`,
                'data-ai-hint': imageInfo ? imageInfo.hint : 'news article',
            };
        }
    }

    return article;
}


export async function updateArticle(id: string, data: ArticleFormValues & { categoryIds: string[] }): Promise<Article> {
  const docRef = doc(db, 'articles', id);
  let imageUrl = data.imageUrl || null;
  let imagePath = data.imagePath || ''; 

  if (data.imageUrl && data.imageUrl.startsWith('data:')) {
    if (imagePath) {
        const oldImageRef = ref(storage, imagePath);
        await deleteObject(oldImageRef).catch(e => console.error("Failed to delete old image, continuing...", e));
    }
    try {
        const watermarkedImageResult = await watermarkImage({
          imageDataUri: data.imageUrl,
          watermarkText: 'Karnataka News Pulse',
        });
        const uploadResult = await uploadImageToStorage(watermarkedImageResult.imageDataUri, 'articles', `${Date.now()}_${Math.random().toString(36).substring(2)}`);
        imageUrl = uploadResult.imageUrl;
        imagePath = uploadResult.imagePath;
    } catch (error: any) {
        console.warn(`Watermarking or upload failed, proceeding with original image. Error: ${error.message}`);
        try {
            const uploadResult = await uploadImageToStorage(data.imageUrl, 'articles', `${Date.now()}_${Math.random().toString(36).substring(2)}`);
            imageUrl = uploadResult.imageUrl;
            imagePath = uploadResult.imagePath;
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
        const imageRef = ref(storage, article.imagePath);
        await deleteObject(imageRef).catch(e => console.error("Failed to delete image from storage:", e));
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

    

    