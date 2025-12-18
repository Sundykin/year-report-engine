<template>
  <RichTextEditor
    :modelValue="value"
    @update:modelValue="$emit('update:value', $event)"
    :style="{ height: field.props?.height || '400px' }"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import type { FormFieldSchema } from '../types'
import RichTextEditor from '../../RichTextEditor.vue'

defineProps<{
  field: FormFieldSchema
  value: string
  disabled?: boolean
}>()

defineEmits<{
  'update:value': [value: string]
}>()
</script>
