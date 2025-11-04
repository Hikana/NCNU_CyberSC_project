<template>
  <div
    ref="containerRef"
    class="bg-bgg relative w-full h-screen overflow-hidden flex justify-center items-center font-sans"
  >
    <div
      class="absolute top-4 left-[320px] px-3 py-2 rounded-md shadow-md transition-all duration-300 z-30 transform scale-125 origin-top-left"
      :style="{
        backgroundColor: currentColor.dot,
        color: 'white',
      }"
    >
      <h2 class="text-xl font-bold">{{ currentGroupTitle }}</h2>
      <p class="text-md mt-1 opacity-90" v-html="currentGroupDescription"></p>
    </div>

    <div
      class="absolute top-4 right-4 px-7 py-2 rounded-md shadow-md transition-all duration-300 z-30 transform scale-125 origin-top-right"
      :style="{
        backgroundColor: currentColor.dot,
        color: 'white',
      }"
    >
      <h2 class="text-xl font-bold">傳輸流程</h2>
      <p class="text-lg mt-1 opacity-90" v-html="currentTheStep"></p>
    </div>

    <div class="absolute left-16 top-[17%] flex items-start z-20 scale-125">
      <div
        class="absolute left-[20px] top-0 w-1.5 h-full rounded-full transition-all duration-300 ease-out"
        :style="{
          backgroundColor: '#D5CFE1',
          height: `${(layerSteps.length - 1) * 61}px`,
          transform: 'translateY(10px)',
        }"
      ></div>

      <div
        ref="jpgNode"
        class="bg-can bg-cover bg-center absolute w-16 h-16 transition-transform duration-300 ease-out"
        :style="{
          left: '-16px',
          transform: `translate(0, ${activeLayerIndex * 56}px)`,
        }"
      ></div>

      <div
        class="ml-16 flex flex-col items-start transition-all duration-500 ease-out"
      >
        <div
          v-for="(layer, index) in layerSteps"
          :key="index"
          class="flex items-center transition-all duration-500 ease-out h-14"
        >
          <div
            class="w-5 h-5 rounded-full transition-all duration-300"
            :style="{
              backgroundColor: layer.color.dot,
              transform:
                activeLayerIndex === index ? 'scale(1.2)' : 'scale(1)',
              boxShadow:
                activeLayerIndex === index
                  ? `0 0 6px 1px ${layer.color.dot}`
                  : 'none',
            }"
          ></div>
          <div
            class="ml-3 px-2 py-0.5 rounded-lg transition-all duration-300 cursor-pointer select-none"
            @click="activeLayerIndex = index; currentPage = 1"
            :style="{
              backgroundColor:
                activeLayerIndex === index ? layer.color.dot : 'transparent',
              color:
                activeLayerIndex === index ? 'white' : normalTextColor,
              fontWeight: 'bold',
              fontSize: activeLayerIndex === index ? '16px' : '14px',
              boxShadow:
                activeLayerIndex === index
                  ? `0 0 8px ${layer.color.dot}`
                  : 'none',
            }"
          >
            {{ layer.title }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="content-container absolute left-[22%] top-[50%] -translate-y-[55%] w-[1200px] flex flex-col transition-opacity duration-300 opacity-100"
    >
      <transition-group
        name="fade-in"
        tag="div"
        class="grid grid-cols-2 gap-x-2 gap-y-6 content-wrapper text-wordcolor"
      >
        <div
          v-for="(step, index) in paginatedSteps"
          :key="step.base"
          class="px-4 py-3 rounded-xl shadow-lg text-left transition-all duration-300 ease-out w-[520px] relative overflow-hidden"
          :style="{
            backgroundColor: step.color.bg,
            transform: `translateY(${index * 5}px)`,
          }"
        >
          <div
            class="flex justify-between items-center cursor-pointer"
            @click="toggleExpand(index)"
          >
            <h3 class="font-bold text-[18px]" v-html="step.base"></h3>
            <svg
              class="w-6 h-6 transition-transform duration-300 transform"
              :style="{
                transform: expandedIndices.has(index)
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
                color: currentColor.dot,
              }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <transition name="expand">
            <div
              v-if="expandedIndices.has(index)"
              class="mt-2 text-base leading-normal"
              v-html="step.detail"
            ></div>
          </transition>
        </div>
      </transition-group>
    </div>

    <div class="absolute bottom-10 left-[22%] w-[1200px]">
      <div class="flex justify-center items-center space-x-4">
        <button
          class="px-3 py-1 rounded-lg font-bold shadow"
          :style="{ backgroundColor: currentColor.dot, color: 'white' }"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          &lt;
        </button>

        <span class="text-lg font-semibold text-wordcolor">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          class="px-3 py-1 rounded-lg font-bold shadow"
          :style="{ backgroundColor: currentColor.dot, color: 'white' }"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// ... (script setup 保持不變，因為邏輯與數據沒有調整)
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const normalTextColor = ref('#464655')
const colorGroups = {
  group7: { bg: "#D8C7D9", dot: "#A997B8", text: "#2E2B35", title: "應用層", description: "此層是<strong>唯一直接與使用者資料互動的層</strong>，提供應用程式所需的通訊協定。", theStep:"<li>使用者輸入網址，向瀏覽器發送請求。</li><li>瀏覽器向 DNS 伺服器查詢網址IP。</li><li>產生 HTTP/HTTPS 請求。</li>" },
  group6: { bg: "#C8D7E0", dot: "#7F9EB2", text: "#2E2B35", title: "表示層", description: "此層負責處理資料的<strong>轉譯、加密和壓縮</strong>，<br>以確保應用程式層能夠正確讀取資料。", theStep:"<li>將應用層的資料轉換成可傳輸格式。</li><li>在此層進行加密（SSL/TLS）。</li><li>字符編碼轉換(標準化格式)：如ASCII、Unicode等不同的字符集轉換。</li>" },
  group5: { bg: "#D8C7D9", dot: "#A997B8", text: "#2E2B35", title: "會話層", description: "此層負責<strong>建立、管理和終止</strong><br>兩個設備之間的通訊「會話」(Session)。", theStep:"<li>建立、管理和終止會話。</li><li>在發生故障時進行數據同步和恢復，確保數據完整。</li><li>設置對話控制，決定哪個終端可以在何時發送數據。</li>" },
  group4: { bg: "#C8D7E0", dot: "#7F9EB2", text: "#2E2B35", title: "傳輸層", description: "此層負責兩個裝置之間端對端的通訊、<br>流量控制與錯誤控制，<br>將<strong>上層資料分解為「區段」(Segment)</strong>。", theStep:"<li>在網路中的不同主機之間建立、維護和終止數據傳輸連接。</li><li>數據分段和重組，傳輸表頭（TH）加至資料以形成封包。</li><li>錯誤檢測和恢復。</li><li>流量控制和擁塞控制。</li>" },
  group3: { bg: "#D8C7D9", dot: "#A997B8", text: "#2E2B35", title: "網路層", description: "此層負責在不同網路之間的資料傳輸與路由，<br>將<strong>傳輸層的區段分解為「封包」(Packet)</strong>，<br>並為封包尋找最佳路徑。", theStep:"<li>路徑選擇和封包轉發。</li><li>將網路表頭（NH）加至封包，<br>以形成封包，加上來源與目的IP地址。</li><li>決定路由。</li>" },
  group2: { bg: "#C8D7E0", dot: "#7F9EB2", text: "#2E2B35", title: "資料鏈結層", description: "此層負責在<strong>同一個網路上的兩個設備之間建立可靠的資料傳輸</strong>，<br>並將來自網路層的封包分割成更小的「訊框」(Frame)。", theStep:"<li>將網路層封包封裝成Frame加入 MAC 地址。</li><li>控制流量傳輸速率，以防止網路擁塞。</li>" },
  group1: { bg: "#D8C7D9", dot: "#A997B8", text: "#2E2B35", title: "實體層", description: "處理網路中實體的設備和介質，<br/>並<strong>將數據轉換為由 1 和 0 組成的位元流</strong>進行傳輸。", theStep:"<li>Wi-Fi：封包轉成無線電波。</li><li>有線網路：封包轉為電壓信號。</li>" },
};

