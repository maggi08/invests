<script setup lang="ts">
import MiniPortfolioCalc from './components/MiniPortfolioCalc.vue'
import SalaryCalculator from './components/SalaryCalculator.vue'
</script>

<template>
  <main>
    <MiniPortfolioCalc />
    <SalaryCalculator />
  </main>
</template>

<style scoped>
main {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
