// src/services/questionService.js
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase"

// 從 Firestore 撈全部題目，然後隨機打亂
export async function getRandomQuestions(limit = 3) {
  const querySnapshot = await getDocs(collection(db, "questions"))
  const questions = []
  querySnapshot.forEach((doc) => {
    questions.push({ id: doc.id, ...doc.data() })
  })

  console.log("Firestore 全部題目：", questions)

  // 隨機打亂題目順序
  const shuffled = questions.sort(() => 0.5 - Math.random())

  // 取前 limit 題
  return shuffled.slice(0, limit)
}
