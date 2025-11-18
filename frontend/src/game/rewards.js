// frontend/src/game/rewards.js
// 防禦工具/道具的定義清單

const DEFENSE_TOOLS = [
  {
    id: 'cdn',
    name: 'CDN 分流雲網',
    desc: '將大量流量分散到世界各地的節點，避免伺服器被擠爆',
    type: 'defense',
    meta: 'DDoS 防禦',
    realdesc: 'CDN 是一種全球分散式的網路節點架構。當使用者發出請求時，流量會被導向就近的 CDN 節點處理，而不是直接衝到原始伺服器。在防禦 DDoS 時，CDN 具有三大作用：1. 分散流量：全球節點共同吸收流量，避免攻擊集中在單一伺服器；2. 流量過濾：許多 CDN 內建防 DDoS 系統，可阻擋惡意請求；3. 隱藏原站：攻擊者只能看到 CDN IP，而不是你的伺服器真實位址。大型服務如 Cloudflare、Akamai 都以 CDN 作為核心防禦機制。'
  },
  {
    id: 'prepared_statements',
    name: 'Prepared Statements（參數化查詢）',
    desc: '預先編譯 SQL 語句，隔離輸入與指令，阻擋注入攻擊',
    type: 'defense',
    meta: '資料庫防護',
    realdesc: '參數化查詢會先把 SQL 語法預先編譯，例如 SELECT * FROM users WHERE username = ?。問號代表參數，之後使用者輸入的資料只會被視為純字串，而不是指令。SQL 語法與輸入永遠分離，使攻擊者即使輸入惡意語句（如 \' OR 1=1 --）也無法被資料庫執行，有效阻斷 SQL 注入攻擊。現代開發語言如 Java、Python、PHP、Node.js 都支援此防禦方式。'
  },
  {
    id: 'output_encoding',
    name: 'Output Encoding（輸出編碼）',
    desc: '對輸出內容進行編碼，讓惡意腳本變成普通文字',
    type: 'defense',
    meta: 'XSS 防護',
    realdesc: 'Output Encoding 是 XSS 防禦核心技術。它會把輸出的內容轉換為無害字元，例如 < 變成 &lt;、> 變成 &gt;、引號變為編碼。如此即使攻擊者在輸入欄放入 <script>alert(1)</script>，網頁也只會顯示文字，不會被瀏覽器執行。常見形式包含 HTML Encoding、JavaScript Encoding、URL Encoding 等。OWASP ESAPI 是常用的安全編碼工具。'
  },
  {
    id: 'mfa',
    name: 'MFA（多因素驗證）',
    desc: '登入時再加一道肉球驗證，讓偷來的密碼派不上用場',
    type: 'defense',
    meta: '帳號防護',
    realdesc: 'MFA 要求使用至少兩種驗證方式，包括：你知道的（密碼）、你擁有的（手機 OTP、實體金鑰）、你本身的（生物辨識）。暴力破解就算猜到密碼，也無法突破第二層驗證，讓攻擊者無從登入。常見 MFA 包括 Google Authenticator、Microsoft Authenticator、SMS OTP 及 FIDO2 安全金鑰。企業普遍用來防止帳號被濫用。'
  },
  {
    id: 'code_signing',
    name: 'Code Signing（軟體簽章驗證）',
    desc: '檢查更新包簽章，確認來源可信，防止惡意程式混入',
    type: 'defense',
    meta: '供應鏈防護',
    realdesc: 'Code Signing 使用「數位簽章」確保軟體或更新包的來源可信，且未被竄改。開發者使用私鑰為軟體簽章，使用者用公鑰驗證簽章是否正確。若檔案被竄改，驗證立即失敗。這能有效阻止攻擊者在更新過程中插入惡意程式。Windows、macOS、iOS、Android 等系統都要求軟體簽章，是供應鏈安全的核心機制。'
  },
  {
    id: 'port_blocking',
    name: 'Port Blocking（封鎖未用埠口）',
    desc: '把用不到的通訊埠全部鎖上，杜絕未授權連線',
    type: 'defense',
    meta: '網路邊界防護',
    realdesc: 'Port Blocking 是最基本的網路邊界安全手段。未封鎖的埠口可能被駭客掃描到，並利用弱點服務或未授權通道入侵。例如攻擊者會用 Nmap 掃描開放的服務，若發現弱點便能滲透系統。Port Blocking 的方式包括：僅開放必要的埠（如 80/443）、封鎖所有不必要通道、使用防火牆限制來源 IP，並可搭配速率限制。可有效防禦滲透、未授權連線及弱點利用。'
  }  
];

export default DEFENSE_TOOLS;
