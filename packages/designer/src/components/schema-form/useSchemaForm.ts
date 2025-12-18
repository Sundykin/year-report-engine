/**
 * Schema Form Composable
 * 提供表单状态管理和控件注册
 */

import { reactive, provide, inject, type InjectionKey, type Component } from 'vue'
import type {
  FormSchema,
  FormFieldSchema,
  CustomFieldComponent,
  SchemaFormContext,
} from './types'
import { getValueByPath, setValueByPath, shouldShowField, isFieldDisabled, getFieldValue, setFieldValue } from './utils'

// 注入 Key
export const SCHEMA_FORM_KEY: InjectionKey<SchemaFormContext> = Symbol('SchemaForm')

// 内置控件注册表
const builtinFields = new Map<string, Component>()

/**
 * 注册内置控件
 */
export function registerBuiltinField(name: string, component: Component) {
  builtinFields.set(name, component)
}

/**
 * 获取内置控件
 */
export function getBuiltinField(name: string): Component | undefined {
  return builtinFields.get(name)
}

/**
 * Schema Form Composable
 */
export function useSchemaForm(props: {
  schema: FormSchema[]
  modelValue: any
  disabled?: boolean
}) {
  // 自定义控件注册表
  const customFields = reactive(new Map<string, CustomFieldComponent>())

  // 获取字段值
  const getValue = (path: string) => getValueByPath(props.modelValue, path)

  // 设置字段值
  const setValue = (path: string, value: any) => {
    setValueByPath(props.modelValue, path, value)
  }

  // 注册自定义控件
  const registerField = (field: CustomFieldComponent) => {
    customFields.set(field.name, field)
  }

  // 获取控件组件
  const getFieldComponent = (type: string): Component | undefined => {
    // 优先查找自定义控件
    const custom = customFields.get(type)
    if (custom) return custom.component
    // 查找内置控件
    return builtinFields.get(type)
  }

  // 检查字段是否显示
  const isFieldVisible = (field: FormFieldSchema) => {
    return shouldShowField(field, props.modelValue)
  }

  // 检查字段是否禁用
  const isDisabled = (field: FormFieldSchema) => {
    return isFieldDisabled(field, props.modelValue, props.disabled ?? false)
  }

  // 获取字段当前值
  const getFieldVal = (field: FormFieldSchema) => {
    return getFieldValue(field, props.modelValue)
  }

  // 设置字段值
  const setFieldVal = (field: FormFieldSchema, value: any) => {
    setFieldValue(field, props.modelValue, value)
  }

  // 上下文
  const context: SchemaFormContext = {
    model: props.modelValue,
    schema: props.schema,
    disabled: props.disabled ?? false,
    customFields,
    getValue,
    setValue,
    registerField
  }

  // 提供上下文
  provide(SCHEMA_FORM_KEY, context)

  return {
    context,
    customFields,
    getValue,
    setValue,
    registerField,
    getFieldComponent,
    isFieldVisible,
    isDisabled,
    getFieldVal,
    setFieldVal
  }
}

/**
 * 在子组件中使用表单上下文
 */
export function useSchemaFormContext() {
  const context = inject(SCHEMA_FORM_KEY)
  if (!context) {
    throw new Error('useSchemaFormContext must be used within SchemaForm')
  }
  return context
}

/**
 * 创建表单字段注册器
 * 用于批量注册自定义控件
 */
export function createFieldRegistry() {
  const fields: CustomFieldComponent[] = []

  return {
    register(name: string, component: Component, defaultProps?: Record<string, any>) {
      fields.push({ name, component, defaultProps })
      return this
    },
    getFields() {
      return fields
    },
    // 安装到表单
    install(context: SchemaFormContext) {
      fields.forEach(f => context.registerField(f))
    }
  }
}
