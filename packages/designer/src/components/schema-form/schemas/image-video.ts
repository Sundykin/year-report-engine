/**
 * 图片/视频组件 Schema 配置
 */

import type { FormSchema } from '../types'

// 图片效果 Schema
const imageEffectsSchema: FormSchema[] = [
  {
    title: '🎨 图片效果',
    collapsible: true,
    defaultCollapsed: true,
    fields: [
      // 滤镜效果
      {
        field: 'imageFilters.enabled',
        label: '滤镜效果',
        type: 'checkbox',
        grid: 2
      },
      {
        field: 'imageFilters.grayscale',
        label: '灰度',
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
        grid: 2,
        showWhen: (model: any) => model.imageFilters?.enabled
      },
      {
        field: 'imageFilters.blur',
        label: '模糊',
        type: 'range',
        min: 0,
        max: 20,
        step: 1,
        grid: 2,
        showWhen: (model: any) => model.imageFilters?.enabled
      },
      {
        field: 'imageFilters.brightness',
        label: '亮度',
        type: 'range',
        min: 0,
        max: 200,
        step: 5,
        grid: 2,
        showWhen: (model: any) => model.imageFilters?.enabled
      },
      {
        field: 'imageFilters.contrast',
        label: '对比度',
        type: 'range',
        min: 0,
        max: 200,
        step: 5,
        grid: 2,
        showWhen: (model: any) => model.imageFilters?.enabled
      },
      {
        field: 'imageFilters.saturate',
        label: '饱和度',
        type: 'range',
        min: 0,
        max: 200,
        step: 5,
        grid: 2,
        showWhen: (model: any) => model.imageFilters?.enabled
      },
      // 蒙版
      {
        field: 'imageMask.enabled',
        label: '图片蒙版',
        type: 'checkbox',
        grid: 2
      },
      {
        field: 'imageMask.type',
        label: '蒙版形状',
        type: 'select',
        options: [
          { label: '圆形', value: 'circle' },
          { label: '椭圆', value: 'ellipse' },
          { label: '三角形', value: 'triangle' },
          { label: '菱形', value: 'diamond' },
          { label: '五边形', value: 'pentagon' },
          { label: '六边形', value: 'hexagon' },
          { label: '星形', value: 'star' },
          { label: '心形', value: 'heart' },
        ],
        grid: 2,
        showWhen: (model: any) => model.imageMask?.enabled
      },
      // 翻转
      {
        field: 'imageFlip.horizontal',
        label: '水平翻转',
        type: 'checkbox',
        grid: 1
      },
      {
        field: 'imageFlip.vertical',
        label: '垂直翻转',
        type: 'checkbox',
        grid: 1
      },
    ]
  }
]

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
  },
  ...imageEffectsSchema
]
