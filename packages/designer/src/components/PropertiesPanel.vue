<template>
  <div class="rightPanel">
    <div class="rightPanelTabs">
      <button
        class="rightTabBtn"
        :class="{ active: rightTab === 'props' }"
        @click="$emit('update:rightTab', 'props')"
      >属性</button>
      <button
        class="rightTabBtn"
        :class="{ active: rightTab === 'animation' }"
        @click="$emit('update:rightTab', 'animation')"
      >动画</button>
      <button
        class="rightTabBtn"
        :class="{ active: rightTab === 'data' }"
        @click="$emit('update:rightTab', 'data')"
      >数据</button>
      <button
        class="rightTabBtn"
        :class="{ active: rightTab === 'layer' }"
        @click="$emit('update:rightTab', 'layer')"
      >图层</button>
    </div>

    <!-- 图层面板 -->
    <div v-show="rightTab === 'layer'" class="layerPanelWrapper">
      <slot name="layer-panel" />
    </div>

    <!-- 动画设置面板 -->
    <div v-show="rightTab === 'animation'" class="animationPanel">
      <slot name="animation-panel" />
    </div>

    <!-- 属性面板 -->
    <SimpleScrollView v-show="rightTab === 'props'" class="propertiesContent">
      <slot name="properties-content" />
    </SimpleScrollView>

    <!-- 数据面板 -->
    <SimpleScrollView v-show="rightTab === 'data'" class="propertiesContent">
      <slot name="data-panel" />
    </SimpleScrollView>
  </div>
</template>

<script setup lang="ts">
import SimpleScrollView from './SimpleScrollView.vue'

interface Props {
  rightTab: 'props' | 'animation' | 'data' | 'layer'
}

defineProps<Props>()

defineEmits<{
  'update:rightTab': [tab: 'props' | 'animation' | 'data' | 'layer']
}>()
</script>

<style scoped>
.rightPanel {
  width: clamp(320px, 20vw, 450px);
  flex-shrink: 0;
  border-left: 1px solid #262626;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rightPanelTabs { display: flex; border-bottom: 1px solid #262626; }
.rightTabBtn { flex: 1; background: transparent; border: none; color: #737373; font-size: 12px; padding: 10px 0; cursor: pointer; border-bottom: 2px solid transparent; }
.rightTabBtn:hover { color: #a3a3a3; }
.rightTabBtn.active { color: white; border-bottom-color: #3b82f6; }
.dataPanel { flex: 1; overflow: hidden; }
.propertiesContent { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 16px; }
.animationPanel { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 12px; overflow-y: auto; }
.layerPanelWrapper { flex: 1; overflow: hidden; }
</style>
