# Vue2 渲染器

基于 Vue2 的年度报告引擎渲染器实现。

## 功能特性

- 支持 Vue2.7+ 版本
- 完整的元素渲染支持（文本、图片、形状、视频、富文本、图表）
- 支持元素分组和分组旋转
- 支持数据绑定和动态内容渲染
- 支持动画系统
- 支持背景音乐和视频
- 响应式设计，支持移动端和桌面端

## 安装

```bash
npm install @year-report/renderer-vue2
# 或
yarn add @year-report/renderer-vue2
```

## 使用方法

### 全局引入

```javascript
import Vue from 'vue'
import YearReportRenderer from '@year-report/renderer-vue2'
import '@year-report/renderer-vue2/dist/style.css'

Vue.use(YearReportRenderer)
```

### 按需引入

```javascript
import { YearReportRenderer, ElementRenderer, GroupRenderer } from '@year-report/renderer-vue2'

export default {
  components: {
    YearReportRenderer,
    ElementRenderer,
    GroupRenderer
  }
}
```

### 基本使用

```vue
<template>
  <YearReportRenderer
    :data="projectData"
    :on-close="handleClose"
    :request-adapter="requestAdapter"
  />
</template>

<script>
export default {
  data() {
    return {
      projectData: {
        // 项目数据
        pages: [],
        backgroundMusic: '',
        dataSources: []
      },
      requestAdapter: {
        // 请求适配器配置
      }
    }
  },
  methods: {
    handleClose() {
      // 处理关闭事件
    }
  }
}
</script>
```

## 组件说明

### YearReportRenderer

主渲染器组件，负责整个报告的渲染和交互。

**Props:**

- `data` (ProjectData): 项目数据
- `onClose` (Function): 关闭回调函数
- `requestAdapter` (RequestAdapter): 数据请求适配器

### ElementRenderer

元素渲染器组件，负责单个元素的渲染。

**Props:**

- `element` (H5Element): 元素数据
- `pageIndex` (number): 页面索引
- `isActive` (boolean): 是否为当前活动页面
- `offsetX` (number): X轴偏移量
- `offsetY` (number): Y轴偏移量

### GroupRenderer

分组渲染器组件，负责元素分组的渲染。

**Props:**

- `elements` (H5Element[]): 分组内的元素列表
- `bounds` (Object): 分组边界信息
- `rotation` (number): 旋转角度
- `pageIndex` (number): 页面索引
- `isActive` (boolean): 是否为当前活动页面

## 支持的元素类型

- **文本**: 支持静态文本和数据绑定
- **图片**: 支持本地和远程图片
- **形状**: 支持多种预设形状（矩形、圆形、三角形等）
- **视频**: 支持视频播放
- **富文本**: 支持 HTML 富文本内容
- **图表**: 支持柱状图、折线图、饼图

## 数据绑定

渲染器支持在文本内容中使用数据绑定语法：

```javascript
{
  type: 'text',
  content: '销售额：{{sales}}万元',
  dataBinding: {
    sourceIds: ['dataSource1'],
    transform: 'ds1 => ds1.map(item => ({ name: item.month, value: item.amount }))'
  }
}
```

## 动画支持

元素支持进入和退出动画，通过 `animations` 属性配置：

```javascript
{
  type: 'text',
  animations: [
    {
      type: 'fadeIn',
      duration: 1,
      delay: 0.5
    }
  ]
}
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 许可证

MIT