<template>
  <div class="buttonGroup">
    <button
      v-for="opt in options"
      :key="opt.value"
      :class="{ active: value === opt.value }"
      :disabled="disabled || opt.disabled"
      @click="handleClick(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormFieldSchema, SelectOption } from '../types'

const props = defineProps<{
  field: FormFieldSchema
  value: any
  disabled?: boolean
}>()

const options = computed(() => (props.field.options || []) as SelectOption[])

const emit = defineEmits<{
  'update:value': [value: any]
}>()

const handleClick = (val: any) => {
  emit('update:value', val)
}
</script>

<style scoped>
.buttonGroup {
  display: flex;
  background: #2a2a2a;
  border-radius: 4px;
  padding: 2px;
}
.buttonGroup button {
  flex: 1;
  background: transparent;
  border: none;
  color: #888;
  padding: 6px 8px;
  font-size: 11px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s;
}
.buttonGroup button:hover:not(:disabled) {
  color: #ccc;
}
.buttonGroup button.active {
  background: #3b82f6;
  color: white;
}
.buttonGroup button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
