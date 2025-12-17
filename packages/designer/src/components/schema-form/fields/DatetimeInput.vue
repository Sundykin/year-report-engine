<template>
  <input
    type="datetime-local"
    :value="formattedValue"
    :disabled="disabled"
    class="datetimeInput"
    @input="handleInput"
  />
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
  'update:value': [value: string]
}>()

// ISO 字符串转 datetime-local 格式
const formattedValue = computed(() => {
  if (!props.value) return ''
  try {
    const d = new Date(props.value)
    return d.toISOString().slice(0, 16)
  } catch {
    return ''
  }
})

const handleInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (val) {
    emit('update:value', new Date(val).toISOString())
  }
}
</script>

<style scoped>
.datetimeInput {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.datetimeInput:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.datetimeInput:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>
