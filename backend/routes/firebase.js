// backend/firebase.js
const admin = require('firebase-admin');

// 建議將金鑰檔案統一放在 config 資料夾
const serviceAccount = require('../firebase/firebase-adminsdk.json'); 

// 加上這層判斷，確保 Firebase App 只會被初始化一次
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  console.log('🔥 Firebase Admin SDK initialized successfully.');
}

// 取得 Firestore 的資料庫實例
const db = admin.firestore();
// 取得 FieldValue，方便在其他地方使用 serverTimestamp 等
const FieldValue = admin.firestore.FieldValue;

// 匯出 db 和 FieldValue，讓其他檔案可以使用
module.exports = { db, FieldValue };