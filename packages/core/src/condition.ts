/**
 * 条件渲染工具函数
 */

import type { ShowCondition, ConditionRule, ConditionOperator } from './types'
import { getNestedValue } from './dataBinding'

/**
 * 评估单个条件
 */
export function evaluateCondition(rule: ConditionRule, dataCache: Map<string, any>): boolean {
  const sourceData = dataCache.get(rule.sourceId)
  if (sourceData === undefined) return false

  const fieldValue = getNestedValue(sourceData, rule.field)

  return evaluateOperator(rule.operator, fieldValue, rule.value)
}

/**
 * 评估运算符
 */
export function evaluateOperator(operator: ConditionOperator, fieldValue: any, compareValue: any): boolean {
  switch (operator) {
    case 'eq':
      return fieldValue === compareValue
    case 'neq':
      return fieldValue !== compareValue
    case 'gt':
      return Number(fieldValue) > Number(compareValue)
    case 'gte':
      return Number(fieldValue) >= Number(compareValue)
    case 'lt':
      return Number(fieldValue) < Number(compareValue)
    case 'lte':
      return Number(fieldValue) <= Number(compareValue)
    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.includes(String(compareValue))
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(compareValue)
      }
      return false
    case 'notContains':
      if (typeof fieldValue === 'string') {
        return !fieldValue.includes(String(compareValue))
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(compareValue)
      }
      return true
    case 'empty':
      return fieldValue === null || fieldValue === undefined || fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
    case 'notEmpty':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '' &&
        !(Array.isArray(fieldValue) && fieldValue.length === 0)
    default:
      return false
  }
}

/**
 * 评估显示条件
 * @param condition 条件配置
 * @param dataCache 数据缓存
 * @returns 是否显示
 */
export function evaluateShowCondition(
  condition: ShowCondition | undefined,
  dataCache: Map<string, any>
): boolean {
  // 没有条件配置或未启用，默认显示
  if (!condition || !condition.enabled || condition.rules.length === 0) {
    return true
  }

  const results = condition.rules.map(rule => evaluateCondition(rule, dataCache))

  // 根据逻辑运算符组合结果
  if (condition.logic === 'and') {
    return results.every(r => r)
  } else {
    return results.some(r => r)
  }
}

/**
 * 运算符显示名称
 */
export const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'eq', label: '等于' },
  { value: 'neq', label: '不等于' },
  { value: 'gt', label: '大于' },
  { value: 'gte', label: '大于等于' },
  { value: 'lt', label: '小于' },
  { value: 'lte', label: '小于等于' },
  { value: 'contains', label: '包含' },
  { value: 'notContains', label: '不包含' },
  { value: 'empty', label: '为空' },
  { value: 'notEmpty', label: '不为空' },
]
