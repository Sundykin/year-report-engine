<template>
  <div class="formField">
    <label v-if="field.label" class="fieldLabel">{{ field.label }}</label>
    <!-- 动态渲染控件 -->
    <component
      :is="fieldComponent"
      v-if="fieldComponent"
      :field="field"
      :value="value"
      :disabled="disabled"
      :model="model"
      v-bind="field.props"
      @update:value="handleUpdate"
    />
    <!-- 自定义渲染 -->
    <template v-else-if="field.render">
      <component :is="renderComponent" />
    </template>
    <!-- 未注册的控件类型 -->
    <div v-else class="unknownField">
      未知控件类型: {{ field.type }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FormFieldSchema } from './types'
import { SCHEMA_FORM_KEY } from './useSchemaForm'
import { getBuiltinField } from './useSchemaForm'

interface Props {
  field: FormFieldSchema
  value: any
  model: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  update: [value: any]
}>()

// 获取表单上下文
const context = inject(SCHEMA_FORM_KEY)

// 获取控件组件
const fieldComponent = computed(() => {
  // 优先查找自定义控件
  const custom = context?.customFields.get(props.field.type)
  if (custom) return custom.component
  // 查找内置控件
  return getBuiltinField(props.field.type)
})

// 自定义渲染组件
const renderComponent = computed(() => {
  if (!props.field.render) return null
  return props.field.render({
    field: props.field,
    value: props.value,
    model: props.model,
    disabled: props.disabled,
    onChange: handleUpdate
  })
})

// 处理值更新
const handleUpdate = (val: any) => {
  emit('update', val)
}
</script>

<style scoped>
.formField {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fieldLabel {
  font-size: 10px;
  color: #737373;
  text-transform: uppercase;
}
.unknownField {
  padding: 8px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px dashed #dc2626;
  border-radius: 4px;
  color: #dc2626;
  font-size: 11px;
}
</style>
