import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Question } from '@/types/question'
import type { AnswerReview, QuizConfig } from '@/types/quiz'
import { useProgressStore } from './progress'

const STORAGE_KEY = 'exam115:active-quiz:v1'

export const useQuizStore = defineStore('quiz', () => {
  const questions = ref<Question[]>([])
  const currentIndex = ref(0)
  const answers = ref<Record<string, string[]>>({})
  const submittedIds = ref<string[]>([])
  const config = ref<QuizConfig | null>(null)
  const startedAt = ref<number | null>(null)
  const completedAt = ref<number | null>(null)

  const currentQuestion = computed(() => questions.value[currentIndex.value])
  const isComplete = computed(() => completedAt.value !== null)
  const answeredCount = computed(() => Object.values(answers.value).filter((a) => a.length).length)
  const progressPercent = computed(() => questions.value.length ? Math.round((answeredCount.value / questions.value.length) * 100) : 0)
  const reviews = computed<AnswerReview[]>(() => questions.value.map((question) => {
    const selected = answers.value[question.id] ?? []
    return { question, selected, correct: sameAnswers(selected, question.answers) }
  }))
  const correctCount = computed(() => reviews.value.filter((item) => item.correct).length)
  const scorePercent = computed(() => questions.value.length ? Math.round((correctCount.value / questions.value.length) * 100) : 0)

  function start(allQuestions: Question[], nextConfig: QuizConfig) {
    const selected = allQuestions.filter((q) => nextConfig.categoryIds.some((categoryId) =>
      categoryId === slug(q.category) || q.id.startsWith(`${categoryId}-`),
    ) && nextConfig.questionTypes.includes(q.type))
    const ordered = nextConfig.shuffleQuestions ? shuffle(selected) : selected
    questions.value = ordered.slice(0, Math.min(nextConfig.questionCount, selected.length)).map((question) => {
      if (!nextConfig.shuffleOptions) return { ...question, options: [...question.options], answers: [...question.answers] }

      const answerMap: Record<string, string> = {}
      const options = shuffle(question.options).map((option, index) => {
        const displayId = String.fromCharCode(65 + index)
        answerMap[option.id] = displayId
        return { ...option, id: displayId }
      })

      return {
        ...question,
        options,
        answers: question.answers.map((answer) => answerMap[answer]),
      }
    })
    currentIndex.value = 0
    answers.value = {}
    submittedIds.value = []
    config.value = nextConfig
    startedAt.value = Date.now()
    completedAt.value = null
    persist()
  }

  function select(optionId: string) {
    const question = currentQuestion.value
    if (!question || isSubmitted(question.id) || isComplete.value) return
    const current = answers.value[question.id] ?? []
    answers.value[question.id] = question.type === 'single'
      ? [optionId]
      : current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    persist()
  }

  function submitCurrent() {
    const question = currentQuestion.value
    if (!question || !(answers.value[question.id]?.length)) return
    if (!submittedIds.value.includes(question.id)) submittedIds.value.push(question.id)
    const progress = useProgressStore()
    if (sameAnswers(answers.value[question.id] ?? [], question.answers)) progress.clearWrong(question.id)
    else progress.recordWrong(question.id)
    persist()
  }

  function finish() {
    completedAt.value = Date.now()
    const progress = useProgressStore()
    reviews.value.filter((item) => !item.correct).forEach((item) => progress.recordWrong(item.question.id))
    progress.addResult({
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      categoryIds: config.value?.categoryIds ?? [],
      total: questions.value.length,
      correct: correctCount.value,
      percentage: scorePercent.value,
      durationSeconds: Math.round(((completedAt.value ?? Date.now()) - (startedAt.value ?? Date.now())) / 1000),
    })
    localStorage.removeItem(STORAGE_KEY)
  }

  function goTo(index: number) {
    if (index >= 0 && index < questions.value.length) {
      currentIndex.value = index
      persist()
    }
  }

  function isSubmitted(id: string) {
    return submittedIds.value.includes(id)
  }

  function reset() {
    questions.value = []
    currentIndex.value = 0
    answers.value = {}
    submittedIds.value = []
    config.value = null
    startedAt.value = null
    completedAt.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      questions: questions.value,
      currentIndex: currentIndex.value,
      answers: answers.value,
      submittedIds: submittedIds.value,
      config: config.value,
      startedAt: startedAt.value,
    }))
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
      if (!saved?.questions?.length) return false
      questions.value = saved.questions
      currentIndex.value = saved.currentIndex ?? 0
      answers.value = saved.answers ?? {}
      submittedIds.value = saved.submittedIds ?? []
      config.value = {
        categoryIds: [],
        questionTypes: ['single', 'multiple'],
        questionCount: saved.questions.length,
        mode: 'practice',
        timeLimitMinutes: null,
        shuffleQuestions: true,
        shuffleOptions: true,
        ...(saved.config ?? {}),
      }
      startedAt.value = saved.startedAt
      completedAt.value = null
      return true
    } catch {
      return false
    }
  }

  return {
    questions, currentIndex, answers, submittedIds, config, startedAt, completedAt,
    currentQuestion, isComplete, answeredCount, progressPercent, reviews, correctCount, scorePercent,
    start, select, submitCurrent, finish, goTo, isSubmitted, reset, restore,
  }
})

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function sameAnswers(a: string[], b: string[]) {
  return [...a].sort().join(',') === [...b].sort().join(',')
}

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
}
