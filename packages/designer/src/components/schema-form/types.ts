/**
 * Schema Form 类型定义
 * 轻量级动态表单系统
 */

import type { Component } from 'vue'

// 内置控件类型
export type BuiltinFieldType =
  | 'number'      // 数值输入
  | 'text'        // 文本输入
  | 'textarea'    // 多行文本
  | 'color'       // 颜色选择
  | 'select'      // 下拉选择
  | 'checkbox'    // 开关
  | 'range'       // 滑块
  | 'button-group' // 按钮组切换
  | 'datetime'    // 日期时间
  | 'code'        // 代码编辑器
  | 'upload'      // 文件上传
  | 'multi-select' // 多选

// 选项配置
export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
}

// 选项分组
export interface SelectOptionGroup {
  label: string
  options: SelectOption[]
}

// 联动依赖配置
export interface FieldDependency {
  field: string                           // 依赖的字段路径
  condition: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'notIn' | 'truthy' | 'falsy'
  value?: any                             // 比较值
}

// 表单字段 Schema
export interface FormFieldSchema {
  field: string                           // 字段路径，支持嵌套如 'style.color'
  label: string                           // 显示标签
  type: BuiltinFieldType | string         // 控件类型，支持自定义类型

  // 布局
  grid?: number                           // 占用列数 (1-4)，默认满行
  hidden?: boolean                        // 是否隐藏

  // 通用属性
  placeholder?: string
  disabled?: boolean | ((model: any) => boolean)
  readonly?: boolean

  // 数值类型
  min?: number
  max?: number
  step?: number

  // 选择类型
  options?: SelectOption[] | SelectOptionGroup[]

  // 上传类型
  accept?: string                         // 文件类型
  uploadType?: 'image' | 'video' | 'audio'

  // 联动显示
  showWhen?: FieldDependency | FieldDependency[] | ((model: any) => boolean)

  // 值变化回调
  onChange?: (value: any, model: any) => void

  // 值转换
  valueGetter?: (model: any) => any       // 从 model 获取值
  valueSetter?: (value: any, model: any) => void  // 设置值到 model

  // 自定义渲染
  render?: (props: FieldRenderProps) => any

  // 扩展属性
  props?: Record<string, any>             // 传递给控件的额外属性
}

// 表单分组 Schema
export interface FormGroupSchema {
  title: string                           // 分组标题
  icon?: string                           // 图标
  collapsible?: boolean                   // 是否可折叠
  defaultCollapsed?: boolean              // 默认折叠
  showWhen?: FieldDependency | FieldDependency[] | ((model: any) => boolean)
  fields: FormFieldSchema[]
}

// 完整表单 Schema
export type FormSchema = FormFieldSchema | FormGroupSchema

// 判断是否为分组
export function isGroupSchema(schema: FormSchema): schema is FormGroupSchema {
  return 'fields' in schema && Array.isArray(schema.fields)
}

// 字段渲染 Props
export interface FieldRenderProps {
  field: FormFieldSchema
  value: any
  model: any
  disabled: boolean
  onChange: (value: any) => void
}

// 自定义控件定义
export interface CustomFieldComponent {
  name: string
  component: Component
  // 默认 props
  defaultProps?: Record<string, any>
}

// 表单上下文
export interface SchemaFormContext {
  model: any
  schema: FormSchema[]
  disabled: boolean
  // 注册的自定义控件
  customFields: Map<string, CustomFieldComponent>
  // 获取字段值
  getValue: (path: string) => any
  // 设置字段值
  setValue: (path: string, value: any) => void
  // 注册自定义控件
  registerField: (field: CustomFieldComponent) => void
}

// 表单 Props
export interface SchemaFormProps {
  schema: FormSchema[]
  modelValue: any
  disabled?: boolean
  columns?: number                        // 默认列数
}

// 表单 Emits
export interface SchemaFormEmits {
  (e: 'update:modelValue', value: any): void
  (e: 'change', field: string, value: any): void
}
