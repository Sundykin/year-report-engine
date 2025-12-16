# 背景功能使用指南

## 功能概述

设计器现在支持多种背景类型，包括纯色、渐变、图片和视频，并且都支持上传功能。背景音乐也支持上传。

## 支持的背景类型

### 1. 纯色背景
```javascript
{
  backgroundType: 'color',
  backgroundColor: '#ffffff'
}
```

### 2. 渐变背景
```javascript
{
  backgroundType: 'gradient',
  backgroundGradient: {
    type: 'linear',  // 'linear' | 'radial'
    direction: 'to right',  // 仅线性渐变需要
    colors: [
      { color: '#ff0000', position: '0%' },
      { color: '#00ff00', position: '50%' },
      { color: '#0000ff', position: '100%' }
    ]
  }
}
```

#### 渐变方向选项
- `to right` - 向右
- `to left` - 向左
- `to bottom` - 向下
- `to top` - 向上
- `to bottom right` - 右下
- `to bottom left` - 左下
- `to top right` - 右上
- `to top left` - 左上

### 3. 图片背景
```javascript
{
  backgroundType: 'image',
  backgroundImage: 'https://example.com/bg.jpg',
  backgroundColor: '#ffffff'  // 图片加载前的背景色
}
```

### 4. 视频背景
```javascript
{
  backgroundType: 'video',
  backgroundVideo: 'https://example.com/bg.mp4'
}
```

## 背景音乐

```javascript
{
  backgroundMusic: 'https://example.com/music.mp3'
}
```

## 上传功能使用

### 基础设置

```vue
<template>
  <YearReportDesigner
    :project="project"
    :upload-adapter="uploadAdapter"
  />
</template>

<script setup>
import { YearReportDesigner, createDefaultUploadAdapter } from '@year-report/designer'

const project = ref({
  title: '我的年度报告',
  pages: [{
    id: 'page1',
    backgroundType: 'gradient',
    backgroundGradient: {
      type: 'linear',
      direction: 'to bottom',
      colors: [
        { color: '#667eea', position: '0%' },
        { color: '#764ba2', position: '100%' }
      ]
    },
    elements: []
  }]
})

// 创建上传适配器
const uploadAdapter = createDefaultUploadAdapter('https://your-api.com/upload')
</script>
```

### 支持的文件类型

- **图片**: `image/*` (最大 10MB)
- **视频**: `video/*` (最大 100MB)
- **音频**: `audio/*` (最大 20MB)

### 上传适配器示例

```javascript
// 自定义上传适配器
const customUploadAdapter = async ({ file, fileType, onProgress }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', fileType)

  const xhr = new XMLHttpRequest()

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress?.((e.loaded / e.total) * 100)
      }
    })

    xhr.addEventListener('load', () => {
      const response = JSON.parse(xhr.responseText)
      resolve({
        url: response.url,
        filename: file.name
      })
    })

    xhr.open('POST', 'https://your-api.com/upload')
    xhr.send(formData)
  })
}
```

## 渲染器支持

所有三个渲染器（Vue2、Vue3、React）都已经支持新的背景功能：

- Vue2 渲染器：自动处理渐变、图片、视频背景
- Vue3 渲染器：使用 Composition API 实现
- React 渲染器：使用 Hooks 实现

## 性能优化建议

1. **图片背景**
   - 使用压缩后的图片
   - 考虑使用 WebP 格式
   - CDN 加速

2. **视频背景**
   - 使用 MP4 格式，兼容性最好
   - 视频时长建议 5-15 秒循环
   - 文件大小控制在 50MB 以内

3. **渐变背景**
   - 避免使用过多颜色节点
   - 2-3 个颜色节点即可达到良好效果

4. **背景音乐**
   - 使用 MP3 或 AAC 格式
   - 文件大小控制在 5MB 以内
   - 考虑使用循环音乐

## 注意事项

1. 渐变背景在低端设备上可能有性能影响
2. 视频背景会自动静音播放（浏览器限制）
3. 背景音乐需要用户交互才能播放（浏览器限制）
4. 上传的文件如果很大，建议添加压缩功能
5. 渐变背景的颜色位置建议使用百分比，避免固定像素值