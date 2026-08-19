import { computed, ref } from 'vue'
import type { QuestionBank } from '@/types/question'

const bank = ref<QuestionBank>({ generatedAt: '', questionCount: 0, categories: [] })
const cache = ref<Record<string, QuestionBank['questions']>>({})
const loading = ref(false)
const error = ref('')
let loaded = false

export function useQuestionBank() {
  async function load() {
    if (loaded || loading.value) return
    loading.value = true
    error.value = ''
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/index.json`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      bank.value = await response.json() as QuestionBank
      loaded = true
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '題庫載入失敗'
    } finally {
      loading.value = false
    }
  }

  async function loadQuestions(categoryIds: string[]) {
    await load()
    loading.value = true
    error.value = ''
    try {
      await Promise.all(categoryIds.filter((id) => !cache.value[id]).map(async (id) => {
        const response = await fetch(`${import.meta.env.BASE_URL}data/${id}.json`)
        if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`)
        const subject = await response.json() as QuestionBank
        cache.value[id] = subject.questions ?? []
      }))
      return categoryIds.flatMap((id) => cache.value[id] ?? [])
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '科目題庫載入失敗'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    bank,
    categories: computed(() => bank.value.categories),
    questions: computed(() => Object.values(cache.value).flatMap((items) => items ?? [])),
    loading,
    error,
    load,
    loadQuestions,
  }
}
