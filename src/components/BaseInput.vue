<template>
  <div class="input-group">
    <div v-if="type === 'radio'" class="radio-group">
      {{ label }}
      <label v-for="option in options" :key="option.value">
        {{ option.label }}
        <input
          type="radio"
          :value="option.value"
          :checked="modelValue === option.value"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </label>
    </div>

    <label v-else>
      {{ label }}
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* .input-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input[type='number'],
input[type='text'] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-width: 200px;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
} */
</style>
