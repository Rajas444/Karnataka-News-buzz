
'use server';

import { db } from '@/lib/firebase';
import { collection, writeBatch, getDocs } from 'firebase/firestore';
import { placeholderArticles } from '@/lib/placeholder-data';
import placeholderDistrictsData from '@/lib/placeholder-districts.json';
import { placeholderCategories } from '@/lib/placeholder-data';

export async function seedDatabase() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }

  const articlesCollection = collection(db, 'articles');
  const categoriesCollection = collection(db, 'categories');
  const districtsCollection = collection(db, 'districts');

  // Check if collections are empty before seeding
  const articlesSnap = await getDocs(articlesCollection);
  const categoriesSnap = await getDocs(categoriesCollection);
  const districtsSnap = await getDocs(districtsCollection);

  if (!articlesSnap.empty || !categoriesSnap.empty || !districtsSnap.empty) {
      let populatedCollections = [];
      if (!articlesSnap.empty) populatedCollections.push('articles');
      if (!categoriesSnap.empty) populatedCollections.push('categories');
      if (!districtsSnap.empty) populatedCollections.push('districts');

      throw new Error(`One or more collections (${populatedCollections.join(', ')}) are not empty. Seeding is aborted to prevent data duplication.`);
  }


  const batch = writeBatch(db);

  // Seed Articles
  placeholderArticles.forEach(article => {
    const docRef = collection(db, 'articles').doc(article.id);
    const { id, district, ...articleData } = article;
    batch.set(docRef, {
        ...articleData,
        publishedAt: new Date(article.publishedAt),
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt),
    });
  });

  // Seed Categories
  placeholderCategories.forEach(category => {
    const docRef = collection(db, 'categories').doc(category.slug);
    batch.set(docRef, { name: category.name, slug: category.slug });
  });

  // Seed Districts
  placeholderDistrictsData.forEach(district => {
    const docRef = collection(db, 'districts').doc(district.id);
    batch.set(docRef, { name: district.name });
  });

  await batch.commit();

  return {
    articles: placeholderArticles.length,
    categories: placeholderCategories.length,
    districts: placeholderDistrictsData.length,
  };
}
