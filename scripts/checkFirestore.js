import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase config (same as your populate script)
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
  const districtsCol = collection(db, "districts");
  const snapshot = await getDocs(districtsCol);
  const districts = snapshot.docs.map(doc => doc.data());
  console.log("Districts:", districts);
}

async function fetchNews() {
  const newsCol = collection(db, "news_articles");
  const snapshot = await getDocs(newsCol);
  const news = snapshot.docs.map(doc => doc.data());
  console.log(`Total News Articles: ${news.length}`);
  console.log("Sample News:", news.slice(0, 5)); // show first 5 for brevity
}

async function main() {
  await fetchDistricts();
  await fetchNews();
}

main().catch(console.error);
