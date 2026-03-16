<template>
  <div :class="$style.currencyToggle">
    <button
      v-for="opt in options"
      :key="opt.sym"
      :class="[$style.currencyToggleBtn, { [$style.currencyToggleBtnActive]: modelValue === opt.sym }]"
      @click="$emit('update:modelValue', opt.sym)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CurrencyOption } from '@/types/portfolio'

defineProps<{
  modelValue: string
  options: CurrencyOption[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style module>
.currencyToggle {
  @apply flex gap-2 flex-wrap;
}

.currencyToggleBtn {
  @apply text-xs font-[inherit] py-[5px] px-3 border border-card-border rounded-lg
         bg-transparent text-subtle cursor-pointer transition-all duration-150;
}

.currencyToggleBtn:hover {
  @apply border-card-border text-slate-300;
}

.currencyToggleBtnActive {
  @apply bg-[rgba(22,163,127,0.12)] text-brand-light border-brand font-semibold;
}
</style>
