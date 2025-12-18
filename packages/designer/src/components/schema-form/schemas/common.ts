/**
 * 通用属性 Schema 配置
 * 适用于所有元素的位置、尺寸、状态属性
 */

import type { FormSchema } from '../types'

export const commonSchema: FormSchema[] = [
  {
    title: '📐 位置尺寸',
    fields: [
      { field: 'x', label: 'X', type: 'number', grid: 1 },
      { field: 'y', label: 'Y', type: 'number', grid: 1 },
      { field: 'width', label: '宽', type: 'number', grid: 1 },
      { field: 'height', label: '高', type: 'number', grid: 1 },
      { field: 'rotation', label: '旋转', type: 'number', placeholder: '0', grid: 1 },
    ]
  },
  {
    title: '🔧 元素状态',
    fields: [
      { field: 'locked', label: '🔒 锁定', type: 'checkbox' },
    ]
  }
]
