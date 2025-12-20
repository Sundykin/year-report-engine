/**
 * 状态切换样式 Schema
 */

import type { FormSchema, FormGroupSchema } from '../types'
import type { H5Element } from '@year-report/core'

// 悬停状态样式
export const hoverStyleSchema: FormSchema[] = [
  {
    title: '悬停效果',
    fields: [
      {
        field: 'hoverStyle.enabled',
        type: 'checkbox',
        label: '启用悬停效果'
      },
      {
        field: 'hoverStyle.scale',
        type: 'range',
        label: '缩放',
        min: 0.5,
        max: 2,
        step: 0.05,
        props: { defaultValue: 1 },
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.opacity',
        type: 'range',
        label: '透明度',
        min: 0,
        max: 1,
        step: 0.1,
        props: { defaultValue: 1 },
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.translateX',
        type: 'number',
        label: 'X位移',
        props: { defaultValue: 0 },
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.translateY',
        type: 'number',
        label: 'Y位移',
        props: { defaultValue: 0 },
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.rotate',
        type: 'number',
        label: '旋转角度',
        props: { defaultValue: 0 },
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.backgroundColor',
        type: 'color',
        label: '背景色',
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.borderColor',
        type: 'color',
        label: '边框色',
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.boxShadow',
        type: 'text',
        label: '阴影',
        placeholder: '0 4px 12px rgba(0,0,0,0.3)',
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      },
      {
        field: 'hoverStyle.transition',
        type: 'number',
        label: '过渡时长(ms)',
        min: 0,
        max: 2000,
        props: { defaultValue: 200 },
        showWhen: (model: H5Element) => model.hoverStyle?.enabled
      }
    ]
  } as FormGroupSchema
]

// 激活状态样式
export const activeStyleSchema: FormSchema[] = [
  {
    title: '点击效果',
    fields: [
      {
        field: 'activeStyle.enabled',
        type: 'checkbox',
        label: '启用点击效果'
      },
      {
        field: 'activeStyle.scale',
        type: 'range',
        label: '缩放',
        min: 0.5,
        max: 2,
        step: 0.05,
        props: { defaultValue: 0.95 },
        showWhen: (model: H5Element) => model.activeStyle?.enabled
      },
      {
        field: 'activeStyle.opacity',
        type: 'range',
        label: '透明度',
        min: 0,
        max: 1,
        step: 0.1,
        props: { defaultValue: 1 },
        showWhen: (model: H5Element) => model.activeStyle?.enabled
      },
      {
        field: 'activeStyle.backgroundColor',
        type: 'color',
        label: '背景色',
        showWhen: (model: H5Element) => model.activeStyle?.enabled
      },
      {
        field: 'activeStyle.borderColor',
        type: 'color',
        label: '边框色',
        showWhen: (model: H5Element) => model.activeStyle?.enabled
      },
      {
        field: 'activeStyle.boxShadow',
        type: 'text',
        label: '阴影',
        placeholder: '0 2px 4px rgba(0,0,0,0.2)',
        showWhen: (model: H5Element) => model.activeStyle?.enabled
      }
    ]
  } as FormGroupSchema
]

// 合并的状态样式 Schema
export const stateStyleSchema: FormSchema[] = [
  ...hoverStyleSchema,
  ...activeStyleSchema
]
