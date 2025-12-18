/**
 * 倒计时组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const countdownSchema: FormSchema[] = [
  {
    title: '⏱️ 倒计时',
    fields: [
      { field: 'countdownTarget', label: '目标时间', type: 'datetime' },
      {
        field: 'countdownFormat',
        label: '显示格式',
        type: 'select',
        options: [
          { label: '天时分秒', value: 'dhms' },
          { label: '时分秒', value: 'hms' },
          { label: '分秒', value: 'ms' },
          { label: '仅秒', value: 's' },
        ]
      },
    ]
  }
]
