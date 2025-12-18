/**
 * 图片/视频组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const imageVideoSchema: FormSchema[] = [
  {
    title: '🖼️ 资源',
    fields: [
      {
        field: 'src',
        label: '资源',
        type: 'file-upload',
        props: {
          showPreview: true
        }
      },
    ]
  }
]
