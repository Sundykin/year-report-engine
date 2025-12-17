/**
 * 计数器组件 Schema 配置示例
 */

import type { FormSchema } from '../types'

export const counterSchema: FormSchema[] = [
  {
    title: '🔢 计数器',
    icon: '🔢',
    fields: [
      { field: 'counterValue', label: '目标值', type: 'number' },
      { field: 'counterPrefix', label: '前缀', type: 'text', placeholder: '¥', grid: 1 },
      { field: 'counterSuffix', label: '后缀', type: 'text', placeholder: '元', grid: 1 },
      { field: 'counterDecimals', label: '小数位', type: 'number', min: 0, max: 4, grid: 1 },
      { field: 'counterDuration', label: '动画时长(秒)', type: 'number', min: 0.5, max: 10, step: 0.5, grid: 1 },
    ]
  },
  {
    title: '🎨 样式',
    icon: '🎨',
    collapsible: true,
    fields: [
      { field: 'style.color', label: '文字颜色', type: 'color', grid: 1 },
      { field: 'style.fontSize', label: '字号', type: 'text', placeholder: '32px', grid: 1 },
      { field: 'style.fontWeight', label: '字重', type: 'select', grid: 1, options: [
        { label: '正常', value: 'normal' },
        { label: '粗体', value: 'bold' },
      ]},
    ]
  }
]
