<template>
  <label class="checkboxWrapper">
    <input
      type="checkbox"
      :checked="!!value"
      :disabled="disabled"
      class="checkboxInput"
      @change="handleChange"
    />
    <span v-if="field.props?.text" class="checkboxText">{{ field.props.text }}</span>
  </label>
</template>

<script setup lang="ts">
import type { FormFieldSchema } from '../types'

defineProps<{
  field: FormFieldSchema
  value: any
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: boolean]
}>()

const handleChange = (e: Event) => {
  emit('update:value', (e.target as HTMLInputElement).checked)
}
</script>

<style scoped>
.checkboxWrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.checkboxInput {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}
.checkboxInput:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.checkboxText {
  font-size: 12px;
  color: #a3a3a3;
}
</style>
