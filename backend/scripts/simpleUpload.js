// backend/scripts/simpleUpload.js

console.log('🚀 簡化版上傳腳本啟動...');

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

try {
  // 載入憑證（使用重新命名後的檔案）
  console.log('🔑 載入 Firebase 憑證...');
  const serviceAccount = require('../firebase/firebase-adminsdk.json');
  console.log('✅ 憑證載入成功，專案 ID:', serviceAccount.project_id);

  // 初始化 Firebase
  console.log('🔧 初始化 Firebase Admin SDK...');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  console.log('✅ Firebase 初始化成功');

  // 取得 Firestore 實例
  const db = admin.firestore();
  console.log('✅ Firestore 實例建立成功');

  // 載入題目
  console.log('📝 載入題目檔案...');
  const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
  console.log(`✅ 載入 ${questions.length} 題題目`);

  // 上傳題目的主要函數
  async function uploadQuestions() {
    console.log('📤 開始上傳題目...');
    
    try {
      // 先測試連線
      console.log('🧪 測試 Firestore 連線...');
      const testRef = db.collection('test').doc('connection');
      await testRef.set({
        message: 'Connection test',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Firestore 連線正常');
      
      // 刪除測試文件
      await testRef.delete();
      
      // 上傳題目
      console.log('📤 上傳題目到 questions collection...');
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const docRef = db.collection('questions').doc(`question_${i}`);
        
        await docRef.set({
          ...question,
          id: `question_${i}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          uploadedBy: 'simple-script'
        });
        
        console.log(`✅ 上傳題目 ${i + 1}/${questions.length}: ${question.question.substring(0, 30)}...`);
      }
      
      console.log('🎉 所有題目上傳完成！');
      
      // 驗證結果
      console.log('🔍 驗證上傳結果...');
      const snapshot = await db.collection('questions').get();
      console.log(`📊 Firestore 中共有 ${snapshot.size} 題題目`);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${doc.id}: ${data.question}`);
      });
      
      console.log('\n🎯 上傳成功！');
      console.log(`🌐 檢查結果: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore`);
      
    } catch (error) {
      console.error('❌ 上傳過程發生錯誤:', error);
    }
  }

  // 執行上傳
  uploadQuestions().then(() => {
    console.log('✅ 腳本執行完成，程序即將結束');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ 腳本執行失敗:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ 初始化失敗:', error);
  console.error('請檢查憑證檔案是否正確');
  process.exit(1);
}