// backend/scripts/uploadExcelQuestions.js

const fs = require('fs');
const path = require('path'); // 確保有引入 path 模組
const admin = require('firebase-admin');
const XLSX = require('xlsx');

// 讀取 Firebase 憑證
const serviceAccount = require('../firebase/firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});
const db = admin.firestore();

// 讀取 Excel
// const workbook = XLSX.readFile('../scripts/questions.xlsx'); // 原始行
const excelFilePath = path.join(__dirname, 'questions.xlsx'); // 正確路徑：在當前腳本目錄下的 questions.xlsx
const workbook = XLSX.readFile(excelFilePath); //
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const questions = XLSX.utils.sheet_to_json(sheet);

async function uploadQuestions() {
  console.log(`🚀 讀取到 ${questions.length} 題題目，開始上傳...`);
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const questionId = `question${String(i+ 1).padStart(2, '0')}`;

    await db.collection('questions').doc(questionId).set({
      question: q.question,
      options: [q.option1, q.option2, q.option3, q.option4],
      answer: q.answer,
      category: q.category,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uploadedBy: 'excel-script'
    });

    console.log(`✅ 已上傳: ${questionId} (${q.question.substring(0, 20)}...)`);
  }

  console.log('🎉 所有題目匯入完成！');
}

uploadQuestions().catch(console.error);