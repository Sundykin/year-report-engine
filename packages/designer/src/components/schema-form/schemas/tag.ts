/**
 * 标签组件 Schema 配置示例
 */

import type { FormSchema } from '../types'

export const tagSchema: FormSchema[] = [
  {
    title: '🏷️ 标签',
    icon: '🏷️',
    fields: [
      { field: 'tagText', label: '标签文字', type: 'text', placeholder: '标签' },
      { field: 'tagColor', label: '颜色', type: 'color', grid: 1 },
      { field: 'tagVariant', label: '样式', type: 'select', grid: 1, options: [
        { label: '实心', value: 'solid' },
        { label: '描边', value: 'outline' },
        { label: '浅色', value: 'light' },
      ]},
    ]
  }
]
