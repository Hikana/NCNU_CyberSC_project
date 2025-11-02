<template>
  <section class="cia-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 背景 CIA 字 -->
    <div class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
      <span class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[25rem]">
        C I A
      </span>
    </div>

    <!-- 主內容區 -->
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">
        <!-- 左欄：標題、說明與按鈕 -->
        <div class="text-left self-start">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            安全三要素 <span class="italic">CIA</span>
          </h2>
          <div class="leading-relaxed space-y-4 mb-8">
            <h4 class="text-2xl font-semibold mb-2"><br/>CIA資訊安全三要素是常見的模型，</h4>
            <h4 class="text-2xl font-semibold mb-2">構成安全系統開發的基礎。</h4>
            <h4 class="text-2xl font-semibold mb-2">它們是用來尋找弱點和建立解決方案的方法。</h4>
          </div>
          
          <!-- 三個按鈕 -->
          <div class="flex gap-6">
            <button
              v-for="item in ciaElements"
              :key="item.id"
              @click="selectedId = item.id"
              :class="[
                'w-20 h-20 rounded-full text-3xl font-bold transition-all duration-300 flex items-center justify-center',
                selectedId === item.id 
                  ? 'bg-middleGray text-wordcolor scale-110' 
                  : 'bg-wordcolor text-white hover:bg-gray-500'
              ]"
            >
              {{ item.id }}
            </button>
          </div>
        </div>

        <!-- 右欄：內容（加上白底長方形 + 可滾動） -->
        <div class="text-left self-start">
          <div
            class="bg-lightGray text-wordcolor rounded-2xl shadow-lg p-6 md:p-8 max-h-[65vh] overflow-y-auto border border-gray-300"
          >
            <div v-if="selectedContent" class="space-y-6">
              <h3 class="font-semibold text-2xl mb-4">
                {{ selectedContent.title }}
              </h3>
              
              <!-- 遍歷 contents -->
              <div
                v-for="(content, cIndex) in selectedContent.contents"
                :key="cIndex"
                class="mb-6"
              >
                <h4 class="font-semibold text-xl mb-2">{{ content.subtitle }}</h4>
                <p
                  class="text-base md:text-xl leading-relaxed mb-3"
                  v-html="content.text"
                ></p>
                
                <!-- 如果有 subcontents -->
                <div v-if="content.subcontents" class="ml-4 space-y-3">
                  <div
                    v-for="(subcontent, sIndex) in content.subcontents"
                    :key="sIndex"
                  >
                    <h5 class="font-medium text-xl mb-1">
                      <li>{{ subcontent.subtitle }}</li>
                    </h5>
                    <p
                      class="text-sm md:text-xl leading-relaxed"
                      v-html="subcontent.text"
                    ></p>
                    
                    <!-- 如果有 subsubcontents -->
                    <div
                      v-if="subcontent.subsubcontents"
                      class="ml-4 mt-2 space-y-2"
                    >
                      <div
                        v-for="(subsubcontent, ssIndex) in subcontent.subsubcontents"
                        :key="ssIndex"
                      >
                        <p
                          class="text-lg leading-relaxed"
                          v-html="subsubcontent.text"
                        ></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> <!-- end scrollable box -->
        </div>
      </div>
    </div>
  </section>
</template>


<script>
import { ref, computed } from "vue"

