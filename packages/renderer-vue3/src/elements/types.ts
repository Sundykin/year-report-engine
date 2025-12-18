import type { H5Element, DataSourceManager } from '@year-report/core'

/**
 * 渲染模式
 * - design: 设计器画布模式，显示占位符
 * - preview: 预览模式，使用真实数据但不触发交互
 * - render: 正式渲染模式，完整功能
 */
export type RenderMode = 'design' | 'preview' | 'render'

/**
 * 元素组件统一 Props 接口
 */
export interface ElementComponentProps {
  element: H5Element
  mode?: RenderMode
  dataBindingManager?: DataSourceManager | null
}
