<template>
  <div class="backgroundUpload">
    <!-- 文件上传区域 -->
    <div class="uploadArea">
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        style="display: none"
        @change="handleFileSelect"
      />
      <button
        class="uploadBtn"
        :disabled="uploading"
        @click="selectFile"
      >
        {{ uploading ? '上传中...' : `选择${label}` }}
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
    <div class="urlInput" v-if="showUrlInput">
      <input
        v-model="localValue"
        type="text"
        class="input"
        :placeholder="placeholder"
        @input="handleUrlInput"
      />
    </div>

    <!-- 预览区域 -->
    <div v-if="previewUrl" class="preview">
      <img
        v-if="type === 'image'"
        :src="previewUrl"
        class="previewImage"
        @load="onPreviewLoad"
        @error="onPreviewError"
      />
      <video
        v-else-if="type === 'video'"
        :src="previewUrl"
        class="previewVideo"
        controls
        muted
      />
      <div v-else-if="type === 'audio'" class="previewAudio">
        <audio controls :src="previewUrl"></audio>
        <span class="audioLabel">🎵 背景音乐</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { UploadAdapter } from '@year-report/core'

interface Props {
  modelValue?: string
  type: 'image' | 'video' | 'audio'
  uploadAdapter?: UploadAdapter
  showUrlInput?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showUrlInput: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadProgress = ref(0)
const localValue = ref(props.modelValue || '')
const previewUrl = ref(props.modelValue || '')
const abortController = ref<AbortController | null>(null)

// 根据类型设置属性
const accept = computed(() => {
  switch (props.type) {
    case 'image':
      return 'image/*'
    case 'video':
      return 'video/*'
    case 'audio':
      return 'audio/*'
    default:
      return '*/*'
  }
})

const label = computed(() => {
  switch (props.type) {
    case 'image':
      return '图片'
    case 'video':
      return '视频'
    case 'audio':
      return '音频'
    default:
      return '文件'
  }
})

const placeholder = computed(() => {
  switch (props.type) {
    case 'image':
      return '输入图片URL或上传文件'
    case 'video':
      return '输入视频URL或上传文件'
    case 'audio':
      return '输入音频URL或上传文件'
    default:
      return '输入文件URL或上传文件'
  }
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue || ''
  previewUrl.value = newValue || ''
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
  let maxSize = 10 * 1024 * 1024 // 默认10MB
  if (props.type === 'video') {
    maxSize = 100 * 1024 * 1024 // 视频100MB
  } else if (props.type === 'audio') {
    maxSize = 20 * 1024 * 1024 // 音频20MB
  }

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
        fileType: props.type === 'audio' ? 'image' : props.type, // 音频暂时归类为image处理
        onProgress: (progress) => {
          uploadProgress.value = Math.round(progress)
        }
      })

      // 更新值
      localValue.value = result.url
      previewUrl.value = result.url
      emit('update:modelValue', result.url)
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

// 处理URL输入
const handleUrlInput = () => {
  emit('update:modelValue', localValue.value)
  previewUrl.value = localValue.value
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
      const result = reader.result as string
      localValue.value = result
      previewUrl.value = result
      emit('update:modelValue', result)
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
  // console.log('预览加载成功')
}

// 预览加载失败
const onPreviewError = () => {
  // console.error('预览加载失败')
}
</script>

<style scoped>
.backgroundUpload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.uploadArea {
  display: flex;
  gap: 8px;
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

.progressBar {
  position: relative;
  height: 24px;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
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

.input {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.input:focus {
  outline: none;
  border-color: #1890ff;
}

.preview {
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

.previewAudio {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.previewAudio audio {
  flex: 1;
}

.audioLabel {
  font-size: 14px;
  color: #a3a3a3;
}
</style>