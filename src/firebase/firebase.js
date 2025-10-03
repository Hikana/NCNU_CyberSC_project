// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";  // 🔑 Firestore 需要這個

import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyOvDG380ac3t-j5AxLj--pzCrllv53cc",
  authDomain: "test-fdd27.firebaseapp.com",
  projectId: "test-fdd27",
  storageBucket: "test-fdd27.firebasestorage.app",
  messagingSenderId: "627347263153",
  appId: "1:627347263153:web:fba05e417be80188b8dc90",
  measurementId: "G-W3LVF0XDSV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);

// // 匯出 db
// export { db };
// 匯出 db 跟 auth
export { db, auth };