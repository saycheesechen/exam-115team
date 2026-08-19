<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionBank } from '@/composables/useQuestionBank'
import { useProgressStore } from '@/stores/progress'
import { useQuizStore } from '@/stores/quiz'

const router = useRouter()
const progress = useProgressStore()
const quiz = useQuizStore()
const { questions, categories, load, loadQuestions } = useQuestionBank()
const wrongQuestions = computed(() => questions.value.filter((q) => progress.wrongQuestionIds.includes(q.id)))
onMounted(async () => { await load(); await loadQuestions(categories.value.map((item) => item.id)) })

function practiceWrong() {
  const categoryIds = [...new Set(wrongQuestions.value.map((q) => slug(q.category)))]
  quiz.start(wrongQuestions.value, { categoryIds, questionTypes: ['single', 'multiple'], questionCount: wrongQuestions.value.length, mode: 'practice', timeLimitMinutes: null, shuffleQuestions: true, shuffleOptions: true })
  router.push('/quiz')
}
function clearAllWrong() {
  if (window.confirm(`確定要清除全部 ${wrongQuestions.value.length} 題錯題嗎？此操作無法復原。`)) progress.clearAllWrong()
}
function slug(value: string) { return value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '') }
</script>

<template>
  <div class="min-h-[calc(100vh-65px)] bg-[linear-gradient(135deg,#eef4f8,#fbf8f0)]"><section class="page-shell max-w-4xl">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow">Review</p><h1 class="mt-2 text-3xl font-black text-ink">錯題本</h1><p class="mt-2 text-slate-500">共有 {{ wrongQuestions.length }} 題待複習</p></div><div v-if="wrongQuestions.length" class="flex gap-3"><button class="rounded-xl px-4 py-3 text-sm font-bold text-danger transition hover:bg-red-50" @click="clearAllWrong">清除全部</button><button class="btn-primary" @click="practiceWrong">開始複習</button></div></div>
    <div v-if="wrongQuestions.length" class="space-y-3"><article v-for="question in wrongQuestions" :key="question.id" class="panel p-5"><div class="flex gap-3"><span class="rounded-full bg-mist px-3 py-1 text-xs font-bold text-ink">{{ question.category }}</span><button class="ml-auto text-xs font-bold text-slate-400 hover:text-danger" @click="progress.clearWrong(question.id)">移除</button></div><h2 class="mt-4 font-bold leading-7 text-slate-800">{{ question.number }}. {{ question.question }}</h2><p class="mt-3 text-sm font-bold text-success">答案：{{ question.answers.join('、') }}</p><p v-if="question.explanation" class="mt-2 text-sm leading-6 text-slate-500">{{ question.explanation }}</p></article></div>
    <div v-else class="panel py-16 text-center"><p class="text-5xl">✓</p><h2 class="mt-4 text-xl font-black text-ink">目前沒有錯題</h2><p class="mt-2 text-slate-500">完成練習後，答錯的題目會自動收錄在這裡。</p><button class="btn-primary mt-6" @click="router.push('/')">開始練習</button></div>
  </section></div>
</template>