// 名詞內容列表，加入了 `layer` 屬性來對應 colorGroups 的 key
const steps = [
  // 第七層：應用層 (Application Layer)
  {base:"DHCP (Dynamic Host <br>Configuration Protocol) - <br>動態主機設定協定", detail:"網路世界的「自動報到櫃檯」。 當您的設備（如手機）連上Wi-Fi時，它會自動向DHCP伺服器（通常是路由器）請求網路設定。DHCP會<strong>自動分配一個 IP 位址</strong>及相關設定（如閘道器、DNS）給您的設備，讓您無需手動設定就能上網。", color:colorGroups.group7, layer: '應用層'},
  {base:"FTP (File Transfer <br>Protocol) - 檔案傳輸協定", detail:"一個古老的、專門用來「傳輸檔案」的協定。 它最大的問題是，您的帳號、密碼和檔案內容全都是「<strong>明文</strong>」傳輸（沒加密），在網路上很容易被偷看，<strong>非常不安全</strong>。", color:colorGroups.group7, layer: '應用層'},
  {base:"HTTP (HyperText <br>Transfer Protocol) - 超文字傳輸協定", detail:"這是瀏覽器用來向網站<strong>要資料</strong>（網頁、圖片）的「語言」。 您的瀏覽器會發出HTTP請求，網站伺服器會回傳HTTP回應。但它也是<strong>明文傳輸</strong>，內容未經加密。", color:colorGroups.group7, layer: '應用層'},
  {base:"HTTPS (HyperText <br>Transfer Protocol Secure) - <br>安全超文字傳輸協定", detail:"<strong>HTTP 的安全加密版</strong>。 它並不是一個全新的協定，而是「<strong>HTTP + SSL/TLS</strong>」的組合。 它透過TLS（第六層）加密，確保您和網站之間的所有通訊都<strong>經過加密</strong>，防止中間人竊聽。", color:colorGroups.group7, layer: '應用層'},
  {base:"POP3 (Post Office <br>Protocol 3) - 郵局協定第3版", detail:"一種「把信件從郵局信箱領回家」的收信協定。 您的Email軟體連上伺服器，把所有信件「<strong>下載</strong>」到您的電腦，然後（通常）會把伺服器上的信件<strong>刪除</strong>。 缺點是您在A電腦收信後，B電腦和手機上就看不到了。", color:colorGroups.group7, layer: '應用層'},
  {base:"SMTP (Simple Mail <br>Transfer Protocol) - <br>簡易郵件傳輸協定", detail:"專門負責「<strong>寄信</strong>」的協定。 無論您用什麼軟體，當您按下「傳送」按鈕時，您的郵件程式就是透過SMTP協定，把信件「<strong>推送</strong>」給郵件伺服器。", color:colorGroups.group7, layer: '應用層'},
  {base:"DNS (Domain Name <br>System) - 網域名稱系統", detail:"「<strong>網際網路的電話簿</strong>」。 人類只記得住「google.com」這樣的網域名稱，但電腦只看得懂「172.217.26.196」這樣的IP位址。 DNS的工作，就是在您輸入網址時，自動去將易於記憶的<strong>網域名稱轉換為機器可讀的 IP 位址</strong>。", color:colorGroups.group7, layer: '應用層'},
  {base:"SSH (Secure Shell) - 安全殼層協定", detail:"讓管理員能「<strong>安全地遠端遙控</strong>」另一台電腦（通常是Linux伺服器）的方式。 它提供一條<strong>加密的網路通道</strong>，讓使用者能夠安全地遠端登入並管理另一台電腦，所有過程（包含密碼和指令）都受到嚴密保護，不會被竊聽。", color:colorGroups.group7, layer: '應用層'},

  // 第六層：表示層 (Presentation Layer)
  {base:"SSL (Secure Sockets Layer) - <br>安全通訊協定", detail:"這是一種<strong>已被淘汰且不安全</strong>的早期加密協定。 它曾被用於網站加密（HTTPS），但因被發現有嚴重漏洞，現已停止使用。", color:colorGroups.group6, layer: '表示層'},
  {base:"TLS (Transport Layer Security) - <br>傳輸層安全性協定", detail:"這是 <strong>SSL 的現代安全後繼者</strong>。 它是<strong>當前網站 HTTPS 加密的標準技術</strong>，也就是您在瀏覽器上看到的那個「鎖頭」，用於保護您的 transmisión 資料安全。", color:colorGroups.group6, layer: '表示層'},
  {base:"GIF (Graphics Interchange Format) / <br>JPEG (Joint Photographic Experts Group)", detail:"這些就是常見的<strong>圖片格式標準</strong>。 GIF 是一種使用<strong>無失真壓縮</strong>的點陣圖格式，支援動畫。 JPEG 則是一種<strong>失真壓縮</strong>技術，最適合儲存色彩豐富的照片。 表示層就負責處理這些格式的定義與轉譯。", color:colorGroups.group6, layer: '表示層'},

  // 第五層：會話層 (Session Layer)
  {base:"RPC (Remote Procedure Call) - <br>遠端程序呼叫", detail:"這是一種允許電腦A「<strong>隔空</strong>」呼叫並執行電腦B上<strong>子程式的技術</strong>。 這個過程就需要會話層來建立和管理一個穩定的會話通道。", color:colorGroups.group5, layer: '會話層'},

  // 第四層：傳輸層 (Transport Layer)
  {base:"TCP (Transmission Control Protocol) - <br>傳輸控制協定", detail:"這像是「掛號信」或「簽收服務」。 它是一種<strong>可靠、連線導向</strong>的協定。 在傳輸前會先「三次交握」建立連線，它會為每個區段編號，接收方收到後必須回傳「確認」，如果沒收到確認（可能遺失了），它就會<strong>重新傳送</strong>。 這能確保資料<strong>完整且有序地送達</strong>，適用於網頁瀏覽、Email等。", color:colorGroups.group4, layer: '傳輸層'},
  {base:"UDP (User Datagram Protocol) - <br>使用者資料包協定", detail:"這像是「平信」或「明信片」。 它是一種<strong>快速、無連線</strong>的協定，抓到資料就直接往外丟，<strong>不保證資料完整送達</strong>與順序。 它追求的是<strong>低延遲和高效率</strong>，適用於線上遊戲、直播等即時性應用（寧可犧牲一點畫質，也不能卡頓）。", color:colorGroups.group4, layer: '傳輸層'},
  {base:"Socket - 通訊端", detail:"這是一個「完整的通訊地址」，也就是 <strong>IP 位址（大樓地址）+ Port 號（幾樓幾室）</strong> 的組合。 電腦靠這個組合來鎖定網路連線的唯一端點。", color:colorGroups.group4, layer: '傳輸層'},
  {base:"Port - 通訊埠", detail:"這是電腦上應用程式的「<strong>分機號碼</strong>」或「<strong>服務窗口號碼</strong>」。 您的電腦只有一個IP，但同時在上網、聽音樂、玩遊戲。Port 是一個 0 到 65535 的數字，作業系統就是靠這個號碼，才知道網路資料應該轉交給哪一個正確的應用程式。", color:colorGroups.group4, layer: '傳輸層'},

  // 第三層：網路層 (Network Layer)
  {base:"IP (Internet Protocol) - 網際協定", detail:"這就是您在網路上「<strong>可變動的門牌號碼</strong>」（例如 172.217.26.196）。 IP位址是網際網路上所有設備的<strong>唯一邏輯標識</strong>。 您的筆電在家裡的IP和在咖啡廳的IP會不一樣，路由器就是靠這個位址來決定如何轉發封包。", color:colorGroups.group3, layer: '網路層'},
  {base:"IPv4 (Internet Protocol version 4)", detail:"<strong>舊版</strong>的IP位址系統，使用 <strong>32 位元</strong>位址（由四組 0-255 的數字組成）。 它大約只能提供 43 億個位址，目前已全球耗盡。", color:colorGroups.group3, layer: '網路層'},
  {base:"IPv6 (Internet Protocol version 6)", detail:"<strong>新版</strong>的IP位址系統，使用 <strong>128 位元</strong>位址，能提供近乎無限的位址數量，是為了解決 IPv4 不足而設計的下一代協定。", color:colorGroups.group3, layer: '網路層'},
  {base:"NAT (Network Address Translation) - <br>網路位址轉譯", detail:"這是您家「路由器」的關鍵功能，像是一個「社區總機」。 您的ISP只會給您家一個「公共IP」，但您家裡卻有多台設備使用「私人IP」（例如 192.168.x.x）。 NAT技術能讓您<strong>多個內部設備透過共享這一個公共 IP 位址來上網</strong>，大大減緩了 IPv4 位址耗盡的問題。", color:colorGroups.group3, layer: '網路層'},
  {base:"ICMP (Internet Control <br>Message Protocol) - <br>網際網路控制訊息協定", detail:"這不是用來傳送資料的，而是網路設備之間用來「<strong>回報錯誤和狀態</strong>」的簡訊系統。 最有名的應用就是 <strong>ping 指令</strong>，ping google.com 就是您的電腦發送一個ICMP「你在嗎？」的請求，Google的伺服器會回傳一個ICMP「我在！」的回應，用來<strong>診斷網路連線狀態</strong>。", color:colorGroups.group3, layer: '網路層'},
  {base:"Router - 路由器", detail:"網路世界的「<strong>智慧交通樞紐</strong>」，專門<strong>連接不同的網路</strong>。 您的家用路由器連接了「您家內部網路」和「ISP的網路」。它會查看封包上的「IP位址」（目的地），然後查詢自己的「路由表」（地圖），智慧地為資料封包<strong>選擇最佳路徑</strong>進行轉發。", color:colorGroups.group3, layer: '網路層'},
  {base:"IPSec (Internet Protocol Security) - <br>網際網路安全協定", detail:"這是一套在 IP 層運作的「<strong>加密保全系統</strong>」。 它可以在兩個網路閘道之間建立一個「<strong>加密通道</strong>」，所有通過的IP封包都會被<strong>加密和認證</strong>。 這是建構<strong>VPN (虛擬私人網路)</strong> 的關鍵技術。", color:colorGroups.group3, layer: '網路層'},

  // 第二層：資料連結層 (Data Link Layer)
  {base:"MAC (Media Access <br>Control) - 媒體存取控制", detail:"這是您網路卡（無論是有線還是Wi-Fi）的「<strong>身分證字號</strong>」。 這是一個<strong>全球唯一、燒錄在硬體中</strong>的實體位址（例如00:1A:2B:3C:4D:5E）。 在同一個區域網路內，設備之間就是靠這個位址來互相辨識和定位的。", color:colorGroups.group2, layer: '資料鏈結層'},
  {base:"Framing - 訊框化", detail:"這就是「<strong>打包</strong>」的過程。此層會拿到來自第三層的「封包」（內容物），然後在它的<strong>前面加上「標頭」</strong>（包含接收方和發送方的MAC位址），在<strong>後面加上「結尾」</strong>（用於錯誤檢查），這個完整的包裹就稱為「訊框」。", color:colorGroups.group2, layer: '資料鏈結層'},
  {base:"ARP (Address Resolution <br>Protocol) - 位址解析協定", detail:"這是在社區內「問路」的機制。您的電腦知道您印表機的IP位址（第三層，像是門牌號碼），但不知道它的MAC位址（第二層，身分證字號）。 於是您的電腦會透過ARP在網路中廣播：「嘿！請問<strong>IP是 192.168.1.100 的人，您的MAC位址是什麼？</strong>」。那台印表機收到後就會回覆：「是我是我！我的MAC是 xx:xx:xx:xx:xx:xx」。", color:colorGroups.group2, layer: '資料鏈結層'},
  {base:"CSMA/CD (Carrier Sense <br>Multiple Access with <br>Collision Detection) - <br>載波感測多重存取/碰撞偵測", detail:"這是一套用在早期Hub網路上的「會議發言規則」。 它的運作方式為「<strong>先聽再說</strong>」：<br>1. <strong>Carrier Sense (先聽)</strong>：發言前先聽聽看有沒有人在講話。<br>2. <strong>Multiple Access (再說)</strong>：如果沒人講，我就開始講。<br>3. <strong>Collision <br>Detection (邊講邊聽)</strong>：我邊講邊聽，如果發現有人跟我同時講（發生碰撞），我們倆就立刻閉嘴，各自隨機等一小段時間，然後再重複第一步。", color:colorGroups.group2, layer: '資料鏈結層'},
  {base:"VLAN (Virtual Local Area <br>Network) - 虛擬區域網路", detail:"這就像是在一間大辦公室（一台實體交換器）裡，用「透明隔板」隔出不同的小組（虛擬網路）。它可以將一台實體交換器在<strong>邏輯上劃分</strong>為多個獨立的廣播網域。 例如，會計部和業務部雖然插在同一台交換器上，但若分屬不同VLAN，它們在<strong>邏輯上就是兩個網路，無法互通</strong>，藉此提升了網路的安全性和管理性。", color:colorGroups.group2, layer: '資料鏈結層'},

  // 第一層：實體層 (Physical Layer)
  {base:"UTP (Unshielded Twisted Pair) - <br>無遮蔽雙絞線", detail:"這就是您最常見到的<strong>網路線</strong>（例如電腦連接到牆上插座的線）。它被稱為「無遮蔽」是因為線材外面沒有額外的金屬層；「雙絞」則是指裡面的八條銅線兩兩一對地纏繞在一起。這樣做的目的是利用電磁原理，<strong>抵銷</strong>來自外部（如電源線、日光燈）的雜訊干擾，以確保訊號穩定。", color:colorGroups.group1, layer: '實體層'},
  {base:"Fiber - 光纖", detail:"這是一種用「<strong>光</strong>」來傳輸訊號的線路，像是一根非常細的玻璃或塑膠纖維。它不是用電，而是利用光脈衝在纖維中傳輸。 因為光的速度極快且<strong>完全不受電磁干擾</strong>，所以光纖具有<strong>頻寬超高</strong>、<strong>傳輸距離超長</strong>（可達數十公里）的巨大優勢，是現代網路骨幹（如海底電纜）的首選。", color:colorGroups.group1, layer: '實體層'},
  {base:"Repeater - 中繼器", detail:"這就像是網路訊號的「大聲公」或「放大器」。網路訊號在UTP銅線中傳輸一段距離後會衰減（變弱）。中繼器的工作就是接收這個衰減的訊號，將其<strong>重新放大和整形</strong>（恢復成漂亮的 1 和 0），然後再發送出去，藉此<strong>延長網路的傳輸距離</strong>。 它很「笨」，完全不看資料內容。", color:colorGroups.group1, layer: '實體層'},
  {base:"Hub - 集線器", detail:"這是一個「多孔的笨中繼器」。它就像一個資訊佈告欄，任何一個連接埠（孔）收到的訊號，它都會<strong>無腦地廣播</strong>給所有其他連接埠。這會導致如果兩台電腦同時發送資料，就會「碰撞」，效率極低，因此<strong>現已被「交換器」(Switch) 取代</strong>。", color:colorGroups.group1, layer: '實體層'},
  {base:"ADSL (Asymmetric Digital <br>Subscriber Line) - <br>非對稱數位用戶線路", detail:"這就是早期的「電話線上網」技術，它利用傳統的電話銅線來提供寬頻上網。其最大的特點是「非對稱」，也就是<strong>下載速度遠高於上傳速度</strong>，這很符合當時一般人上網瀏覽（大量下載）的需求。", color:colorGroups.group1, layer: '實體層'},
];

