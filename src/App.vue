<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-40 border-b border-white/10 bg-ink/90 text-white backdrop-blur-xl">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <RouterLink to="/" class="flex items-center gap-3 font-bold tracking-wide">
          <span class="grid size-9 place-items-center rounded-xl bg-gold text-lg text-ink shadow-lg shadow-black/15">115</span>
          <span>題庫練習室</span>
        </RouterLink>
        <div class="flex items-center gap-1 text-sm font-medium text-slate-200">
          <RouterLink class="nav-link" to="/wrong-book">錯題本</RouterLink>
          <RouterLink class="nav-link" to="/history">紀錄</RouterLink>
        </div>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
