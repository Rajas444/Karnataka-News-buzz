import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export function useLatestNews(limitCount = 10) {
  const [news, setNews] = useState([]);
  useEffect(() => {
    async function fetchNews() {
      const q = query(
        collection(db, "news_articles"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchNews();
  }, [limitCount]);

  return news;
}

export function useDistrictNews(districtId) {
  const [news, setNews] = useState([]);
  useEffect(() => {
    if (!districtId) return;
    async function fetchNews() {
      const q = query(
        collection(db, "news_articles"),
        where("districtId", "==", districtId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchNews();
  }, [districtId]);

  return news;
}
