
'use server';

import { db } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, where, QueryConstraint, Timestamp, limit, startAfter, DocumentSnapshot, orderBy } from 'firebase/firestore';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { getExternalNews } from './newsapi';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  const docRef = await addDoc(articlesCollection, newArticleData).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: articlesCollection.path,
      operation: 'create',
      requestResourceData: newArticleData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
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
    
    // We will fetch articles in batches until we have enough to satisfy the page size
    // after client-side filtering. This avoids complex composite indexes in Firestore.
    let lastDoc: DocumentSnapshot | undefined = undefined;
    if (startAfterDocId) {
        const startAfterDocSnap = await getDoc(doc(db, 'articles', startAfterDocId));
        if (startAfterDocSnap.exists()) {
            lastDoc = startAfterDocSnap;
        }
    }

    const articlesToReturn: Article[] = [];

    // Loop to fetch and filter until we have enough articles
    const constraints: QueryConstraint[] = [
        orderBy('publishedAt', 'desc'),
        limit(25) // Fetch a larger batch to filter from
    ];

    if (categorySlug && categorySlug !== 'all') {
        const categories = await getCategories();
        const categoryId = categories.find(c => c.slug === categorySlug)?.id;
        if (categoryId) {
            constraints.push(where('categoryIds', 'array-contains', categoryId));
        }
    }
    
    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }

    const q = query(articlesCollection, ...constraints);
    
    const snapshot = await getDocs(q).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: articlesCollection.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });

    const fetchedArticles = await Promise.all(snapshot.docs.map(serializeArticle));

    const filteredArticles = districtId && districtId !== 'all'
        ? fetchedArticles.filter(a => a.districtId === districtId)
        : fetchedArticles;
    
    articlesToReturn.push(...filteredArticles);
    
    const finalArticles = articlesToReturn.slice(0, pageSize);
    let newLastVisibleDocId: string | null = null;

    if (snapshot.docs.length > 0) {
        const lastVisibleDocInBatch = snapshot.docs[snapshot.docs.length - 1];
        if (finalArticles.length > 0 && lastVisibleDocInBatch) {
             newLastVisibleDocId = lastVisibleDocInBatch.id;
        }
    }
   
    return {
        articles: finalArticles,
        lastVisibleDocId: newLastVisibleDocId
    };
}

export async function getArticle(id: string): Promise<Article | null> {
    const isExternalId = id.startsWith('http');
    
    let article: Article | null = null;

    if (!isExternalId) {
        const docRef = doc(db, 'articles', id);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                article = await serializeArticle(docSnap);
                // The view count update should be a non-blocking operation
                updateDoc(docRef, { views: (article.views || 0) + 1 }).catch(e => console.error("Failed to update view count:", e));
            }
        } catch(error: any) {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        }

    } else {
        // For external articles, we can fetch them from our newsapi service
        try {
            const externalNews = await getExternalNews();
            article = externalNews.find(a => a.id === id) || null;
        } catch (error: any) {
            throw new Error(`Failed to fetch external news article: ${error.message}`);
        }
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

  updateDoc(docRef, updateData)
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
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
    deleteDoc(docRef)
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });
}

export async function getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
    if (!categoryId) return [];

    try {
        const q = query(
            articlesCollection,
            where('categoryIds', 'array-contains', categoryId),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(5) 
        );

        const snapshot = await getDocs(q);
        const articles = await Promise.all(snapshot.docs.map(serializeArticle));

        return articles
            .filter(article => article.id !== currentArticleId)
            .slice(0, 3);

    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: articlesCollection.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}
