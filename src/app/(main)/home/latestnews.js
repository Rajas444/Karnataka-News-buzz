import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; // your Firebase config

async function fetchLatestNews() {
  const q = query(
    collection(db, "news_articles"),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
