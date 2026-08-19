import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { QuizResult } from '@/types/quiz'

const STORAGE_KEY = 'exam115:progress:v1'

interface SavedProgress {
  wrongQuestionIds: string[]
  history: QuizResult[]
  questionRatings: Record<string, number>
  questionNotes: Record<string, string>
}

export const useProgressStore = defineStore('progress', () => {
  const saved = loadProgress()
  const wrongQuestionIds = ref(saved.wrongQuestionIds)
  const history = ref(saved.history)
  const questionRatings = ref(saved.questionRatings)
  const questionNotes = ref(saved.questionNotes)
  const averageScore = computed(() => history.value.length
    ? Math.round(history.value.reduce((sum, item) => sum + item.percentage, 0) / history.value.length)
    : 0)

  function recordWrong(questionId: string) {
    if (!wrongQuestionIds.value.includes(questionId)) wrongQuestionIds.value.push(questionId)
  }

  function clearWrong(questionId: string) {
    wrongQuestionIds.value = wrongQuestionIds.value.filter((id) => id !== questionId)
  }

  function clearAllWrong() {
    wrongQuestionIds.value = []
  }

  function addResult(result: QuizResult) {
    history.value.unshift(result)
    history.value = history.value.slice(0, 50)
  }

  function clearHistory() {
    history.value = []
  }

  function setQuestionRating(questionId: string, rating: number) {
    const normalized = Math.max(0, Math.min(3, Math.round(rating)))
    if (normalized === 0) delete questionRatings.value[questionId]
    else questionRatings.value[questionId] = normalized
  }

  function setQuestionNote(questionId: string, note: string) {
    const normalized = note.slice(0, 200)
    if (normalized.trim()) questionNotes.value[questionId] = normalized
    else delete questionNotes.value[questionId]
  }

  watch([wrongQuestionIds, history, questionRatings, questionNotes], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      wrongQuestionIds: wrongQuestionIds.value,
      history: history.value,
      questionRatings: questionRatings.value,
      questionNotes: questionNotes.value,
    }))
  }, { deep: true })

  return { wrongQuestionIds, history, questionRatings, questionNotes, averageScore, recordWrong, clearWrong, clearAllWrong, addResult, clearHistory, setQuestionRating, setQuestionNote }
})

function loadProgress(): SavedProgress {
  try {
    return { wrongQuestionIds: [], history: [], questionRatings: {}, questionNotes: {}, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return { wrongQuestionIds: [], history: [], questionRatings: {}, questionNotes: {} }
  }
}
