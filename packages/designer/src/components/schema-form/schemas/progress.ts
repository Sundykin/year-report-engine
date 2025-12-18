/**
 * 进度条组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const progressSchema: FormSchema[] = [
  {
    title: '📶 进度条',
    fields: [
      {
        field: 'progressType',
        label: '类型',
        type: 'select',
        options: [
          { label: '条形', value: 'line' },
          { label: '环形', value: 'circle' },
          { label: '半圆', value: 'semicircle' },
        ]
      },
      {
        field: 'progressValue',
        label: '进度值',
        type: 'range',
        min: 0,
        max: 100,
        props: { suffix: '%' }
      },
      { field: 'progressColor', label: '进度颜色', type: 'color', grid: 1 },
      { field: 'style.backgroundColor', label: '轨道颜色', type: 'color', grid: 1 },
    ]
  }
]
