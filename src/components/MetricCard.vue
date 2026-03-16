<template>
  <div :class="$style.metricCard">
    <div :class="$style.metricCardLabel">{{ label }}</div>
    <div :class="$style.metricCardValue" :style="color ? { color } : {}">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
  color?: string
}>()
</script>

<style module>
.metricCard {
  @apply bg-card rounded-xl p-3;
}

.metricCardLabel {
  @apply text-[11px] font-medium text-muted uppercase tracking-[0.03em] mb-1;
}

.metricCardValue {
  @apply text-[17px] font-bold text-slate-100 tracking-tight;
}
</style>
