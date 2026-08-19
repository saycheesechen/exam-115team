import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { QuizMode } from '@/types/quiz'

const STORAGE_KEY = 'exam115:settings:v1'

interface SavedSettings {
  questionCount: number
  mode: QuizMode
  timeLimitMinutes: number | null
  shuffleQuestions: boolean
  shuffleOptions: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadSettings()
  const questionCount = ref(saved.questionCount)
  const mode = ref<QuizMode>(saved.mode)
  const timeLimitMinutes = ref<number | null>(saved.timeLimitMinutes)
  const shuffleQuestions = ref(saved.shuffleQuestions)
  const shuffleOptions = ref(saved.shuffleOptions)

  watch([questionCount, mode, timeLimitMinutes, shuffleQuestions, shuffleOptions], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      questionCount: questionCount.value,
      mode: mode.value,
      timeLimitMinutes: timeLimitMinutes.value,
      shuffleQuestions: shuffleQuestions.value,
      shuffleOptions: shuffleOptions.value,
    }))
  })

  return { questionCount, mode, timeLimitMinutes, shuffleQuestions, shuffleOptions }
})

function loadSettings(): SavedSettings {
  try {
    return { questionCount: 20, mode: 'practice', timeLimitMinutes: null, shuffleQuestions: true, shuffleOptions: true, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return { questionCount: 20, mode: 'practice', timeLimitMinutes: null, shuffleQuestions: true, shuffleOptions: true }
  }
}
