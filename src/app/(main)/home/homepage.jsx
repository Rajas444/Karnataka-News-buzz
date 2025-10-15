// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { fetchRecentNews } from "../services/newsService";

export default function HomePage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchRecentNews().then(setNews);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Latest Karnataka News</h1>

      {news.map(article => (
        <div key={article.id} className="border-b py-3">
          <h2 className="font-semibold text-lg">{article.title}</h2>
          <p>{article.content}</p>
        </div>
      ))}
    </div>
  );
}
// inside HomePage.jsx
import { collection, query, orderBy, startAfter, limit, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const [lastDoc, setLastDoc] = useState(null);

async function loadMore() {
  const q = query(
    collection(db, "articles"),
    orderBy("createdAt", "desc"),
    startAfter(lastDoc),
    limit(10)
  );
  const snapshot = await getDocs(q);
  const newArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
  setNews(prev => [...prev, ...newArticles]);
}
