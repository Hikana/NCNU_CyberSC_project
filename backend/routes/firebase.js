// backend/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json'); // ←你的 json 檔名

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };
