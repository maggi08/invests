<script setup lang="ts">
import MiniPortfolioCalc from './components/MiniPortfolioCalc.vue'
import SalaryCalculator from './components/SalaryCalculator.vue'
</script>

<template>
  <main class="w-full max-w-[900px] mx-auto px-4 py-8 flex flex-col gap-8">
    <MiniPortfolioCalc />
    <SalaryCalculator />
  </main>
</template>
