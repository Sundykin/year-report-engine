<template>
  <div class="uploadWrapper">
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

    <div v-if="uploading" class="progressBar">
      <div class="progressFill" :style="{ width: uploadProgress + '%' }"></div>
      <span class="progressText">{{ uploadProgress }}%</span>
    </div>

    <div class="urlInput">
      <input
        :value="value"
        @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
        type="text"
        class="input"
        :disabled="disabled"
        placeholder="输入资源URL或上传文件"
      />
    </div>

    <div v-if="value && showPreview" class="preview">
      <img
        v-if="fileType === 'image'"
        :src="value"
        class="previewImage"
      />
      <video
        v-else-if="fileType === 'video'"
        :src="value"
        class="previewVideo"
        controls
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormFieldSchema } from '../types'

const props = defineProps<{
  field: FormFieldSchema
  value: string
  model: any
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

// 从 model 获取元素类型来决定文件类型
const fileType = computed(() => props.model?.type as 'image' | 'video' | undefined)
const showPreview = computed(() => props.field.props?.showPreview !== false)

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadProgress = ref(0)
const abortController = ref<AbortController | null>(null)

const accept = computed(() => {
  if (fileType.value === 'image') return 'image/*'
  if (fileType.value === 'video') return 'video/*'
  return '*/*'
})

const selectFile = () => fileInput.value?.click()

const cancelUpload = () => {
  abortController.value?.abort()
  uploading.value = false
  uploadProgress.value = 0
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const maxSize = fileType.value === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`)
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  abortController.value = new AbortController()

  try {
    // 默认使用 base64
    await handleDefaultUpload(file)
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      alert('上传失败: ' + error.message)
    }
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    abortController.value = null
    target.value = ''
  }
}

const handleDefaultUpload = (file: File) => {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader()
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    }
    reader.onload = () => {
      emit('update:value', reader.result as string)
      resolve()
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.uploadWrapper { display: flex; flex-direction: column; gap: 12px; }
.uploadArea { display: flex; gap: 8px; }
.uploadBtn, .cancelBtn { padding: 6px 16px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.uploadBtn { background: #1890ff; color: white; border: 1px solid #1890ff; }
.uploadBtn:hover:not(:disabled) { background: #40a9ff; border-color: #40a9ff; }
.uploadBtn:disabled { opacity: 0.5; cursor: not-allowed; }
.cancelBtn { background: #ff4d4f; color: white; border: 1px solid #ff4d4f; }
.cancelBtn:hover { background: #ff7875; border-color: #ff7875; }
.urlInput { }
.input { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.input:disabled { opacity: 0.5; cursor: not-allowed; }
.progressBar { position: relative; height: 24px; background: #2a2a2a; border-radius: 4px; overflow: hidden; }
.progressFill { height: 100%; background: #1890ff; transition: width 0.3s ease; }
.progressText { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; color: white; font-weight: 500; }
.preview { border: 1px solid #444; border-radius: 4px; overflow: hidden; background: #1a1a1a; }
.previewImage { width: 100%; max-height: 200px; object-fit: contain; }
.previewVideo { width: 100%; max-height: 200px; }
</style>
