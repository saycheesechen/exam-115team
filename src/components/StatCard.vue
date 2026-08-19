<script setup lang="ts">
defineProps<{ value: string | number; label: string; tone?: 'gold' | 'green' | 'blue' }>()
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4">
    <p class="text-2xl font-black" :class="tone === 'green' ? 'text-success' : tone === 'gold' ? 'text-amber-700' : 'text-ink'">{{ value }}</p>
    <p class="mt-1 text-xs font-semibold text-slate-500">{{ label }}</p>
  </div>
</template>
