<template>
  <CodeEditor
    :modelValue="value"
    @update:modelValue="$emit('update:value', $event)"
    :style="{ height: field.props?.height || '100px' }"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import type { FormFieldSchema } from '../types'
import CodeEditor from '../../CodeEditor.vue'

defineProps<{
  field: FormFieldSchema
  value: string
  disabled?: boolean
}>()

defineEmits<{
  'update:value': [value: string]
}>()
</script>
