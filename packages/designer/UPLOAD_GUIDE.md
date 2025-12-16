# 设计器上传功能使用指南

## 概述

设计器现在支持图片和视频文件的上传功能。通过 `uploadAdapter` 参数，开发者可以轻松适配各种上传接口。

## 基本使用

```vue
<template>
  <YearReportDesigner
    :project="project"
    :upload-adapter="uploadAdapter"
    @update:project="handleProjectUpdate"
    @preview="handlePreview"
  />
</template>

<script setup>
import { ref } from 'vue'
import { YearReportDesigner, createDefaultUploadAdapter } from '@year-report/designer'
import '@year-report/designer/dist/style.css'

const project = ref({
  title: '我的年度报告',
  author: '作者',
  pages: []
})

// 创建上传适配器
const uploadAdapter = createDefaultUploadAdapter('https://your-server.com/api/upload')

const handleProjectUpdate = (newProject) => {
  project.value = newProject
}

const handlePreview = () => {
  // 处理预览
}
</script>
```

## UploadAdapter 接口定义

```typescript
export type UploadAdapter = (config: {
  file: File          // 要上传的文件
  fileType: 'image' | 'video'  // 文件类型
  onProgress?: (progress: number) => void  // 上传进度回调
}) => Promise<{
  url: string        // 上传后的文件URL
  filename?: string  // 文件名
  size?: number      // 文件大小
}>
```

## 预设的上传适配器

### 1. 默认上传适配器

适用于标准的文件上传接口，使用 FormData 进行上传：

```javascript
import { createDefaultUploadAdapter } from '@year-report/designer'

const uploadAdapter = createDefaultUploadAdapter('https://api.example.com/upload')
```

服务器端需要处理以下格式的请求：
- Method: POST
- Content-Type: multipart/form-data
- Fields:
  - `file`: 上传的文件
  - `type`: 文件类型（"image" 或 "video"）

### 2. 阿里云 OSS 上传适配器

```javascript
import { createAliyunOSSUploadAdapter } from '@year-report/designer'
// 需要先安装: npm install ali-oss

const uploadAdapter = createAliyunOSSUploadAdapter({
  region: 'oss-cn-hangzhou',
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  bucket: 'your-bucket-name'
})
```

### 3. 腾讯云 COS 上传适配器

```javascript
import { createTencentCOSUploadAdapter } from '@year-report/designer'
// 需要先安装: npm install cos-js-sdk-v5

const uploadAdapter = createTencentCOSUploadAdapter({
  SecretId: 'your-secret-id',
  SecretKey: 'your-secret-key',
  Bucket: 'your-bucket-name',
  Region: 'ap-guangzhou'
})
```

### 4. 七牛云上传适配器

```javascript
import { createQiniuUploadAdapter } from '@year-report/designer'

const uploadAdapter = createQiniuUploadAdapter({
  uploadUrl: 'https://upload.qbox.me',
  token: 'your-upload-token',
  domain: 'https://your-cdn-domain.com'
})
```

## 自定义上传适配器

如果预设的适配器不满足需求，你可以创建自己的上传适配器：

```javascript
const customUploadAdapter = async ({ file, fileType, onProgress }) => {
  // 实现你的上传逻辑
  const formData = new FormData()
  formData.append('myFile', file)
  formData.append('fileType', fileType)

  // 使用 fetch 或 axios 上传
  const response = await fetch('https://your-api.com/upload', {
    method: 'POST',
    body: formData
  })

  const result = await response.json()

  return {
    url: result.fileUrl,
    filename: file.name,
    size: file.size
  }
}
```

## 功能特性

1. **拖拽上传**：支持点击选择文件进行上传
2. **进度显示**：实时显示上传进度
3. **文件预览**：上传成功后自动预览
4. **取消上传**：支持取消正在进行的上传
5. **文件大小限制**：
   - 图片：最大 10MB
   - 视频：最大 100MB
6. **文件类型限制**：
   - 图片：支持所有图片格式（image/*）
   - 视频：支持所有视频格式（video/*）

## 注意事项

1. 如果没有提供 `uploadAdapter`，文件会转换为 base64 格式临时使用
2. 建议在生产环境中始终提供 `uploadAdapter`
3. 服务器端需要正确处理 CORS（跨域请求）
4. 上传的 URL 会直接赋值给元素的 `src` 属性

## 后端接口示例

Node.js Express 示例：

```javascript
const express = require('express')
const multer = require('multer')
const app = express()

const upload = multer({ dest: 'uploads/' })

app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file
  const fileType = req.body.type

  // 处理文件保存逻辑
  const fileUrl = `https://your-cdn.com/uploads/${file.filename}`

  res.json({
    url: fileUrl,
    filename: file.originalname,
    size: file.size
  })
})

app.listen(3000)
```