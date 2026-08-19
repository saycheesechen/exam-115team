<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionBank } from '@/composables/useQuestionBank'
import { useQuizStore } from '@/stores/quiz'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import StatCard from '@/components/StatCard.vue'
import type { QuestionType } from '@/types/question'

const router = useRouter()
const quiz = useQuizStore()
const settings = useSettingsStore()
const progress = useProgressStore()
const { bank, categories, loading, error, load, loadQuestions } = useQuestionBank()
const selectedCategories = ref<string[]>([])
const subjectsOpen = ref(true)
const hasSavedQuiz = ref(false)
const selectedQuestionTypes = ref<QuestionType[]>(['single', 'multiple'])
const questionPreset = ref<'' | '10' | '20' | '50' | '100' | 'all' | 'custom'>('')
const customQuestionCount = ref(20)
const availableCount = computed(() => categories.value.filter((item) => selectedCategories.value.includes(item.id)).reduce((sum, item) => {
  if (selectedQuestionTypes.value.length === 2) return sum + item.count
  if (selectedQuestionTypes.value.includes('single')) return sum + item.singleCount
  if (selectedQuestionTypes.value.includes('multiple')) return sum + item.multipleCount
  return sum
}, 0))
const selectedQuestionCount = computed(() => {
  if (!questionPreset.value) return 0
  if (questionPreset.value === 'all') return availableCount.value
  const requested = questionPreset.value === 'custom' ? customQuestionCount.value : Number(questionPreset.value)
  return Math.max(1, Math.min(requested || 1, availableCount.value))
})

onMounted(async () => {
  hasSavedQuiz.value = quiz.restore()
  if (!hasSavedQuiz.value) localStorage.removeItem('exam115:active-quiz:v1')
  await load()
  if (!selectedCategories.value.length) selectedCategories.value = categories.value.map((item) => item.id)
})

function toggleCategory(id: string) {
  selectedCategories.value = selectedCategories.value.includes(id)
    ? selectedCategories.value.filter((item) => item !== id)
    : [...selectedCategories.value, id]
}

function toggleQuestionType(type: QuestionType) {
  selectedQuestionTypes.value = selectedQuestionTypes.value.includes(type)
    ? selectedQuestionTypes.value.filter((item) => item !== type)
    : [...selectedQuestionTypes.value, type]
}

async function startQuiz() {
  if (!selectedCategories.value.length || !selectedQuestionTypes.value.length || !questionPreset.value || selectedQuestionCount.value < 1) return
  const selectedQuestions = await loadQuestions(selectedCategories.value)
  if (!selectedQuestions.length) return
  quiz.start(selectedQuestions, {
    categoryIds: selectedCategories.value,
    questionTypes: selectedQuestionTypes.value,
    questionCount: selectedQuestionCount.value,
    mode: settings.mode,
    timeLimitMinutes: settings.timeLimitMinutes && settings.timeLimitMinutes > 0 ? settings.timeLimitMinutes : null,
    shuffleQuestions: settings.shuffleQuestions,
    shuffleOptions: settings.shuffleOptions,
  })
  settings.questionCount = selectedQuestionCount.value
  router.push('/quiz')
}

function resumeQuiz() {
  if (quiz.questions.length || quiz.restore()) {
    router.push('/quiz')
    return
  }
  localStorage.removeItem('exam115:active-quiz:v1')
  hasSavedQuiz.value = false
}
</script>

