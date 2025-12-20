<template>
  <div class="templateSelector">
    <div class="header">
      <span class="title">🎬 动画模板</span>
      <button class="closeBtn" @click="$emit('close')">×</button>
    </div>

    <!-- 分类标签 -->
    <div class="categories">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="categoryBtn"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- 模板列表 -->
    <div class="templateList">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="templateCard"
        @click="selectTemplate(template)"
      >
        <div class="templatePreview">
          <div class="previewBox" :class="getPreviewClass(template)">
            <div class="previewElement"></div>
          </div>
        </div>
        <div class="templateInfo">
          <div class="templateName">{{ template.name }}</div>
          <div class="templateDesc">{{ template.description }}</div>
          <div class="templateMeta">
            <span class="animCount">{{ template.animations.length }} 个动画</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div v-if="selectedTemplate" class="previewSection">
      <div class="previewHeader">
        <span>{{ selectedTemplate.name }}</span>
        <button class="previewBtn" @click="previewTemplate">▶ 预览</button>
      </div>
      <div class="animationDetails">
        <div v-for="(anim, idx) in selectedTemplate.animations" :key="idx" class="animDetail">
          <span class="animOrder">{{ idx + 1 }}</span>
          <span class="animType">{{ getAnimTypeName(anim.type) }}</span>
          <span class="animTiming">{{ anim.duration }}s</span>
          <span class="animTrigger">{{ getTriggerName(anim.trigger) }}</span>
        </div>
      </div>
      <button class="applyBtn" @click="applySelectedTemplate">应用此模板</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ANIMATION_TEMPLATE_CATEGORIES,
  ANIMATION_TEMPLATES,
  applyTemplate,
  type AnimationTemplate
} from '@year-report/core'
import { ANIMATION_GROUPS } from '@year-report/core'

const emit = defineEmits<{
  close: []
  apply: [animations: any[]]
  preview: [animations: any[]]
}>()

const categories = ANIMATION_TEMPLATE_CATEGORIES
const activeCategory = ref('entrance')
const selectedTemplate = ref<AnimationTemplate | null>(null)

const filteredTemplates = computed(() => {
  return ANIMATION_TEMPLATES.filter(t => t.category === activeCategory.value)
})

const selectTemplate = (template: AnimationTemplate) => {
  selectedTemplate.value = template
}

const getPreviewClass = (template: AnimationTemplate) => {
  // 根据模板类型返回预览动画类
  const firstAnim = template.animations[0]
  return `preview-${firstAnim?.type || 'fadeIn'}`
}

const getAnimTypeName = (type?: string) => {
  if (!type) return '未知'
  for (const group of ANIMATION_GROUPS) {
    const item = group.items.find(i => i.value === type)
    if (item) return item.label
  }
  return type
}

const getTriggerName = (trigger?: string) => {
  const names: Record<string, string> = {
    onEnter: '入场时',
    onExit: '退场时',
    afterPrevious: '上一动画后',
    withPrevious: '与上一同时',
    onClick: '点击时',
    onScroll: '滚动时',
    onDelay: '延迟'
  }
  return names[trigger || 'onEnter'] || trigger
}

const previewTemplate = () => {
  if (!selectedTemplate.value) return
  const animations = applyTemplate(selectedTemplate.value)
  emit('preview', animations)
}

const applySelectedTemplate = () => {
  if (!selectedTemplate.value) return
  const animations = applyTemplate(selectedTemplate.value)
  emit('apply', animations)
  emit('close')
}
</script>

<style scoped>
.templateSelector {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
  min-width: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.closeBtn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
}

.closeBtn:hover {
  color: #fff;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.categoryBtn {
  background: #262626;
  border: 1px solid #333;
  color: #a3a3a3;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.categoryBtn:hover {
  background: #333;
  color: #fff;
}

.categoryBtn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.templateList {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
}

.templateCard {
  background: #262626;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.templateCard:hover {
  border-color: #3b82f6;
  background: #2a2a2a;
}

.templatePreview {
  height: 60px;
  background: #1a1a1a;
  border-radius: 4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.previewBox {
  width: 30px;
  height: 30px;
  background: #3b82f6;
  border-radius: 4px;
}

.templateInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.templateName {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.templateDesc {
  font-size: 10px;
  color: #737373;
}

.templateMeta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.animCount {
  font-size: 10px;
  color: #3b82f6;
}

.previewSection {
  background: #262626;
  border-radius: 6px;
  padding: 12px;
}

.previewHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #fff;
  font-size: 13px;
}

.previewBtn {
  background: #333;
  border: none;
  color: #a3a3a3;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

.previewBtn:hover {
  background: #3b82f6;
  color: #fff;
}

.animationDetails {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.animDetail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #a3a3a3;
}

.animOrder {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.animType {
  flex: 1;
  color: #fff;
}

.animTiming {
  color: #10b981;
}

.animTrigger {
  color: #f59e0b;
}

.applyBtn {
  width: 100%;
  background: #3b82f6;
  border: none;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.applyBtn:hover {
  background: #2563eb;
}
</style>
