
import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp, getDocs, deleteDoc, writeBatch } from "firebase/firestore";

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
  { id: "bagalkote", name: "ಬಾಗಲಕೋಟೆ" },
  { id: "ballari", name: "ಬಳ್ಳಾರಿ" },
  { id: "belagavi", name: "ಬೆಳಗಾವಿ" },
  { id: "bengaluru-rural", name: "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ" },
  { id: "bengaluru-urban", name: "ಬೆಂಗಳೂರು ನಗರ" },
  { id: "bidar", name: "ಬೀದರ್" },
  { id: "chamarajanagara", name: "ಚಾಮರಾಜನಗರ" },
  { id: "chikkaballapura", name: "ಚಿಕ್ಕಬಳ್ಳಾಪುರ" },
  { id: "chikkamagaluru", name: "ಚಿಕ್ಕಮಗಳೂರು" },
  { id: "chitradurga", name: "ಚಿತ್ರದುರ್ಗ" },
  { id: "dakshina-kannada", name: "ದಕ್ಷಿಣ ಕನ್ನಡ" },
  { id: "davanagere", name: "ದಾವಣಗೆರೆ" },
  { id: "dharwad", name: "ಧಾರವಾಡ" },
  { id: "gadag", name: "ಗದಗ" },
  { id: "hassan", name: "ಹಾಸನ" },
  { id: "haveri", name: "ಹಾವೇರಿ" },
  { id: "kalaburagi", name: "ಕಲಬುರಗಿ" },
  { id: "kodagu", name: "ಕೊಡಗು" },
  { id: "kolar", name: "ಕೋಲಾರ" },
  { id: "koppala", name: "ಕೊಪ್ಪಳ" },
  { id: "mandya", name: "ಮಂಡ್ಯ" },
  { id: "mysuru", name: "ಮೈಸೂರು" },
  { id: "raichuru", name: "ರಾಯಚೂರು" },
  { id: "ramanagara", name: "ರಾಮನಗರ" },
  { id: "shivamogga", name: "ಶಿವಮೊಗ್ಗ" },
  { id: "tumakuru", name: "ತುಮಕೂರು" },
  { id: "udupi", name: "ಉಡುಪಿ" },
  { id: "uttara-kannada", name: "ಉತ್ತರ ಕನ್ನಡ" },
  { id: "vijayanagara", name: "ವಿಜಯನಗರ" },
  { id: "yadgiri", name: "ಯಾದಗಿರಿ" }
];

const categories = ["Politics", "Sports", "Business", "Technology", "Culture", "Health"];

async function clearCollection(collectionName: string) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  if (snapshot.empty) return;
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function populateDistricts() {
  const batch = writeBatch(db);
  const districtsRef = collection(db, "districts");
  districts.forEach(district => {
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
        categoryIds: [categories[Math.floor(Math.random() * categories.length)].toLowerCase()],
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
        }
      });
    }
  });
  return newsList;
}

async function populateNews() {
  const batch = writeBatch(db);
  const newsRef = collection(db, "news_articles");
  const newsList = generateSampleNews();
  newsList.forEach(news => {
    const docRef = doc(newsRef);
    batch.set(docRef, news);
  });
  await batch.commit();
}

export async function POST() {
  try {
    // 1. Clear collections
    await clearCollection("districts");
    await clearCollection("news_articles");
    
    // 2. Populate collections
    await populateDistricts();
    await populateNews();
    
    return NextResponse.json({ message: "Firestore seeded successfully!" });
  } catch (err: any) {
    console.error("Error seeding Firestore:", err);
    return NextResponse.json({ message: "Failed to seed Firestore", error: err.message }, { status: 500 });
  }
}
