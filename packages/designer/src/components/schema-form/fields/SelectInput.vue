<template>
  <select
    :value="value"
    :disabled="disabled"
    class="selectInput"
    @change="handleChange"
  >
    <option v-if="field.placeholder" value="" disabled>{{ field.placeholder }}</option>
    <template v-for="(opt, idx) in field.options" :key="idx">
      <!-- 分组选项 -->
      <optgroup v-if="isOptionGroup(opt)" :label="opt.label">
        <option
          v-for="(subOpt, subIdx) in opt.options"
          :key="subIdx"
          :value="subOpt.value"
          :disabled="subOpt.disabled"
        >
          {{ subOpt.label }}
        </option>
      </optgroup>
      <!-- 普通选项 -->
      <option v-else :value="opt.value" :disabled="opt.disabled">
        {{ opt.label }}
      </option>
    </template>
  </select>
</template>

<script setup lang="ts">
import type { FormFieldSchema, SelectOption, SelectOptionGroup } from '../types'

defineProps<{
  field: FormFieldSchema
  value: any
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: any]
}>()

const isOptionGroup = (opt: SelectOption | SelectOptionGroup): opt is SelectOptionGroup => {
  return 'options' in opt && Array.isArray(opt.options)
}

const handleChange = (e: Event) => {
  emit('update:value', (e.target as HTMLSelectElement).value)
}
</script>

<style scoped>
.selectInput {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.selectInput:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.selectInput:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>
