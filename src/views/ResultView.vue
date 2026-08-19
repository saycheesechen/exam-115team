<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import StatCard from '@/components/StatCard.vue'

const router = useRouter()
const quiz = useQuizStore()
const wrongReviews = computed(() => quiz.reviews.filter((item) => !item.correct))

function backHome() { quiz.reset(); router.push('/') }
</script>

<template>
  <div class="min-h-[calc(100vh-65px)] bg-[linear-gradient(135deg,#eef4f8,#fbf8f0)]">
    <section class="page-shell max-w-4xl">
      <div v-if="quiz.questions.length" class="panel">
        <div class="text-center">
          <p class="eyebrow">測驗完成</p>
          <p class="mt-3 text-6xl font-black" :class="quiz.scorePercent >= 80 ? 'text-success' : quiz.scorePercent >= 60 ? 'text-amber-700' : 'text-danger'">{{ quiz.scorePercent }}<span class="text-2xl">%</span></p>
          <p class="mt-3 text-slate-500">答對 {{ quiz.correctCount }} 題，共 {{ quiz.questions.length }} 題</p>
        </div>
        <div class="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-3">
          <StatCard :value="quiz.correctCount" label="答對" tone="green" />
          <StatCard :value="wrongReviews.length" label="答錯／未答" tone="gold" />
          <StatCard :value="quiz.answeredCount" label="已作答" />
        </div>
        <div class="mt-8 flex justify-center gap-3"><button class="btn-secondary" @click="router.push('/wrong-book')">查看錯題本</button><button class="btn-primary" @click="backHome">返回首頁</button></div>

        <div v-if="wrongReviews.length" class="mt-10 border-t border-slate-200 pt-7">
          <h2 class="text-xl font-black text-ink">本次錯題</h2>
          <div class="mt-4 space-y-3">
            <details v-for="item in wrongReviews" :key="item.question.id" class="rounded-2xl border border-slate-200 bg-white p-4">
              <summary class="cursor-pointer font-bold leading-relaxed text-slate-800">{{ item.question.number }}. {{ item.question.question }}</summary>
              <div class="mt-3 text-sm leading-7 text-slate-600"><p>你的答案：{{ item.selected.join('、') || '未作答' }}</p><p class="font-bold text-success">正確答案：{{ item.question.answers.join('、') }}</p><p v-if="item.question.explanation" class="mt-2">{{ item.question.explanation }}</p></div>
            </details>
          </div>
        </div>
      </div>
      <div v-else class="panel text-center"><p class="text-slate-500">目前沒有測驗結果</p><button class="btn-primary mt-5" @click="router.push('/')">開始測驗</button></div>
    </section>
  </div>
</template>
