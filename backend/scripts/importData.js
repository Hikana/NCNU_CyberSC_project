// importData.js
const admin = require('firebase-admin');

// 替換成你的服務帳戶金鑰檔案路徑
const serviceAccount = require('../firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 你要匯入的資料陣列
const dataToImport = [
  {
    "itemId": "sec_waf",
    "name": "WAF（Web Application Firewall）",
    "key": "waf",
    "desc": "用來防禦 Web 攻擊的防火牆，可過濾惡意流量。",
    "qty": 1,
    "defenseValue": 70,
    "type": "defense",
    "icon": "icons/waf.png"
  },
  {
    "itemId": "sec_prepared_statements",
    "name": "Prepared Statements（參數化查詢）",
    "key": "prepared_statements",
    "desc": "避免 SQL Injection 的方法，透過參數化查詢提升安全性。",
    "qty": 1,
    "defenseValue": 60,
    "type": "defense",
    "icon": "icons/sql.png"
  },
  {
    "itemId": "sec_output_encoding",
    "name": "Output Encoding（輸出編碼）",
    "key": "output_encoding",
    "desc": "透過編碼避免跨站腳本攻擊（XSS）。",
    "qty": 1,
    "defenseValue": 55,
    "type": "defense",
    "icon": "icons/xss.png"
  },
  {
    "itemId": "sec_csrf_token",
    "name": "CSRF Token（隨機驗證碼）",
    "key": "csrf_token",
    "desc": "防止跨站請求偽造（CSRF）攻擊的隨機驗證機制。",
    "qty": 1,
    "defenseValue": 65,
    "type": "defense",
    "icon": "icons/csrf.png"
  },
  {
    "itemId": "sec_mfa",
    "name": "MFA（多因素驗證）",
    "key": "mfa",
    "desc": "需要多種身份驗證方式才能登入，提升帳號安全性。",
    "qty": 1,
    "defenseValue": 80,
    "type": "defense",
    "icon": "icons/mfa.png"
  },
  {
    "itemId": "sec_security_awareness",
    "name": "Security Awareness Training（資安意識訓練）",
    "key": "security_awareness",
    "desc": "透過教育訓練提升使用者的資安意識，減少人為風險。",
    "qty": 1,
    "defenseValue": 40,
    "type": "awareness",
    "icon": "icons/training.png"
  },
  {
    "itemId": "sec_tls_https",
    "name": "TLS/HTTPS 加密",
    "key": "tls_https",
    "desc": "透過加密確保資料在傳輸過程中的安全性。",
    "qty": 1,
    "defenseValue": 75,
    "type": "network",
    "icon": "icons/https.png"
  },
  {
    "itemId": "sec_backup",
    "name": "定期備份（3-2-1 備份原則）",
    "key": "backup",
    "desc": "遵循 3-2-1 原則確保資料有多份備份以應對災難。",
    "qty": 1,
    "defenseValue": 50,
    "type": "monitoring",
    "icon": "icons/backup.png"
  },
  {
    "itemId": "sec_least_privilege",
    "name": "Least Privilege（最小權限原則）",
    "key": "least_privilege",
    "desc": "使用者僅擁有執行任務所需的最低權限，降低風險。",
    "qty": 1,
    "defenseValue": 65,
    "type": "defense",
    "icon": "icons/privilege.png"
  },
  {
    "itemId": "sec_http_cookie",
    "name": "HttpOnly & Secure Cookie 屬性",
    "key": "http_cookie",
    "desc": "透過 Cookie 屬性保護使用者會話資訊不被竊取。",
    "qty": 1,
    "defenseValue": 55,
    "type": "defense",
    "icon": "icons/cookie.png"
  },
  {
    "itemId": "sec_dnssec",
    "name": "DNSSEC（Domain Name System Security Extensions）",
    "key": "dnssec",
    "desc": "防止 DNS 欺騙與資料竄改的安全擴充技術。",
    "qty": 1,
    "defenseValue": 70,
    "type": "network",
    "icon": "icons/dns.png"
  },
  {
    "itemId": "sec_code_signing",
    "name": "Code Signing（軟體簽章驗證）",
    "key": "code_signing",
    "desc": "確保程式碼來源可信且未被竄改。",
    "qty": 1,
    "defenseValue": 60,
    "type": "monitoring",
    "icon": "icons/code.png"
  }
];

async function importData() {
  console.log('開始匯入資料...');
  const batch = db.batch(); // 使用批次寫入可以更有效率地處理多筆資料

  // 定義目標路徑：/players/test-user/backpack
  const playerDocRef = db.collection('players').doc('test-user');
  const backpackCollectionRef = playerDocRef.collection('backpack');


  for (const item of dataToImport) {
    // 這裡，我們將每個物品作為一個文件新增到 'backpack' 子集合中
    // 我們可以選擇使用 item.itemId 作為文件 ID，或者讓 Firestore 自動生成
    const docRef = backpackCollectionRef.doc(item.itemId); // 使用 item.itemId 作為文件 ID
    // 如果你希望 Firestore 自動生成 ID，可以這樣寫：
    // const docRef = backpackCollectionRef.doc();
    batch.set(docRef, item);
  }

  try {
    await batch.commit();
    console.log('資料匯入成功！');
  } catch (error) {
    console.error('資料匯入失敗：', error);
  } finally {
    // 結束程式
    process.exit();
  }
}

importData();
