<template>
  <section class="top10-section">
    <div class="w-screen h-[460vh] bg-bgg relative overflow-x-hidden" >
    <!-- A01 ~ A10 (粉色石頭) -->
    <div
        v-for="stone in specialStones"
        :key="stone.id"
        class="absolute rounded-lg flex flex-col justify-start items-center font-bold cursor-pointer transition-all duration-300 p-2"
        :class="['bg-lightGray text-wordcolor']"
        :style="{ top: stone.top, left: stone.left, width: stone.width, height: stone.height }"
        @mouseenter="activateGray(stone.id)"
        @mouseleave="deactivateGray(stone.id)"
    >
      <!-- title 上方置中 -->
      <h3 class="text-[27px] font-bold text-center mt-2" v-html="stone.title"></h3>
      <!-- text 在下方靠左，可以用 <br> 換行 -->
      <p class="text-[21px] font-bold w-full px-4 mt-4 text-left" v-html="stone.text"></p>
    </div>

    <!-- 灰色石頭 -->
    <div
        v-for="stone in grayStones"
        :key="stone.id"
        class="absolute rounded-lg flex flex-col justify-start items-center font-bold transition-all duration-300 p-2"
        :class="[stone.active ? 'bg-gray-700 text-white' : 'bg-middleGray text-transparent']"
        :style="{ top: stone.top, left: stone.left, width: stone.width, height: stone.height }"
    >
      <!-- title 上方置中 -->
      <h3 class="font-bold text-center mt-2" :style="{ fontSize: stone.currentTrigger ? (stone.contents[stone.currentTrigger]?.titleSize || '27px') : '27px' }" v-html="stone.currentTrigger ? stone.contents[stone.currentTrigger]?.title : ''"></h3>
      <!-- text 在下方靠左，可以用 <br> 換行 -->
      <p class="font-bold w-full px-4 mt-4 text-left" :style="{ fontSize: stone.currentTrigger ? (stone.contents[stone.currentTrigger]?.textSize || '21px') : '21px' }" v-html="stone.currentTrigger ? stone.contents[stone.currentTrigger]?.text : ''"></p>
    </div>
  </div>
  </section>
  
</template>

