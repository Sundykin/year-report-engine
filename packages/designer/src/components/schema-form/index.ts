/**
 * Schema Form 动态表单系统
 *
 * 使用示例:
 * ```vue
 * <template>
 *   <SchemaForm
 *     v-model="element"
 *     :schema="counterSchema"
 *     :disabled="element.locked"
 *   />
 * </template>
 *
 * <script setup>
 * const counterSchema = [
 *   {
 *     title: '🔢 计数器',
 *     icon: '🔢',
 *     fields: [
 *       { field: 'counterValue', label: '目标值', type: 'number' },
 *       { field: 'counterPrefix', label: '前缀', type: 'text', grid: 1 },
 *       { field: 'counterSuffix', label: '后缀', type: 'text', grid: 1 },
 *     ]
 *   }
 * ]
 * </script>
 * ```
 */

// 类型导出
export * from './types'

// 工具函数导出
export * from './utils'

// Composable 导出
export {
  useSchemaForm,
  useSchemaFormContext,
  registerBuiltinField,
  getBuiltinField,
  createFieldRegistry,
  SCHEMA_FORM_KEY
} from './useSchemaForm'

// 组件导出
export { default as SchemaForm } from './SchemaForm.vue'
export { default as FormField } from './FormField.vue'
export { default as FormGroup } from './FormGroup.vue'

// 内置控件
export { registerBuiltinFields } from './fields'
export * from './fields'
