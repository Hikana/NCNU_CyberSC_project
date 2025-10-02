import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 讓 ESM 模式下也能用 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../firebase/firebase-adminsdk.json'))
);

initializeApp({
  credential: cert(serviceAccount)
});




const db = getFirestore();

async function initFirestore() {
  try {
    console.log("🚀 開始初始化 Firestore 資料...");

    // 1️⃣ 建立玩家背包
    const playerId = "test-user"; // 先用你現在的玩家
    const backpackRef = db.collection("players").doc(playerId).collection("backpack");
    await backpackRef.doc("tool01").set({
      name: "輸入驗證工具",
      count: 1,
      forEvent: "SQLInjection",
    });

    // 2️⃣ 建立商店範例
    await db.collection("shop").doc("item01").set({
      name: "貓窩",
      cost: { techPoints: 100 },
    });

    await db.collection("shop").doc("item02").set({
      name: "防火牆",
      cost: { techPoints: 300 },
    });

    // 3️⃣ 建立事件範例
    const eventRef = db.collection("events").doc(playerId).collection("list").doc("event01");
    await eventRef.set({
      title: "SQL Injection 攻擊",
      description: "駭客正嘗試對資料庫進行 SQL 注入攻擊！",
      requiredTool: "tool01",
      status: "unresolved",
      createdAt: new Date(),
      damagePerDay: {
        defense: 20,
        intervalSec: 120,
      },
      lastUpdated: null,
    });

    // 4️⃣ 建立成就範例
    await db.collection("achievement").doc("question_expert").set({
      id: "question_expert",
      name: "答題專家",
      description: "答對50題",
      condition: { field: "answeredCount", value: 50 },
      reward: { techPoints: 200 },
      status: "locked",
      progress: 0,
      maxProgress: 50,
    });

    console.log("✅ Firestore 初始化完成！");
  } catch (err) {
    console.error("❌ Firestore 初始化失敗:", err);
  }
}

initFirestore();
