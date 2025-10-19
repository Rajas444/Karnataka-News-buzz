import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function clearDistricts() {
  const districtsRef = collection(db, "districts");
  const snapshot = await getDocs(districtsRef);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(districtsRef, docSnap.id));
  }
  console.log("All districts deleted!");
}

clearDistricts().catch(console.error);
