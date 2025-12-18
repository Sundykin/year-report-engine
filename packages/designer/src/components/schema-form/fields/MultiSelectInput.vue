<template>
  <div class="multiSelectWrapper">
    <select
      multiple
      :value="value || []"
      @change="handleChange"
      class="multiSelect"
      :size="field.props?.size || 4"
      :disabled="disabled"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <div class="hint">按住Ctrl/Cmd多选</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormFieldSchema, SelectOption } from '../types'

const props = defineProps<{
  field: FormFieldSchema
  value: (string | number)[]
  disabled?: boolean
}>()

const options = computed(() => (props.field.options || []) as SelectOption[])

const emit = defineEmits<{
  'update:value': [value: (string | number)[]]
}>()

const handleChange = (e: Event) => {
  const select = e.target as HTMLSelectElement
  const values = Array.from(select.selectedOptions).map(opt => opt.value)
  emit('update:value', values)
}
</script>

<style scoped>
.multiSelectWrapper { display: flex; flex-direction: column; gap: 4px; }
.multiSelect { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 4px; border-radius: 4px; font-size: 12px; }
.multiSelect option { padding: 4px; }
.multiSelect option:checked { background: #3b82f6; }
.multiSelect:disabled { opacity: 0.5; cursor: not-allowed; }
.hint { font-size: 10px; color: #737373; font-style: italic; }
</style>
