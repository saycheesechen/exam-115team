<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionBank } from '@/composables/useQuestionBank'
import { useProgressStore } from '@/stores/progress'
import { useQuizStore } from '@/stores/quiz'

const router = useRouter()
const progress = useProgressStore()
const quiz = useQuizStore()
const { questions, categories, load, loadQuestions } = useQuestionBank()
const wrongQuestions = computed(() => questions.value.filter((q) => progress.wrongQuestionIds.includes(q.id)))
const activeFilter = ref<'wrong' | 1 | 2 | 3>('wrong')
const ratedCounts = computed(() => ({
  1: questions.value.filter((q) => progress.questionRatings[q.id] === 1).length,
  2: questions.value.filter((q) => progress.questionRatings[q.id] === 2).length,
  3: questions.value.filter((q) => progress.questionRatings[q.id] === 3).length,
}))
const displayedQuestions = computed(() => activeFilter.value === 'wrong'
  ? wrongQuestions.value
  : questions.value.filter((q) => progress.questionRatings[q.id] === activeFilter.value))
onMounted(async () => { await load(); await loadQuestions(categories.value.map((item) => item.id)) })

function practiceDisplayed() {
  const categoryIds = [...new Set(displayedQuestions.value.map((q) => slug(q.category)))]
  quiz.start(displayedQuestions.value, { categoryIds, questionTypes: ['single', 'multiple'], questionCount: displayedQuestions.value.length, mode: 'practice', timeLimitMinutes: null, shuffleQuestions: true, shuffleOptions: true })
  router.push('/quiz')
}
function clearAllWrong() {
  if (window.confirm(`確定要清除全部 ${wrongQuestions.value.length} 題錯題嗎？此操作無法復原。`)) progress.clearAllWrong()
}
function setRating(questionId: string, rating: number) {
  const current = progress.questionRatings[questionId] ?? 0
  progress.setQuestionRating(questionId, current === rating ? 0 : rating)
}
function slug(value: string) { return value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '') }
</script>

<template>
  <div class="min-h-[calc(100vh-65px)] bg-[linear-gradient(135deg,#eef4f8,#fbf8f0)]"><section class="page-shell max-w-4xl">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow">Review</p><h1 class="mt-2 text-3xl font-black text-ink">錯題本</h1><p class="mt-2 text-slate-500">錯題與星等題目集中複習</p></div><div v-if="displayedQuestions.length" class="flex gap-3"><button v-if="activeFilter === 'wrong'" class="rounded-xl px-4 py-3 text-sm font-bold text-danger transition hover:bg-red-50" @click="clearAllWrong">清除錯題</button><button class="btn-primary" @click="practiceDisplayed">複習這些題目</button></div></div>

    <div class="mb-6 flex flex-wrap gap-2">
      <button type="button" class="rounded-full px-4 py-2 text-sm font-bold transition" :class="activeFilter === 'wrong' ? 'bg-ink text-white' : 'bg-white text-slate-500 hover:bg-slate-100'" @click="activeFilter = 'wrong'">錯題 {{ wrongQuestions.length }}</button>
      <button v-for="star in 3" :key="star" type="button" class="rounded-full px-4 py-2 text-sm font-bold transition" :class="activeFilter === star ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 hover:bg-amber-50'" @click="activeFilter = star as 1 | 2 | 3">{{ '★'.repeat(star) }} {{ ratedCounts[star as 1 | 2 | 3] }}</button>
    </div>

    <div v-if="displayedQuestions.length" class="space-y-3"><article v-for="question in displayedQuestions" :key="question.id" class="panel p-5"><div class="flex flex-wrap items-center gap-3"><span class="rounded-full bg-mist px-3 py-1 text-xs font-bold text-ink">{{ question.category }}</span><div class="flex items-center gap-1"><button v-for="star in 3" :key="star" type="button" class="text-xl leading-none transition hover:scale-110" :class="star <= (progress.questionRatings[question.id] ?? 0) ? 'text-gold' : 'text-slate-200 hover:text-amber-300'" :aria-label="`設定為 ${star} 星`" @click="setRating(question.id, star)">★</button></div><button v-if="activeFilter === 'wrong'" class="ml-auto text-xs font-bold text-slate-400 hover:text-danger" @click="progress.clearWrong(question.id)">移除錯題</button></div><h2 class="mt-4 font-bold leading-7 text-slate-800">{{ question.number }}. {{ question.question }}</h2><p class="mt-3 text-sm font-bold text-success">答案：{{ question.answers.join('、') }}</p><p v-if="question.explanation" class="mt-2 text-sm leading-6 text-slate-500">{{ question.explanation }}</p></article></div>
    <div v-else class="panel py-16 text-center"><p class="text-5xl">{{ activeFilter === 'wrong' ? '✓' : '☆' }}</p><h2 class="mt-4 text-xl font-black text-ink">{{ activeFilter === 'wrong' ? '目前沒有錯題' : `目前沒有 ${activeFilter} 星題目` }}</h2><p class="mt-2 text-slate-500">{{ activeFilter === 'wrong' ? '完成練習後，答錯的題目會自動收錄在這裡。' : '作答時點選星星，即可在這裡分類查看。' }}</p><button class="btn-primary mt-6" @click="router.push('/')">開始練習</button></div>
  </section></div>
</template>
