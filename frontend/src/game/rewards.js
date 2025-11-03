// frontend/src/game/rewards.js
// 防禦工具/道具的定義清單

const DEFENSE_TOOLS = [
  {
    id: 'waf',
    name: 'WAF 應用程式防火牆',
    desc: 'Web Application Firewall，能過濾惡意流量和攻擊',
    type: 'defense',
    meta: '阻擋 SQL 注入、XSS 等攻擊'
  },
  {
    id: 'prepared_statements',
    name: 'Prepared Statements（參數化查詢）',
    desc: '預編譯的 SQL 語句，防止 SQL 注入攻擊',
    type: 'defense',
    meta: '資料庫安全防護'
  },
  {
    id: 'output_encoding',
    name: 'Output Encoding（輸出編碼）',
    desc: '對輸出資料進行編碼，防止 XSS 攻擊',
    type: 'defense',
    meta: '防止跨站腳本攻擊'
  },
  {
    id: 'csrf',
    name: 'CSRF Token（隨機驗證碼）',
    desc: '跨站請求偽造防護令牌',
    type: 'defense',
    meta: '防止跨站請求偽造'
  },
  {
    id: 'mfa',
    name: 'MFA（多因素驗證）',
    desc: '多重身份驗證，提高帳戶安全性',
    type: 'defense',
    meta: '身份驗證強化'
  },
  {
    id: 'security_awareness',
    name: 'Security Awareness Training（資安意識訓練）',
    desc: '員工資安意識教育訓練',
    type: 'defense',
    meta: '人為因素防護'
  },
  {
    id: 'tls_https',
    name: 'TLS/HTTPS 加密',
    desc: '傳輸層安全協定，加密資料傳輸',
    type: 'defense',
    meta: '資料傳輸加密'
  },
  {
    id: 'backup',
    name: '定期備份（3-2-1 備份原則）',
    desc: '3份備份、2種媒體、1份異地存放',
    type: 'defense',
    meta: '資料備份與恢復'
  },
  {
    id: 'least_privilege',
    name: 'Least Privilege（最小權限原則）',
    desc: '只給予必要的最小權限',
    type: 'defense',
    meta: '權限管理'
  },
  {
    id: 'http_cookie',
    name: 'HttpOnly & Secure Cookie 屬性',
    desc: '安全的 Cookie 設定',
    type: 'defense',
    meta: 'Cookie 安全'
  },
  {
    id: 'dnssec',
    name: 'DNSSEC（Domain Name System Security Extensions）',
    desc: 'DNS 安全擴展協定',
    type: 'defense',
    meta: 'DNS 安全'
  },
  {
    id: 'code_signing',
    name: 'Code Signing（軟體簽章驗證）',
    desc: '程式碼數位簽章驗證',
    type: 'defense',
    meta: '軟體驗證'
  }
];

export default DEFENSE_TOOLS;
