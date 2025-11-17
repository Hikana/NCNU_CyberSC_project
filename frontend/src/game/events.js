export const EVENTS = {
  ddos: {
    id: 'ddos',
    name: 'DDoS 分散式阻斷服務攻擊',
    shortExplain: '向目標發送大量的網路流量，使目標伺服器或網路資源不堪重負，導致服務中斷或無法使用',
    gameDescription:
      '成千上萬隻流浪貓湧向「貓貓資訊中心的大門」，大家同時喵喵叫著要上網看魚影片、玩貓草對戰、下載罐罐優惠券。伺服器門口被擠得水泄不通，連郵差小鴿子的信都送不進來！幸好你早就有準備，為了避免伺服器被擠爆，你建造了...',
    failureConsequence:
      '你只聽到喵喵大暴動，大門被擠壞，整個貓城的網路癱瘓。貓咖啡廳不能點餐、貓郵局延遲三天、連貓草娛樂台都轉圈圈。',
    toolresistancedescription:
      '你的 CDN 小毛球軍團迅速分散流量，把請求平均分配到世界各地的鏟鏟節點，瞬間，伺服器維持穩定，郵差小鴿子也順利飛進來遞信。全城貓咪拍爪歡呼：「我們的網路救回來了！」',
    wafresistancedescription: 'WAF士兵貓們站在入口大門前，用小魚干魔杖一揮：「喵，不合法的請求禁止進入！」',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2025年美國「Rapper Bot」DDoS-for-hire 機器人網絡案件',
      body: '美國一名 22 歲男子涉嫌建立「Rapper Bot」機器人網絡，控制將近 100,000 部設備，於 2025 年 4 月至 8 月間對全球 18,000 名不同受害者發動 370,000 次以上的 DDoS 攻擊，有些攻擊強度達每秒 6Tbps。',
    },
    correctDefenses: ['cdn'],
    timerSeconds: 60,
  },

  sql_injection: {
    id: 'sql_injection',
    name: 'SQL 注入攻擊',
    shortExplain: '在使用者輸入的資料中插入惡意SQL語句，使得這些語句被資料庫伺服器誤認為是正常的SQL語句並執行',
    gameDescription:
      '一隻戴著斗篷的神祕黑貓，遞來一張寫滿奇怪符號的網路請求卷軸，說是要查詢「罐罐庫存」。系統小貓隨手一讀，結果庫房大門突然「啪」地一下全開，所有數據彈出亂跳！',
    failureConsequence: '黑貓帶著一群小偷貓衝進資料庫，把高級鮪魚罐、金光閃閃貓薄荷、甚至貓皇的私人零食都搬走，整座資料中心亂成一團。',
    toolresistancedescription:
      '資料庫小貓開始用 參數化查詢（Prepared Statements）把資料逐一分類、清洗，把所有可疑指令鎖在鐵籠裡。黑貓被擋在城外，看著資料庫大門嚴密地關上，只能悻悻然地吹著鬍鬚離開。',
    wafresistancedescription: '黑貓把捲軸遞進來時，你的 WAF 小哨兵貓嗅了嗅，立刻發現奇怪符號：「喵！這不是正常查詢！」立刻把捲軸扔進垃圾桶。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2007年美國「7-Eleven SQL Injection 資料外洩」事件',
      body: '攻擊者利用 SQL 注入漏洞入侵 7-Eleven 支付系統，竊取超過 1.3 億筆信用卡資料，成為當時最嚴重的大規模資料外洩之一。',
    },
    correctDefenses: ['prepared_statements'],
    timerSeconds: 60,
  },

  xss: {
    id: 'xss',
    name: '跨站腳本攻擊 (XSS)',
    shortExplain: '利用 input 欄位可以輸入內容的特性，只要使用者輸入特別的 JS 語法，且網頁有輸出此內容的時候，就可以竄改網頁或竊取資料',
    gameDescription:
      '敵對貓國在訊息看板貼上一張超華麗的「魚魚祭典宣傳海報」。結果海報一打開，一段神祕的閃亮亮咒語就跳出來，把所有貓迷得神魂顛倒，開始不受控制地轉貼、點擊，還自動幫敵人蓋網站連結！',
    failureConsequence:
      '貓居民開始在深夜偷偷幫敵對貓國建魚橋，導致貓城的資訊看板被塞滿詐騙廣告，甚至還引爆了糧倉伺服器當機。',
    toolresistancedescription:
      'Output Encoding 小工程師貓開始把可疑的符咒符號全部轉換成「純文字魚骨頭」。海報變得既安全又無害，貓居民開心地圍過來討論活動，再也不會被莫名其妙控制。',
    wafresistancedescription: '敵對貓國的魚魚海報一放上看板，你的 WAF 士兵貓馬上衝過去：「這段內容有怪怪的魚味！」立刻把海報柔爛。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2018年英國「British Airways XSS 信用卡資料外洩」事件',
      body: 'Magecart 組織利用 Feedify JavaScript 函式庫中的 XSS 漏洞，竊取約 380,000 筆旅客付款資訊，成為重大隱私洩露案件。',
    },
    correctDefenses: ['output_encoding'],
    timerSeconds: 60,
  },

  brute_force: {
    id: 'brute_force',
    name: '暴力破解攻擊',
    shortExplain: '反覆試驗所有可能的組合，直至猜到正確密碼',
    gameDescription: '深夜裡，一群不懷好意的狸貓軍團擺出一大籃「萬用開鎖骨頭」，一根根塞進貓城大門的智慧鎖裡狂試密碼。',
    failureConsequence:
      '最終，他們猜中了密碼。大門被打開，狸貓們衝進貓市場，把珍珠奶茶口味罐罐、高山貓草、還有半夜限定的烤秋刀魚都搶走。',
    toolresistancedescription:
      'MFA 雙重認證小貓突然跳出來：「喵！請輸入第二階段肉球驗證！」狸貓們呆住，因為牠們根本沒有肉球。最後他們興致恢恢地離去，只留下一地被破解的密碼碎片。',
    wafresistancedescription:
      'Host Firewall 也立刻關掉可疑的登入通道，把所有錯誤嘗試記錄起來。狸貓們灰頭土臉地被擋在門外，只好抱著骨頭回家。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: "2015年「Dunkin' Donuts Brute Force 盜用顧客帳戶」事件",
      body: '駭客利用先前洩露的憑證清單進行暴力破解，攻破約 19,715 個 Dunkin\' Donuts 客戶忠誠度帳戶，偷取數萬元奖励金，導致公司支付高額罰款並強制重設用戶密碼與加強安全措施。',
    },
    correctDefenses: ['mfa'],
    timerSeconds: 60,
  },

  supply_chain: {
    id: 'supply_chain',
    name: '供應鏈攻擊',
    shortExplain: '攻擊使用第三方工具或服務（統稱為「供應鏈」）來滲透目標系統或網路',
    gameDescription:
      '運送貓糧的商隊帶來一批「超級營養魚魚乾」，所有貓都吃得津津有味。結果幾天後，伺服器小貓開始肚子痛、網路塔貓昏昏欲睡，原來其中混入了敵國偷偷放進去的惡意程式貓草！',
    failureConsequence:
      '整個貓城的工程師貓們都倒下，更新伺服器的速度變慢、網路塔也開始斷斷續續，城市整體防禦力急速下降。',
    toolresistancedescription:
      '工程師貓準備安裝那包看似誘人的魚味更新包時，你的 Code Signing 驗證貓跳出來用魔法放大鏡查看簽章。「喵？這不是官方授權的爪印！」惡意魚骨頭瞬間冒煙被識破！更新被阻擋後，所有伺服器貓集體鬆了一口氣，避免了一場可能讓整個城陷入混亂的大災難。貓皇親自頒獎：「你保護了貓城的供應鏈，你的勇氣值得獎賞！」',
    wafresistancedescription: null,
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2020年「SolarWinds 供應鏈攻擊」事件',
      body: '駭客於 SolarWinds Orion 軟體更新中植入 Sunburst 後門，導致超過 18,000 名客戶下載受到感染的更新，進而造成數個美國聯邦機構與企業遭全面滲透。',
    },
    correctDefenses: ['code_signing'],
    timerSeconds: 60,
  },

  unauthorized_access: {
    id: 'unauthorized_access',
    name: '未授權連線 / 開放埠入侵',
    shortExplain: '某個使用者或系統在未經允許的情況下，嘗試或成功進入某個資源、系統或網路的行為',
    gameDescription:
      '流氓貓發現貓城的路由器旁有幾個「沒關好的小洞」。\n牠們從沒鎖住的通訊埠鑽進來，偷偷接上自己的小線路，企圖進入貓城的內部網路！',
    failureConsequence: '流氓貓成功入侵貓城內部網路，竊取了大量的資料，包括居民的個人資料、貓城的機密文件等。',
    toolresistancedescription:
      'Port Blocking 工具也自動關閉所有沒用到的小通道，就像把洞穴入口一個個封起來。流氓貓找不到入口，只能在外面乾瞪眼最後悵然離去。整座貓城的內部網路恢復安靜，路由器貓甚至還有空睡了個午覺。',
    wafresistancedescription:
      '流氓貓試圖從路由器旁的小洞鑽進來時，Network Firewall 大胖貓立刻站起來擋住：「喵止！這裡不能過！」流氓貓被嚇得落荒而逃，再也不敢來了。',
    penalty: '失去科技點-10、城牆防禦值-10',
    realCase: {
      title: '2016年「美國海軍未授權連線事件」',
      body: '駭客成功入侵美國海軍的網路系統，竊取了大量的敏感資料，包括艦艇的航行路線、艦艇的航行速度、艦艇的航行方向等。',
    },
    correctDefenses: ['port_blocking'],
    timerSeconds: 60,
  },
};

