<template>
  <div v-if="isVisible" class="formGroup">
    <div class="groupHeader" @click="toggleCollapse">
      <span v-if="group.icon" class="groupIcon">{{ group.icon }}</span>
      <span class="groupTitle">{{ group.title }}</span>
      <span v-if="group.collapsible" class="collapseIcon">{{ collapsed ? '▶' : '▼' }}</span>
    </div>
    <div v-show="!collapsed" class="groupContent">
      <div class="fieldGrid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
        <template v-for="(field, idx) in group.fields" :key="idx">
          <FormField
            v-if="shouldShow(field)"
            :field="field"
            :model="model"
            :disabled="isDisabled(field)"
            :value="getValue(field)"
            :style="{ gridColumn: `span ${field.grid || columns}` }"
            @update="(val) => $emit('update', field.field, val)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormGroupSchema, FormFieldSchema } from './types'
import { shouldShowField, isFieldDisabled, getFieldValue } from './utils'
import FormField from './FormField.vue'

interface Props {
  group: FormGroupSchema
  model: any
  disabled?: boolean
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  columns: 2
})

defineEmits<{
  update: [field: string, value: any]
}>()

const collapsed = ref(props.group.defaultCollapsed ?? false)

const toggleCollapse = () => {
  if (props.group.collapsible) {
    collapsed.value = !collapsed.value
  }
}

// 分组是否显示
const isVisible = computed(() => {
  if (!props.group.showWhen) return true
  if (typeof props.group.showWhen === 'function') {
    return props.group.showWhen(props.model)
  }
  // 复用字段的显示逻辑
  return shouldShowField({ field: '', label: '', type: 'text', showWhen: props.group.showWhen }, props.model)
})

// 字段是否显示
const shouldShow = (field: FormFieldSchema) => shouldShowField(field, props.model)

// 字段是否禁用
const isDisabled = (field: FormFieldSchema) => isFieldDisabled(field, props.model, props.disabled)

// 获取字段值
const getValue = (field: FormFieldSchema) => getFieldValue(field, props.model)
</script>

<style scoped>
.formGroup {
  background: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
}
.groupHeader {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
}
.groupHeader:hover {
  background: #222;
}
.groupIcon {
  font-size: 14px;
}
.groupTitle {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #a3a3a3;
}
.collapseIcon {
  font-size: 10px;
  color: #666;
}
.groupContent {
  padding: 12px;
  border-top: 1px solid #333;
}
.fieldGrid {
  display: grid;
  gap: 10px;
}
</style>
