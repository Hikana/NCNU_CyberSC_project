<template>
  <section class="aaa-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 背景 AAA 字 -->
    <div class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
      <span class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[25rem]">
        A A A
      </span>
    </div>

    <!-- 主內容區 -->
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">
        
        <!-- 左欄：標題、說明與按鈕 -->
        <div class="text-left self-start">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            身份與授權三要素 <span class="italic">AAA</span>
          </h2>
          <div class="text-lg md:text-xl leading-relaxed space-y-4 mb-8">
            <h4 class="text-2xl font-semibold mb-2">AAA 是身份驗證與授權的核心框架。</h4>
            <h4 class="text-2xl font-semibold mb-2">它們確保系統能夠辨識使用者身份、限制可執行的操作，</h4>
            <h4 class="text-2xl font-semibold mb-2">並記錄每一項行為，讓系統在安全性與可追蹤性之間取得平衡。</h4>
          </div>
          
          <!-- 三個按鈕 -->
          <div class="flex gap-6">
            <button
              v-for="item in aaaElements"
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

        <!-- 右欄：內容（白底框＋可滾動） -->
        <div class="text-left self-start">
          <div
            class="bg-lightGray text-wordcolor rounded-2xl shadow-lg p-6 md:p-8 max-h-[65vh] overflow-y-auto border border-gray-300"
          >
            <!-- 顯示選中的內容 -->
            <div v-if="selectedContent" class="space-y-6">
              <h3 class="font-semibold text-2xl mb-2">
                {{ selectedContent.title }}
              </h3>
              <h4 class="text-xl mb-4 text-gray-700">{{ selectedContent.subtitle }}</h4>

              <!-- 遍歷 contents -->
              <div v-for="(content, cIndex) in selectedContent.contents" :key="cIndex" class="mb-6">
                <h4 class="font-semibold text-xl mb-2">{{ content.subtitle }}</h4>
                <p class="text-base md:text-xl leading-relaxed mb-3" v-html="content.text"></p>

                <!-- 如果有 subcontents -->
                <div v-if="content.subcontents" class="ml-4 space-y-3">
                  <div v-for="(subcontent, sIndex) in content.subcontents" :key="sIndex">
                    <h5 class="font-medium text-xl mb-1">
                      <li>{{ subcontent.subtitle }}</li>
                    </h5>
                    <p class="text-sm md:text-lg leading-relaxed" v-html="subcontent.text"></p>

                    <!-- 如果有 subsubcontents -->
                    <div v-if="subcontent.subsubcontents" class="ml-4 mt-2 space-y-2">
                      <div v-for="(subsubcontent, ssIndex) in subcontent.subsubcontents" :key="ssIndex">
                        <h6 class="font-medium text-lg mb-1">
                          <li>{{ subsubcontent.subtitle }}</li>
                        </h6>
                        <p class="text-lg leading-relaxed" v-html="subsubcontent.text"></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> <!-- end scroll box -->
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from "vue"

export default {
  name: "AAABar",
  setup() {
    // 預設選擇第一個 (認證)
    const selectedId = ref('認證')

    // AAA 資料
    const aaaElements = ref([
      {
        id: "認證",
        title: "認證 (Authentication)",
        subtitle: "可鑑別性 Authenticity",
        contents: [
          {
            subtitle: "你是誰？",
            text: "識別資訊使用者的身分，可記錄資訊被誰所存取使用，例如：透過密碼或憑證方式驗證使用者身分。",
            subcontents: [
              { subtitle: "你所知道的（Something you know）：", text: "帳號／密碼" },
              { subtitle: "你所擁有的（Something you have）：", text: "IC卡、數位裝置、數位簽章、一次性密碼(OTP)" },
              { subtitle: "你所具備的（Something you are）：", text: "指紋、虹膜、聲紋、臉部特徵、靜脈脈紋、DNA" }
            ]
          }
        ]
      },
      {
        id: "授權",
        title: "授權 (Authorization)",
        subtitle: "存取權限控制 Access Control",
        contents: [
          {
            subtitle: "你能做什麼？",
            text: "依照實際需求給予實體適當的權限",
            subcontents: [
              {
                subtitle: "常見的分類方法",
                text: "",
                subsubcontents: [
                  { subtitle: "強制存取控制（Mandatory Access Control）", text: "作業系統強制執行的存取控制機制..." },
                  { subtitle: "自由選定存取控制（Discretionary Access Control）", text: "根據使用者身份決定訪問權限..." },
                  { subtitle: "以角色為基礎的存取控制（Role-Based Access Control）", text: "使用者獲取特定角色後自動擁有權限..." }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "紀錄",
        title: "紀錄 (Accounting)",
        subtitle: "不可否認性 Non-repudiation",
        contents: [
          {
            subtitle: "記錄你做了什麼",
            text: "為了收集使用者與系統之間互動的資料，留下軌跡紀錄。",
            subcontents: [
              { subtitle: "行為：", text: "量測（Measuring）、監控（Monitoring）、報告（Reporting）與紀錄檔案 (Logging)" },
              { subtitle: "應用：", text: "幫助未來進行稽核（Auditing）、計費（Billing）、分析（Analysis）、管理" }
            ]
          }
        ]
      }
    ])

    const selectedContent = computed(() =>
      aaaElements.value.find(item => item.id === selectedId.value)
    )

    return { aaaElements, selectedId, selectedContent }
  }
}
</script>

<style scoped>
.aaa-section {
  overflow: hidden;
}
</style>
