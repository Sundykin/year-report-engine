<template>
  <template v-if="selectedElement">
    <!-- 动画配置表单 -->
    <div v-if="selectedAnim" class="animConfigFixed">
      <h4 class="sectionTitle">⚙️ 动画配置</h4>
      <div class="inputGroup">
        <label class="inputLabel">动画类型</label>
        <select v-model="selectedAnim.type" class="select" @change="$emit('sync')" :disabled="disabled">
          <optgroup v-for="group in animationGroups" :key="group.title" :label="group.title">
            <option v-for="item in group.items" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </optgroup>
        </select>
      </div>
      <div class="grid2">
        <div class="inputGroup">
          <label class="inputLabel">时长(秒)</label>
          <input v-model.number="selectedAnim.duration" type="number" step="0.1" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
        </div>
        <div class="inputGroup">
          <label class="inputLabel">延迟(秒)</label>
          <input v-model.number="selectedAnim.delay" type="number" step="0.1" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
        </div>
      </div>
      <div class="inputGroup">
        <label class="inputLabel">触发时机</label>
        <select v-model="selectedAnim.trigger" class="select" @change="$emit('sync')" :disabled="disabled">
          <option v-for="t in animationTriggers" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
      <div class="inputGroup">
        <label class="inputLabel">缓动函数</label>
        <select v-model="selectedAnim.easing" class="select" @change="$emit('sync')" :disabled="disabled">
          <option v-for="e in easingFunctions" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </div>

      <!-- 关键帧动画 -->
      <div v-if="selectedAnim.type === 'custom'" class="keyframesSection">
        <div class="sectionHeader">
          <h4 class="sectionTitle">🎯 关键帧</h4>
          <button @click="$emit('add-keyframe')" class="addBtn" :disabled="disabled">+ 添加</button>
        </div>
        <div v-for="(kf, idx) in selectedAnim.keyframes" :key="idx" class="keyframeItem" :class="{ activeKeyframe: selectedKeyframeIdx === idx }" @click="$emit('preview-keyframe', idx)">
          <div class="keyframeHeader">
            <span>关键帧 {{ idx + 1 }} ({{ kf.percent }}%)</span>
            <button @click.stop="$emit('remove-keyframe', idx)" class="deleteKeyframeBtn" :disabled="disabled">×</button>
          </div>
          <div class="grid2">
            <div class="inputGroup">
              <label class="inputLabel">进度 %</label>
              <input v-model.number="kf.percent" type="number" min="0" max="100" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
            </div>
            <div class="inputGroup">
              <label class="inputLabel">缓动</label>
              <select v-model="kf.easing" class="select" @change="$emit('sync')" :disabled="disabled">
                <option v-for="e in easingFunctions" :key="e.value" :value="e.value">{{ e.label }}</option>
              </select>
            </div>
          </div>
          <div class="grid2">
            <div class="inputGroup">
              <label class="inputLabel">X</label>
              <input v-model.number="kf.x" type="number" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
            </div>
            <div class="inputGroup">
              <label class="inputLabel">Y</label>
              <input v-model.number="kf.y" type="number" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
            </div>
            <div class="inputGroup">
              <label class="inputLabel">透明度</label>
              <input v-model.number="kf.opacity" type="number" min="0" max="1" step="0.1" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
            </div>
            <div class="inputGroup">
              <label class="inputLabel">旋转(度)</label>
              <input v-model.number="kf.rotate" type="number" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
            </div>
            <div class="inputGroup">
              <label class="inputLabel">缩放</label>
              <input v-model.number="kf.scale" type="number" step="0.1" class="inputSmall" @change="$emit('sync')" :disabled="disabled" />
            </div>
          </div>
        </div>
      </div>

      <button @click="$emit('remove-animation')" class="deleteBtn" :disabled="disabled">删除此动画</button>
    </div>
    <div v-else class="emptyTip">在时间轴中选择动画</div>
  </template>
  <div v-else class="emptyTip">选择元素后配置动画</div>
</template>

<script setup lang="ts">
import type { H5Element, AnimationConfig } from '@year-report/core'

interface Props {
  selectedElement?: H5Element
  selectedAnim: AnimationConfig | null
  selectedKeyframeIdx: number
  animationGroups: any[]
  animationTriggers: any[]
  easingFunctions: any[]
  disabled?: boolean
}

defineProps<Props>()

defineEmits<{
  sync: []
  'add-keyframe': []
  'remove-keyframe': [idx: number]
  'preview-keyframe': [idx: number]
  'remove-animation': []
}>()
</script>

<style scoped>
.animConfigFixed { display: flex; flex-direction: column; gap: 8px; }

.keyframesSection { margin-top: 12px; padding-top: 12px; border-top: 1px solid #262626; }
.sectionHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.keyframeItem { background: #171717; border: 1px solid #262626; border-radius: 4px; padding: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
.keyframeItem:hover { border-color: #404040; background: #1e1e1e; }
.keyframeItem.activeKeyframe { border-color: #3b82f6; background: #1e3a8a22; }
.keyframeHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11px; color: #a3a3a3; }
.deleteKeyframeBtn { background: transparent; border: none; color: #666; cursor: pointer; font-size: 16px; }
.deleteKeyframeBtn:hover { color: #ef4444; }
.addBtn { background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; }

.sectionTitle { font-size: 11px; color: #60a5fa; text-transform: uppercase; font-weight: bold; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.inputSmall, .select { width: 100%; background: #171717; border: 1px solid #262626; border-radius: 4px; padding: 4px 6px; font-size: 11px; color: white; outline: none; }
.inputSmall:focus, .select:focus { border-color: #2563eb; }
.inputSmall:disabled, .select:disabled { opacity: 0.5; cursor: not-allowed; }
.grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.deleteBtn { width: 100%; background: rgba(220, 38, 38, 0.1); color: #dc2626; padding: 8px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer; margin-top: 8px; }
.deleteBtn:hover { background: rgba(220, 38, 38, 0.2); }
.deleteBtn:disabled, .addBtn:disabled { opacity: 0.5; cursor: not-allowed; }
.emptyTip { color: #737373; text-align: center; padding: 40px 20px; }
</style>