// 依照層次順序定義的陣列
const layerSteps = [
  { title: "應用層", key: '應用層', color: colorGroups.group7 },
  { title: "表示層", key: '表示層', color: colorGroups.group6 },
  { title: "會話層", key: '會話層', color: colorGroups.group5 },
  { title: "傳輸層", key: '傳輸層', color: colorGroups.group4 },
  { title: "網路層", key: '網路層', color: colorGroups.group3 },
  { title: "資料鏈結層", key: '資料鏈結層', color: colorGroups.group2 },
  { title: "實體層", key: '實體層', color: colorGroups.group1 },
];

// activeIndex 代表當前是第幾層 (從 0 開始)
const activeLayerIndex = ref(0);

// 當前活躍層的顏色組
const currentColor = computed(() => layerSteps[activeLayerIndex.value].color);
// 當前活躍層的標題
const currentGroupTitle = computed(() => layerSteps[activeLayerIndex.value].title);
// 當前活躍層的描述
const currentGroupDescription = computed(() => currentColor.value.description);
// 當前活躍層的流程
const currentTheStep = computed(() => currentColor.value.theStep);

// 當前層的所有名詞內容
const currentLayerSteps = computed(() => {
  const currentLayerName = layerSteps[activeLayerIndex.value].title;
  return steps.filter(step => step.layer === currentLayerName);
});


