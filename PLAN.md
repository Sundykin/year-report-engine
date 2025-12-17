# Year Report Engine 开发规划

## 当前状态概览

### 已实现功能
- 核心类型系统（text/image/shape/chart/video/richtext/button/icon/divider/progress/counter）
- Vue3 设计器（组件面板、属性面板、画布编辑、动画配置、数据源管理）
- 三端渲染器（Vue3/Vue2/React）
- 动画系统（animate.css 预设 + anime.js 关键帧）
- 数据绑定（静态/异步数据源、插值语法）
- 分组操作（创建/解散/移动/缩放/旋转）
- 智能吸附对齐
- 项目导出（ZIP）
- ✅ 撤销/重做系统（Ctrl+Z / Ctrl+Shift+Z）
- ✅ 复制粘贴增强（Ctrl+C/V/X，复制样式 Ctrl+Shift+C/V）
- ✅ 对齐分布工具（多选对齐、等间距分布）
- ✅ 图层面板（拖拽排序、可见性、锁定）
- ✅ 新组件：按钮、图标、分割线、进度条、计数器

---

## Phase 1: 核心功能完善（优先级：高）✅ 已完成

### 1.1 撤销/重做系统 ✅
- [x] 实现操作历史栈（useHistory composable）
- [x] 支持 Ctrl+Z / Ctrl+Shift+Z 快捷键
- [x] 批量操作合并（如连续移动合并为一次）
- [x] 历史记录上限配置

### 1.2 复制粘贴增强 ✅
- [x] 跨页面复制粘贴
- [x] 复制样式（Ctrl+Shift+C/V）
- [x] 批量复制（多选元素）
- [x] 剪切功能（Ctrl+X）

### 1.3 对齐分布工具 ✅
- [x] 多选元素对齐（左/中/右/上/中/下）
- [x] 等间距分布（水平/垂直）
- [x] 对齐到画布中心
- [x] 工具栏快捷按钮

### 1.4 图层面板 ✅
- [x] 独立图层面板组件
- [x] 拖拽调整图层顺序
- [x] 图层可见性切换
- [x] 图层锁定状态显示

---

## Phase 2: 组件库扩展（优先级：高）🚧 进行中

> 参考：易企秀、MAKA、兔展、创客贴、Canva、稿定设计等商业化产品

### 2.1 基础组件增强

**文本组件**
- [ ] 文字描边效果
- [ ] 文字阴影
- [ ] 渐变文字填充
- [ ] 艺术字预设模板
- [ ] 文字路径（沿曲线排列）

**图片组件**
- [ ] 图片裁剪（自由/比例）
- [ ] 滤镜效果（灰度/模糊/对比度/饱和度）
- [ ] 图片蒙版（圆形/多边形/自定义）
- [ ] 边框样式（实线/虚线/阴影）
- [ ] 图片翻转（水平/垂直）

**形状组件**
- [ ] 更多预设形状（箭头/对话框/标注/徽章）
- [ ] 自定义路径绘制
- [ ] 形状组合（布尔运算）
- [ ] 渐变填充

### 2.2 新增基础组件 ✅ 部分完成

**按钮组件** `button` ✅
- [x] 多种按钮样式（实心/描边/文字）
- [x] 图标+文字组合
- [x] 点击事件（跳转链接/拨打电话/发送邮件）

**图标组件** `icon` ✅
- [x] 内置图标库（基础图标）
- [x] 自定义颜色和大小

**分割线组件** `divider` ✅
- [x] 实线/虚线/点线
- [x] 带文字分割线

**容器组件** `container`
- [ ] 背景色/背景图
- [ ] 圆角/阴影
- [ ] 内边距配置
- [ ] 子元素布局（自由/flex）

### 2.3 数据展示组件 ✅ 部分完成

**进度条** `progress` ✅
- [x] 条形进度条
- [x] 环形进度条
- [ ] 半圆进度条
- [ ] 动画效果
- [ ] 数据绑定

**计数器** `counter` ✅
- [x] 数字滚动动画
- [x] 前缀/后缀单位
- [x] 小数位配置
- [ ] 千分位格式化

**倒计时** `countdown`
- [ ] 天/时/分/秒显示
- [ ] 自定义样式
- [ ] 结束回调

**表格** `table`
- [ ] 表头配置
- [ ] 斑马纹
- [ ] 数据绑定
- [ ] 滚动支持

**列表** `list`
- [ ] 有序/无序列表
- [ ] 自定义图标
- [ ] 数据绑定循环

**标签** `tag`
- [ ] 多种颜色预设
- [ ] 可关闭标签
- [ ] 标签组

