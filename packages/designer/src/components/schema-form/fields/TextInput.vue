<template>
  <input
    type="text"
    :value="value"
    :placeholder="field.placeholder"
    :disabled="disabled"
    :readonly="field.readonly"
    class="textInput"
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
  'update:value': [value: string]
}>()

const handleInput = (e: Event) => {
  emit('update:value', (e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.textInput {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.textInput:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.textInput:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>
