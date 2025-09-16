
'use server';

import { db, storage } from '@/lib/firebase';
import type { Article, ArticleFormValues, NewsdataArticle } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, FieldPath, QueryConstraint, Timestamp, limit, startAfter, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { watermarkImage } from '@/ai/flows/watermark-image-flow';
import { getCategories } from './categories';

const articlesCollection = collection(db, 'articles');

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
  const newArticle = docSnap.data();

  return { 
    id: docRef.id, 
    ...newArticle,
    publishedAt: (newArticle?.publishedAt as Timestamp).toDate(),
    createdAt: (newArticle?.createdAt as Timestamp).toDate(),
    updatedAt: (newArticle?.updatedAt as Timestamp).toDate(),
  } as Article;
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


    // 3. Create article object
    const newArticle: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
        title: apiArticle.title,
        content: apiArticle.content || apiArticle.description || 'No content available.',
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

    // 4. Save to Firestore
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
    lastVisible?: any; 
    pageSize?: number;
    category?: string; // This can be slug or ID
    district?: string;
}): Promise<{ articles: Article[], lastVisible: any | null }> {
    
    const { lastVisible, pageSize = 10, category, district } = options || {};
    const constraints: QueryConstraint[] = [];

    if (category && category !== 'general') {
        const allCategories = await getCategories();
        // Support both slug and ID for category filter
        const categoryDoc = allCategories.find(c => c.slug === category || c.id === category);
        if (categoryDoc) {
            constraints.push(where('categoryIds', 'array-contains', categoryDoc.id));
        }
    }

    if (district && district !== 'all') {
        constraints.push(where('district', '==', district));
    }
    
    constraints.push(orderBy('publishedAt', 'desc'));
    
    if (lastVisible) {
        constraints.push(startAfter(lastVisible));
    }
    
    constraints.push(limit(pageSize));
    
    const q = query(articlesCollection, ...constraints);

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            publishedAt: (data.publishedAt as Timestamp)?.toDate(),
            createdAt: (data.createdAt as Timestamp)?.toDate(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate(),
        } as Article;
    });

    const newLastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { articles, lastVisible: newLastVisible };
}


// READ (one)
export async function getArticle(id: string): Promise<Article | null> {
  const docRef = doc(db, 'articles', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        publishedAt: (data.publishedAt as Timestamp)?.toDate(),
        createdAt: (data.createdAt as Timestamp)?.toDate(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    } as Article;
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
  const updatedData = updatedDoc.data();

  return { 
    id, 
    ...updatedData,
    publishedAt: (updatedData?.publishedAt as Timestamp).toDate(),
    createdAt: (updatedData?.createdAt as Timestamp).toDate(),
    updatedAt: (updatedData?.updatedAt as Timestamp).toDate(),
 } as Article;
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
