<template>
  <div class="exportDialog" v-if="visible">
    <div class="dialogOverlay" @click="$emit('close')"></div>
    <div class="dialogContent">
      <div class="dialogHeader">
        <h3>📤 导出项目</h3>
        <button class="closeBtn" @click="$emit('close')">×</button>
      </div>

      <div class="dialogBody">
        <!-- 导出格式选择 -->
        <div class="formatSection">
          <h4>选择导出格式</h4>
          <div class="formatGrid">
            <div
              v-for="fmt in formats"
              :key="fmt.id"
              class="formatCard"
              :class="{ active: selectedFormat === fmt.id, disabled: fmt.disabled }"
              @click="!fmt.disabled && (selectedFormat = fmt.id)"
            >
              <span class="formatIcon">{{ fmt.icon }}</span>
              <span class="formatName">{{ fmt.name }}</span>
              <span class="formatDesc">{{ fmt.desc }}</span>
              <span v-if="fmt.disabled" class="comingSoon">即将推出</span>
            </div>
          </div>
        </div>

        <!-- 导出选项 -->
        <div class="optionsSection" v-if="selectedFormat">
          <h4>导出选项</h4>

          <!-- 图片选项 -->
          <template v-if="selectedFormat === 'png' || selectedFormat === 'jpg'">
            <div class="optionRow">
              <label>缩放比例</label>
              <select v-model="options.scale">
                <option :value="1">1x (标准)</option>
                <option :value="2">2x (高清)</option>
                <option :value="3">3x (超清)</option>
              </select>
            </div>
            <div class="optionRow" v-if="selectedFormat === 'jpg'">
              <label>图片质量</label>
              <input type="range" v-model="options.quality" min="0.5" max="1" step="0.1" />
              <span>{{ Math.round(options.quality * 100) }}%</span>
            </div>
            <div class="optionRow">
              <label>导出页面</label>
              <select v-model="options.pageMode">
                <option value="current">当前页</option>
                <option value="all">全部页面</option>
              </select>
            </div>
          </template>

          <!-- PDF选项 -->
          <template v-if="selectedFormat === 'pdf'">
            <div class="optionRow">
              <label>页面范围</label>
              <select v-model="options.pageMode">
                <option value="all">全部页面</option>
                <option value="current">当前页</option>
              </select>
            </div>
          </template>

          <!-- HTML选项 -->
          <template v-if="selectedFormat === 'html'">
            <div class="optionRow">
              <label>包含动画</label>
              <input type="checkbox" v-model="options.includeAnimations" />
            </div>
          </template>

          <!-- 文件名 -->
          <div class="optionRow">
            <label>文件名</label>
            <input type="text" v-model="options.filename" placeholder="export" />
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="previewSection" v-if="selectedFormat === 'png' || selectedFormat === 'jpg'">
          <h4>预览</h4>
          <div class="previewBox" ref="previewRef">
            <div class="previewPlaceholder" v-if="!previewUrl">
              点击"生成预览"查看效果
            </div>
            <img v-else :src="previewUrl" class="previewImage" />
          </div>
          <button class="previewBtn" @click="generatePreview" :disabled="isExporting">
            {{ isExporting ? '生成中...' : '生成预览' }}
          </button>
        </div>
      </div>

      <div class="dialogFooter">
        <button class="cancelBtn" @click="$emit('close')">取消</button>
        <button class="exportBtn" @click="doExport" :disabled="!selectedFormat || isExporting">
          {{ isExporting ? '导出中...' : '导出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { exportToImage, exportToPDF, exportToHTML, downloadBlob } from '@year-report/core'

interface Props {
  visible: boolean
  projectData: any
  currentPageIndex: number
  getPageElement: (index: number) => HTMLElement | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  exported: [format: string]
}>()

const formats = [
  { id: 'png', icon: '🖼️', name: 'PNG', desc: '透明背景图片' },
  { id: 'jpg', icon: '📷', name: 'JPG', desc: '压缩图片格式' },
  { id: 'pdf', icon: '📄', name: 'PDF', desc: '多页文档' },
  { id: 'html', icon: '🌐', name: 'HTML', desc: '独立网页文件' },
  { id: 'json', icon: '📋', name: 'JSON', desc: '项目数据文件' },
  { id: 'mp4', icon: '🎬', name: 'MP4', desc: '视频格式', disabled: true }
]

const selectedFormat = ref<string>('')
const isExporting = ref(false)
const previewUrl = ref<string>('')

const options = reactive({
  scale: 2,
  quality: 0.92,
  pageMode: 'current' as 'current' | 'all',
  includeAnimations: true,
  filename: ''
})

// 重置选项
watch(() => props.visible, (visible) => {
  if (visible) {
    selectedFormat.value = ''
    previewUrl.value = ''
    options.filename = props.projectData?.title || 'export'
  }
})

// 生成预览
const generatePreview = async () => {
  if (!props.getPageElement) return

  isExporting.value = true
  try {
    const pageEl = props.getPageElement(props.currentPageIndex)
    if (!pageEl) return

    const result = await exportToImage(pageEl, {
      format: selectedFormat.value as 'png' | 'jpg',
      scale: 1, // 预览用低分辨率
      quality: options.quality
    })

    if (result.success && result.url) {
      previewUrl.value = result.url
    }
  } finally {
    isExporting.value = false
  }
}

// 执行导出
const doExport = async () => {
  isExporting.value = true

  try {
    switch (selectedFormat.value) {
      case 'png':
      case 'jpg':
        await exportImage()
        break
      case 'pdf':
        await exportPDF()
        break
      case 'html':
        await exportHTML()
        break
      case 'json':
        await exportJSON()
        break
    }

    emit('exported', selectedFormat.value)
  } finally {
    isExporting.value = false
  }
}

const exportImage = async () => {
  const pages = options.pageMode === 'all'
    ? props.projectData.pages.map((_: any, i: number) => i)
    : [props.currentPageIndex]

  for (const pageIdx of pages) {
    const pageEl = props.getPageElement(pageIdx)
    if (!pageEl) continue

    const result = await exportToImage(pageEl, {
      format: selectedFormat.value as 'png' | 'jpg',
      scale: options.scale,
      quality: options.quality,
      filename: pages.length > 1 ? `${options.filename}_${pageIdx + 1}` : options.filename
    })

    if (result.success && result.blob) {
      downloadBlob(result.blob, result.filename)
    }
  }
}

const exportPDF = async () => {
  const pageIndices = options.pageMode === 'all'
    ? props.projectData.pages.map((_: any, i: number) => i)
    : [props.currentPageIndex]

  const elements: HTMLElement[] = []
  for (const idx of pageIndices) {
    const el = props.getPageElement(idx)
    if (el) elements.push(el)
  }

  const result = await exportToPDF(elements, {
    filename: options.filename,
    scale: options.scale
  })

  if (result.success && result.blob) {
    downloadBlob(result.blob, result.filename)
  }
}

const exportHTML = async () => {
  const result = await exportToHTML(props.projectData, {
    filename: options.filename,
    includeAnimations: options.includeAnimations
  })

  if (result.success && result.blob) {
    downloadBlob(result.blob, result.filename)
  }
}

const exportJSON = async () => {
  const json = JSON.stringify(props.projectData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, `${options.filename}.json`)
}
</script>

<style scoped>
.exportDialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialogOverlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.dialogContent {
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dialogHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
}

.dialogHeader h3 {
  font-size: 16px;
  color: #fff;
  margin: 0;
}

.closeBtn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
}

.closeBtn:hover { color: #fff; }

.dialogBody {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.formatSection h4,
.optionsSection h4,
.previewSection h4 {
  font-size: 13px;
  color: #a3a3a3;
  margin: 0 0 12px 0;
}

.formatGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.formatCard {
  background: #262626;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.formatCard:hover { border-color: #3b82f6; }
.formatCard.active { border-color: #3b82f6; background: #1e3a8a22; }
.formatCard.disabled { opacity: 0.5; cursor: not-allowed; }

.formatIcon { font-size: 24px; }
.formatName { font-size: 13px; font-weight: 600; color: #fff; }
.formatDesc { font-size: 10px; color: #737373; }

.comingSoon {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 9px;
  background: #f59e0b;
  color: #000;
  padding: 2px 4px;
  border-radius: 3px;
}

.optionsSection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #333;
}

.optionRow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.optionRow label {
  width: 80px;
  font-size: 12px;
  color: #a3a3a3;
}

.optionRow select,
.optionRow input[type="text"] {
  flex: 1;
  background: #262626;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px;
  color: #fff;
  font-size: 12px;
}

.optionRow input[type="range"] {
  flex: 1;
}

.optionRow input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.previewSection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #333;
}

.previewBox {
  background: #0a0a0a;
  border-radius: 8px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.previewPlaceholder {
  color: #666;
  font-size: 12px;
}

.previewImage {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.previewBtn {
  width: 100%;
  background: #333;
  border: none;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.previewBtn:hover { background: #404040; }
.previewBtn:disabled { opacity: 0.5; cursor: not-allowed; }

.dialogFooter {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #333;
}

.cancelBtn {
  background: #333;
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.cancelBtn:hover { background: #404040; }

.exportBtn {
  background: #3b82f6;
  border: none;
  color: #fff;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.exportBtn:hover { background: #2563eb; }
.exportBtn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
