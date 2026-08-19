<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import QuestionCard from '@/components/QuestionCard.vue'
import { useQuizStore } from '@/stores/quiz'
import { useProgressStore } from '@/stores/progress'

const router = useRouter()
const quiz = useQuizStore()
const progress = useProgressStore()
const selected = computed(() => quiz.currentQuestion ? quiz.answers[quiz.currentQuestion.id] ?? [] : [])
const revealed = computed(() => Boolean(quiz.currentQuestion && quiz.config?.mode === 'practice' && quiz.isSubmitted(quiz.currentQuestion.id)))
const now = ref(Date.now())
let timerHandle: number | undefined
const remainingSeconds = computed(() => {
  if (!quiz.config?.timeLimitMinutes || !quiz.startedAt) return null
  const deadline = quiz.startedAt + quiz.config.timeLimitMinutes * 60_000
  return Math.max(0, Math.ceil((deadline - now.value) / 1000))
})
const timerText = computed(() => {
  if (remainingSeconds.value === null) return ''
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const currentRating = computed(() => quiz.currentQuestion ? progress.questionRatings[quiz.currentQuestion.id] ?? 0 : 0)

function setRating(rating: number) {
  if (!quiz.currentQuestion) return
  progress.setQuestionRating(quiz.currentQuestion.id, currentRating.value === rating ? 0 : rating)
}
function updateNote(event: Event) {
  if (!quiz.currentQuestion) return
  progress.setQuestionNote(quiz.currentQuestion.id, (event.target as HTMLTextAreaElement).value)
}

onMounted(() => {
  if (!quiz.questions.length && !quiz.restore()) router.replace('/')
  if (quiz.config?.timeLimitMinutes) {
    timerHandle = window.setInterval(() => {
      now.value = Date.now()
      if (remainingSeconds.value === 0 && !quiz.isComplete) {
        window.clearInterval(timerHandle)
        quiz.finish()
        router.replace('/result')
      }
    }, 1000)
  }
})
onUnmounted(() => window.clearInterval(timerHandle))

function next() {
  if (quiz.currentIndex === quiz.questions.length - 1) {
    quiz.finish()
    router.push('/result')
  } else quiz.goTo(quiz.currentIndex + 1)
}

function leave() {
  if (confirm('作答進度已儲存，確定返回首頁嗎？')) router.push('/')
}
</script>

<template>
  <div class="min-h-[calc(100vh-65px)] bg-[linear-gradient(135deg,#eef4f8,#fbf8f0)]">
    <section v-if="quiz.currentQuestion" class="page-shell max-w-4xl">
      <div class="mb-5 flex items-center justify-between gap-4">
        <button class="text-sm font-bold text-slate-500 hover:text-ink" @click="leave">← 暫離測驗</button>
        <div class="flex items-center gap-3"><p v-if="timerText" class="rounded-full px-3 py-1 font-mono text-sm font-black" :class="(remainingSeconds ?? 0) <= 60 ? 'bg-red-100 text-danger' : 'bg-white text-ink'">{{ timerText }}</p><p class="text-sm font-bold text-ink">{{ quiz.currentIndex + 1 }} / {{ quiz.questions.length }}</p></div>
      </div>
      <div class="mb-6 h-2 overflow-hidden rounded-full bg-white shadow-inner">
        <div class="h-full rounded-full bg-gold transition-all" :style="{ width: `${((quiz.currentIndex + 1) / quiz.questions.length) * 100}%` }" />
      </div>

      <div class="panel">
        <div class="mb-5 flex items-center justify-end gap-2 border-b border-slate-100 pb-4">
          <span class="mr-1 text-xs font-semibold text-slate-400">題目星等</span>
          <button v-for="star in 3" :key="star" type="button" class="text-2xl leading-none transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500" :class="star <= currentRating ? 'text-gold' : 'text-slate-200 hover:text-amber-300'" :aria-label="`設定為 ${star} 星`" :aria-pressed="star <= currentRating" @click="setRating(star)">★</button>
          <button v-if="currentRating" type="button" class="ml-1 text-xs font-semibold text-slate-400 underline hover:text-slate-600" @click="setRating(currentRating)">清除</button>
        </div>
        <div class="mb-6">
          <div class="mb-2 flex items-center justify-between gap-3"><label :for="`note-${quiz.currentQuestion.id}`" class="text-xs font-bold text-slate-500">自訂筆記</label><span class="text-xs text-slate-400">{{ (progress.questionNotes[quiz.currentQuestion.id] ?? '').length }} / 200</span></div>
          <textarea :id="`note-${quiz.currentQuestion.id}`" :value="progress.questionNotes[quiz.currentQuestion.id] ?? ''" maxlength="200" rows="2" class="w-full resize-y border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none focus:border-ink" placeholder="記下易錯觀念、口訣或補充說明…" @input="updateNote" />
        </div>
        <QuestionCard :question="quiz.currentQuestion" :selected="selected" :revealed="revealed" :disabled="revealed" @select="quiz.select" />
        <div class="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5">
          <button class="btn-secondary" :disabled="quiz.currentIndex === 0" @click="quiz.goTo(quiz.currentIndex - 1)">上一題</button>
          <div class="flex gap-3">
            <button v-if="quiz.config?.mode === 'practice' && !revealed" class="btn-primary" :disabled="!selected.length" @click="quiz.submitCurrent">確認答案</button>
            <button v-else class="btn-primary" @click="next">{{ quiz.currentIndex === quiz.questions.length - 1 ? '完成測驗' : '下一題' }}</button>
          </div>
        </div>
      </div>

      <div class="mt-6 panel p-4 sm:p-5">
        <div class="grid grid-cols-8 gap-2 sm:grid-cols-10">
          <button v-for="(question, index) in quiz.questions" :key="question.id" class="aspect-square rounded-lg text-xs font-bold transition" :class="index === quiz.currentIndex ? 'bg-gold text-ink ring-2 ring-ink' : quiz.answers[question.id]?.length ? 'bg-ink text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'" @click="quiz.goTo(index)">{{ index + 1 }}</button>
        </div>
      </div>
    </section>
  </div>
</template>
