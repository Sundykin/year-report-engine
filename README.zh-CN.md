<div align="center">

<!-- LOGO_PLACEHOLDER: 在此添加 Logo -->
<!-- <img src="./assets/logo.png" alt="Year Report Engine" width="200"> -->

# Year Report Engine

**专业的 H5 年度报告可视化设计与多框架渲染解决方案**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io/)

[English](./README.md) | [简体中文](./README.zh-CN.md)

</div>

---

## 项目简介

Year Report Engine 是一个功能强大的企业级解决方案，用于创建精美的 H5 年度报告和交互式演示文稿。它提供了完整的可视化设计系统，包含拖拽式编辑器和多框架渲染器，可无缝集成到 Vue 2、Vue 3 和 React 应用中。

<!-- SCREENSHOT_PLACEHOLDER: 在此添加设计器截图 -->
<!-- ![设计器截图](./assets/screenshots/designer.png) -->

## 核心特性

### 可视化设计器

- **拖拽式编辑** - 直观的所见即所得编辑体验
- **智能对齐** - 智能吸附辅助线和对齐工具
- **元素分组** - 支持分组、取消分组和批量变换
- **图层管理** - 完整的元素层级和可见性控制
- **撤销/重做** - 完整的历史记录管理（即将推出）

### 丰富的组件库

| 分类 | 组件 |
|------|------|
| **基础组件** | 文本、富文本、图片、形状、视频 |
| **图表组件** | 柱状图、折线图、饼图（基于 ECharts/Recharts） |
| **形状组件** | 矩形、圆形、三角形、菱形、星形、六边形 |

### 动画系统

- **35+ 预设动画** - 淡入、滑入、缩放、弹跳、翻转、旋转系列
- **自定义关键帧** - 通过关键帧编辑器创建复杂动画
- **动画时间轴** - 可视化时间轴编排动画序列
- **触发方式** - 页面进入、上一动画后、同时播放、点击触发、延迟触发

### 数据绑定

- **静态数据源** - JSON 数据绑定
- **异步数据源** - REST API 集成，支持自动刷新
- **模板语法** - `{{dataSource.field}}` 插值表达式
- **数据转换** - 自定义转换函数

### 多框架支持

```
┌─────────────────────────────────────────────────────────┐
│                    @year-report/core                     │
│                  （框架无关的类型和工具）                   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ renderer-vue3 │   │ renderer-vue2 │   │ renderer-react│
│   Vue3 渲染器  │   │   Vue2 渲染器  │   │  React 渲染器  │
└───────────────┘   └───────────────┘   └───────────────┘
```

## 演示

<!-- DEMO_GIF_PLACEHOLDER: 在此添加演示 GIF -->
<!-- ![演示](./assets/demo.gif) -->

**在线演示：** 即将推出

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
# 克隆仓库
git clone https://github.com/user/year-report-engine.git
cd year-report-engine

# 安装依赖
pnpm install

# 启动设计器
pnpm dev
```

在浏览器中打开 http://localhost:3000

## 使用指南

### 使用渲染器

#### Vue 3 项目

```bash
npm install @year-report/renderer-vue3
```

```vue
<template>
  <YearReportRenderer
    :data="reportData"
    :request-adapter="fetchAdapter"
  />
</template>

<script setup lang="ts">
import { YearReportRenderer } from '@year-report/renderer-vue3'
import type { ProjectData } from '@year-report/core'

const reportData: ProjectData = {
  title: '2024年度报告',
  author: '您的公司',
  pages: [/* ... */]
}

// 可选：自定义请求适配器，用于异步数据源
const fetchAdapter = async (config) => {
  const response = await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: JSON.stringify(config.body)
  })
  return response.json()
}
</script>
```

#### Vue 2 项目

```bash
npm install @year-report/renderer-vue2
```

```vue
<template>
  <YearReportRenderer :data="reportData" />
</template>

<script>
import { YearReportRenderer } from '@year-report/renderer-vue2'

export default {
  components: { YearReportRenderer },
  data() {
    return {
      reportData: { /* ... */ }
    }
  }
}
</script>
```

#### React 项目

```bash
npm install @year-report/renderer-react
```

```tsx
import { YearReportRenderer } from '@year-report/renderer-react'
import type { ProjectData } from '@year-report/core'

function App() {
  const reportData: ProjectData = { /* ... */ }

  return (
    <YearReportRenderer
      data={reportData}
      onPageChange={(index) => console.log('当前页:', index)}
    />
  )
}
```

### 使用设计器

```bash
npm install @year-report/designer
```

```vue
<template>
  <YearReportDesigner
    v-model:project="project"
    :request-adapter="requestAdapter"
    :upload-adapter="uploadAdapter"
    @export="handleExport"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { YearReportDesigner } from '@year-report/designer'
import type { ProjectData } from '@year-report/core'

const project = ref<ProjectData>({
  title: '我的报告',
  author: '作者',
  pages: []
})

// 自定义上传适配器
const uploadAdapter = async ({ file, fileType, onProgress }) => {
  // 上传到您的服务器/CDN
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  const { url } = await response.json()
  return { url }
}
</script>
```

## 项目结构

```
year-report-engine/
├── packages/
│   ├── core/                 # 核心类型、工具、动画调度器
│   ├── designer/             # Vue 3 可视化设计器
│   ├── renderer-vue3/        # Vue 3 渲染器
│   ├── renderer-vue2/        # Vue 2 渲染器
│   └── renderer-react/       # React 渲染器
├── examples/
│   └── designer-app/         # 设计器示例应用
└── docs/                     # 文档（即将推出）
```

## 技术栈

| 分类 | 技术 |
|------|------|
| **开发语言** | TypeScript 5.x |
| **设计器** | Vue 3, Vite |
| **渲染器** | Vue 3, Vue 2, React 18 |
| **动画** | Animate.css, Anime.js |
| **图表** | ECharts (Vue), Recharts (React) |
| **富文本** | WangEditor |
| **构建工具** | Vite, pnpm Workspaces |

## 开发路线图

详细的开发规划请查看 [PLAN.md](./PLAN.md)。

### 即将推出的功能

- [ ] 撤销/重做系统
- [ ] 更多组件类型（按钮、图标、进度条、计数器等）
- [ ] 条件渲染
- [ ] 导出为图片/PDF/视频
- [ ] 模板库
- [ ] 实时协作

## 参与贡献

我们欢迎各种形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加某个很棒的特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 开源协议

本项目基于 MIT 协议开源 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 致谢

- [Animate.css](https://animate.style/) - 动画库
- [Anime.js](https://animejs.com/) - JavaScript 动画引擎
- [ECharts](https://echarts.apache.org/) - 图表库
- [WangEditor](https://www.wangeditor.com/) - 富文本编辑器

---

<div align="center">

**如果这个项目对您有帮助，请考虑给它一个 Star！**

用心制作

</div>