<template>
  <div class="bg-[radial-gradient(circle_at_top_left,_#dbeaf3,_transparent_38%),linear-gradient(135deg,#f7f3e8,#eef4f8)]">
    <section class="page-shell grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr] lg:py-16">
      <div>
        <p class="eyebrow">115 年甄試題庫</p>
        <h1 class="mt-4 max-w-2xl text-4xl font-black leading-tight text-ink sm:text-6xl">把每一次練習，<br /><span class="text-amber-700">變成看得見的進步。</span></h1>
        <p class="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">跨科隨機抽題、即時解析、模擬測驗與錯題追蹤。資料留在你的瀏覽器，不需登入。</p>
        <div class="mt-8 grid max-w-xl grid-cols-3 gap-3">
          <StatCard :value="bank.questionCount" label="題庫總題數" />
          <StatCard :value="progress.wrongQuestionIds.length" label="待複習錯題" tone="gold" />
          <StatCard :value="`${progress.averageScore}%`" label="平均正確率" tone="green" />
        </div>

        <div class="mt-5">
          <p class="mb-2 text-sm font-bold text-slate-600">題型</p>
          <div class="flex gap-2">
            <button type="button" class="rounded-full px-4 py-2 text-sm font-bold transition" :class="selectedQuestionTypes.includes('single') ? 'bg-ink text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'" @click="toggleQuestionType('single')">單選題</button>
            <button type="button" class="rounded-full px-4 py-2 text-sm font-bold transition" :class="selectedQuestionTypes.includes('multiple') ? 'bg-ink text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'" @click="toggleQuestionType('multiple')">複選題</button>
          </div>
          <p v-if="!selectedQuestionTypes.length" class="mt-2 text-xs font-semibold text-danger">請至少選擇一種題型</p>
        </div>
      </div>

      <div class="panel">
        <div class="flex items-center justify-between gap-4">
          <div><p class="eyebrow">建立測驗</p><h2 class="mt-2 text-2xl font-black text-ink">今天想練什麼？</h2></div>
          <span class="rounded-full bg-mist px-3 py-1 text-xs font-bold text-ink">可選 {{ availableCount }} 題</span>
        </div>

        <button v-if="hasSavedQuiz" type="button" class="mt-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-400 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" @click="resumeQuiz">
          <span><span class="block text-sm font-bold text-amber-900">有一份尚未完成的測驗</span><span class="mt-1 block text-xs text-amber-700">點擊此處接續上次進度</span></span>
          <span class="shrink-0 font-bold text-amber-800">繼續 →</span>
        </button>

        <div class="mt-6">
          <div class="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3 text-sm font-bold text-slate-600">
            <button type="button" class="flex flex-1 items-center justify-between gap-3 text-left" :aria-expanded="subjectsOpen" @click="subjectsOpen = !subjectsOpen">
              <span>選擇科目 <span class="ml-1 text-xs font-medium text-slate-400">已選 {{ selectedCategories.length }} / {{ categories.length }}</span></span>
              <span class="text-xs text-slate-400 transition-transform" :class="subjectsOpen ? 'rotate-180' : ''">▼</span>
            </button>
            <button type="button" class="shrink-0 text-ink underline" @click="selectedCategories = selectedCategories.length === categories.length ? [] : categories.map(c => c.id)">{{ selectedCategories.length === categories.length ? '全部取消' : '全選' }}</button>
          </div>
          <div v-show="subjectsOpen" class="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1">
            <button v-for="category in categories" :key="category.id" class="flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition" :class="selectedCategories.includes(category.id) ? 'border-ink bg-ink text-white' : 'border-slate-200 bg-white hover:border-ink/50'" @click="toggleCategory(category.id)">
              <span class="font-bold">{{ category.name }}</span><span class="opacity-70">{{ category.count }}</span>
            </button>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <label class="rounded-xl border border-gray-100 bg-white p-3 text-sm"><span class="mb-2 block font-bold text-slate-600">題數</span><select v-model="questionPreset" class="w-full border border-slate-200 px-3 py-2 outline-none focus:border-ink"><option disabled value="">請選擇題數</option><option value="10">10 題</option><option value="20">20 題</option><option value="50">50 題</option><option value="100">100 題</option><option value="all">全部（{{ availableCount }} 題）</option><option value="custom">自定義題數…</option></select></label>
          <label class="rounded-xl border border-gray-100 bg-white p-3 text-sm"><span class="mb-2 block font-bold text-slate-600">模式</span><select v-model="settings.mode" class="w-full border border-slate-200 px-3 py-2 outline-none focus:border-ink"><option value="practice">練習模式</option><option value="exam">模擬考模式</option></select></label>
        </div>
        <label v-if="questionPreset === 'custom'" class="mt-3 block rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm"><span class="mb-2 flex items-center justify-between font-bold text-amber-900"><span>自定義題數</span><span class="text-xs font-medium text-amber-700">最多 {{ availableCount }} 題</span></span><input v-model.number="customQuestionCount" class="w-full border border-amber-200 bg-white px-3 py-2 outline-none focus:border-ink" type="number" min="1" :max="availableCount" /></label>
        <p v-if="questionPreset" class="mt-3 text-xs font-semibold text-slate-500">本次將抽取 {{ selectedQuestionCount }} 題</p>
        <div class="mt-5 grid gap-5 sm:grid-cols-2 sm:items-start">
          <div class="space-y-3 pt-0.5">
            <label class="flex cursor-pointer items-start gap-3 text-sm text-slate-600"><input v-model="settings.shuffleQuestions" type="checkbox" class="mt-0.5 size-4 accent-[#17324d]" /><span><b class="block leading-none text-slate-700">隨機出題順序</b><small class="mt-1 block text-slate-400">每次測驗重新洗牌</small></span></label>
            <label class="flex cursor-pointer items-start gap-3 text-sm text-slate-600"><input v-model="settings.shuffleOptions" type="checkbox" class="mt-0.5 size-4 accent-[#17324d]" /><span><b class="block leading-none text-slate-700">隨機選項順序</b><small class="mt-1 block text-slate-400">選項內容隨機排列</small></span></label>
          </div>
          <label class="block text-sm"><b class="block text-slate-600">限時（分鐘）</b><span class="mt-1 block text-xs font-medium text-slate-400">留空表示不限時</span><input v-model.number="settings.timeLimitMinutes" class="mt-2 w-32 border border-slate-200 bg-white px-3 py-2 outline-none focus:border-ink" type="number" min="1" placeholder="不限時" /></label>
        </div>
        <button class="btn-primary mt-6 w-full" :disabled="!selectedCategories.length || !selectedQuestionTypes.length || !questionPreset || !bank.questionCount || loading" @click="startQuiz">{{ loading ? '載入題庫中…' : '開始練習' }}</button>
        <p v-if="error" class="mt-3 text-center text-xs text-danger">題庫載入失敗：{{ error }}</p>
      </div>
    </section>
  </div>
</template>
