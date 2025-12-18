<template>
  <template v-if="!selectedElement">
    <!-- 页面背景设置 -->
    <div class="section">
      <h4 class="sectionTitle">🎨 页面背景</h4>
      <div class="btnGroup">
        <button
          v-for="t in ['color', 'gradient', 'image', 'video']"
          :key="t"
          @click="handleBackgroundTypeChange(t)"
          class="btnGroupItem"
          :class="{ active: activePage.backgroundType === t }"
        >
          {{ t === 'color' ? '纯色' : t === 'gradient' ? '渐变' : t === 'image' ? '图片' : '视频' }}
        </button>
      </div>

      <!-- 纯色背景 -->
      <div v-if="activePage.backgroundType === 'color'" class="inputGroup">
        <label class="inputLabel">背景颜色</label>
        <input
          :value="activePage.backgroundColor || '#ffffff'"
          @input="updateBackgroundColor(($event.target as HTMLInputElement).value)"
          type="color"
          class="colorInput"
        />
      </div>

      <!-- 渐变背景 -->
      <div v-if="activePage.backgroundType === 'gradient'">
        <BackgroundGradient
          :page="activePage"
          @update:page="$emit('update-page', $event)"
        />
      </div>

      <!-- 图片背景 -->
      <div v-if="activePage.backgroundType === 'image'" class="inputGroup">
        <label class="inputLabel">背景图片</label>
        <BackgroundUpload
          v-model="activePage.backgroundImage"
          type="image"
          :upload-adapter="uploadAdapter"
        />
      </div>

      <!-- 视频背景 -->
      <div v-if="activePage.backgroundType === 'video'" class="inputGroup">
        <label class="inputLabel">背景视频</label>
        <BackgroundUpload
          v-model="activePage.backgroundVideo"
          type="video"
          :upload-adapter="uploadAdapter"
        />
      </div>
    </div>

    <!-- 全局音乐 -->
    <div class="section">
      <h4 class="sectionTitle">🎵 背景音乐</h4>
      <BackgroundUpload
        v-model="project.backgroundMusic"
        type="audio"
        :upload-adapter="uploadAdapter"
      />
    </div>
  </template>

  <template v-else>
    <!-- 锁定提示浮窗 -->
    <div v-if="selectedElement.locked && showLockedTip" class="lockedTipFloat">
      <span>🔒 元素已锁定，部分属性不可编辑</span>
      <button class="closeTip" @click="showLockedTip = false">×</button>
    </div>

    <!-- 锁定控制（始终可用） -->
    <SchemaForm
      :model-value="selectedElement"
      :schema="lockSchema"
    />

    <!-- 位置尺寸（受锁定影响） -->
    <SchemaForm
      :model-value="selectedElement"
      :schema="positionSchema"
      :disabled="selectedElement.locked"
    />

    <!-- 组件专属属性 -->
    <SchemaForm
      :model-value="selectedElement"
      :schema="componentSchema"
      :disabled="selectedElement.locked"
    />

    <!-- 样式效果 -->
    <SchemaForm
      v-if="showStyleEffects"
      :model-value="selectedElement"
      :schema="styleEffectsSchema"
      :disabled="selectedElement.locked"
    />

    <button @click="$emit('delete-element')" class="deleteBtn" :disabled="selectedElement.locked">🗑️ 删除组件</button>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { ProjectData, H5Page, H5Element, UploadAdapter } from '@year-report/core'
import BackgroundUpload from './properties/BackgroundUpload.vue'
import BackgroundGradient from './properties/BackgroundGradient.vue'
import { SchemaForm, registerBuiltinFields } from './schema-form'
import {
  positionSchema,
  lockSchema,
  progressSchema,
  counterSchema,
  countdownSchema,
  tagSchema,
  listSchema,
  shapeSchema,
  createTextSchema,
  richtextSchema,
  imageVideoSchema,
  createChartSchema,
  styleEffectsSchema
} from './schema-form/schemas'
import type { FormSchema } from './schema-form/types'

interface Props {
  project: ProjectData
  activePage: H5Page
  selectedElement?: H5Element
  uploadAdapter?: UploadAdapter
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update-page': [updates: Partial<H5Page>]
  'init-render-function': []
  'update-text-data-sources': [event: Event]
  'update-chart-data-sources': [event: Event]
  'show-text-render-modal': []
  'show-chart-transform-modal': []
  'delete-element': []
}>()

// 锁定提示显示状态
const showLockedTip = ref(false)

// 元素变化时重置提示
watch(() => props.selectedElement?.id, () => {
  showLockedTip.value = true
})

// 锁定状态变化时显示提示
watch(() => props.selectedElement?.locked, (locked) => {
  if (locked) showLockedTip.value = true
})

// 注册内置控件
onMounted(() => {
  registerBuiltinFields()
})

// 是否显示样式效果
const showStyleEffects = computed(() => {
  if (!props.selectedElement) return false
  return ['text', 'richtext', 'image', 'video', 'shape', 'button'].includes(props.selectedElement.type)
})

// 根据组件类型获取对应的 schema
const componentSchema = computed<FormSchema[]>(() => {
  if (!props.selectedElement) return []

  const type = props.selectedElement.type
  const dataSources = props.project.dataSources || []

  switch (type) {
    case 'text':
      return createTextSchema(dataSources)
    case 'richtext':
      return richtextSchema
    case 'image':
    case 'video':
      return imageVideoSchema
    case 'shape':
      return shapeSchema
    case 'chart':
      return createChartSchema(dataSources)
    case 'progress':
      return progressSchema
    case 'counter':
      return counterSchema
    case 'countdown':
      return countdownSchema
    case 'list':
      return listSchema
    case 'tag':
      return tagSchema
    default:
      return []
  }
})

// 处理背景类型切换
const handleBackgroundTypeChange = (type: string) => {
  emit('update-page', { backgroundType: type as 'color' | 'gradient' | 'image' | 'video' })
}

// 更新背景颜色
const updateBackgroundColor = (color: string) => {
  emit('update-page', { backgroundColor: color })
}
</script>

<style scoped>
.section { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 11px; color: #60a5fa; text-transform: uppercase; font-weight: bold; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.input { width: 100%; background: #171717; border: 1px solid #262626; border-radius: 4px; padding: 6px 8px; font-size: 12px; color: white; outline: none; }
.input:focus { border-color: #2563eb; }
.colorInput { width: 100%; height: 28px; background: transparent; cursor: pointer; border: 1px solid #262626; border-radius: 4px; }
.btnGroup { display: flex; background: #171717; padding: 2px; border-radius: 4px; border: 1px solid #262626; }
.btnGroupItem { flex: 1; font-size: 11px; padding: 4px; border-radius: 2px; background: transparent; color: #737373; border: none; cursor: pointer; }
.btnGroupItem.active { background: #404040; color: white; }
.deleteBtn { width: 100%; background: rgba(220, 38, 38, 0.1); color: #dc2626; padding: 8px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer; margin-top: 8px; }
.deleteBtn:hover { background: rgba(220, 38, 38, 0.2); }
.deleteBtn:disabled { opacity: 0.5; cursor: not-allowed; }
.lockedTipFloat { position: fixed; top: 60px; right: 20px; z-index: 1000; display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(251, 191, 36, 0.95); border-radius: 6px; color: #1a1a1a; font-size: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.closeTip { background: none; border: none; color: #1a1a1a; font-size: 16px; cursor: pointer; padding: 0 4px; opacity: 0.7; }
.closeTip:hover { opacity: 1; }
</style>