export default {
  name: "CIABar",
  setup() {
    // 預設選擇第一個 (C)
    const selectedId = ref('C')
    
    // 直接顯示資料
    const ciaElements = ref([
      {
        id: "C",
        title: "機密性（Confidentiality）",
        contents: [
          {
            subtitle: "定義：",
            text: "採用適當安全機制保護資料以避免暴露於無權限人員或程式之下。這在保護個人隱私、金融交易、企業機密、政府機構機密等方面都至關重要。"
          },
          {
            subtitle: "會破壞機密性的風險？",
            subcontents: [
              {
                subtitle: "未授權存取：",
                text: "駭客入侵你的電腦，竊取你的私人照片、公司機密檔案。"
              },
              {
                subtitle: "資料外洩：",
                text: "員工離職前偷偷下載公司的機密技術檔案，賣給競爭對手。"
              },
              {
                subtitle: "社交工程攻擊：",
                text: "詐騙集團假裝是銀行客服，打電話騙走你的信用卡資訊。"
              }
            ]
          },
          {
            subtitle: "怎麼保護機密性？",
            subcontents: [
              {
                subtitle: "加密 (Encryption)：",
                text: "讓資料變成亂碼，沒有密碼的人看不懂。就像你寄一封信，裡面全是 「#@%&」這種亂碼，只有收信人知道解讀方式。確保即使資料被竊取，駭客也無法解讀內容。",
                subsubcontents: [
                  {
                    text: "使用磁碟加密軟體（ex. VeraCrypt），可以建立實體磁碟上的加密區域、建立加密虛擬磁碟檔案並掛載使用。"
                  }
                ]
              },
              {
                subtitle: "多重驗證 (2FA, MFA) & 角色權限管理 (RBAC, ABAC)：",
                text: "<ul><li>登入時除了密碼，還要驗證你的手機驗證碼（OTP one time password）或指紋。就像你開保險箱不只需要鑰匙，還要指紋掃描。</li><li>不同層級的使用者只能存取對應的資料，例如員工不能查看 CEO 的郵件。</li></ul>",
              },
              {
                subtitle: "資料分池（Sharding）& 金鑰分池（Key Sharding）：",
                text: "<ul><li>資料分池將一份機密檔案拆成三部分，分別存放在不同伺服器，就算駭客入侵其中一台，也無法看到完整的資料。</li><li>金鑰分池就是讓多個人分別掌握加密金鑰的一部分，沒有人可以單獨解密資料。即使駭客攻破其中一個資料庫或者金鑰，也無法取得完整的資訊。</li></ul>",
              },
            ]
          },
          {
            subtitle: "實際案例：",
            subcontents: [
              {
                subtitle: "明星iCloud照片外洩事件：",
                text: "2014年，多位明星的iCloud帳號遭駭客破解，私人照片外流，造成嚴重的隱私與名譽損害。這就是機密性被破壞。"
              },
              {
                subtitle: "醫院電腦中毒，病患資料被公開販售：",
                text: "駭客入侵醫療系統，將患者病歷與聯絡方式放到暗網販售，導致個資曝光、勒索案件發生。"
              },
              {
                subtitle: "公司USB遺失：",
                text: "員工將客戶資料存入USB，結果在捷運上遺失。若資料未加密，任何人撿到就能查看，造成重大洩密。"
              }
            ]
          }
        ]
      },
      {
        id: "I",
        title: "完整性（Integrity）",
        contents: [
          {
            subtitle:"定義：",
            text:"完整性就是確保資料在傳輸、儲存、處理的過程中不會被未授權的修改，且修改後可以被偵測到。簡單來說，你看到的東西應該是「原汁原味」，而不是被偷偷改過的！"
          },
          {
            subtitle: "會破壞完整性的風險？",
            subcontents: [
              {
                subtitle: "資料篡改 (Data Tampering)：",
                text: "駭客竄改你的成績單，把 90 分變成 59 分，然後你就延畢了。"
              },
              {
                subtitle: "中間人攻擊 (Man-in-the-Middle Attack, MITM)：",
                text: "你連上免費 Wi-Fi 轉帳時，駭客在中間偷偷修改你的匯款對象，把錢轉到他的帳戶。"
              },
            ]
          },
          {
            subtitle: "怎麼確保完整性？",
            subcontents: [
              {
                subtitle: "雜湊函數 (Hashing) & 數位簽章 (Digital Signature)：",
                subsubcontents: [
                  {
                    text: "<ul><li>雜湊函數：單向不可逆的計算，只要有一點點變動，兩個就是不一樣的東西了。</li><li>數位簽章：使用私鑰加密、公鑰解密，就是「電子世界的簽名」。</li></ul>"
                  }
                ]
              },
            ]
          },
          {
            subtitle: "實際案例：",
            subcontents: [
              {
                subtitle: "轉帳金額被竄改：",
                text: "你透過公共Wi-Fi轉帳給朋友 1000 元，但中間人攻擊讓金額被竄改為100000元且收款人變成駭客。這就是完整性被破壞。"
              },
              {
                subtitle: "維基百科惡搞事件：",
                text: "有人惡意修改維基百科條目，把歷史人物名字改掉或貼上不實資訊，使讀者無法獲得正確資料。"
              },
            ]
          }
        ]
      },
      {
        id:"A",
        title: "可用性（Availability）",
        contents: [
          {
            subtitle:"定義：",
            text:"可用性就是確保系統和資料隨時可用，不會因為攻擊或故障而癱瘓。你應該能在任何時候存取你的銀行帳戶，而不是因為某個駭客搞破壞，你的錢就變成「無法顯示餘額」。"
          },
          {
            subtitle: "會破壞可用性的風險？",
            subcontents: [
              {
                subtitle: "DDoS 攻擊與系統過載：",
                text: "指攻擊者透過大量分散的設備發送大量請求，使目標伺服器無法處理正常流量，最終導致伺服器過載，無法提供服務。"
              },
              {
                subtitle: "硬體故障 & 天然災害：",
                text: "伺服器當機、機房起火、地震摧毀資料中心，導致網站或服務掛掉。"
              },
            ]
          },
          {
            subtitle: "怎麼確保可用性？",
            subcontents: [
              {
                subtitle: "負載平衡 ( Load Balancing ) & 高可用架構 (High Availability, HA)：",
                subsubcontents: [
                  {
                    text: "<ul><li>雜湊函數：單向不可逆的計算，只要有一點點變動，兩個就是不一樣的東西了。</li><li>數位簽章：使用私鑰加密、公鑰解密，就是「電子世界的簽名」。</li></ul>"
                  }
                ]
              },
              {
                subtitle: "災難復原 (Disaster Recovery, DR) & 自動備份：",
                subsubcontents: [
                  {
                    text: "<ul><li>異地備援 (Geo-Redundancy)，確保即使某個地區的伺服器故障，其他地區仍能提供服務。</li><li>自動備份，讓資料能夠快速還原，即使勒索病毒攻擊也不怕。</li></ul>"
                  }
                ]
              }
            ]
          },
          {
            subtitle: "實際案例：",
            subcontents: [
              {
                subtitle: "LINE / IG 突然連不上：",
                text: "如果像LINE或Instagram因伺服器故障、DDoS被癱瘓幾小時，全世界的人都無法傳訊息，這就是可用性失效。"
              },
              {
                subtitle: "銀行系統維護突然關閉：",
                text: "某銀行因系統更新中斷3小時，使用者無法提款、轉帳或刷卡，被視為可用性不足。"
              },
              {
                subtitle: "勒索病毒攻擊醫院：",
                text: "醫院系統被勒索軟體攻擊，所有病患資料被鎖住，醫師無法開藥、安排手術，造成醫療延誤。"
              }
            ]
          }
        ]
      },
    ])

    // 計算當前選中的內容
    const selectedContent = computed(() => {
      return ciaElements.value.find(item => item.id === selectedId.value)
    })

    return { ciaElements, selectedId, selectedContent }
  },
}
</script>

<style scoped>
.cia-section {
  overflow: hidden;
}
</style>