### 2.4 交互组件

**轮播图** `carousel`
- [ ] 图片/内容轮播
- [ ] 自动播放
- [ ] 指示器样式
- [ ] 切换动画

**选项卡** `tabs`
- [ ] 顶部/底部选项卡
- [ ] 滑动切换
- [ ] 自定义样式

**折叠面板** `collapse`
- [ ] 手风琴模式
- [ ] 展开/收起动画
- [ ] 自定义图标

**弹窗** `modal`
- [ ] 点击触发弹窗
- [ ] 自定义内容
- [ ] 关闭按钮
- [ ] 遮罩层

**抽屉** `drawer`
- [ ] 左/右/上/下滑出
- [ ] 自定义宽度

### 2.5 营销组件

**抽奖转盘** `lottery`
- [ ] 转盘样式配置
- [ ] 奖品配置
- [ ] 中奖概率
- [ ] 抽奖次数限制

**红包雨** `redpacket`
- [ ] 红包样式
- [ ] 下落动画
- [ ] 点击领取

**优惠券** `coupon`
- [ ] 多种券样式
- [ ] 有效期显示
- [ ] 领取状态

**投票** `vote`
- [ ] 单选/多选
- [ ] 实时结果展示
- [ ] 投票限制

### 2.6 表单组件

**输入框** `input`
- [ ] 单行/多行
- [ ] 占位符
- [ ] 验证规则
- [ ] 数据绑定

**选择器** `select`
- [ ] 下拉选择
- [ ] 单选/多选
- [ ] 搜索过滤

**开关** `switch`
- [ ] 开关状态
- [ ] 自定义颜色

**滑块** `slider`
- [ ] 数值范围
- [ ] 步进值
- [ ] 显示当前值

**评分** `rate`
- [ ] 星星/心形/自定义图标
- [ ] 半星支持
- [ ] 只读模式

### 2.7 媒体组件增强

**音频** `audio`
- [ ] 播放器样式
- [ ] 播放控制
- [ ] 自动播放

**Lottie动画** `lottie`
- [ ] JSON 动画文件支持
- [ ] 播放控制
- [ ] 循环配置

**GIF** `gif`
- [ ] GIF 播放控制
- [ ] 首帧预览

### 2.8 图表组件增强

- [ ] 雷达图
- [ ] 漏斗图
- [ ] 仪表盘
- [ ] 词云图
- [ ] 地图（省份/城市）
- [ ] 图表主题配置
- [ ] 图表动画配置
- [ ] 数据标签显示

---

## Phase 2.5: 组件渲染逻辑控制（优先级：高）

### 条件渲染
- [ ] 显示条件配置（基于数据源字段）
- [ ] 比较运算符（等于/不等于/大于/小于/包含）
- [ ] 逻辑运算符（与/或/非）
- [ ] 多条件组合

### 循环渲染
- [ ] 基于数组数据源循环生成元素
- [ ] 循环变量绑定（item/index）
- [ ] 循环内元素模板
- [ ] 空数据占位

### 状态切换
- [ ] 元素多状态配置（默认/悬停/激活/禁用）
- [ ] 状态切换动画
- [ ] 状态间属性差异

### 事件系统
- [ ] 点击事件
- [ ] 长按事件
- [ ] 滑动事件
- [ ] 事件动作（跳转/弹窗/切换状态/触发动画）

---

## Phase 3: 动画系统升级（优先级：中）

### 3.1 动画编辑器优化
- [ ] 可视化时间轴编辑
- [ ] 动画曲线编辑器（贝塞尔曲线）
- [ ] 动画预览速度控制
- [ ] 动画模板库

### 3.2 新增动画类型
- [ ] 路径动画（沿路径移动）
- [ ] 弹性动画（spring physics）
- [ ] 粒子效果
- [ ] 打字机效果
- [ ] 数字滚动效果

### 3.3 交互动画
- [ ] 滚动触发动画
- [ ] 手势触发（滑动/长按）
- [ ] 元素间联动动画
- [ ] 页面切换动画增强

---

## Phase 4: 数据能力增强（优先级：中）

### 4.1 数据源管理
- [ ] 数据源分组管理
- [ ] 数据源导入导出
- [ ] 数据预览和调试
- [ ] 请求错误处理和重试

### 4.2 数据绑定增强
- [ ] 条件渲染（v-if 类似）
- [ ] 列表渲染（v-for 类似）
- [ ] 数据格式化（日期/数字/货币）
- [ ] 计算属性支持

### 4.3 实时数据
- [ ] WebSocket 数据源支持
- [ ] 数据轮询优化
- [ ] 数据变化动画

