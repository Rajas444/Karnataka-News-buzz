
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  limit,
  startAfter,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';
import { getExternalNews } from './newsapi';
import { placeholderArticles } from '@/lib/placeholder-data';
import imageData from '@/app/lib/placeholder-images.json';

type ImageData = {
  [key: string]: { seed: string; hint: string };
};
const typedImageData = imageData as ImageData;

async function serializeArticle(docSnap: any): Promise<Article> {
  const data = docSnap.data();
  if (!data) throw new Error('Document data is undefined.');

  const districts = await getDistricts();
  const districtName = data.districtId ? districts.find(d => d.id === data.districtId)?.name : undefined;

  const toISOString = (date: any) => {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate().toISOString();
    if (date instanceof Date) return date.toISOString();
    return date;
  };

  return {
    id: docSnap.id,
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
    district: districtName,
    publishedAt: toISOString(data.publishedAt),
    createdAt: toISOString(data.createdAt),
    updatedAt: toISOString(data.updatedAt),
  } as Article;
}

async function uploadImageToStorage(imageDataUri: string, folder: string, fileName: string) {
  const path = `${folder}/${fileName}`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, imageDataUri, 'data_url');
  const url = await getDownloadURL(storageRef);
  return { imageUrl: url, imagePath: path };
}

async function handleImageUpload(imageDataUri?: string | null, oldImagePath?: string) {
  if (!imageDataUri || !imageDataUri.startsWith('data:')) return { imageUrl: imageDataUri, imagePath: oldImagePath || '' };

  // Delete old image if exists
  if (oldImagePath) await deleteObject(ref(storage, oldImagePath)).catch(() => {});

  try {
    const watermarked = await watermarkImage({ imageDataUri, watermarkText: 'Karnataka News Pulse' });
    return await uploadImageToStorage(watermarked.imageDataUri, 'articles', `${Date.now()}_${Math.random().toString(36).slice(2)}`);
  } catch {
    // fallback upload without watermark
    try {
      return await uploadImageToStorage(imageDataUri, 'articles', `${Date.now()}_${Math.random().toString(36).slice(2)}`);
    } catch {
      return { imageUrl: null, imagePath: '' };
    }
  }
}

export async function createArticle(data: ArticleFormValues & { categoryIds: string[] }) {
  const articlesCollection = collection(db, 'news_articles');
  const { imageUrl, imagePath } = await handleImageUpload(data.imageUrl);

  const newDoc = {
    ...data,
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
    },
  };

  const docRef = await addDoc(articlesCollection, newDoc);
  const docSnap = await getDoc(docRef);
  return serializeArticle(docSnap);
}

export async function updateArticle(id: string, data: ArticleFormValues & { categoryIds: string[] }) {
  const docRef = doc(db, 'news_articles', id);
  const { imageUrl, imagePath } = await handleImageUpload(data.imageUrl, data.imagePath);

  const updatedDoc = {
    ...data,
    categoryIds: data.categoryIds,
    districtId: data.districtId,
    imageUrl,
    imagePath,
    updatedAt: serverTimestamp(),
    publishedAt: data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : serverTimestamp(),
    seo: {
      keywords: data.seoKeywords?.split(',').map(k => k.trim()) || [],
      metaDescription: data.seoMetaDescription || '',
    },
  };

  await updateDoc(docRef, updatedDoc);
  const docSnap = await getDoc(docRef);
  return serializeArticle(docSnap);
}

export async function deleteArticle(id: string) {
  const docRef = doc(db, 'news_articles', id);
  const docSnap = await getDoc(docRef);
  const article = docSnap.exists() ? docSnap.data() : null;

  if (article?.imagePath) await deleteObject(ref(storage, article.imagePath)).catch(() => {});
  await deleteDoc(docRef);
}

export async function getArticle(id: string): Promise<Article | null> {
  if (!id) return null;

  const isExternal = id.startsWith('http');
  let article: Article | null = null;

  if (!isExternal) {
    const docRef = doc(db, 'news_articles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      article = await serializeArticle(docSnap);
      updateDoc(docRef, { views: (article.views || 0) + 1 }).catch(() => {});
    }
  } else {
    const external = await getExternalNews();
    article = external.find(a => a.id === id) || null;
  }

  if (!article) {
    const placeholder = placeholderArticles.find(p => p.id === id);
    if (placeholder) {
      const imgInfo = typedImageData[placeholder.id as keyof typeof typedImageData];
      article = {
        ...placeholder,
        imageUrl: imgInfo ? `https://picsum.photos/seed/${imgInfo.seed}/800/600` : `https://picsum.photos/seed/${placeholder.id}/800/600`,
        'data-ai-hint': imgInfo?.hint ?? 'news article',
      };
    }
  }

  return article;
}

export async function getArticles(options?: {
  pageSize?: number;
  startAfterDocId?: string | null;
  categorySlug?: string;
  districtId?: string;
}) {
  try {
    const articlesCollection = collection(db, 'news_articles');
    const { pageSize = 10, startAfterDocId, categorySlug, districtId } = options || {};
    const constraints: any[] = [where('status', '==', 'published')];

    if (districtId && districtId !== 'all') {
      constraints.push(where('districtId', '==', districtId));
    }
    if (categorySlug && categorySlug !== 'all') {
      const categories = await getCategories();
      const catId = categories.find(c => c.slug === categorySlug)?.id;
      if (catId) {
        constraints.push(where('categoryIds', 'array-contains', catId));
      }
    }

    constraints.push(orderBy('publishedAt', 'desc'), limit(pageSize));

    if (startAfterDocId) {
      const startDoc = await getDoc(doc(db, 'news_articles', startAfterDocId));
      if (startDoc.exists()) {
        constraints.push(startAfter(startDoc));
      }
    }

    const q = query(articlesCollection, ...constraints);
    const snapshot = await getDocs(q);


    if (snapshot.empty) {
      return { articles: [], lastVisibleDocId: null };
    }

    const fetched = await Promise.all(snapshot.docs.map(serializeArticle));
    const lastVisible = snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1].id : null;
    
    return { articles: fetched, lastVisibleDocId: lastVisible };

  } catch (error: any) {
    console.error("[getArticles] CRITICAL ERROR fetching articles from Firestore:", error);
    return { articles: [], lastVisibleDocId: null };
  }
}

export async function getRelatedArticles(categoryId: string, currentArticleId: string) {
  if (!categoryId) return [];
  const articlesCollection = collection(db, 'news_articles');
  const q = query(
    articlesCollection,
    where('categoryIds', 'array-contains', categoryId),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(5)
  );

  const snapshot = await getDocs(q);
  const articles = await Promise.all(snapshot.docs.map(serializeArticle));

  return articles.filter(a => a.id !== currentArticleId).slice(0, 3);
}
