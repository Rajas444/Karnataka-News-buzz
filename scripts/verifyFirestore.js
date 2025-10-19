import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDX_GFsHRhloy9ZceOfEcnFpIX4WiBHf38",
  authDomain: "karnataka-news-buzz.firebaseapp.com",
  projectId: "karnataka-news-buzz",
  storageBucket: "karnataka-news-buzz.firebasestorage.app",
  messagingSenderId: "298153641015",
  appId: "1:298153641015:web:c285db9ada95a1fbe22bb2",
  measurementId: "G-KG01P2G0VK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchDistricts() {
  const snapshot = await getDocs(collection(db, "districts"));
  const districts = snapshot.docs.map(doc => doc.id);
  console.log(`✅ Found ${districts.length} districts.`);
  return districts;
}

async function fetchNews() {
  const snapshot = await getDocs(collection(db, "news_articles"));
  const news = snapshot.docs.map(doc => doc.data());
  console.log(`📰 Total news articles: ${news.length}`);
  return news;
}

async function verifyNewsDistricts(districts, news) {
  let invalidCount = 0;
  news.forEach(article => {
    if (!districts.includes(article.district)) {
      invalidCount++;
      console.warn(`⚠️ Invalid district found in article: "${article.title}" => ${article.district}`);
    }
  });

  if (invalidCount === 0) {
    console.log("✅ All news articles are linked to valid districts.");
  } else {
    console.log(`❌ ${invalidCount} articles have invalid district references.`);
  }
}

async function main() {
  const districts = await fetchDistricts();
  const news = await fetchNews();
  await verifyNewsDistricts(districts, news);
}

main().catch(console.error);
