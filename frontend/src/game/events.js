export const EVENTS = {
  ddos: {
    id: 'ddos',
    name: 'DDoS 分散式阻斷服務攻擊',
    shortExplain: '向目標發送大量的網路流量，使目標伺服器或網路資源不堪重負，導致服務中斷或無法使用',
    gameDescription: '成千上萬的敵軍士兵從四面八方湧來，像海嘯一樣往城門口衝。守軍拼命推回去，卻發現人潮無止無盡，連送信的鴿子都被擠得飛不進來！但是聰明的你早有準備，為了預防這類攻擊，你建造了...',
    failureConsequence: '你沒有成功預防此次攻擊，城門被擠爆，商隊無法進出，市場癱瘓，百姓開始抱怨米價翻了三倍。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2025年美國「Rapper Bot」DDoS-for-hire 機器人網絡案件',
      body: '美國一名 22 歲男子涉嫌建立「Rapper Bot」機器人網絡，控制將近 100,000 部設備，於 2025 年 4 月至 8 月間對全球 18,000 名不同受害者發動 370,000 次以上的 DDoS 攻擊，有些攻擊強度達每秒 6Tbps。',
    },
    correctDefenses: ['waf'],
    timerSeconds: 30,
  },
  
  sql_injection: {
    id: 'sql_injection',
    name: 'SQL 注入攻擊',
    shortExplain: '在使用者輸入的資料中插入惡意SQL語句，使得這些語句被資料庫伺服器誤認為是正常的SQL語句並執行',
    gameDescription: '一名神秘的旅人拿出一卷黃金邊的捲軸，聲稱是國王的密令。守門官大聲朗讀後，只聽見轟隆一聲——寶庫大門自己打開了！',
    failureConsequence: '敵軍蜂擁而入，洗劫寶庫，連國王的夜帽和鑲寶石的馬桶都被搬走。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2007年美國「7-Eleven SQL Injection 資料外洩」事件',
      body: '攻擊者利用 SQL 注入漏洞入侵 7-Eleven 支付系統，竊取超過 1.3 億筆信用卡資料，成為當時最嚴重的大規模資料外洩之一。',
    },
    correctDefenses: ['prepared_statements'],
    timerSeconds: 25,
  },
  
  xss: {
    id: 'xss',
    name: '跨站腳本攻擊 (XSS)',
    shortExplain: '利用 input 欄位可以輸入內容的特性，只要使用者輸入特別的 JS 語法，且網頁有輸出此內容的時候，就可以竄改網頁或竊取資料',
    gameDescription: '敵軍在城牆外升起一面詭異的旗幟，上面畫著令人頭暈的符號。居民一看到就失神，開始幫敵人搬石頭築橋，還唱著奇怪的歌。',
    failureConsequence: '半夜，居民偷偷打開小門迎接敵軍，結果城內爆發混亂，糧倉也被點火焚燒。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2018年英國「British Airways XSS 信用卡資料外洩」事件',
      body: 'Magecart 組織利用 Feedify JavaScript 函式庫中的 XSS 漏洞，竊取約 380,000 筆旅客付款資訊，成為重大隱私洩露案件。',
    },
    correctDefenses: ['output_encoding'],
    timerSeconds: 20,
  },
  
  csrf: {
    id: 'csrf',
    name: '跨站請求偽造 (CSRF)',
    shortExplain: '攻擊者通過一些技術手段欺騙使用者的瀏覽器去訪問一個自己曾經認證過的網站並執行一些操作',
    gameDescription: '敵軍送來一封信，蓋著國王印章：「立即把糧食送往北門！」士兵雖然覺得奇怪，但印章幾乎一模一樣……',
    failureConsequence: '數十車糧食被推出城外，沒想到全落入敵人手中。百姓只能啃草根充飢。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2020年「TikTok CSRF 漏洞」事件',
      body: '研究人員發現 TikTok 存在可透過惡意訊息觸發的 CSRF 與 XSS 漏洞，允許攻擊者在使用者不知情下執行操作。',
    },
    correctDefenses: ['csrf_token'],
    timerSeconds: 22,
  },
  
  brute_force: {
    id: 'brute_force',
    name: '暴力破解攻擊',
    shortExplain: '反覆試驗所有可能的組合，直至猜到正確密碼',
    gameDescription: '夜裡，敵軍搬來一大袋鑰匙，一個個往城門鎖孔裡試。鐵門響個不停，守衛快被吵瘋了！',
    failureConsequence: '城門最終被打開，敵軍直衝市場，搶走珍珠、香料與啤酒。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2015年「Dunkin\' Donuts Brute Force 盜用顧客帳戶」事件',
      body: '駭客利用先前洩露的憑證清單進行暴力破解，攻破約 19,715 個 Dunkin\' Donuts 客戶忠誠度帳戶，偷取數萬元奖励金，導致公司支付高額罰款並強制重設用戶密碼與加強安全措施。',
    },
    correctDefenses: ['mfa'],
    timerSeconds: 28,
  },

  phishing: {
    id: 'phishing',
    name: '網路釣魚攻擊',
    shortExplain: '偽裝成有信譽的機構網站，並以電子通訊詐取個人敏感資料的詐騙手段',
    gameDescription: '一封蓋著金色蠟印的信件送到：「開糧倉！今晚國宴！」士兵猶豫著……字跡跟國王的一模一樣。',
    failureConsequence: '糧倉被打開，敵軍衝進來一邊唱歌一邊抱麵包跑走，百姓只能搶最後的洋蔥湯。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2009年「Experi-Metal v. Comerica 銀行網路釣魚詐騙」事件',
      body: '一名 Experi-Metal 員工在 2009 年 1 月 22 日收到一封偽裝成 Comerica 銀行的網路釣魚電子郵件，點擊後輸入了安全金鑰與登入資訊。當天 7.5 小時內詐騙者進行 93 次非法轉帳，總金額高達 1,901,269 美元，最終只追回部分款項，損失約 561,399 美元。',
    },
    correctDefenses: ['security_awareness_training'],
    timerSeconds: 25,
  },

  mitm: {
    id: 'mitm',
    name: '中間人攻擊 (MITM)',
    shortExplain: '攻擊者插入到兩個合法通訊端之間，扮演「中間人」的角色，攔截、修改或重發兩端之間的數據包',
    gameDescription: '敵人在森林裡搭建假傳令塔，攔截所有鴿子信件。將軍的「往東迎敵」變成了「往西撤退」！',
    failureConsequence: '我軍誤判方向，主力部隊白白跑去沙漠，結果城牆被攻破。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2019年「以色列新創遭中間人攻擊騙轉 100 萬美元」事件',
      body: '駭客透過精心設計的釣魚與電子郵件篡改手法，中間人攔截並竄改以色列新創與中國風投間的匯款資料，將原定匯款轉入駭客帳戶，成功騙取 100 萬美元。',
    },
    correctDefenses: ['tls_https'],
    timerSeconds: 30,
  },

  ransomware: {
    id: 'ransomware',
    name: '勒索軟體攻擊',
    shortExplain: '破壞受駭者存取權限，並向受駭者要求贖金的惡意程式',
    gameDescription: '黑夜裡，神秘人闖入糧倉，把每一棟的糧倉門都鎖上鐵鎖。牆上只留下一句話：「交錢，否則餓死！」',
    failureConsequence: '百姓為了一碗稀粥大打出手，有人甚至開始盯著宮廷御馬流口水。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2021年「Kaseya 供應鏈 Ransomware 勒索攻擊」事件',
      body: '攻擊者利用 Kaseya VSA 軟體更新中的零日漏洞，大規模部署 REvil 勒索軟體，影響超過 1,000 家企業，展開大規模勒索行動。',
    },
    correctDefenses: ['backup_321'],
    timerSeconds: 35,
  },

  privilege_escalation: {
    id: 'privilege_escalation',
    name: '特權提升攻擊',
    shortExplain: '一個用戶或程序利用系統或應用程式的漏洞，獲得比其原本授權更高的訪問權限的行為',
    gameDescription: '一名平凡的清潔工，竟然戴上將軍的盔甲，大搖大擺地下令士兵撤退。士兵們居然真的聽了！',
    failureConsequence: '整支部隊在假將軍指揮下走向陷阱，城堡失去了半數守軍。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2023年「Scattered Spider 組織濫用特權提升進行勒索」事件',
      body: 'Scattered Spider 組織透過社交工程針對大型企業 IT 支援部門，取得初始權限後再透過特權提升與繞過多重身份驗證方式，取得完整環境控制權進行勒索攻擊。',
    },
    correctDefenses: ['least_privilege'],
    timerSeconds: 20,
  },

  session_hijacking: {
    id: 'session_hijacking',
    name: '會話劫持攻擊',
    shortExplain: '網路罪犯使用各種方法來找到會話 ID，使用該資訊在不被偵測到的情況下控制會話進行各種惡意行為',
    gameDescription: '敵人潛入酒館，從將軍腰帶上偷走出入城門的令牌。隔天早上，一名「將軍」揮舞令牌大搖大擺走進來……',
    failureConsequence: '敵人化身將軍帶著士兵直搗糧倉，甚至還要求樂師替他演奏。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '「Broken Authentication 導致 Session 會話劫持技術風險」情境',
      body: 'Brightsec 技術文章指出，若網站未妥善處理 session 過期時間與驗證機制，攻擊者可偷取 session token 實施未經驗證的操作，此為典型 Session Hijacking 的實戰風險示例。',
    },
    correctDefenses: ['httponly_secure_cookie'],
    timerSeconds: 25,
  },

  dns_spoofing: {
    id: 'dns_spoofing',
    name: 'DNS 快取中毒攻擊',
    shortExplain: '誘騙者藉由將儲存在 DNS 伺服器中的 IP 位址更改為其想要使用的地址來進行此攻擊，導致使用者被重新導向到詐欺或惡意網站',
    gameDescription: '敵人在城外更換路牌，把「王城」指向一條小路。結果來訪的商隊全被引進敵軍的陷阱！',
    failureConsequence: '貿易貨物全被劫走，鄰國商人開始懷疑王國的誠信，外交陷入危機。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '「Target 供應鏈事件中可能涉及 DNS Spoofing 的風險情境」',
      body: 'Target 2013 年大型資料外洩事件中，攻擊者透過第三方管道竊取 HVAC 廠商憑證入侵，雖未明確使用 DNS Spoofing，但這類供應鏈縫隙型入侵提醒 DNS 相關攻擊機制也可能被利用。',
    },
    correctDefenses: ['dnssec'],
    timerSeconds: 30,
  },

  supply_chain: {
    id: 'supply_chain',
    name: '供應鏈攻擊',
    shortExplain: '攻擊使用第三方工具或服務（統稱為「供應鏈」）來滲透目標系統或網路',
    gameDescription: '商隊送來的新麥香氣撲鼻，但幾天後，全城百姓開始腹痛。原來麥子裡混了毒草！',
    failureConsequence: '大半居民倒下，醫生忙到暈倒，士兵體力不足，城牆防禦力大幅下降。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2020年「SolarWinds 供應鏈攻擊」事件',
      body: '駭客於 SolarWinds Orion 軟體更新中植入 Sunburst 後門，導致超過 18,000 名客戶下載受到感染的更新，進而造成數個美國聯邦機構與企業遭全面滲透。',
    },
    correctDefenses: ['code_signing'],
    timerSeconds: 40,
  },
};