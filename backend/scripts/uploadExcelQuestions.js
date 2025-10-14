// backend/scripts/uploadExcelQuestions.js
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const XLSX = require('xlsx');


// --- 初始化 Firebase Admin ---
// 確保只初始化一次
if (!admin.apps.length) {
    const serviceAccount = require('../firebase/firebase-adminsdk.json'); // 建議路徑
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
}
const db = admin.firestore();
console.log('DB 初始化測試:', db != null);

// --- 讀取 Excel 檔案 ---
const excelFilePath = path.join(__dirname, 'questions.xlsx');
if (!fs.existsSync(excelFilePath)) {
    console.error(`❌ 錯誤：找不到 Excel 檔案於 ${excelFilePath}`);
    process.exit(1); // 找不到檔案就直接結束程式
}
const workbook = XLSX.readFile(excelFilePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const questionsFromExcel = XLSX.utils.sheet_to_json(sheet);

/**
 * 主要上傳函式
 */
async function uploadQuestions() {
  const questionsCollection = db.collection('questions');
  console.log(`🚀 讀取到 ${questionsFromExcel.length} 題題目，準備開始上傳...`);
     
  // Firestore 批次寫入一次最多 500 個操作
  const BATCH_SIZE = 500;
  let batch = db.batch();
  let operationCount = 0;
  let totalUploaded = 0;

  for (const q of questionsFromExcel) {
    // 取得一個新的文件引用 (自動產生 ID)
    const docRef = questionsCollection.doc();
    
    // --- 建立符合新架構的資料物件 ---
    const questionData = {
      question: q.question,
      
      // ✅ 存索引（程式判斷正確性用）
      // 如果 answer 是數字就直接用，如果是文字就設為 0 (需要手動確認)
      answer: typeof q.answer === 'number' ? parseInt(q.answer) : 0,
      
      // ✅ 存中文正解（方便人工檢視用）
      correctanswer: q.correctanswer,
      

      
      category: q.category || 'MISC',
      
      // 篩選掉空的選項
      options: [q.option1, q.option2, q.option3, q.option4].filter(opt => 
        opt != null && opt !== '' && opt !== undefined
      ),
      
      // 新增 description 欄位
      description: q.description || '',
      
      q_code: `${q.category || 'MISC'}-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*100)}`,
      random: Math.random(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uploadedBy: 'excel-script-v3'
    };
    
    // 驗證必要欄位
    if (!questionData.question || questionData.options.length === 0) {
      console.warn(`⚠️  跳過無效題目：${questionData.question || '空題目'}`);
      continue;
    }
    
    // 將 set 操作加入批次中
    batch.set(docRef, questionData);
    operationCount++;
         
    // 當批次達到上限時，提交批次並建立新批次
    if (operationCount === BATCH_SIZE) {
      console.log(`📦 正在提交 ${BATCH_SIZE} 筆題目的批次...`);
      await batch.commit();
      totalUploaded += operationCount;
      console.log(`✅ 已完成 ${totalUploaded} / ${questionsFromExcel.length} 題上傳。`);
             
      // 重置批次和計數器
      batch = db.batch();
      operationCount = 0;
    }
  }

  // 提交剩餘的批次 (如果有的話)
  if (operationCount > 0) {
    console.log(`📦 正在提交最後 ${operationCount} 筆題目的批次...`);
    await batch.commit();
    totalUploaded += operationCount;
  }

  console.log(`🎉 所有題目匯入完成！總共 ${totalUploaded} 筆。`);
}

// 執行上傳並捕捉錯誤
uploadQuestions().catch(error => {
    console.error('💥 上傳過程中發生嚴重錯誤:', error);
});