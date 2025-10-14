// 將前端 stores/achievement.js 中的清單，轉成後端成就結構並批次寫入 Firestore

const { db } = require('../config/firebase');

// 從前端 stores/achievement.js 搬移過來的成就清單（改為數字化獎勵結構）
const sourceAchievements = [
  // 答題相關
  { id: 'first_question', name: '初學者', description: '答對第一題', maxProgress: 1, reward: { techPoints: 30, wallDefense: 5 } },
  { id: 'question_master', name: '答題大師', description: '答對100題', maxProgress: 100, reward: { techPoints: 200, wallDefense: 15 } },
  { id: 'question_expert', name: '答題專家', description: '答對200題', maxProgress: 200, reward: { techPoints: 500, wallDefense: 30 } },
  // 建築相關
  { id: 'first_building', name: '建築新手', description: '建造第一座建築', maxProgress: 1, reward: { techPoints: 30, wallDefense:  5 } },
  { id: 'building_master', name: '建築大師', description: '建造40座建築', maxProgress: 40, reward: { techPoints: 300, wallDefense: 15 } },
  { id: 'city_builder', name: '城市建造者', description: '建造80座建築', maxProgress: 80, reward: { techPoints: 600, wallDefense: 30 } },
  // 資安相關
  { id: 'first_event', name: '資安新手', description: '解決第一個資安事件', maxProgress: 1, reward: { techPoints: 30, wallDefense: 5 } },
  { id: 'event_master', name: '資安高手', description: '解決5個資安事件', maxProgress: 5, reward: { techPoints: 300, wallDefense: 15 } },
  { id: 'event_expert', name: '資安專家', description: '解決12個資安事件', maxProgress: 12, reward: { techPoints: 600, wallDefense: 30 } },
];


function deriveCondition(desc, maxProgress) {
  // 從描述推論 condition.field 與 value
  if (/答對/.test(desc)) {
    const m = desc.match(/答對(\d+|第一)題/);
    const value = m ? (m[1] === '第一' ? 1 : Number(m[1])) : maxProgress;
    return { field: 'answeredCount', value };
  }
  if (/建造/.test(desc)) {
    const m = desc.match(/建造(\d+|第一座)建築/);
    const value = m ? (m[1] === '第一座' ? 1 : Number(m[1])) : maxProgress;
    return { field: 'itemCount', value };
  }
  if (/解決/.test(desc)) {
    const m = desc.match(/解決(\d+)個資安事件/);
    const value = m ? Number(m[1]) : maxProgress;
    return { field: 'eventCount', value };
  }
}

// 轉換為後端儲存結構
const achievements = sourceAchievements.map(a => ({
  id: a.id,
  name: a.name,
  description: a.description,
  condition: deriveCondition(a.description, a.maxProgress),
  reward: {
    techPoints: a.reward?.techPoints ?? 0,
    wallDefense: a.reward?.wallDefense ?? 0,
  },
  status: 'locked',
  progress: 0,
  maxProgress: a.maxProgress || (deriveCondition(a.description, 1).value),
}));

async function importAchievements() {
  console.log('開始匯入成就資料...');

  const batch = db.batch();
  const colRef = db.collection('achievement');

  for (const ach of achievements) {
    const docRef = colRef.doc(ach.id);
    batch.set(docRef, ach, { merge: true });
  }

  try {
    await batch.commit();
    console.log('成就資料匯入成功！');
  } catch (err) {
    console.error('成就資料匯入失敗：', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

importAchievements();


