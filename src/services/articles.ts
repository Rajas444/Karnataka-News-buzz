
'use server';

import { db } from '@/lib/firebase-admin';
import type { Article, ArticleFormValues } from '@/lib/types';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { getExternalNews } from './newsapi';
import { Timestamp } from 'firebase-admin/firestore';

async function serializeArticle(doc: FirebaseFirestore.DocumentSnapshot): Promise<Article> {
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
  const articlesCollection = db.collection('articles');
  
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
    publishedAt: data.status === 'published' ? Timestamp.now() : (data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : null),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    views: 0,
    author: 'Admin User',
    authorId: 'admin1',
    seo: {
      keywords: data.seoKeywords?.split(',').map(k => k.trim()) || [],
      metaDescription: data.seoMetaDescription || '',
    }
  };

  const docRef = await articlesCollection.add(newArticleData);
  const docSnap = await docRef.get();
  return serializeArticle(docSnap);
}

export async function getArticles(options?: {
  pageSize?: number;
  startAfterDocId?: string | null;
  categorySlug?: string;
  districtId?: string;
}): Promise<{ articles: Article[]; lastVisibleDocId: string | null }> {
    const articlesCollection = db.collection('articles');
    const { pageSize = 10, startAfterDocId, categorySlug, districtId } = options || {};
    
    let query: FirebaseFirestore.Query = articlesCollection;

    if (categorySlug && categorySlug !== 'all') {
        const categories = await getCategories();
        const categoryId = categories.find(c => c.slug === categorySlug)?.id;
        if (categoryId) {
            query = query.where('categoryIds', 'array-contains', categoryId);
        }
    }

    query = query.orderBy('publishedAt', 'desc');

    if (startAfterDocId) {
        const startAfterDoc = await db.collection('articles').doc(startAfterDocId).get();
        if (startAfterDoc.exists) {
            query = query.startAfter(startAfterDoc);
        }
    }

    const snapshot = await query.limit(25).get();

    const fetchedArticles = await Promise.all(snapshot.docs.map(serializeArticle));
    
    const filteredArticles = districtId && districtId !== 'all'
        ? fetchedArticles.filter(a => a.districtId === districtId)
        : fetchedArticles;
    
    const finalArticles = filteredArticles.slice(0, pageSize);
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
        const docRef = db.collection('articles').doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            article = await serializeArticle(docSnap);
            // Increment view count without waiting
            docRef.update({ views: (article.views || 0) + 1 }).catch(e => console.error("Failed to update view count:", e));
        }
    } else {
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
  const docRef = db.collection('articles').doc(id);
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
    publishedAt: data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : Timestamp.now(),
    updatedAt: Timestamp.now(),
     seo: {
      keywords: data.seoKeywords?.split(',').map(k => k.trim()) || [],
      metaDescription: data.seoMetaDescription || '',
    }
  };

  await docRef.update(updateData);

  const updatedDoc = await docRef.get();
  return serializeArticle(updatedDoc);
}

export async function deleteArticle(id: string): Promise<void> {
    const docRef = db.collection('articles').doc(id);
    const docSnap = await docRef.get();
    const article = docSnap.exists ? docSnap.data() : null;
    
    if (article?.imagePath) {
        await deleteFromCloudinary(article.imagePath);
    }
    await docRef.delete();
}

export async function getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
    if (!categoryId) return [];
    const articlesCollection = db.collection('articles');

    const q = articlesCollection
        .where('categoryIds', 'array-contains', categoryId)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(5);

    const snapshot = await q.get();
    const articles = await Promise.all(snapshot.docs.map(serializeArticle));

    return articles
        .filter(article => article.id !== currentArticleId)
        .slice(0, 3);
}
