const admin = require('firebase-admin');

// 載入服務帳戶金鑰
const serviceAccount = require('../firebase/firebase-adminsdk.json');

// 檢查是否已經初始化過 Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  console.log('🔥 Firebase Admin SDK initialized successfully from config.');
}

// 導出 Firestore 資料庫實例
const db = admin.firestore();

module.exports = { db, admin };
