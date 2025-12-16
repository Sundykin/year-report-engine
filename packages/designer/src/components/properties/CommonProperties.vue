<template>
  <div class="section">
    <h4 class="sectionTitle">📐 位置尺寸</h4>
    <div class="grid2">
      <div class="inputGroup">
        <label class="inputLabel">X</label>
        <input v-model.number="element.x" type="number" class="inputSmall" :disabled="element.locked" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">Y</label>
        <input v-model.number="element.y" type="number" class="inputSmall" :disabled="element.locked" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">宽</label>
        <input v-model.number="element.width" type="number" class="inputSmall" :disabled="element.locked" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">高</label>
        <input v-model.number="element.height" type="number" class="inputSmall" :disabled="element.locked" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">旋转</label>
        <input v-model.number="element.rotation" type="number" class="inputSmall" placeholder="0" :disabled="element.locked" />
      </div>
    </div>
  </div>

  <div class="section">
    <h4 class="sectionTitle">🔧 元素状态</h4>
    <div class="statusRow">
      <label class="checkboxLabel">
        <input type="checkbox" v-model="element.locked" />
        <span>🔒 锁定</span>
      </label>
    </div>
    <div v-if="element.groupId" class="groupInfo">
      <span class="groupBadge">📦 已分组</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { H5Element } from '@year-report/core'

interface Props {
  element: H5Element
}

defineProps<Props>()
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.inputSmall { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 4px 6px; border-radius: 4px; font-size: 12px; }
.inputSmall:disabled { opacity: 0.5; cursor: not-allowed; }
.statusRow { display: flex; align-items: center; gap: 12px; }
.checkboxLabel { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 12px; color: #a3a3a3; }
.checkboxLabel input[type="checkbox"] { width: 14px; height: 14px; cursor: pointer; }
.groupInfo { margin-top: 8px; }
.groupBadge { display: inline-block; background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
</style>
