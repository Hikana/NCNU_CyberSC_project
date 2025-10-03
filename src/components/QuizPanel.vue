<!--
<template>
  <div v-if="visible" class="quiz-panel">
    <button class="close-btn" @click="closePanel">×</button>
    <div class="quiz-header">
      <div class="quiz-category">{{ categoryName }}</div>
      <h3>探索挑戰</h3>
    </div>
    <div class="quiz-question">
      第 {{ questionIndex + 1 }}/{{ totalQuestions }} 題：{{ currentQuestion?.question }}
    </div>
    <div class="quiz-options">
      <button
        v-for="(option, i) in currentQuestion?.options"
        :key="i"
        :class="['quiz-option', { selected: selectedAnswer === i }]"
        @click="selectAnswer(i)"
      >
        {{ String.fromCharCode(65 + i) }}. {{ option }}
      </button>
    </div>
    <div v-if="showResult" class="quiz-result" :class="{ correct: isCorrect, wrong: !isCorrect }">
      <div><strong>{{ isCorrect ? "✅ 答對了！" : "❌ 答錯了！" }}</strong></div>
    </div>
    <div class="quiz-buttons">
      <button v-if="!showResult" class="quiz-btn" :disabled="selectedAnswer === null" @click="submitAnswer">
        提交答案
      </button>
      <button v-if="showResult && questionIndex + 1 < totalQuestions" class="quiz-btn" @click="nextQuestion">
        下一題
      </button>
      <button v-if="showResult && questionIndex + 1 >= totalQuestions" class="quiz-btn" @click="completeQuiz">
        完成探索
      </button>
    </div>
  </div>
</template>

<script setup>
/* ✅ 改成 <script setup> 寫法 */
import { ref } from "vue"
import { getRandomQuestions } from "../services/questionService"

/* 狀態變數 */
const visible = ref(false)
const categoryName = ref("")
const questions = ref([])
const currentQuestion = ref(null)
const selectedAnswer = ref(null)
const isCorrect = ref(false)
const showResult = ref(false)
const questionIndex = ref(0)
const totalQuestions = ref(0)
const correctAnswers = ref(0)

/* 定義 startQuiz，GamePage 才能呼叫 */
async function startQuiz() {
  console.log("startQuiz 被呼叫了!")

  questions.value = await getRandomQuestions(3)  // 例如隨機選 1 題
  console.log("隨機題目：", questions.value)

  categoryName.value = "隨機挑戰"
  questionIndex.value = 0
  correctAnswers.value = 0
  totalQuestions.value = questions.value.length
  visible.value = true
  showQuestion()
}

function showQuestion() {
  currentQuestion.value = questions.value[questionIndex.value]
  selectedAnswer.value = null
  showResult.value = false
}

function selectAnswer(index) {
  if (showResult.value) return
  selectedAnswer.value = index
}

function submitAnswer() {
  if (selectedAnswer.value === null) return
  // 取玩家選的答案  Firestore 的 correctAnswer 是字串
  const chosen = currentQuestion.value.options[selectedAnswer.value]
  isCorrect.value = chosen === currentQuestion.value.correctAnswer
  //isCorrect.value = currentQuestion.value.options[selectedAnswer.value] === currentQuestion.value.correctAnswer
  
  if (isCorrect.value) correctAnswers.value++
  showResult.value = true
}

function nextQuestion() {
  questionIndex.value++
  showQuestion()
}

function completeQuiz() {
  alert(`探索完成！答對：${correctAnswers.value}/${totalQuestions.value} 題`)
  closePanel()
}

function closePanel() {
  visible.value = false
}

/* ✅ 關鍵：暴露 startQuiz/closePanel 給父層 (GamePage.vue) 呼叫 */
defineExpose({
  startQuiz,
  closePanel
})
</script>

<style scoped>
.quiz-panel {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  max-width: 500px;
  margin: auto;
}
.quiz-option.selected { background-color: #cce5ff; }
.quiz-result.correct { color: green; }
.quiz-result.wrong { color: red; }
</style> 
-->
<template></template>