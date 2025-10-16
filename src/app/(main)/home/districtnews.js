import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

async function fetchDistrictNews(districtId) {
  const q = query(
    collection(db, "news_articles"),
    where("districtId", "==", districtId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
