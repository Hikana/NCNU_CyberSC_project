const admin = require('firebase-admin');
const serviceAccount = require('../firebase/firebase-adminsdk.json');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin SDK 初始化成功');
  } catch (error) {
    console.error('❌ Firebase Admin SDK 初始化失敗:', error);
    throw error;
  }
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

module.exports = { admin, db, FieldValue };