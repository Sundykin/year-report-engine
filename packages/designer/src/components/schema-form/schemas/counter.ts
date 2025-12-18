/**
 * 计数器组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const counterSchema: FormSchema[] = [
  {
    title: '🔢 计数器',
    fields: [
      { field: 'counterValue', label: '目标值', type: 'number' },
      { field: 'counterPrefix', label: '前缀', type: 'text', placeholder: '¥', grid: 1 },
      { field: 'counterSuffix', label: '后缀', type: 'text', placeholder: '元', grid: 1 },
      { field: 'counterDecimals', label: '小数位', type: 'number', min: 0, max: 4, grid: 1 },
      { field: 'counterDuration', label: '动画时长(秒)', type: 'number', min: 0.5, max: 10, step: 0.5, grid: 1 },
    ]
  }
]