---

## Phase 5: 导出与发布（优先级：中）

### 5.1 导出格式扩展
- [ ] 导出为图片（PNG/JPG）
- [ ] 导出为 PDF
- [ ] 导出为视频（MP4）
- [ ] 导出为独立 HTML

### 5.2 发布功能
- [ ] 一键发布到 CDN
- [ ] 生成分享链接
- [ ] 二维码生成
- [ ] 访问统计集成

### 5.3 嵌入支持
- [ ] iframe 嵌入代码生成
- [ ] Web Component 封装
- [ ] SDK 集成文档

---

## Phase 6: 用户体验优化（优先级：中）

### 6.1 设计器优化
- [ ] 深色/浅色主题切换
- [ ] 自定义快捷键配置
- [ ] 工作区布局保存
- [ ] 最近项目列表

### 6.2 性能优化
- [ ] 大量元素虚拟滚动
- [ ] 画布渲染优化（离屏 Canvas）
- [ ] 资源懒加载
- [ ] 操作防抖节流

### 6.3 辅助功能
- [ ] 网格显示/隐藏
- [ ] 参考线手动添加
- [ ] 元素搜索定位
- [ ] 快捷键提示面板

---

## Phase 7: 模板与资源（优先级：低）

### 7.1 模板系统
- [ ] 内置模板库
- [ ] 模板分类管理
- [ ] 模板预览
- [ ] 自定义模板保存

### 7.2 资源库
- [ ] 图片素材库
- [ ] 图标库集成
- [ ] 字体库管理
- [ ] 配色方案库

---

## Phase 8: 动态表单属性面板（优先级：高）

### 背景与问题

当前每新增一个组件，都需要创建对应的 `XxxProperties.vue` 属性面板组件，导致：
- 代码量大幅增加（目前已有 12 个属性面板组件）
- 重复代码多（样式、布局、表单控件）
- 维护成本高
- 新增组件开发效率低

### 现有表单控件分析

通过分析现有属性面板，总结出以下原子级表单控件：

| 控件类型 | 用途 | 示例 |
|---------|------|------|
| `number` | 数值输入 | x, y, width, height, rotation, fontSize |
| `text` | 文本输入 | content, tagText, counterPrefix |
| `textarea` | 多行文本 | content, listItems |
| `color` | 颜色选择 | color, backgroundColor, progressColor |
| `select` | 下拉选择 | shapeType, progressType, listType |
| `select-group` | 分组下拉 | shapeType (带 optgroup) |
| `checkbox` | 开关 | locked, useGradient |
| `range` | 滑块 | progressValue, filter values |
| `button-group` | 按钮组切换 | backgroundType, renderMode |
| `datetime` | 日期时间 | countdownTarget |
| `code` | 代码编辑器 | renderFunction, transform |
| `upload` | 文件上传 | src, backgroundImage |
| `multi-select` | 多选下拉 | dataBinding.sourceIds |
| `collapsible` | 可折叠区域 | 样式效果分组 |
| `grid` | 网格布局 | 2列/3列/4列布局 |

### 方案评估

#### 方案一：自研轻量级 Schema 表单

**优点：**
- 完全可控，按需定制
- 无外部依赖，体积小
- 与现有代码风格一致

**缺点：**
- 开发工作量较大
- 需要自行处理复杂场景

**实现思路：**
```typescript
// 组件元信息定义
interface ComponentMeta {
  type: ElementType
  name: string
  icon: string
  defaultProps: Partial<H5Element>
  schema: FormSchema[]
}

interface FormSchema {
  field: string           // 字段路径，如 'style.color'
  label: string
  type: 'number' | 'text' | 'color' | 'select' | ...
  options?: { label: string; value: any }[]  // select 选项
  min?: number
  max?: number
  step?: number
  placeholder?: string
  showWhen?: (element: H5Element) => boolean  // 条件显示
  grid?: number           // 占用列数 (1-4)
  group?: string          // 分组名称
  collapsible?: boolean   // 是否可折叠
}
```

#### 方案二：使用 FormCreate

**优点：**
- 功能完善，支持复杂表单
- 社区活跃，文档齐全
- 支持 Vue3

**缺点：**
- 引入额外依赖（~100KB）
- 样式需要适配深色主题
- 部分控件可能不符合需求

**官网：** https://www.form-create.com/

#### 方案三：使用 FormKit

**优点：**
- 现代化设计，Vue3 原生
- Schema 驱动
- 高度可定制

**缺点：**
- 学习成本
- 需要自定义主题

