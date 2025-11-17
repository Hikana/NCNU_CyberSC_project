// frontend/src/game/rewards.js
// 防禦工具/道具的定義清單

const DEFENSE_TOOLS = [
  {
    id: 'cdn',
    name: 'CDN 分流雲網',
    desc: '將大量流量分散到世界各地的節點，避免伺服器被擠爆',
    type: 'defense',
    meta: 'DDoS 防禦'
  },
  {
    id: 'prepared_statements',
    name: 'Prepared Statements（參數化查詢）',
    desc: '預先編譯 SQL 語句，隔離輸入與指令，阻擋注入攻擊',
    type: 'defense',
    meta: '資料庫防護'
  },
  {
    id: 'output_encoding',
    name: 'Output Encoding（輸出編碼）',
    desc: '對輸出內容進行編碼，讓惡意腳本變成普通文字',
    type: 'defense',
    meta: 'XSS 防護'
  },
  {
    id: 'mfa',
    name: 'MFA（多因素驗證）',
    desc: '登入時再加一道肉球驗證，讓偷來的密碼派不上用場',
    type: 'defense',
    meta: '帳號防護'
  },
  {
    id: 'code_signing',
    name: 'Code Signing（軟體簽章驗證）',
    desc: '檢查更新包簽章，確認來源可信，防止惡意程式混入',
    type: 'defense',
    meta: '供應鏈防護'
  },
  {
    id: 'port_blocking',
    name: 'Port Blocking（封鎖未用埠口）',
    desc: '把用不到的通訊埠全部鎖上，杜絕未授權連線',
    type: 'defense',
    meta: '網路邊界防護'
  }
];

export default DEFENSE_TOOLS;
