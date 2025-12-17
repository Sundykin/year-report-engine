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
          @input="updateBackgroundColor($event.target.value)"
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
    <!-- 锁定提示 -->
    <div v-if="selectedElement.locked" class="lockedTip">
      🔒 元素已锁定
    </div>

    <CommonProperties :element="selectedElement" />

    <TextProperties
      v-if="selectedElement.type === 'text'"
      :element="selectedElement"
      :data-sources="project.dataSources"
      :disabled="selectedElement.locked"
      @init-render-function="$emit('init-render-function')"
      @update-data-sources="$emit('update-text-data-sources', $event)"
      @show-render-modal="$emit('show-text-render-modal')"
    />

    <RichTextProperties
      v-if="selectedElement.type === 'richtext'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <ImageVideoProperties
      v-if="selectedElement.type === 'image' || selectedElement.type === 'video'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
      :upload-adapter="uploadAdapter"
    />

    <ShapeProperties
      v-if="selectedElement.type === 'shape'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <ChartProperties
      v-if="selectedElement.type === 'chart'"
      :element="selectedElement"
      :data-sources="project.dataSources"
      :disabled="selectedElement.locked"
      @update-data-sources="$emit('update-chart-data-sources', $event)"
      @show-transform-modal="$emit('show-chart-transform-modal')"
    />

    <ProgressProperties
      v-if="selectedElement.type === 'progress'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <CounterProperties
      v-if="selectedElement.type === 'counter'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <CountdownProperties
      v-if="selectedElement.type === 'countdown'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <ListProperties
      v-if="selectedElement.type === 'list'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <TagProperties
      v-if="selectedElement.type === 'tag'"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <StyleEffectsProperties
      v-if="['text', 'richtext', 'image', 'video', 'shape', 'button'].includes(selectedElement.type)"
      :element="selectedElement"
      :disabled="selectedElement.locked"
    />

    <button @click="$emit('delete-element')" class="deleteBtn" :disabled="selectedElement.locked">🗑️ 删除组件</button>
  </template>
</template>

<script setup lang="ts">
import type { ProjectData, H5Page, H5Element, UploadAdapter } from '@year-report/core'
import CommonProperties from './properties/CommonProperties.vue'
import TextProperties from './properties/TextProperties.vue'
import RichTextProperties from './properties/RichTextProperties.vue'
import ImageVideoProperties from './properties/ImageVideoProperties.vue'
import ShapeProperties from './properties/ShapeProperties.vue'
import ChartProperties from './properties/ChartProperties.vue'
import ProgressProperties from './properties/ProgressProperties.vue'
import CounterProperties from './properties/CounterProperties.vue'
import CountdownProperties from './properties/CountdownProperties.vue'
import ListProperties from './properties/ListProperties.vue'
import TagProperties from './properties/TagProperties.vue'
import BackgroundUpload from './properties/BackgroundUpload.vue'
import BackgroundGradient from './properties/BackgroundGradient.vue'
import StyleEffectsProperties from './properties/StyleEffectsProperties.vue'

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

// 处理背景类型切换
const handleBackgroundTypeChange = (type: string) => {
  emit('update-page', { backgroundType: type })
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
.lockedTip { padding: 12px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 4px; color: #fbbf24; font-size: 12px; text-align: center; }
</style>
