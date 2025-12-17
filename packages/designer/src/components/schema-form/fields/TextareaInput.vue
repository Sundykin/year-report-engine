<template>
  <textarea
    :value="value"
    :placeholder="field.placeholder"
    :disabled="disabled"
    :readonly="field.readonly"
    :rows="field.props?.rows || 3"
    class="textareaInput"
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
  emit('update:value', (e.target as HTMLTextAreaElement).value)
}
</script>

<style scoped>
.textareaInput {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  resize: vertical;
  font-family: inherit;
}
.textareaInput:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.textareaInput:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>
