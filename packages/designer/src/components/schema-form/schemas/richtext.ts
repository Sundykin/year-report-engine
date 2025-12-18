/**
 * 富文本组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const richtextSchema: FormSchema[] = [
  {
    title: '📄 富文本',
    fields: [
      {
        field: 'content',
        label: '内容',
        type: 'richtext-editor',
        props: { height: '400px' }
      },
    ]
  }
]
