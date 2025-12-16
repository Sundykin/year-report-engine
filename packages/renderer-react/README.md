# Year Report Engine - React Renderer

React 渲染器，用于渲染 H5 年度报告。

## 安装

```bash
npm install @year-report/renderer-react
```

## 使用

```jsx
import React from 'react'
import { YearReportRenderer } from '@year-report/renderer-react'
import '@year-report/renderer-react/dist/style.css'
import 'animate.css'

function App() {
  const projectData = {
    // 项目数据
    pages: [
      {
        id: 'page1',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el1',
            type: 'text',
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            content: 'Hello World'
          }
        ]
      }
    ]
  }

  return (
    <YearReportRenderer
      data={projectData}
      onClose={() => console.log('closed')}
    />
  )
}
```

## 支持的元素类型

- `text` - 文本
- `image` - 图片
- `shape` - 形状
- `video` - 视频
- `richtext` - 富文本
- `chart` - 图表（ECharts）

## 功能特性

- ✅ 响应式布局
- ✅ 页面切换动画
- ✅ 元素动画效果
- ✅ 数据绑定
- ✅ 图表渲染
- ✅ 背景音乐/视频
- ✅ 触摸/鼠标事件支持