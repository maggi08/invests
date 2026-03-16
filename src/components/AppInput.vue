<template>
  <div :class="$style.appInputGroup">
    <label v-if="label" :class="$style.appInputLabel">{{ label }}</label>
    <input
      :class="$style.appInput"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number | string
  label?: string
  type?: 'text' | 'number'
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: number | string]
}>()
</script>

<style module>
.appInputGroup {
  @apply flex flex-col;
}

.appInputLabel {
  @apply block text-[12px] font-medium text-subtle uppercase tracking-[0.04em] mb-1.5;
}

.appInput {
  @apply w-full bg-card border border-card-border rounded-lg text-slate-100 text-sm
         font-[inherit] px-2.5 py-2 outline-none transition-colors duration-150
         box-border;
}

.appInput:focus {
  @apply border-brand;
}
</style>
