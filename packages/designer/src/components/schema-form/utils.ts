/**
 * Schema Form 工具函数
 */

import { get, set, cloneDeep } from 'lodash-es'
import type { FieldDependency, FormFieldSchema } from './types'

/**
 * 根据路径获取对象值
 * @example getValueByPath({ style: { color: 'red' } }, 'style.color') => 'red'
 */
export const getValueByPath = get

/**
 * 根据路径设置对象值（会修改原对象）
 * @example setValueByPath({ style: {} }, 'style.color', 'red') => { style: { color: 'red' } }
 */
export const setValueByPath = set

/**
 * 深拷贝对象
 */
export const deepClone = cloneDeep

/**
 * 检查依赖条件是否满足
 */
export function checkDependency(dep: FieldDependency, model: any): boolean {
  const fieldValue = get(model, dep.field)
  switch (dep.condition) {
    case 'eq':
      return fieldValue === dep.value
    case 'neq':
      return fieldValue !== dep.value
    case 'gt':
      return fieldValue > dep.value
    case 'lt':
      return fieldValue < dep.value
    case 'in':
      return Array.isArray(dep.value) && dep.value.includes(fieldValue)
    case 'notIn':
      return Array.isArray(dep.value) && !dep.value.includes(fieldValue)
    case 'truthy':
      return !!fieldValue
    case 'falsy':
      return !fieldValue
    default:
      return true
  }
}

/**
 * 检查字段是否应该显示
 */
export function shouldShowField(field: FormFieldSchema, model: any): boolean {
  if (field.hidden) return false
  if (!field.showWhen) return true

  if (typeof field.showWhen === 'function') {
    return field.showWhen(model)
  }

  if (!Array.isArray(field.showWhen)) {
    return checkDependency(field.showWhen, model)
  }

  return field.showWhen.every(dep => checkDependency(dep, model))
}

/**
 * 检查字段是否禁用
 */
export function isFieldDisabled(field: FormFieldSchema, model: any, formDisabled: boolean): boolean {
  if (formDisabled) return true
  if (typeof field.disabled === 'function') {
    return field.disabled(model)
  }
  return !!field.disabled
}

/**
 * 获取字段值（支持自定义 getter）
 */
export function getFieldValue(field: FormFieldSchema, model: any): any {
  if (field.valueGetter) {
    return field.valueGetter(model)
  }
  return get(model, field.field)
}

/**
 * 设置字段值（支持自定义 setter）
 */
export function setFieldValue(field: FormFieldSchema, model: any, value: any): void {
  if (field.valueSetter) {
    field.valueSetter(value, model)
  } else {
    set(model, field.field, value)
  }
  field.onChange?.(value, model)
}
