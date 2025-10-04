
'use server';

import { db } from '@/lib/firebase';
import type { Article, ArticleFormValues } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, where, QueryConstraint, Timestamp, limit, startAfter, DocumentSnapshot, orderBy } from 'firebase/firestore';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getDistricts } from './districts';
import { getCategories } from './categories';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

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
        ...data,
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

  const { categoryId, ...restOfData } = data;

  const docRef = await addDoc(articlesCollection, {
    ...restOfData,
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

export async function getArticles(options: {
    pageSize?: number;
    startAfterDocId?: string | null;
    categorySlug?: string;
    districtId?: string;
} = {}): Promise<{ articles: Article[], lastVisibleDocId: string | null }> {
    const { pageSize = 10, startAfterDocId, categorySlug, districtId } = options;
    
    const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
    ];

    if (categorySlug && categorySlug !== 'all') {
        const categories = await getCategories();
        const category = categories.find(c => c.slug === categorySlug);
        if (category) {
            constraints.push(where('categoryIds', 'array-contains', category.id));
        }
    }

    if (districtId && districtId !== 'all') {
        constraints.push(where('districtId', '==', districtId));
    }
    
    if (startAfterDocId) {
        const startDoc = await getDoc(doc(db, 'articles', startAfterDocId));
        if (startDoc.exists()) {
            constraints.push(startAfter(startDoc));
        }
    }

    constraints.push(limit(pageSize));

    try {
        const q = query(articlesCollection, ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { articles: [], lastVisibleDocId: null };
        }
        
        const articles = await Promise.all(snapshot.docs.map(serializeArticle));
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

        // Check if there are more documents
        const nextQueryConstraints = [...constraints];
        nextQueryConstraints.pop(); // remove previous limit
        if (startAfterDocId) { // We need to manage the constraints array carefully
            nextQueryConstraints.pop(); // remove previous startAfter
        }
        nextQueryConstraints.push(startAfter(lastVisibleDoc), limit(1));
        const nextQuery = query(articlesCollection, ...nextQueryConstraints);
        const nextSnapshot = await getDocs(nextQuery);

        return {
            articles,
            lastVisibleDocId: nextSnapshot.empty ? null : lastVisibleDoc.id,
        };
        
    } catch (error: any) {
        console.error(`Error fetching articles: "${error.message}"`);
        if (error.code === 'failed-precondition') {
            console.error("Firestore query failed. This is likely due to a missing composite index. Please create the required index in your Firebase console based on the error message in the server logs.");
        }
        return { articles: [], lastVisibleDocId: null };
    }
}

export async function getArticle(id: string): Promise<Article | null> {
  const docRef = doc(db, 'articles', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    updateDoc(docRef, { views: (docSnap.data().views || 0) + 1 });
    return serializeArticle(docSnap);
  } else {
    return null;
  }
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
        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            where('categoryIds', 'array-contains', categoryId),
            limit(4) 
        ];
        
        const q = query(articlesCollection, ...constraints);
        const snapshot = await getDocs(q);
        articles = await Promise.all(snapshot.docs.map(serializeArticle));

    } catch (error: any) {
        console.error("Query for related articles failed:", error);
        return [];
    }
    
    return articles.filter(article => article.id !== currentArticleId).slice(0, 3);
}
