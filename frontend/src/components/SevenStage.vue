<template>
  <div ref="containerRef" class="bg-bgg relative w-full h-screen overflow-hidden flex justify-center items-center font-sans">

    <!-- 左上：層說明 -->
    <div class="absolute top-4 left-4 px-3 py-2 rounded-md shadow-md transition-all duration-300 z-30 transform scale-125 origin-top-left"
         :style="{
           backgroundColor: currentColor.dot,
           color: 'white'
         }">
      <h2 class="text-xl font-bold">{{ currentGroupTitle }}</h2>
      <p class="text-sm mt-1 opacity-90" v-html="currentGroupDescription"></p>
    </div>

    <!-- 右上：流程說明 -->
    <div class="absolute top-4 right-4 px-6 py-2 rounded-md shadow-md transition-all duration-300 z-30 transform scale-125 origin-top-right"
         :style="{
           backgroundColor: currentColor.dot,
           color: 'white'
         }">
      <h2 class="text-lg font-bold">傳輸流程</h2>
      <p class="text-sm mt-1 opacity-90" v-html="currentTheStep"></p>
    </div>

    <!-- 左側層次列表 -->
    <div class="absolute left-16 top-[60%] -translate-y-1/2 flex items-start z-20 scale-125">
      <div
          class="absolute left-[20px] top-0 w-1.5 h-full rounded-full transition-all duration-300 ease-out"
          :style="{
            backgroundColor: '#D5CFE1',
            height: `${(layerSteps.length - 1) * 61}px`,
            transform: 'translateY(10px)'
          }"
      ></div>

      <div
          ref="jpgNode"
          class="bg-can bg-cover bg-center absolute w-16 h-16 transition-transform duration-300 ease-out"
          :style="{
            left: '-16px',
            transform: `translate(0, ${activeLayerIndex * 56}px)`
          }"
      ></div>

      <div class="ml-16 flex flex-col items-start transition-all duration-500 ease-out">
        <div v-for="(layer, index) in layerSteps" :key="index"
             class="flex items-center transition-all duration-500 ease-out h-14">
          <div class="w-5 h-5 rounded-full transition-all duration-300"
               :style="{
                backgroundColor: layer.color.dot,
                transform: activeLayerIndex === index ? 'scale(1.2)' : 'scale(1)',
                boxShadow: activeLayerIndex === index ? `0 0 6px 1px ${layer.color.dot}` : 'none'
              }">
          </div>
          <div class="ml-3 px-2 py-0.5 rounded-lg transition-all duration-300"
               :style="{
                backgroundColor: activeLayerIndex === index ? layer.color.dot : 'transparent',
                color: activeLayerIndex === index ? 'white' : normalTextColor,
                fontWeight: 'bold',
                fontSize: activeLayerIndex === index ? '16px' : '14px',
              }">
            {{ layer.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- 中間內容方格區 -->
    <div class="content-container absolute left-[25%] top-[55%] -translate-y-1/2 w-[1200px] flex flex-col transition-opacity duration-300 opacity-100">
      <transition-group
        name="fade-in"
        tag="div"
        class="grid grid-cols-2 gap-x-2 gap-y-6 content-wrapper text-wordcolor"
      >
        <div
          v-for="(step, index) in currentLayerSteps"
          :key="step.base"
          class="px-4 py-3 rounded-xl shadow-lg text-left transition-all duration-300 ease-out w-[520px] relative overflow-hidden"
          :style="{ backgroundColor: step.color.bg, transform: `translateY(${index * 5}px)` }"
        >
          <!-- 標題列 -->
          <div class="flex justify-between items-center cursor-pointer"
               @click="toggleExpand(index)">
            <h3 class="font-bold text-[18px]" v-html="step.base"></h3>
            <svg class="w-6 h-6 transition-transform duration-300 transform"
                             :style="{
                                transform: expandedIndices.has(index) ? 'rotate(180deg)' : 'rotate(0deg)',
                                color: currentColor.dot // 讓箭頭顏色跟隨當前層次的主題色
                             }"
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                             stroke="currentColor"
                             stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
          </div>

          <!-- 內容展開 -->
          <transition name="expand">
            <div v-if="expandedIndices.has(index)" class="mt-2 text-base leading-normal" v-html="step.detail"></div>
          </transition>
        </div>
      </transition-group>
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
  group5: { bg: "#D8C7D9", dot: "#A997B8", text: "#2E2B35", title: "會話層", description: "此層負責<strong>建立、管理和終止</strong>兩個設備之間的通訊「會話」(Session)。", theStep:"<li>建立、管理和終止會話。</li><li>在發生故障時進行數據同步和恢復，確保數據完整。</li><li>設置對話控制，決定哪個終端可以在何時發送數據。</li>" },
  group4: { bg: "#C8D7E0", dot: "#7F9EB2", text: "#2E2B35", title: "傳輸層", description: "此層負責兩個裝置之間端對端的通訊、流量控制與錯誤控制，<br>將<strong>上層資料分解為「區段」(Segment)</strong>。", theStep:"<li>在網路中的不同主機之間建立、維護和終止數據傳輸連接。</li><li>數據分段和重組，傳輸表頭（TH）加至資料以形成封包。</li><li>錯誤檢測和恢復。</li><li>流量控制和擁塞控制。</li>" },
  group3: { bg: "#D8C7D9", dot: "#A997B8", text: "#2E2B35", title: "網路層", description: "此層負責在不同網路之間的資料傳輸與路由，<br>將<strong>傳輸層的區段分解為「封包」(Packet)</strong>，並為封包尋找最佳路徑。", theStep:"<li>路徑選擇和封包轉發。</li><li>將網路表頭（NH）加至封包，以形成封包，加上來源與目的 IP 地址。</li><li>決定路由。</li>" },
  group2: { bg: "#C8D7E0", dot: "#7F9EB2", text: "#2E2B35", title: "資料鏈結層", description: "此層負責在<strong>同一個網路上的兩個設備之間建立可靠的資料傳輸</strong>，<br>並將來自網路層的封包分割成更小的「訊框」(Frame)。", theStep:"<li>將網路層封包封裝成Frame加入 MAC 地址。</li><li>控制流量傳輸速率，以防止網路擁塞。</li>" },
  group1: { bg: "#D8C7D9", dot: "#A997B8", text: "#2E2B35", title: "實體層", description: "處理網路中實體的設備和介質，<br/>並<strong>將數據轉換為由 1 和 0 組成的位元流</strong>進行傳輸。", theStep:"<li>Wi-Fi：封包轉成無線電波。</li><li>有線網路：封包轉為電壓信號。</li>" },
};

