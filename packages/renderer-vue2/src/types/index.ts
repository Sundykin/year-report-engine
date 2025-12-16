import type { H5Element, H5Page, ProjectData } from '@year-report/core'

// 扩展元素类型，添加Vue2渲染器特有的属性
export interface Vue2Element extends H5Element {
  // Vue2特有的属性可以在这里扩展
  vue2Ref?: Vue
}

// 扩展页面类型
export interface Vue2Page extends H5Page {
  // Vue2特有的属性可以在这里扩展
}

// 渲染器配置
export interface RendererConfig {
  // 是否启用动画
  enableAnimation?: boolean
  // 动画默认时长（秒）
  defaultAnimationDuration?: number
  // 是否启用调试模式
  debug?: boolean
}

// 组件Props类型
export interface ElementRendererProps {
  element: H5Element
  pageIndex: number
  isActive: boolean
  offsetX?: number
  offsetY?: number
}

export interface GroupRendererProps {
  elements: H5Element[]
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  rotation: number
  pageIndex: number
  isActive: boolean
}

export interface YearReportRendererProps {
  data: ProjectData
  onClose?: () => void
  requestAdapter?: any
}