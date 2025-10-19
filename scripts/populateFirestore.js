import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

// Districts array
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

async function populateNews() {
  const newsRef = collection(db, "news_articles");
  const newsList = [];

  for (const district of districts) {
    const articleCount = Math.floor(Math.random() * 3) + 2; // 2-4 articles per district
    for (let i = 1; i <= articleCount; i++) {
      newsList.push({
        title: `${district.name} Sample News ${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        district: district.id, // ✅ properly assign district id
        content: `This is a sample news article ${i} for ${district.name}.`,
        imageUrl: `https://picsum.photos/seed/${district.id}-${i}/600/400`,
        timestamp: serverTimestamp()
      });
    }
  }

  for (const news of newsList) {
    const docRef = doc(newsRef);
    await setDoc(docRef, news);
  }

  console.log(`Added ${newsList.length} sample news articles successfully!`);
}

populateNews().catch(console.error);