<script>
export default {
  data() {
    return {
      // A01~A10 (粉色石頭)
      specialStones: [
        { id: "A01", top: "10vh", left: "12vw", width:"410px", height:"250px", title:"A01 Broken Access Control", text: "應用程式未能正確限制使用者的行為，<br>導致未經授權的存取或操作。<br>可能導致敏感資訊的洩露、<br>數據的修改或刪除，<br>甚至執行超出預期的業務功能。" },
        { id: "A02", top: "40vh", left: "63vw", width:"430px", height:"280px", title:"A02 Cryptographic Failures", text: "指在使用加密技術保護資料時，<br>因為設計、或配置不當，<br>導致加密的資料未能受到保護，<br>而產生資安漏洞，<br>這些漏洞能夠讓攻擊者繞過加密，<br>從而獲得敏感的資料或破壞系統的安全。" },
        { id: "A03", top: "82vh", left: "15vw", width:"600px", height:"310px", title:"A03 Injection", text: "指攻擊者透過未經適當驗證或處理的使用者輸入，<br>將惡意程式碼或指令注入到應用程式中，<br>使其被系統錯誤地執行。<br>這類攻擊通常利用應用程式與後端系統之間的互動漏洞，<br>可能導致資料外洩、系統控制權喪失，甚至服務完全中斷。常見的注入攻擊包括 SQL Injection、<br>Command Injection、LDAP Injection 等。" },
        { id: "A04", top: "117vh", left: "63vw", width:"430px", height:"220px", title:"A04 Insecure Design", text: "應用程式在設計階段未考慮安全性，<br>導致系統邏輯無法有效防止攻擊。<br>不安全的設計無法透過後期修補來解決，<br>因為所需的安全控制從未被創建。" },
        { id: "A05", top: "177vh", left: "32vw", width:"560px", height:"280px", title:"A05 Security Misconfiguration", text: "指程式設計及系統架構上的不當設計與設定，<br>例如不必要的 Port、帳號或權限、沒有按時更新系統、<br>未改掉預設帳號密碼、忘了設定安全參數、<br>錯誤訊息曝露 Stacktrace 程式檔資訊、<br>未移除具安全缺陷的預設範例程式，<br>可能會發生在資料庫、伺服器、應用程式或網路設備。" },
        { id: "A06", top: "220vh", left: "63vw", width:"400px", height:"350px", title:"A06 Vulnerable and Outdated Components", text: "使用過時、未修補的軟體元件，<br>如第三方函式庫、框架、開源套件，<br>甚至是作業系統的組件。<br>這些元件可能包含已知的漏洞，<br>若未更新或移除，<br>攻擊者可以利用它們發動攻擊，<br>從而入侵系統或竊取機密資訊。" },
        { id: "A07", top: "248vh", left: "10vw", width:"450px", height:"260px", title:"A07 Identification and Authentication Failures", text: "此類別涵蓋身份識別和認證過程中的弱點，<br>例如使用弱密碼、缺乏多因素認證等。<br>這些問題可能使攻擊者繞過身份驗證機制，<br>進而獲取未經授權的存取權限。" },
        { id: "A08", top: "288vh", left: "33.3vw", width:"430px", height:"320px", title:"A08 Software and <br>Data Integrity Failures", text: "指軟體未能正確保護其代碼、數據或 CI/CD流程，導致攻擊者可以篡改、<br>破壞或利用這些漏洞來執行惡意行為。<br>這類攻擊可能會影響應用程式的完整性，<br>導致未經授權的行為、數據損毀，<br>甚至供應鏈的攻擊。" },
        { id: "A09", top: "337vh", left: "63vw", width:"360px", height:"260px", title:"A09 Security Logging <br>and Monitoring Failures", text: "缺乏適當的記錄與監控機制，<br>導致無法偵測攻擊、<br>延遲回應安全事件，<br>甚至無法追蹤攻擊行為。" },
        { id: "A10", top: "377vh", left: "8vw", width:"700px", height:"220px", title:"A10 Server-Side Request Forgery", text: "發生於 Web 應用程式允許用戶端提供的 URL 來發送請求，<br>卻未對該 URL 進行適當的驗證與限制。<br>攻擊者可以利用 SSRF 讓伺服器向內部或外部的未授權資源發送請求，<br>可能導致內部網路偵察、數據洩露、甚至遠端代碼執行（RCE）。" },
      ],

      // 灰色石頭
      grayStones: [
        { id:"G01", top:"10vh", left:"40vw", width:"330px", height:"500px", active:false, currentTrigger:null, contents:{
            A01: { title:"上榜原因", titleSize:"27px", textSize:"21px", text:"<ul><li>很多應用程式缺乏適當的存取控制機制，或者開發者在實作存取控制時出錯。</li><br><li>根據調查，94% 受測的應用程式至少有一個存取控制漏洞，平均發生率為 3.81％。</li><br><li>由於 Web 應用日益複雜，存取控制規則變得更難管理，錯誤機率也隨之上升。</li></ul>"  },
            A02: { title:"上榜原因", titleSize:"27px", textSize:"21px", text:"<ul><li>攻擊門檻低，許多加密失敗問題容易被攻擊者利用。</li><br><li>影響範圍大，可能導致用戶資料外洩、身份盜竊、金融詐騙等嚴重後果。</li><br><li>廣泛存在的實現錯誤，開發人員容易使用弱加密演算法或金鑰管理不當。</li></ul>" }
          }},
        { id:"G02", top:"10vh", left:"63vw", width:"350px", height:"200px", active:false, currentTrigger:null, contents:{
            A01: { title:"預防措施", titleSize:"22px", textSize:"17px",text:"<ul><li>存取控制應僅在可信的環境中執行。</li><li>預設拒絕存取，除非明確授權。</li><li>實施統一的存取控制機制，避免不同系統間的不一致。</li></ul>" },
          }},
        { id:"G03", top:"48vh", left:"15vw", width:"365px", height:"220px", active:false, currentTrigger:null, contents:{
            A01: { title:"預防措施", titleSize:"22px", textSize:"17px", text:"<ul><li>API 需驗證 POST、PUT、DELETE 請求的存取權限。</li><li>確保JWT、Cookie 權限不可被操縱。</li><li>記錄存取控制失敗的事件，並通知管理員。</li></ul>" },
            A03: { title:"Injection 的類型", titleSize:"25px", textSize:"18px", text:"<ul><li>SQL Injection</li><li>Command Injection</li><li>LDAP Injection</li><li>NoSQL Injection</li></ul>" },
            }},
        { id:"G04", top:"82vh", left:"57vw", width:"520px", height:"240px", active:false, currentTrigger:null, contents:{
            A01: { title:"常見弱點", titleSize:"25px", textSize:"18px", text:"<ul><li>權限提升：用戶獲得同級別或高級別用戶的權限。</li><li>IDOR：攻擊者通過修改請求參數來訪問未經授權的資源。</li><li>Cookie 或 JWT 未正確驗證，導致未經授權的存取。</li></ul>" },
            A02: { title:"預防措施", titleSize:"25px", textSize:"19px",text:"<ul><li>使用經過驗證的強加密演算法，如 AES-256、RSA。</li><li>定期輪換金鑰，避免硬編碼金鑰。</li><li>使用安全的 TLS 版本並啟用 HSTS，強制使用 HTTPS。</li></ul>" },
            A03: { title:"預防措施", titleSize:"25px", textSize:"18px", text:"<ul><li>永遠不信任使用者輸入，對所有輸入進行嚴格的格式檢查。</li><li>使用參數化查詢，確保輸入僅作為數據值處理。</li><li>避免將使用者輸入直接拼接到 SQL、系統命令或其他查詢中。</li></ul>" },
            A04: { title:"預防措施", titleSize:"27px", textSize:"21px", text:"<ul><li>採用安全開發生命週期，確保安全專家參與設計。</li><li>在開發過程中使用安全設計模式與威脅建模。</li><li>限制使用者或服務的資源消耗，防止濫用。</li></ul>" },
          }},
        { id:"G05", top:"129vh", left:"32vw", width:"430px", height:"320px", active:false, currentTrigger:null, contents:{
            A03: { title:"上榜原因", titleSize:"27px", textSize:"21px", text:"<ul><li>廣泛影響範圍，幾乎所有與外部輸入交互的系統都可能成為目標。</li><li>高破壞力，可能導致敏感資料洩露，甚至讓攻擊者完全控制系統。</li><li>易於執行，許多注入攻擊只需簡單的工具或技巧即可實現。</li></ul>" },
            A04: { title:"需求和資源管理", titleSize:"27px", textSize:"21px", text:"<ul><li>收集並協商應用程式的業務需求，包含資料機密性、完整性要求。</li><li>評估應用程式的暴露程度，確定是否需要租戶隔離。</li><li>確保預算涵蓋設計、開發、測試與運行期間的安全活動。</li></ul>" },
            A05: { title:"預防措施", titleSize:"27px", textSize:"21px", text:"<ul><li>建立可重複的安全化流程，自動化確認環境中的安全設定。</li><li>停用不必要的功能與服務，移除預設帳號與密碼。</li><li>定期依據資安公告進行安全審查，使用 WAF 阻擋常見攻擊。</li></ul>" },
          }},
        { id:"G06", top:"129vh", left:"7vw", width:"330px", height:"375px", active:false, currentTrigger:null, contents:{
            A03: { title:"常見範例", titleSize:"27px", textSize:"18px", text:"<ul><li>SQL Injection：<br>使用 ' OR '1'='1 繞過登入驗證。</li><br><li>Command Injection：<br>附加 ; ls -la 或 && dir 執行惡意命令。</li><br><li>NoSQL Injection：<br>使用 {\"$ne\": null} 操作符注入。</li></ul>" }
          }},
        { id:"G07", top:"153vh", left:"70vw", width:"320px", height:"455px", active:false, currentTrigger:null, contents:{
            A05: { title:"上榜原因", titleSize:"27px", textSize:"20px", text:"<ul><li>容易被攻擊者利用，不需要高門檻技術。</li><br><li>影響範圍大，損害嚴重，可能導致資料庫被刪除或資料外洩。</li><br><li>可被用來發動進一步攻擊，如 XXE、SQL Injection 等。</li></ul>" },
          }},
        { id:"G08", top:"185vh", left:"10vw", width:"280px", height:"435px", active:false, currentTrigger:null, contents:{
            A05: { title:"主要問題", titleSize:"27px", textSize:"21px", text:"<ul><li>應用程式、伺服器、資料庫或框架的不當安全設定。</li><li>未移除預設帳號密碼或具安全缺陷的範例程式。</li><li>錯誤訊息曝露敏感的系統資訊。</li></ul>" },
          }},
        { id:"G09", top:"220vh", left:"32vw", width:"450px", height:"178px", active:false, currentTrigger:null, contents:{
            A06: { title:"上榜原因", titleSize:"23px", textSize:"18px", text:"<ul><li>使用過時、未修補的軟體元件。</li><li>若未更新或移除，攻擊者可利用它們發動攻擊。</li><li>從而入侵系統或竊取機密資訊。</li></ul>" },
          }},
        { id:"G10", top:"248vh", left:"41vw", width:"310px", height:"260px", active:false, currentTrigger:null, contents:{
            A06: { title:"主要問題", titleSize:"23px", textSize:"19px", text:"<ul><li>依賴過時的軟體與函式庫，如舊版 jQuery、Log4j。</li><li>使用含有漏洞的前端框架，可能導致 XSS 攻擊。</li><li>過時的 API 或 Web 服務可能導致認證繞過。</li></ul>" },
            A07: { title:"常見弱點", titleSize:"25px", textSize:"18px", text:"<ul><li>使用預設或弱密碼，如「1234」、「password」。</li><li>未實施多因素認證。</li><li>會話管理不當，導致會話固定攻擊。</li></ul>" },
          }},
        { id:"G11", top:"288vh", left:"10vw", width:"330px", height:"320px", active:false, currentTrigger:null, contents:{
            A06: { title:"攻擊手法", titleSize:"27px", textSize:"21px", text:"<ul><li>遠端代碼執行：利用 RCE 漏洞，執行惡意代碼。</li><li>已知漏洞利用：檢查應用程式是否使用有已知 CVE 的舊版軟體。</li><li>依賴函式庫漏洞：利用過時的套件執行攻擊。</li></ul>" },
            A07: { title:"預防措施", titleSize:"27px", textSize:"21px", text:"<ul><li>強制使用強密碼策略並定期更換密碼。</li><li>實施多因素認證來增強安全性。</li><li>確保會話管理安全，登入後產生新的 Session ID。</li></ul>" },
            A08: { title:"攻擊範例", titleSize:"25px", textSize:"18px", text:"<ul><li>供應鏈攻擊：植入惡意程式碼於第三方套件。</li><li>CI/CD 流程攻擊：竊取憑證或修改腳本。</li><li>偽造軟體更新：向用戶提供含惡意程式的更新。</li><li>數據篡改：修改 API 請求或資料庫記錄。</li></ul>" },
            A09: { title:"預防措施", titleSize:"25px", textSize:"19px", text:"<ul><li>使用集中式日誌管理，確保歷史日誌可追溯。</li><li>採用標準日誌格式，確保統一分析。</li><li>限制日誌存取權限，避免攻擊者刪除證據。</li><li>有效地即時監控及告警機制。</li></ul>" },
          }},
        { id:"G12", top:"272vh", left:"63vw", width:"400px", height:"438px", active:false, currentTrigger:null, contents:{
            A06: { title:"預防措施", titleSize:"27px", textSize:"21px", text:"<ul><li>定期更新所有軟體與依賴項，確保使用最新的安全補丁。</li><li>監控應用程式中使用的第三方套件。</li><li>刪除未使用的舊元件，減少攻擊面。</li><li>使用最小權限原則 + WAF 保護，降低風險。</li></ul>" },
            A07: { title:"常見範例", titleSize:"27px", textSize:"21px", text:"<ul><li>密碼預言機攻擊：使用已知密碼列表進行攻擊。</li><br><li>會話管理不當：未登出導致攻擊者可重新取得存取權限。</li><br><li>密碼安全性問題：強制密碼輪換反而導致使用者選擇弱密碼。</li></ul>" },
            A08: { title:"預防措施", titleSize:"26px", textSize:"20px", text:"<ul><li>定期檢查並更新所有第三方庫和開源套件。</li><br><li>對 CI/CD 系統實施最小權限原則。</li><br><li>對軟體更新進行數位簽章驗證。</li><br><li>對敏感數據進行加密和完整性檢查。</li></ul>" },
            }},
        { id:"G13", top:"337vh", left:"12vw", width:"400px", height:"260px", active:false, currentTrigger:null, contents:{
            A08: { title:"主要問題", titleSize:"27px", textSize:"21px", text:"<ul><li>未保護軟體供應鏈，高度依賴開源套件。</li><li>CI/CD 流程中的完整性漏洞。</li><li>未安全驗證軟體更新。</li></ul>" },
            A09: { title:"攻擊手法", titleSize:"25px", textSize:"19px", text:"<ul><li>反取證攻擊：刪除、修改或混淆日誌。</li><li>偽造正常流量：大量產生正常流量混淆惡意行為。</li><li>分散式攻擊：透過多個 IP 同時攻擊。</li></ul>" },
            A10: { title:"上榜原因", titleSize:"25px", textSize:"19px", text:"<ul><li>可繞過防火牆與 ACL，訪問內部系統。</li><li>影響範圍廣，許多應用程式允許用戶輸入 URL。</li><li>雲端環境風險提升，可存取 metadata 獲取敏感資訊。</li></ul>" },
          }},
        { id:"G14", top:"337vh", left:"41vw", width:"310px", height:"260px", active:false, currentTrigger:null, contents:{
            A09: { title:"主要問題", titleSize:"27px", textSize:"21px", text:"<ul><li>未記錄重要的安全事件。</li><li>記錄內容過於簡略。</li><li>日誌未受保護，攻擊者可刪除或修改 log。</li></ul>" },
            A10: { title:"SSRF 的類型", titleSize:"25px", textSize:"18px", text:"<ul><li>基本 SSRF：攻擊者能控制請求的 URL。</li><li>盲 SSRF：伺服器不會回應請求結果。</li><li>增強型 SSRF：透過 DNS rebinding 攻擊。</li></ul>" },
          }},
        { id:"G15", top:"377vh", left:"56vw", width:"468px", height:"470px", active:false, currentTrigger:null, contents:{
            A09: { title:"常見範例", titleSize:"27px", textSize:"21px", text:"<ul><li>內部威脅：內部員工濫用權限存取機密資料。</li><br><li>日誌規避技術：利用特定字元破壞日誌結構。</li><br><li>分散式暴力破解：使用大量代理伺服器避免觸發限制。</li></ul>" },
            A10: { title:"預防措施", titleSize:"27px", textSize:"21px", text:"<ul><li>白名單機制：僅允許特定的 URL 目標。</li><br><li>禁止內部 IP 訪問：過濾 127.0.0.1、localhost 及內部 IP。</li><br><li>關閉 HTTP 重導向，避免返回完整的伺服器響應。</li><br><li>使用 WAF 來檢測與攔截異常請求。</li></ul>" },
          }},
        { id:"G16", top:"412vh", left:"13vw", width:"620px", height:"215px", active:false, currentTrigger:null, contents:{
            A10: { title:"常見範例", titleSize:"27px", textSize:"20px", text:"<ul><li>內部端口掃描：透過 URL 變數控制請求目標地址來確認內部服務是否開放。</li><li>訪問雲端 metadata：獲取 AWS IAM 憑證，進一步利用 API 權限進行攻擊。</li></ul>" },
          }},

]
};
},
methods: {
  activateGray(aStoneId) {
    this.grayStones.forEach(stone => {
      if (stone.contents[aStoneId]) {
        stone.active = true;
        stone.currentTrigger = aStoneId;
      }
    });
  },
  deactivateGray(aStoneId) {
    this.grayStones.forEach(stone => {
      if (stone.currentTrigger === aStoneId) {
        stone.active = false;
        stone.currentTrigger = null;
      }
    });
  }
}
};
</script>
<style>
ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

li {
  display: list-item;
  margin-bottom: 8px;
}
</style>