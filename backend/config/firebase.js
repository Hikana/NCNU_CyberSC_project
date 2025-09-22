const admin = require('firebase-admin');
// 確保金鑰檔案路徑正確
const serviceAccount = require('../firebase/firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

console.log('🔥 Firebase Admin SDK initialized successfully.');

module.exports = { db, FieldValue };