**官网：** https://formkit.com/

#### 方案四：使用 VueFormulate / Vuelidate + 自定义

**优点：**
- 轻量级
- 灵活组合

**缺点：**
- 需要较多自定义工作

### 推荐方案：自研轻量级 Schema 表单

考虑到：
1. 项目已有明确的控件类型需求
2. 需要深度定制深色主题
3. 避免引入过多外部依赖
4. 控件类型相对固定

**建议采用自研方案**，实现步骤：

### 实现计划

#### 8.1 基础架构
- [ ] 定义 FormSchema 类型系统
- [ ] 创建 SchemaForm.vue 动态表单组件
- [ ] 实现字段路径解析（支持 `style.color` 嵌套路径）

#### 8.2 原子控件库
- [ ] NumberInput - 数值输入
- [ ] TextInput - 文本输入
- [ ] TextareaInput - 多行文本
- [ ] ColorPicker - 颜色选择
- [ ] SelectInput - 下拉选择
- [ ] CheckboxInput - 开关
- [ ] RangeSlider - 滑块
- [ ] ButtonGroup - 按钮组
- [ ] DatetimeInput - 日期时间
- [ ] CodeEditor - 代码编辑（复用现有）
- [ ] FileUpload - 文件上传（复用现有）
- [ ] MultiSelect - 多选

#### 8.3 布局组件
- [ ] FormSection - 分组区域（带标题）
- [ ] FormGrid - 网格布局
- [ ] FormCollapsible - 可折叠区域

#### 8.4 组件元信息定义
- [ ] 为每个组件类型定义 schema
- [ ] 迁移现有属性面板到 schema 配置
- [ ] 支持条件显示逻辑

#### 8.5 高级功能
- [ ] 自定义控件注册机制
- [ ] 表单验证
- [ ] 联动逻辑（字段间依赖）

### 预期收益

1. **代码量减少 60%+**：12 个属性面板 → 1 个动态表单 + schema 配置
2. **新增组件效率提升**：只需定义 schema，无需写 Vue 组件
3. **一致性保证**：所有控件样式统一
4. **易于维护**：修改控件样式只需改一处

### 示例 Schema 配置

```typescript
// 计数器组件 schema 示例
const counterSchema: FormSchema[] = [
  { field: 'counterValue', label: '目标值', type: 'number', grid: 2 },
  { field: 'counterPrefix', label: '前缀', type: 'text', placeholder: '¥', grid: 1 },
  { field: 'counterSuffix', label: '后缀', type: 'text', placeholder: '元', grid: 1 },
  { field: 'counterDecimals', label: '小数位', type: 'number', min: 0, max: 4, grid: 1 },
  { field: 'counterDuration', label: '动画时长(秒)', type: 'number', min: 0.5, max: 10, step: 0.5, grid: 1 },
]

// 标签组件 schema 示例
const tagSchema: FormSchema[] = [
  { field: 'tagText', label: '标签文字', type: 'text', placeholder: '标签' },
  { field: 'tagColor', label: '颜色', type: 'color', grid: 1 },
  { field: 'tagVariant', label: '样式', type: 'select', grid: 1, options: [
    { label: '实心', value: 'solid' },
    { label: '描边', value: 'outline' },
    { label: '浅色', value: 'light' },
  ]},
]
```

---

## 技术债务清理

### 代码质量
- [ ] 完善 TypeScript 类型定义
- [ ] 添加单元测试（Vitest）
- [ ] 添加 E2E 测试（Playwright）
- [ ] ESLint/Prettier 配置统一

### 文档完善
- [ ] API 文档生成
- [ ] 组件使用文档
- [ ] 开发者指南
- [ ] 部署文档

### 构建优化
- [ ] 修复 vue-tsc 版本兼容问题
- [ ] 优化打包体积
- [ ] Tree-shaking 优化
- [ ] 按需加载配置

---

## 建议开发顺序

1. **立即开始**：撤销/重做系统、对齐分布工具
2. **短期目标**：图层面板、文本增强、复制粘贴增强
3. **中期目标**：新组件类型、动画编辑器优化、导出格式扩展
4. **长期目标**：模板系统、协作功能

---

## 里程碑规划

### v1.1 - 编辑体验优化
- 撤销/重做
- 对齐分布
- 图层面板
- 复制粘贴增强

### v1.2 - 组件能力扩展
- 文本/图片增强
- 进度条/计数器组件
- 图表类型扩展

### v1.3 - 动画与数据
- 动画编辑器升级
- 数据绑定增强
- 交互动画

### v2.0 - 发布与协作
- 多格式导出
- 发布功能
