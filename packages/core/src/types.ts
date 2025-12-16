// 核心类型定义（框架无关）

export type ElementType = 'text' | 'image' | 'shape' | 'chart' | 'video' | 'richtext'

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'parallelogram' | 'diamond' | 'star' | 'hexagon'

export type ChartType = 'bar' | 'line' | 'pie'

// 动画触发时机
export type AnimationTrigger =
  | 'onEnter'        // 页面进入时
  | 'afterPrevious'  // 上一动画结束后
  | 'withPrevious'   // 与上一动画同时
  | 'onClick'        // 点击触发
  | 'onDelay'        // 延迟触发

// 动画类型（扩展支持animate.css��
export type AnimationType =
  // 基础动画
  | 'none'
  // 淡入
  | 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight'
  // 滑入
  | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight'
  // 缩放
  | 'zoomIn' | 'zoomInUp' | 'zoomInDown'
  // 弹跳
  | 'bounceIn' | 'bounceInUp' | 'bounceInDown'
  // 翻转
  | 'flipInX' | 'flipInY'
  // 旋转
  | 'rotateIn' | 'rotateInDownLeft' | 'rotateInDownRight'
  // 强调
  | 'bounce' | 'flash' | 'pulse' | 'rubberBand' | 'shake' | 'swing' | 'tada' | 'wobble' | 'jello' | 'heartBeat'
  // 退出
  | 'fadeOut' | 'fadeOutUp' | 'fadeOutDown'
  | 'slideOutUp' | 'slideOutDown'
  | 'zoomOut' | 'bounceOut'
  // 自定义关键帧
  | 'custom'

export interface CSSStyle {
  color?: string
  fontSize?: string
  backgroundColor?: string
  borderRadius?: string
  fontWeight?: string | number
  textAlign?: 'left' | 'center' | 'right'
  opacity?: number
  transform?: string
  [key: string]: any
}

// 关键帧
export interface Keyframe {
  percent: number  // 0-100
  x?: number
  y?: number
  width?: number
  height?: number
  opacity?: number
  rotate?: number
  scale?: number
  easing?: string
}

// 动画配置
export interface AnimationConfig {
  id?: string
  type: AnimationType
  duration: number      // 秒
  delay: number         // 秒
  easing?: string       // 缓动函数
  trigger?: AnimationTrigger
  order?: number        // 动画顺序
  keyframes?: Keyframe[] // 关键帧动画
  iterationCount?: number | 'infinite'
}

export interface ChartDataItem {
  name: string
  value: number
}

// 数据绑定配置（多数据源）
export interface DataBinding {
  sourceIds: string[]   // 数据源ID列表
  transform?: string    // 转换函数，接收多个数据源数据作为参数
}

export interface H5Element {
  id: string
  type: ElementType
  // 位置和尺寸（绝对定位）
  x: number
  y: number
  width: number
  height: number
  rotation?: number  // 旋转角度（度）
  zIndex?: number
  // 内容属性
  content?: string      // 文本内容/富文本HTML
  src?: string          // 图片/视频URL
  chartType?: ChartType
  chartData?: ChartDataItem[]
  shapeType?: ShapeType // 形状类型
  renderFunction?: string // 文本渲染函数，返回HTML片段
  // 样式
  style: CSSStyle
  // 动画配置（支持多个动画）
  animations?: AnimationConfig[]
  // 兼容旧版单动画
  animation?: AnimationConfig
  // 数据绑定
  dataBinding?: DataBinding
  // 锁定状态
  locked?: boolean
  // 可见性
  visible?: boolean
  // 组合ID
  groupId?: string
}

export interface H5Page {
  id: string
  name?: string
  backgroundType: 'color' | 'gradient' | 'image' | 'video'
  backgroundColor?: string
  backgroundGradient?: {
    type: 'linear' | 'radial'
    direction?: string  // linear: to right, to bottom, etc.
    colors: Array<{
      color: string
      position?: string  // 0%, 50%, 100%
    }>
  }
  backgroundImage?: string
  backgroundVideo?: string
  elements: H5Element[]
  // 分组旋转角度 { groupId: angle }
  groupRotations?: Record<string, number>
  // 页面切换动画
  transition?: {
    type: 'slide' | 'fade' | 'zoom' | 'flip'
    duration: number
  }
}

// 数据源类型
export type DataSourceType = 'static' | 'async'

// 数据映射类型
export type DataMappingType = 'none' | 'function' | 'fieldMap'

// 字段映射配置
export interface FieldMapItem {
  source: string  // 源字段路径，如 "data.list[0].name"
  target: string  // 目标字段名
}

// 数据源配置
export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  // 静态数据
  staticData?: any
  // 异步数据配置
  asyncConfig?: {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    body?: any
    refreshInterval?: number  // 刷新间隔(毫秒)
    // 数据映射配置
    mappingType?: DataMappingType
    // 转换函数（当mappingType为function时）
    transform?: string  // 函数体字符串，如 "return data.result.list"
    // 字段映射（当mappingType为fieldMap时）
    fieldMapping?: FieldMapItem[]
    // 数据路径（快速提取，如 "data.result"）
    dataPath?: string
  }
}

// 请求适配器类型
export type RequestAdapter = (config: {
  url: string
  method: string
  headers?: Record<string, string>
  body?: any
}) => Promise<any>

// 上传适配器类型
export type UploadAdapter = (config: {
  file: File
  fileType: 'image' | 'video'
  onProgress?: (progress: number) => void
}) => Promise<{
  url: string
  filename?: string
  size?: number
}>

export interface ProjectData {
  title: string
  author: string
  backgroundMusic?: string
  pages: H5Page[]
  // 数据源列表
  dataSources?: DataSource[]
  // 画布配置
  canvas?: {
    width: number
    height: number
    extendWidth: number   // 扩展区域宽度
    extendHeight: number  // 扩展区域高度
  }
}

// 编辑器状态
export interface EditorState {
  project: ProjectData
  activePageId: string
  selectedElementIds: string[]  // 支持多选
  isPreview: boolean
  zoom: number
  showGrid: boolean
  showRuler: boolean
}
