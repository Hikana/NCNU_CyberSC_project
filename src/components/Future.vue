<template>
  <div class="flex flex-col items-center gap-14 p-10 bg-bgg">
    <!-- 每一組粉+紫卡 -->
    <div
      v-for="(card, index) in cards"
      :key="index"
      class="relative w-full flex justify-start"
      ref="cardGroups"
    >
      <!-- 粉紅卡（左邊） -->
      <div
        class="bg-middleGray text-wordcolor rounded-2xl p-6 w-[600px] h-auto shadow-lg z-10 relative left-[-60px]"
      >
        <h2 class="text-3xl font-bold mb-4" v-html="card.title"></h2>
        <p class="text-xl font-bold mb-4"v-html="card.text"></p>
      </div>

      <!-- 紫色卡（右邊，滾動控制） -->
      <div
        ref="purpleCards"
        class="absolute bg-lightGray text-wordcolor rounded-2xl p-6 w-96 h-auto shadow-md top-0 left-36 opacity-0"
      >
        <h2 class="text-2xl font-bold mb-4" v-html="card.hiddenTitle"></h2>
        <div class="text-lg"v-html="card.hiddenText"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { gsap } from "gsap";

const purpleCards = ref([]);
const cardGroups = ref([]);

const cards = [
  {
    title: "紅隊（攻擊導向）",
    text: `
      <b>常見職稱：<br></b>Red Team Operator、Penetration Tester、<br>Offensive Security Engineer<br><br>
      <b>常用工具：<br></b>Metasploit、Burp Suite、Nmap、Impacket、BloodHound、Cobalt Strike<br><br>
      <b>證照：<br></b>eJPT、OSCP、eCPPT、OSCE<br>
      
    `,
    hiddenTitle: "紅隊詳情",
    hiddenText: `
      <b>實作/作品：<br></b>公開滲透測試報告、滲透測試腳本、CTF 解題紀錄<br><br>
      <b>面試重點：<br></b>滲透流程、漏洞利用示範、報告結構、攻擊思路（Threat Modeling）<br><br>
      <b>職涯路徑：<br></b>Junior Pentester → Senior Pentester → Red Team Lead / Offensive CTI
      `,
  },
  {
    title: "藍隊（防守導向）",
    text: `
      <b>常見職稱：<br></b>SOC Analyst、Incident Responder、Threat Hunter、Blue Team Engineer<br><br>
      <b>常用工具：<br></b>Splunk / ELK / QRadar、Suricata、OSSEC、Velociraptor、Cortex XSOAR<br><br>
      <b>證照：<br></b>Security+、GCIA、GCIH、CISSP、CISM
    `,
    hiddenTitle: "藍隊詳情",
    hiddenText: `
    <b>實作/作品：<br></b>事件回應報告、SIEM 規則、模擬惡意樣本偵測流程<br><br>
      <b>面試重點：<br></b>事件調查流程、log 分析能力、SIEM 規則撰寫<br><br>
      <b>職涯路徑：<br></b>SOC Tier1 → SOC Tier2/IR → Threat Hunter → SOC Manager / Head of Security Ops
    `,
  },
  {
    title: "逆向工程（Reverse Engineering）",
    text: `
      <b>常見職稱：<br></b>Reverse Engineer、Malware Analyst、Vulnerability Researcher<br><br>
      <b>常用工具：<br></b>Ghidra、IDA Pro、Radare2、x64dbg、OllyDbg、Binary Ninja<br><br>
      <b>推薦資源：<br></b>CrackMe、Malware 分析 Lab、CTF（pwn/reverse）<br>
      `,
    hiddenTitle: "逆向工程詳情",
    hiddenText: `<b>實作/作品：<br></b>malware analysis report、exploit PoC、漏洞研究部落格<br><br>
      <b>面試重點：<br></b>靜態/動態分析流程、匯編理解、packing/obfuscation 辨識<br><br>
      <b>職涯路徑：<br></b>Analyst → Senior RE/Exploit Dev → Vulnerability Research Lead
    `,
  },
  {
    title: "應用安全 / Web 安全",
    text: `
      <b>常見職稱：<br></b>Application Security Engineer、Web App Pentester、Secure Code Reviewer<br><br>
      <b>常用工具：<br></b>Burp Suite、OWASP ZAP、Snyk、Semgrep、Dependabot<br><br>
      <b>證照：<br></b>eWPT、OSWE、GWAPT、CSSLP<br>
      
    `,
    hiddenTitle: "應用安全詳情",
    hiddenText: `<b>實作/作品：<br></b>安全審查 checklist、Code Review 範例、修補建議 PR<br><br>
      <b>面試重點：<br></b>OWASP Top10、代碼漏洞修補、設計安全建議<br><br>
      <b>職涯路徑：<br></b>AppSec Engineer → Secure SDLC Owner → AppSec Manager`,
  },
];

onMounted(async () => {
  await nextTick();

  const updateScrollEffect = () => {
    const windowHeight = window.innerHeight;

    purpleCards.value.forEach((card, index) => {
      const group = cardGroups.value[index];
      const rect = group.getBoundingClientRect();

      // 計算卡片在畫面內的進度 (0~1)
      const progress = 1 - Math.min(Math.max(rect.top / windowHeight, 0), 1);

      // 限制最大移動距離 520px
      const moveX = Math.min(progress * 1000, 520);

      // 淡入與位移動畫
      gsap.to(card, {
        x: moveX,
        opacity: progress > 0.1 ? 1 : 0,
        duration: 0.15,
        ease: "power2.out",
      });
    });
  };

  window.addEventListener("scroll", updateScrollEffect);
  updateScrollEffect();

  onUnmounted(() => {
    window.removeEventListener("scroll", updateScrollEffect);
  });
});
</script>

<style scoped>
.w-full {
  max-width: 1000px;
}
</style>
