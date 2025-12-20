/**
 * 轮播图组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const carouselSchema: FormSchema[] = [
  {
    title: '🎠 轮播配置',
    fields: [
      {
        field: 'carouselItems',
        label: '轮播项',
        type: 'code-editor',
        props: {
          height: '120px',
          placeholder: '[{ "src": "图片URL", "title": "标题" }]'
        },
        valueGetter: (model: any) => JSON.stringify(model.carouselItems || [], null, 2),
        valueSetter: (value: string, model: any) => {
          try {
            model.carouselItems = JSON.parse(value)
          } catch (e) {
            // 忽略解析错误
          }
        }
      },
      {
        field: 'carouselAutoplay',
        label: '自动播放',
        type: 'checkbox',
        grid: 1
      },
      {
        field: 'carouselInterval',
        label: '间隔(ms)',
        type: 'number',
        min: 1000,
        max: 10000,
        step: 500,
        grid: 1,
        showWhen: (model: any) => model.carouselAutoplay !== false
      },
      {
        field: 'carouselIndicator',
        label: '指示器',
        type: 'select',
        options: [
          { label: '圆点', value: 'dots' },
          { label: '数字', value: 'numbers' },
          { label: '无', value: 'none' }
        ],
        grid: 1
      },
      {
        field: 'carouselEffect',
        label: '切换效果',
        type: 'select',
        options: [
          { label: '滑动', value: 'slide' },
          { label: '淡入淡出', value: 'fade' }
        ],
        grid: 1
      },
    ]
  }
]
