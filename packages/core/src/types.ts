// 核心类型定义（框架无关）

export type ElementType = 'text' | 'image' | 'shape' | 'chart' | 'video' | 'richtext' | 'button' | 'icon' | 'divider' | 'progress' | 'counter' | 'countdown' | 'list' | 'tag' | 'table' | 'carousel'

export type ShapeType =
  | 'rectangle' | 'circle' | 'triangle' | 'parallelogram' | 'diamond' | 'star' | 'hexagon'
  | 'arrow' | 'arrowLeft' | 'arrowUp' | 'arrowDown'
  | 'bubble' | 'bubbleLeft'
  | 'badge' | 'ribbon'
  | 'cross' | 'heart' | 'pentagon' | 'octagon'

export type ChartType = 'bar' | 'line' | 'pie'

// 按钮样式类型
export type ButtonStyle = 'solid' | 'outline' | 'text' | 'gradient'

// 按钮点击动作
export interface ButtonAction {
  type: 'link' | 'phone' | 'email' | 'page' | 'popup' | 'none'
  value?: string // URL/电话号码/邮箱/页面ID
}

// 进度条类型
export type ProgressType = 'line' | 'circle' | 'semicircle'

// 动画触发时机
export type AnimationTrigger =
  | 'onEnter'        // 页面进入时
  | 'onExit'         // 页面退出时
  | 'afterPrevious'  // 上一动画结束后
  | 'withPrevious'   // 与上一动画同时
  | 'onClick'        // 点击触发
  | 'onScroll'       // 滚动进入视口时
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
  // 描边
  border?: string
  borderWidth?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderColor?: string
  // 阴影
  boxShadow?: string
  textShadow?: string
  // 滤镜
  filter?: string
  // 渐变背景
  backgroundImage?: string
  backgroundClip?: string
  WebkitBackgroundClip?: string
  WebkitTextFillColor?: string
  // 图片翻转
  scaleX?: number
  scaleY?: number
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
  // 滚动触发配置
  scrollConfig?: {
    threshold?: number    // 触发阈值 0-1，表示元素可见比例
    once?: boolean        // 是否只触发一次
    rootMargin?: string   // 观察器边距，如 '0px 0px -100px 0px'
  }
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

// 条件渲染 - 比较运算符
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'notContains' | 'empty' | 'notEmpty'

// 条件渲染 - 逻辑运算符
export type LogicOperator = 'and' | 'or'

// 单个条件
export interface ConditionRule {
  sourceId: string        // 数据源ID
  field: string           // 字段路径，如 "user.name"
  operator: ConditionOperator
  value?: any             // 比较值（empty/notEmpty 不需要）
}

// 条件组
export interface ConditionGroup {
  logic: LogicOperator
  conditions: ConditionRule[]
}

// 显示条件配置
export interface ShowCondition {
  enabled: boolean
  logic: LogicOperator    // 多条件之间的逻辑
  rules: ConditionRule[]
}

// 循环渲染配置
export interface LoopConfig {
  enabled: boolean
  sourceId: string        // 数据源ID
  dataPath?: string       // 数据路径，如 "list" 或 "data.items"
  itemKey?: string        // 唯一标识字段，如 "id"
  direction: 'horizontal' | 'vertical' | 'grid'  // 排列方向
  gap: number             // 间距 px
  columns?: number        // grid 模式下的列数
  maxCount?: number       // 最大渲染数量
  emptyText?: string      // 空数据提示文本
}

// 事件动作类型
export type EventActionType =
  | 'navigate'      // 跳转链接
  | 'page'          // 切换页面
  | 'call'          // 拨打电话
  | 'email'         // 发送邮件
  | 'animation'     // 触发动画
  | 'toggle'        // 切换元素显示
  | 'custom'        // 自定义JS

// 事件动作
export interface EventAction {
  type: EventActionType
  // navigate
  url?: string
  openInNew?: boolean
  // page
  pageId?: string
  // call/email
  value?: string
  // animation
  targetElementId?: string
  animationName?: string
  // toggle
  toggleElementId?: string
  // custom
  customCode?: string
}

