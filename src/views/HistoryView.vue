<script setup lang="ts">
import { useProgressStore } from '@/stores/progress'
const progress = useProgressStore()
function formatDate(value: string) { return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function clearHistory() {
  if (window.confirm(`確定要清除全部 ${progress.history.length} 筆練習紀錄嗎？此操作無法復原。`)) progress.clearHistory()
}
</script>

<template>
  <div class="min-h-[calc(100vh-65px)] bg-[linear-gradient(135deg,#eef4f8,#fbf8f0)]"><section class="page-shell max-w-4xl"><div class="flex items-end justify-between gap-4"><div><p class="eyebrow">Progress</p><h1 class="mt-2 text-3xl font-black text-ink">練習紀錄</h1></div><button v-if="progress.history.length" class="rounded-xl px-4 py-3 text-sm font-bold text-danger transition hover:bg-red-50" @click="clearHistory">清除全部</button></div>
    <div v-if="progress.history.length" class="mt-7 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl shadow-slate-900/5"><div v-for="item in progress.history" :key="item.id" class="flex items-center gap-4 border-b border-slate-100 p-5 last:border-0"><div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-mist text-lg font-black text-ink">{{ item.percentage }}%</div><div class="min-w-0 flex-1"><p class="font-bold text-slate-800">{{ item.correct }} / {{ item.total }} 題答對</p><p class="mt-1 text-xs text-slate-500">{{ formatDate(item.completedAt) }}</p></div><p class="text-xs font-semibold text-slate-400">{{ Math.floor(item.durationSeconds / 60) }} 分 {{ item.durationSeconds % 60 }} 秒</p></div></div>
    <div v-else class="panel mt-7 py-16 text-center text-slate-500">尚無練習紀錄</div>
  </section></div>
</template>