// 名詞內容列表，加入了 `layer` 屬性來對應 colorGroups 的 key
const steps = [
  {base:" DHCP (Dynamic Host Configuration Protocol) <br>- 動態主機設定協定",detail:" <strong>自動分配 IP 位址</strong>及相關網路設定給連上網路的設備。",color:colorGroups.group7, layer: '應用層'},
  {base:" FTP (File Transfer Protocol) - 檔案傳輸協定",detail:" 傳統的檔案傳輸協定，因其傳輸過程為<strong>明文，非常不安全</strong>。",color:colorGroups.group7, layer: '應用層'},
  {base:" HTTP (HyperText Transfer Protocol) - 超文字傳輸協定",detail:" 傳輸網頁內容的基本協定，<strong>內容未經加密</strong>。",color:colorGroups.group7, layer: '應用層'},
  {base:" HTTPS (HyperText Transfer Protocol Secure) <br>- 安全超文字傳輸協定",detail:" HTTP 的<strong>加密安全版</strong>。",color:colorGroups.group7, layer: '應用層'},
  {base:" POP3 (Post Office Protocol 3) - 郵局協定第3版",detail:" 一種將郵件從伺服器下載到本地的收信協定。",color:colorGroups.group7, layer: '應用層'},
  {base:" SMTP (Simple Mail Transfer Protocol) - <br>簡易郵件傳輸協定",detail:" 專門負責發送<strong>電子郵件的協定</strong>。",color:colorGroups.group7, layer: '應用層'},
  {base:" DNS (Domain Name System) - 網域名稱系統",detail:" 負責將易於記憶的<strong>網域名稱轉換為機器可讀的 IP 位址</strong>。",color:colorGroups.group7, layer: '應用層'},
  {base:" SSH (Secure Shell) - 安全殼層協定",detail:" 提供一條<strong>加密的網路通道</strong>，讓使用者能夠安全地遠端登入並管理另一台電腦。",color:colorGroups.group7, layer: '應用層'},
  {base:" SSL (Secure Sockets Layer) - 安全通訊協定",detail:" 一種<strong>已被淘汰且不安全</strong>的早期加密協定。",color:colorGroups.group6, layer: '表示層'},
  {base:" TLS (Transport Layer Security) - 傳輸層安全性協定",detail:" SSL 的現代安全後繼者，是<strong>當前網站 HTTPS 加密的標準技術</strong>。",color:colorGroups.group6, layer: '表示層'},
  {base:" GIF (Graphics Interchange Format)",detail:" 這是一種<strong>支援256色</strong>、動畫和簡單透明背景的點陣圖格式，使用<strong>無失真壓縮</strong>。",color:colorGroups.group6, layer: '表示層'},
  {base:" JPEG (Joint Photographic Experts Group)",detail:" 這是一種使用<strong>失真壓縮技術</strong>的點陣圖格式，最適合儲存彩色照片和寫實圖像。",color:colorGroups.group6, layer: '表示層'},
  {base:" RPC (Remote Procedure Call) - 遠端程序呼叫",detail:" 一種允許一台電腦呼叫另一台電腦上<strong>子程式的技術</strong>。",color:colorGroups.group5, layer: '會話層'},
  {base:" TCP (Transmission Control Protocol) - 傳輸控制協定",detail:" 一種<strong>可靠、連線導向的傳輸協定</strong>，確保<strong>資料完整且有序地送達</strong>。",color:colorGroups.group4, layer: '傳輸層'},
  {base:" UDP (User Datagram Protocol) - 使用者資料包協定",detail:" 一種<strong>快速、無連線的傳輸協定</strong>，追求低延遲和高效率，<strong>不保證</strong>資料完整傳送。",color:colorGroups.group4, layer: '傳輸層'},
  {base:" Socket - 通訊端",detail:" 由<strong>IP 位址和 Port 號</strong>組合而成的網路連線唯一端點。",color:colorGroups.group4, layer: '傳輸層'},
  {base:" Port - 通訊埠",detail:" 應用程式的<strong>網路門牌號碼</strong>，讓作業系統能將網路資料轉交給正確的應用程式。",color:colorGroups.group4, layer: '傳輸層'},
  {base:" IP (Internet Protocol) - 網際協定",detail:" 網路世界的基本通訊規則，所有連網設備都<strong>必須有一個唯一的 IP 位址</strong>作為標識。",color:colorGroups.group3, layer: '網路層'},
  {base:" IPv4 / IPv6",detail:" 第四版 IP 協定，使用<strong>32</strong>位元位址。<br>下一代 IP 協定，使用<strong>128</strong>位元位址。",color:colorGroups.group3, layer: '網路層'},
  {base:" NAT (Network Address Translation) - 網路位址轉譯",detail:" 允許<strong>多個內部</strong>設備透過<strong>共享一個公共 IP </strong> 位址來上網的技術。",color:colorGroups.group3, layer: '網路層'},
  {base:" ICMP (Internet Control Message Protocol) <br>- 網際網路控制訊息協定",detail:" 用於診斷和回報網路連線狀態的協定，<strong>ping 和 tracert </strong> 工具皆基於此協定。",color:colorGroups.group3, layer: '網路層'},
  {base:" Router - 路由器",detail:" 連接不同網路的樞紐設備，會根據路由表為<strong>資料封包選擇最佳路徑 </strong>進行轉發。",color:colorGroups.group3, layer: '網路層'},
  {base:" IPSec (Internet Protocol Security) - 網際網路安全協定",detail:" 一套在 IP 層對資料封包<strong>進行加密和認證</strong>的安全協定，是<strong>建立 VPN 的關鍵技術</strong>。",color:colorGroups.group3, layer: '網路層'},
  {base:" MAC (Media Access Control) - 媒體存取控制",detail:" 燒錄在網路設備中的<strong>唯一實體硬體位址</strong>，用於在區域網路中定位目標設備。",color:colorGroups.group2, layer: '資料鏈結層'},
  {base:" Framing - 訊框化",detail:" 將上層的封包加上包含<strong>MAC 位址的標頭和用於錯誤檢查的結尾</strong>，封裝成訊框的過程。",color:colorGroups.group2, layer: '資料鏈結層'},
  {base:" ARP (Address Resolution Protocol) - 位址解析協定",detail:" 在區域網路中，用來<strong>透過目標的 IP 位址查詢其對應 MAC 位址的協定。</strong>",color:colorGroups.group2, layer: '資料鏈結層'},
  {base:" CSMA/CD (Carrier Sense Multiple Access <br>with Collision Detection) <br>- 載波感測多重存取/碰撞偵測",detail:" 一種早期的網路協定，運作方式為<strong>「先聽再說」</strong>，用於協調設備共享同一傳輸通道。",color:colorGroups.group2, layer: '資料鏈結層'},
  {base:" VLAN (Virtual Local Area Network) - 虛擬區域網路",detail:" 一種能將一台實體交換器在邏輯上劃分為<strong>多個獨立廣播網域</strong>的技術。",color:colorGroups.group2, layer: '資料鏈結層'},
  {base:" UTP (Unshielded Twisted Pair) - 無遮蔽雙絞線",detail:"<strong>最常見的乙太網路實體傳輸媒介</strong>，內部由四對相互纏繞的銅線組成，透過雙絞方式來抵銷電磁干擾。",color:colorGroups.group1, layer: '實體層'},
  {base:" Fiber - 光纖",detail:" 利用玻璃或塑料纖維，以光脈衝來傳輸資料的先進媒介，具有<strong>頻寬極高、傳輸距離極長、完全免疫於電磁干擾</strong>等巨大優勢。",color:colorGroups.group1, layer: '實體層'},
  {base:" Repeater - 中繼器",detail:"<strong>將衰減的訊號重新放大和整形</strong>後再轉發出去，以延長網路傳輸的距離。",color:colorGroups.group1, layer: '實體層'},
  {base:" Hub - 集線器",detail:" 一種多埠的中繼器，會<strong>將收到的訊號廣播到所有連接埠</strong>，現已被交換器取代。",color:colorGroups.group1, layer: '實體層'},
  {base:" ADSL (Asymmetric Digital Subscriber Line) <br>- 非對稱數位用戶線路",detail:" 利用傳統電話銅線提供寬頻上網的技術，其特點是<strong>下載速度遠高於上傳速度。</strong>",color:colorGroups.group1, layer: '實體層'},
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

const expandedIndices = ref(new Set());
function toggleExpand(index) {
  if (expandedIndices.value.has(index)) expandedIndices.value.delete(index);
  else expandedIndices.value.add(index);
  expandedIndices.value = new Set(expandedIndices.value); // 觸發更新
}

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