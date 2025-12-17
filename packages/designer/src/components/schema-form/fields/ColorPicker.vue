<template>
  <input
    type="color"
    :value="value || '#000000'"
    :disabled="disabled"
    class="colorPicker"
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
.colorPicker {
  width: 100%;
  height: 32px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
}
.colorPicker:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