const isFullyVisible = ref(false);
const containerRef = ref(null);
let scrollTimeout = null;

function handleScroll(e) {
  // 只有當組件完全可見時才處理滾動鎖定
  if (!isFullyVisible.value) return;

  // 向下滾且還沒到最後一層時
  if (e.deltaY > 0 && activeLayerIndex.value < layerSteps.length - 1) {
    e.preventDefault();

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      activeLayerIndex.value++;
      scrollTimeout = null;
    }, 100);
  }
  // 向上滾且不在第一層時
  else if (e.deltaY < 0 && activeLayerIndex.value > 0) {
    e.preventDefault();

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      activeLayerIndex.value--;
      scrollTimeout = null;
    }, 100);
  }
}

let observer = null;

onMounted(() => {
  // 注意：由於罐子是獨立定位的，我們需要調整左側層次點的間隔 (h-14, 60px) 來與罐子移動距離 (60px) 保持一致
  window.addEventListener("wheel", handleScroll, { passive: false });

  // 使用 Intersection Observer 監測組件是否完全填滿螢幕
  observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 當組件完全可見時(intersectionRatio >= 0.8)
          isFullyVisible.value = entry.intersectionRatio >= 0.8;
          // console.log('可見度:', entry.intersectionRatio, '是否鎖定:', isFullyVisible.value);
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // 0 到 1 的所有百分比
      }
  );

  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", handleScroll);
  if (observer && containerRef.value) {
    observer.unobserve(containerRef.value);
  }
});
// ✅ 新增分頁邏輯
const currentPage = ref(1);
const pageSize = 4;

const totalPages = computed(() =>
  Math.ceil(currentLayerSteps.value.length / pageSize)
);

const paginatedSteps = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return currentLayerSteps.value.slice(start, start + pageSize);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

// 展開收合
const expandedIndices = ref(new Set());
function toggleExpand(index) {
  if (expandedIndices.value.has(index)) {
    expandedIndices.value.delete(index);
  } else {
    expandedIndices.value.add(index);
  }
}

</script>

<style scoped>
.content-container {
  transition: height 0.5s ease-in-out;
}

.fade-in-enter-active {
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.fade-in-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  position: absolute;
  width: 430px;
}
.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(20px) !important;
}
.fade-in-move {
  transition: transform 0.5s;
}

/* 展開動畫 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>