<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/types/question'

const props = defineProps<{
  question: Question
  selected: string[]
  revealed?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ select: [optionId: string] }>()
const inputType = computed(() => props.question.type === 'single' ? 'radio' : 'checkbox')

function optionState(id: string) {
  if (!props.revealed) return props.selected.includes(id) ? 'selected' : 'idle'
  if (props.question.answers.includes(id)) return 'correct'
  if (props.selected.includes(id)) return 'wrong'
  return 'idle'
}
</script>

<template>
  <article>
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <span class="rounded-full bg-mist px-3 py-1 text-xs font-bold text-ink">{{ question.category }}</span>
      <span class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
        {{ question.type === 'multiple' ? '複選題' : '單選題' }}
      </span>
    </div>
    <h1 class="text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl">
      <span class="mr-2 text-gold">{{ question.number }}.</span>{{ question.question }}
    </h1>
    <p v-if="question.type === 'multiple'" class="mt-2 text-sm text-slate-500">本題有多個正確答案</p>

    <div class="mt-6 space-y-3">
      <label
        v-for="option in question.options"
        :key="option.id"
        class="group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition"
        :class="{
          'border-slate-200 bg-white hover:border-ink/40 hover:bg-mist/40': optionState(option.id) === 'idle',
          'border-gold bg-amber-50 ring-1 ring-gold': optionState(option.id) === 'selected',
          'border-success bg-emerald-50 ring-1 ring-success': optionState(option.id) === 'correct',
          'border-danger bg-red-50 ring-1 ring-danger': optionState(option.id) === 'wrong',
          'cursor-default': disabled,
        }"
      >
        <input
          class="mt-1 size-4 accent-[#17324d]"
          :type="inputType"
          :name="question.id"
          :value="option.id"
          :checked="selected.includes(option.id)"
          :disabled="disabled"
          @change="emit('select', option.id)"
        />
        <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-black text-ink">{{ option.id }}</span>
        <span class="leading-relaxed text-slate-700">{{ option.text }}</span>
      </label>
    </div>

    <div v-if="revealed" class="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <p class="text-sm font-bold text-amber-900">正確答案：{{ question.answers.join('、') }}</p>
      <p v-if="question.explanation" class="mt-2 text-sm leading-relaxed text-amber-950/75">{{ question.explanation }}</p>
    </div>
  </article>
</template>
