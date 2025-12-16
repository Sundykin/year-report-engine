<template>
  <div class="section">
    <h4 class="sectionTitle">🖼️ 资源</h4>

    <!-- 文件上传区域 -->
    <div class="uploadArea">
      <input
        ref="fileInput"
        type="file"
        :accept="fileAccept"
        style="display: none"
        @change="handleFileSelect"
      />
      <button
        class="uploadBtn"
        :disabled="disabled || uploading"
        @click="selectFile"
      >
        {{ uploading ? '上传中...' : '选择文件' }}
      </button>
      <button
        v-if="uploading"
        class="cancelBtn"
        @click="cancelUpload"
      >
        取消
      </button>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="progressBar">
      <div
        class="progressFill"
        :style="{ width: uploadProgress + '%' }"
      ></div>
      <span class="progressText">{{ uploadProgress }}%</span>
    </div>

    <!-- URL 输入框 -->
    <div class="urlInput">
      <input
        v-model="element.src"
        type="text"
        class="input"
        :disabled="disabled"
        placeholder="输入资源URL或上传文件"
      />
    </div>

    <!-- 预览区域 -->
    <div v-if="element.src" class="preview">
      <img
        v-if="element.type === 'image'"
        :src="element.src"
        class="previewImage"
        @load="onPreviewLoad"
        @error="onPreviewError"
      />
      <video
        v-else-if="element.type === 'video'"
        :src="element.src"
        class="previewVideo"
        controls
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { H5Element, UploadAdapter } from '@year-report/core'

interface Props {
  element: H5Element
  disabled?: boolean
  uploadAdapter?: UploadAdapter
}

const props = defineProps<Props>()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadProgress = ref(0)
const abortController = ref<AbortController | null>(null)

// 文件类型限制
const fileAccept = computed(() => {
  if (props.element.type === 'image') {
    return 'image/*'
  } else if (props.element.type === 'video') {
    return 'video/*'
  }
  return '*/*'
})

// 选择文件
const selectFile = () => {
  fileInput.value?.click()
}

// 取消上传
const cancelUpload = () => {
  if (abortController.value) {
    abortController.value.abort()
  }
  uploading.value = false
  uploadProgress.value = 0
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 文件大小检查
  const maxSize = props.element.type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 视频100MB，图片10MB
  if (file.size > maxSize) {
    alert(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`)
    return
  }

  // 开始上传
  uploading.value = true
  uploadProgress.value = 0
  abortController.value = new AbortController()

  try {
    if (props.uploadAdapter) {
      // 使用自定义上传适配器
      const result = await props.uploadAdapter({
        file,
        fileType: props.element.type as 'image' | 'video',
        onProgress: (progress) => {
          uploadProgress.value = Math.round(progress)
        }
      })

      // 更新元素src
      props.element.src = result.url
    } else {
      // 默认前端处理（转换为base64或临时URL）
      await handleDefaultUpload(file)
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      alert('上传失败: ' + error.message)
    }
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    abortController.value = null
    // 清空input值，允许重复选择同一文件
    target.value = ''
  }
}

// 默认上传处理（前端临时处理）
const handleDefaultUpload = async (file: File) => {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100
        uploadProgress.value = Math.round(progress)
      }
    }

    reader.onload = () => {
      // 临时使用base64，实际项目应该上传到服务器
      props.element.src = reader.result as string
      resolve()
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

// 预览加载成功
const onPreviewLoad = () => {
  console.log('预览加载成功')
}

// 预览加载失败
const onPreviewError = () => {
  console.error('预览加载失败')
}
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.input { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.input:disabled { opacity: 0.5; cursor: not-allowed; }

/* 上传区域 */
.uploadArea {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.uploadBtn, .cancelBtn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.uploadBtn {
  background: #1890ff;
  color: white;
  border: 1px solid #1890ff;
}

.uploadBtn:hover:not(:disabled) {
  background: #40a9ff;
  border-color: #40a9ff;
}

.uploadBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancelBtn {
  background: #ff4d4f;
  color: white;
  border: 1px solid #ff4d4f;
}

.cancelBtn:hover {
  background: #ff7875;
  border-color: #ff7875;
}

/* URL输入框 */
.urlInput {
  margin-bottom: 12px;
}

/* 进度条 */
.progressBar {
  position: relative;
  height: 24px;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progressFill {
  height: 100%;
  background: #1890ff;
  transition: width 0.3s ease;
}

.progressText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: white;
  font-weight: 500;
}

/* 预览区域 */
.preview {
  margin-top: 12px;
  border: 1px solid #444;
  border-radius: 4px;
  overflow: hidden;
  background: #1a1a1a;
}

.previewImage {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.previewVideo {
  width: 100%;
  max-height: 200px;
}
</style>
