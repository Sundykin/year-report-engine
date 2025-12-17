<template>
  <input
    type="number"
    :value="value"
    :min="field.min"
    :max="field.max"
    :step="field.step || 1"
    :placeholder="field.placeholder"
    :disabled="disabled"
    :readonly="field.readonly"
    class="numberInput"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import type { FormFieldSchema } from '../types'

defineProps<{
  field: FormFieldSchema
  value: any
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: number]
}>()

const handleInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  emit('update:value', val === '' ? 0 : Number(val))
}
</script>

<style scoped>
.numberInput {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.numberInput:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.numberInput:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>
