
'use server';

import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const districts = [
  { id: 'bagalkote', name: 'ಬಾಗಲಕೋಟೆ' },
  { id: 'ballari', name: 'ಬಳ್ಳಾರಿ' },
  { id: 'belagavi', name: 'ಬೆಳಗಾವಿ' },
  { id: 'bengaluru-rural', name: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ' },
  { id: 'bengaluru-urban', name: 'ಬೆಂಗಳೂರು ನಗರ' },
  { id: 'bidar', name: 'ಬೀದರ್' },
  { id: 'chamarajanagara', name: 'ಚಾಮರಾಜನಗರ' },
  { id: 'chikkaballapura', name: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ' },
  { id: 'chikkamagaluru', name: 'ಚಿಕ್ಕಮಗಳೂರು' },
  { id: 'chitradurga', name: 'ಚಿತ್ರದುರ್ಗ' },
  { id: 'dakshina-kannada', name: 'ದಕ್ಷಿಣ ಕನ್ನಡ' },
  { id: 'davanagere', name: 'ದಾವಣಗೆರೆ' },
  { id: 'dharwad', name: 'ಧಾರವಾಡ' },
  { id: 'gadag', name: 'ಗದಗ' },
  { id: 'hassan', name: 'ಹಾಸನ' },
  { id: 'haveri', name: 'ಹಾವೇರಿ' },
  { id: 'kalaburagi', name: 'ಕಲಬುರಗಿ' },
  { id: 'kodagu', name: 'ಕೊಡಗು' },
  { id: 'kolar', name: 'ಕೋಲಾರ' },
  { id: 'koppala', name: 'ಕೊಪ್ಪಳ' },
  { id: 'mandya', name: 'ಮಂಡ್ಯ' },
  { id: 'mysuru', name: 'ಮೈಸೂರು' },
  { id: 'raichuru', name: 'ರಾಯಚೂರು' },
  { id: 'ramanagara', name: 'ರಾಮನಗರ' },
  { id: 'shivamogga', name: 'ಶಿವಮೊಗ್ಗ' },
  { id: 'tumakuru', name: 'ತುಮಕೂರು' },
  { id: 'udupi', name: 'ಉಡುಪಿ' },
  { id: 'uttara-kannada', name: 'ಉತ್ತರ ಕನ್ನಡ' },
  { id: 'vijayanagara', name: 'ವಿಜಯನಗರ' },
  { id: 'yadgiri', name: 'ಯಾದಗಿರಿ' },
];

const categories = [
  'Politics',
  'Sports',
  'Business',
  'Technology',
  'Culture',
  'Health',
];

const sampleJobs = [
  {
    title: 'Village Accountant',
    company: 'Karnataka Revenue Department',
    location: 'Across Karnataka',
    qualification: 'PUC / 12th Standard',
    description: 'Responsible for maintaining land records and revenue collection at the village level. Requires strong local knowledge and basic computer skills.',
    applyLink: 'https://kpsc.kar.nic.in/',
    jobType: 'Government',
    lastDateToApply: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
  },
  {
    title: 'Software Development Engineer',
    company: 'Tech Solutions Inc.',
    location: 'Bengaluru',
    qualification: 'B.E/B.Tech in Computer Science',
    description: 'Join our dynamic team to build next-generation web applications using React and Node.js. 2+ years of experience preferred.',
    applyLink: 'https://example.com/job/sde',
    jobType: 'Private',
    lastDateToApply: new Date(new Date().setDate(new Date().getDate() + 45)), // 45 days from now
  },
  {
    title: 'Digital Marketing Intern',
    company: 'Growth Hackers',
    location: 'Mysuru',
    qualification: 'Any Degree (BBA/BBM preferred)',
    description: 'A 3-month internship program for aspiring digital marketers. Learn SEO, SEM, and social media marketing from industry experts.',
    applyLink: 'https://example.com/job/intern',
    jobType: 'Internship',
    lastDateToApply: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 days from now
  },
  {
    title: 'Data Entry Operator (Fresher)',
    company: 'InfoData Services',
    location: 'Hubballi',
    qualification: 'Any Degree with good typing speed',
    description: 'Entry-level position for freshers. Responsible for entering data from various sources into our system. Training will be provided.',
    applyLink: 'https://example.com/job/data-entry',
    jobType: 'Fresher',
    lastDateToApply: new Date(new Date().setDate(new Date().getDate() + 20)), // 20 days from now
  },
];


async function clearCollection(collectionName: string) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function populateDistricts() {
  const batch = writeBatch(db);
  const districtsRef = collection(db, 'districts');
  districts.forEach((district) => {
    const docRef = doc(districtsRef, district.id);
    batch.set(docRef, district);
  });
  await batch.commit();
}

function generateSampleNews() {
  const newsList: any[] = [];
  districts.forEach((district) => {
    const count = Math.floor(Math.random() * 4) + 2; // 2 to 5 articles
    for (let i = 1; i <= count; i++) {
      newsList.push({
        title: `${district.name} Sample News ${i}`,
        categoryIds: [
          categories[Math.floor(Math.random() * categories.length)].toLowerCase(),
        ],
        districtId: district.id,
        content: `This is a sample news article ${i} for ${district.name}. The content is generated for demonstration purposes.`,
        imageUrl: `https://picsum.photos/seed/${district.id}-${i}/600/400`,
        status: 'published',
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        author: 'KNP Staff',
        authorId: 'system',
        views: Math.floor(Math.random() * 1000),
        seo: {
          metaDescription: `Read the latest sample news ${i} from ${district.name}.`,
          keywords: [district.name, `news ${i}`, 'sample'],
        },
      });
    }
  });
  return newsList;
}

async function populateNews() {
  const batch = writeBatch(db);
  const newsRef = collection(db, 'news_articles');
  const newsList = generateSampleNews();
  newsList.forEach((news) => {
    const docRef = doc(newsRef);
    batch.set(docRef, news);
  });
  await batch.commit();
}

async function populateJobs() {
  const batch = writeBatch(db);
  const jobsRef = collection(db, 'jobs');
  sampleJobs.forEach((job) => {
    const docRef = doc(jobsRef);
    batch.set(docRef, {
      ...job,
      lastDateToApply: Timestamp.fromDate(job.lastDateToApply),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function POST() {
  try {
    // 1. Clear collections
    await clearCollection('districts');
    await clearCollection('news_articles');
    await clearCollection('jobs');


    // 2. Populate collections
    await populateDistricts();
    await populateNews();
    await populateJobs();

    return NextResponse.json({ message: 'Firestore seeded successfully!' });
  } catch (err: any) {
    console.error('Error seeding Firestore:', err);
    return NextResponse.json(
      { message: 'Failed to seed Firestore', error: err.message },
      { status: 500 }
    );
  }
}