// 元素事件配置
export interface ElementEvent {
  trigger: 'click' | 'doubleClick' | 'longPress' | 'hover'
  actions: EventAction[]
}

export interface H5Element {
  id: string
  type: ElementType
  name?: string  // 图层名称
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
  hidden?: boolean
  // 组合ID
  groupId?: string
  // 按钮配置
  buttonStyle?: ButtonStyle
  buttonAction?: ButtonAction
  buttonIcon?: string
  // 进度条配置
  progressType?: ProgressType
  progressValue?: number // 0-100
  progressColor?: string
  // 计数器配置
  counterValue?: number
  counterPrefix?: string
  counterSuffix?: string
  counterDecimals?: number
  counterDuration?: number // 动画时长(秒)
  // 分割线配置
  dividerStyle?: 'solid' | 'dashed' | 'dotted'
  dividerText?: string
  // 图标配置
  iconName?: string
  iconColor?: string
  // 倒计时配置
  countdownTarget?: string  // ISO日期字符串
  countdownFormat?: 'dhms' | 'hms' | 'ms' | 's'  // 显示格式
  // 列表配置
  listItems?: string[]
  listType?: 'ordered' | 'unordered' | 'checklist'
  listIconColor?: string
  // 标签配置
  tagText?: string
  tagColor?: string
  tagVariant?: 'solid' | 'outline' | 'light'
  // 文本增强配置
  textStroke?: {
    enabled: boolean
    width: number      // 描边宽度 px
    color: string      // 描边颜色
  }
  textShadow?: {
    enabled: boolean
    offsetX: number    // X偏移 px
    offsetY: number    // Y偏移 px
    blur: number       // 模糊半径 px
    color: string      // 阴影颜色
  }
  textGradient?: {
    enabled: boolean
    type: 'linear' | 'radial'
    direction: string  // 角度或方向，如 '90deg', 'to right'
    colors: string[]   // 渐变颜色数组
  }
  // 图片增强配置
  imageFilters?: {
    enabled: boolean
    grayscale: number    // 灰度 0-100
    blur: number         // 模糊 0-20 px
    brightness: number   // 亮度 0-200 (100为原始)
    contrast: number     // 对比度 0-200 (100为原始)
    saturate: number     // 饱和度 0-200 (100为原始)
  }
  imageMask?: {
    enabled: boolean
    type: 'circle' | 'ellipse' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'heart' | 'custom'
    customPath?: string  // 自定义 clip-path
  }
  imageFlip?: {
    horizontal: boolean  // 水平翻转
    vertical: boolean    // 垂直翻转
  }
  // 表格配置
  tableColumns?: Array<{
    key: string
    title: string
    width?: number
  }>
  tableData?: Array<Record<string, any>>
  tableStriped?: boolean      // 斑马纹
  tableBordered?: boolean     // 边框
  tableHeaderBg?: string      // 表头背景色
  tableHeaderColor?: string   // 表头文字颜色
  // 轮播图配置
  carouselItems?: Array<{
    src: string
    title?: string
    link?: string
  }>
  carouselAutoplay?: boolean
  carouselInterval?: number   // 轮播间隔(ms)
  carouselIndicator?: 'dots' | 'numbers' | 'none'
  carouselEffect?: 'slide' | 'fade'
  // 条件渲染
  showCondition?: ShowCondition
  // 循环渲染
  loopConfig?: LoopConfig
  // 事件配置
  events?: ElementEvent[]
  // 状态切换样式
  hoverStyle?: {
    enabled: boolean
    scale?: number          // 缩放比例 默认1
    opacity?: number        // 透明度 0-1
    translateX?: number     // X位移 px
    translateY?: number     // Y位移 px
    rotate?: number         // 旋转角度
    backgroundColor?: string
    borderColor?: string
    boxShadow?: string
    transition?: number     // 过渡时长 ms
  }
  activeStyle?: {
    enabled: boolean
    scale?: number
    opacity?: number
    backgroundColor?: string
    borderColor?: string
    boxShadow?: string
  }
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
  // 分组层级 { groupId: zIndex }
  groupZIndexes?: Record<string, number>
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
