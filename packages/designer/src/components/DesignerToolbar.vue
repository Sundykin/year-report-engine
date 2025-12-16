<template>
  <div class="toolbar">
    <div class="toolbarSection">
      <div class="logo">H5</div>
      <span class="title">Forge 设计器</span>
    </div>
    <div class="toolbarCenter">
      <button @click="$emit('zoom', 0.5)" class="iconBtn" title="缩小">🔍-</button>
      <span class="zoomText">{{ Math.round(zoom * 100) }}%</span>
      <button @click="$emit('zoom', 2)" class="iconBtn" title="放大">🔍+</button>
    </div>
    <div class="toolbarRight">
      <button @click="$emit('preview')" class="previewBtn">▶️ 预览</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  zoom: number
}

defineProps<Props>()
defineEmits<{
  zoom: [scale: number]
  preview: []
}>()
</script>

<style scoped>
.toolbar { height: 48px; background: #0a0a0a; border-bottom: 1px solid #262626; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; position: relative; z-index: 100; }
.toolbarSection { display: flex; align-items: center; gap: 12px; }
.logo { width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px; }
.title { font-size: 14px; font-weight: 600; color: white; }
.toolbarCenter { display: flex; align-items: center; gap: 8px; }
.zoomText { color: #a3a3a3; font-size: 12px; min-width: 50px; text-align: center; }
.iconBtn { background: transparent; border: 1px solid #404040; color: #a3a3a3; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.iconBtn:hover { border-color: #737373; color: white; }
.toolbarRight { display: flex; gap: 8px; }
.previewBtn { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
.previewBtn:hover { background: #059669; }
</style>
