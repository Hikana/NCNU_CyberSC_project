// firebase.js 或 firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// ⚠️ 安全提醒：在生產環境中，建議將這些配置放到環境變數中
// 例如：apiKey: import.meta.env.VITE_FIREBASE_API_KEY
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
let app;
let analytics;
let db;
let auth;

try {
  // 初始化 Firebase
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase 應用初始化成功");

  // 初始化 Analytics（僅在瀏覽器環境中）
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
    console.log("✅ Firebase Analytics 初始化成功");
  }

  // 初始化 Firestore
  db = getFirestore(app);
  console.log("✅ Firestore 初始化成功");

  // 初始化 Auth
  auth = getAuth(app);
  console.log("✅ Firebase Auth 初始化成功");

} catch (error) {
  console.error("❌ Firebase 初始化失敗:", error);
}

// 匯出服務
export { db, auth, analytics, app };

// 預設匯出 auth（方便在其他地方使用）
export default auth;