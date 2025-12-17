<template>
  <div class="schemaForm">
    <template v-for="(item, idx) in schema" :key="idx">
      <!-- 分组 -->
      <FormGroup
        v-if="isGroup(item)"
        :group="item"
        :model="modelValue"
        :disabled="disabled"
        :columns="columns"
        @update="handleFieldUpdate"
      />
      <!-- 单个字段 -->
      <FormField
        v-else-if="isFieldVisible(item)"
        :field="item"
        :model="modelValue"
        :disabled="isDisabled(item)"
        :value="getFieldVal(item)"
        @update="(val) => handleFieldUpdate(item.field, val)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormSchema, FormFieldSchema, FormGroupSchema } from './types'
import { isGroupSchema } from './types'
import { useSchemaForm } from './useSchemaForm'
import FormField from './FormField.vue'
import FormGroup from './FormGroup.vue'

interface Props {
  schema: FormSchema[]
  modelValue: any
  disabled?: boolean
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  columns: 2
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [field: string, value: any]
}>()

const {
  isFieldVisible,
  isDisabled,
  getFieldVal,
  setFieldVal,
  registerField,
  context
} = useSchemaForm({
  schema: props.schema,
  modelValue: props.modelValue,
  disabled: props.disabled
})

// 判断是否为分组
const isGroup = (item: FormSchema): item is FormGroupSchema => isGroupSchema(item)

// 处理字段更新
const handleFieldUpdate = (field: string, value: any) => {
  // 找到对应的 schema
  const fieldSchema = findFieldSchema(props.schema, field)
  if (fieldSchema) {
    setFieldVal(fieldSchema, value)
  }
  emit('change', field, value)
}

// 递归查找字段 schema
function findFieldSchema(schemas: FormSchema[], field: string): FormFieldSchema | undefined {
  for (const item of schemas) {
    if (isGroupSchema(item)) {
      const found = findFieldSchema(item.fields, field)
      if (found) return found
    } else if (item.field === field) {
      return item
    }
  }
  return undefined
}

// 暴露注册方法
defineExpose({
  registerField,
  context
})
</script>

<style scoped>
.schemaForm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
