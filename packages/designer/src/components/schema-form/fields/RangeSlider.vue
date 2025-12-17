<template>
  <div class="rangeWrapper">
    <input
      type="range"
      :value="value ?? field.min ?? 0"
      :min="field.min ?? 0"
      :max="field.max ?? 100"
      :step="field.step ?? 1"
      :disabled="disabled"
      class="rangeInput"
      @input="handleInput"
    />
    <span class="rangeValue">{{ displayValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormFieldSchema } from '../types'

const props = defineProps<{
  field: FormFieldSchema
  value: any
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: number]
}>()

const displayValue = computed(() => {
  const val = props.value ?? props.field.min ?? 0
  const suffix = props.field.props?.suffix || ''
  return `${val}${suffix}`
})

const handleInput = (e: Event) => {
  emit('update:value', Number((e.target as HTMLInputElement).value))
}
</script>

<style scoped>
.rangeWrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rangeInput {
  flex: 1;
  accent-color: #3b82f6;
}
.rangeInput:disabled {
  opacity: 0.5;
}
.rangeValue {
  min-width: 40px;
  font-size: 11px;
  color: #888;
  text-align: right;
}
</style>
