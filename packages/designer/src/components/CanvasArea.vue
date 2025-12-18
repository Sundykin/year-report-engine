<template>
  <div class="canvasWorkspace">
    <!-- 页面列表（左侧） -->
    <div class="pagesPanel">
      <div class="pagesPanelHeader">
        <span>📄 页面</span>
        <button @click="$emit('add-page')" class="iconBtn" title="添加页面">➕</button>
      </div>
      <SimpleScrollView class="pagesList">
        <div
          v-for="(page, idx) in pages"
          :key="page.id"
          @click="$emit('update:activePageId', page.id)"
          class="pageItem"
          :class="{ active: activePageId === page.id }"
        >
          <div class="pageThumb" :style="{ backgroundColor: page.backgroundColor }">
            <span class="pageNumber">{{ idx + 1 }}</span>
          </div>
          <button
            v-if="pages.length > 1"
            @click.stop="$emit('delete-page', page.id)"
            class="deletePageBtn"
          >🗑️</button>
        </div>
      </SimpleScrollView>
    </div>

    <!-- 画布主区域 -->
    <div class="canvasMain">
      <SimpleScrollView class="canvasScroll" @mousedown="$emit('background-click', $event)">
        <div class="canvasWithRulers">
          <!-- 标尺角 -->
          <div class="rulerCorner" />
          <!-- 水平标尺 -->
          <div class="rulerH">
            <div v-for="n in Math.ceil((canvasWidth + extendWidth) / 50)" :key="'h'+n" class="rulerMark" :style="{ left: `${20 + (n-1)*50*zoom}px` }">
              <span>{{ (n-1)*50 - extendWidth/2 }}</span>
            </div>
          </div>
          <!-- 垂直标尺 -->
          <div class="rulerV">
            <div v-for="n in Math.ceil((canvasHeight + extendHeight) / 50)" :key="'v'+n" class="rulerMark" :style="{ top: `${20 + (n-1)*50*zoom}px` }">
              <span>{{ (n-1)*50 - extendHeight/2 }}</span>
            </div>
          </div>
          <!-- 画布容器 -->
          <div class="canvasContainer" :style="{ transform: `scale(${zoom})`, transformOrigin: 'top left', marginLeft: '20px', marginTop: '20px' }">
            <!-- 扩展区域（非可视化） -->
            <div class="extendArea" :style="extendAreaStyle">
              <!-- 可视化区域背景 -->
              <div class="visibleArea" :style="visibleAreaStyle">
                <!-- 背景视频 -->
                <video
                  v-if="activePage.backgroundType === 'video' && activePage.backgroundVideo"
                  :src="activePage.backgroundVideo"
                  class="bgVideo"
                  autoplay loop muted playsinline
                />
              </div>

              <!-- 辅助线 -->
              <div
                v-for="(guide, idx) in guides"
                :key="'guide-' + idx"
                class="guideLine"
                :class="guide.type === 'h' ? 'horizontal' : 'vertical'"
                :style="guide.type === 'h'
                  ? { top: `${guide.pos + extendHeight / 2}px`, left: 0, right: 0 }
                  : { left: `${guide.pos + extendWidth / 2}px`, top: 0, bottom: 0 }"
              />

              <!-- 非分组元素 -->
              <ElementWrapper
                v-for="el in ungroupedElements"
                :key="el.id"
                :element="el"
                :is-selected="selectedElementIds.includes(el.id)"
                :show-border="showElementBorder"
                :is-in-group="false"
                :canvas-width="canvasWidth"
                :canvas-height="canvasHeight"
                :extend-width="extendWidth"
                :extend-height="extendHeight"
                :offset-x="extendWidth / 2"
                :offset-y="extendHeight / 2"
                :keyframe-preview="selectedElementIds.includes(el.id) ? keyframePreview : null"
                :data-element-id="el.id"
                :class="getElementAnimClass(el)"
                @select="(id, multiSelect) => $emit('select-element', id, multiSelect)"
                @update="$emit('update-element', el.id, $event)"
                @dragend="$emit('dragend')"
                @contextmenu="$emit('context-menu', $event, el.id)"
              >
                <ElementRenderer :element="el" mode="design" />
              </ElementWrapper>

              <!-- 分组边界（可交互） -->
              <GroupWrapper
                v-for="group in groupBounds"
                :key="'group-' + group.groupId"
                :bounds="group"
                :is-selected="props.selectedGroupId === group.groupId"
                :group-rotation="props.groupRotations?.get(group.groupId) || 0"
                :offset-x="extendWidth / 2"
                :offset-y="extendHeight / 2"
                @select="$emit('select-group', $event)"
                @move="(dx, dy) => $emit('group-move', group.groupId, dx, dy)"
                @resize="(sx, sy, ax, ay) => $emit('group-resize', group.groupId, sx, sy, ax, ay)"
                @rotate="(angle) => $emit('group-rotate', group.groupId, angle)"
                @dragend="$emit('dragend')"
                @contextmenu="$emit('context-menu-group', $event, group.groupId)"
              />
            </div>
          </div>
        </div>
      </SimpleScrollView>

      <!-- 时间轴面板（右侧，仅在动画tab激活时显示） -->
      <div v-if="rightTab === 'animation' && !timelineCollapsed" class="canvasTimelinePanel">
        <div class="timelinePanelHeader">
          <span>✨ 时间轴</span>
          <button @click="$emit('update:timelineCollapsed', true)" class="collapseBtn">▶</button>
        </div>
        <SimpleScrollView class="timelinePanelContent">
          <AnimationTimeline
            v-if="selectedElement"
            :animations="selectedElementAnimations"
            :selected-element="selectedElement"
            :previewing-element="previewingElement"
            :disabled="selectedElement.locked"
            @add="$emit('add-animation')"
            @update="$emit('update-animations', $event)"
            @preview="$emit('preview-animations', $event)"
            @select="$emit('select-animation', $event)"
          />
          <div v-else class="emptyTip">选择元素后配置动画</div>
        </SimpleScrollView>
      </div>
      <button v-if="rightTab === 'animation' && timelineCollapsed" @click="$emit('update:timelineCollapsed', false)" class="expandTimelineBtn">
        ◀ 时间轴
      </button>

      <!-- 数据源列表面板（右侧，仅在数据tab激活时显示） -->
      <div v-if="rightTab === 'data' && !dataSourceCollapsed" class="canvasTimelinePanel">
        <div class="timelinePanelHeader">
          <span>📊 数据源</span>
          <button @click="$emit('update:dataSourceCollapsed', true)" class="collapseBtn">▶</button>
        </div>
        <DataSourceTimeline
          :data-sources="dataSources"
          :selected-id="selectedDataSourceId"
          @select="$emit('select-data-source', $event)"
          @add="$emit('add-data-source')"
          @delete="$emit('delete-data-source', $event)"
          @duplicate="$emit('duplicate-data-source', $event)"
          @test="$emit('test-data-source', $event)"
        />
      </div>
      <button v-if="rightTab === 'data' && dataSourceCollapsed" @click="$emit('update:dataSourceCollapsed', false)" class="expandTimelineBtn">
        ◀ 数据源
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { H5Page, H5Element, AnimationConfig, DataSource } from '@year-report/core'
import { ElementRenderer } from '@year-report/renderer-vue3'
import type { GroupBounds } from '../composables/useGroupOperations'
import ElementWrapper from './ElementWrapper.vue'
import GroupWrapper from './GroupWrapper.vue'
import AnimationTimeline from './AnimationTimeline.vue'
import DataSourceTimeline from './DataSourceTimeline.vue'
import SimpleScrollView from './SimpleScrollView.vue'

interface Props {
  pages: H5Page[]
  activePageId: string
  selectedElementIds: string[]
  zoom: number
  rightTab: 'props' | 'animation' | 'data' | 'layer'
  timelineCollapsed: boolean
  dataSourceCollapsed: boolean
  selectedElement?: H5Element
  selectedElementAnimations: AnimationConfig[]
  keyframePreview: { x?: number; y?: number; opacity?: number; rotate?: number; scale?: number } | null
  guides: { type: 'h' | 'v'; pos: number }[]
  previewingElement: string | null
  canvasWidth: number
  canvasHeight: number
  extendWidth: number
  extendHeight: number
  showElementBorder?: boolean
  groupBounds?: GroupBounds[]
  selectedGroupId?: string | null
  groupRotations?: Map<string, number>
  dataSources: DataSource[]
  selectedDataSourceId?: string | null
}

const props = defineProps<Props>()

defineEmits<{
  'update:activePageId': [id: string]
  'select-element': [id: string | null, multiSelect: boolean]
  'select-group': [groupId: string]
  'update:timelineCollapsed': [collapsed: boolean]
  'update:dataSourceCollapsed': [collapsed: boolean]
  'add-page': []
  'delete-page': [id: string]
  'update-element': [id: string, updates: Partial<H5Element> & { _resizeDir?: string; _rotation?: number; _anchorX?: number; _anchorY?: number }]
  'background-click': [e: MouseEvent]
  'context-menu': [e: MouseEvent, id: string]
  'context-menu-group': [e: MouseEvent, groupId: string]
  'dragend': []
  'group-move': [groupId: string, deltaX: number, deltaY: number]
  'group-resize': [groupId: string, scaleX: number, scaleY: number, anchorX: number, anchorY: number]
  'group-rotate': [groupId: string, angle: number]
  'add-animation': []
  'update-animations': [anims: AnimationConfig[]]
  'preview-animations': [anims: AnimationConfig[]]
  'select-animation': [idx: number]
  'select-data-source': [id: string]
  'add-data-source': []
  'delete-data-source': [id: string]
  'duplicate-data-source': [id: string]
  'test-data-source': [id: string]
}>()

const activePage = computed(() => props.pages.find(p => p.id === props.activePageId)!)

// 非分组元素（组内元素由 GroupWrapper 渲染）
const ungroupedElements = computed(() => activePage.value.elements.filter(el => !el.groupId))

const extendAreaStyle = computed(() => ({
  width: `${props.canvasWidth + props.extendWidth}px`,
  height: `${props.canvasHeight + props.extendHeight}px`,
  position: 'relative' as const
}))

const visibleAreaStyle = computed(() => {
  const style: any = {
    position: 'absolute' as const,
    left: `${props.extendWidth / 2}px`,
    top: `${props.extendHeight / 2}px`,
    width: `${props.canvasWidth}px`,
    height: `${props.canvasHeight}px`
  }

  if (activePage.value.backgroundType === 'color') {
    style.backgroundColor = activePage.value.backgroundColor || '#ffffff'
  } else if (activePage.value.backgroundType === 'gradient' && activePage.value.backgroundGradient) {
    const { type, direction, colors } = activePage.value.backgroundGradient
    const colorStops = colors.map(c => `${c.color} ${c.position || ''}`).join(', ')
    if (type === 'linear') {
      style.background = `linear-gradient(${direction || 'to bottom'}, ${colorStops})`
    } else {
      style.background = `radial-gradient(circle, ${colorStops})`
    }
  } else if (activePage.value.backgroundType === 'image' && activePage.value.backgroundImage) {
    style.backgroundImage = `url(${activePage.value.backgroundImage})`
    style.backgroundColor = activePage.value.backgroundColor || '#ffffff'
    style.backgroundSize = 'cover'
  } else {
    style.backgroundColor = activePage.value.backgroundColor || '#ffffff'
  }

  return style
})

const getElementAnimClass = (el: H5Element) => {
  if (props.previewingElement !== el.id) return ''
  const anim = el.animations?.[0] || el.animation
  if (!anim || anim.type === 'none') return ''
  return `animate__animated animate__${anim.type}`
}
</script>

<style scoped>
.canvasWorkspace { flex: 1; display: flex; min-height: 0; }

.pagesPanel {
  width: clamp(80px, 6vw, 120px);
  flex-shrink: 0;
  border-right: 1px solid #262626;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
}
.pagesPanelHeader { height: 40px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px; border-bottom: 1px solid #262626; font-size: 11px; }
.iconBtn { background: transparent; border: none; color: #737373; cursor: pointer; font-size: 12px; padding: 2px; }
.iconBtn:hover { color: white; }
.pagesList { flex: 1; padding: 8px; }
.pageItem { position: relative; width: 48px; height: 64px; margin: 0 auto 8px; border-radius: 4px; cursor: pointer; border: 2px solid transparent; }
.pageItem:hover { border-color: #404040; }
.pageItem.active { border-color: #2563eb; }
.pageThumb { width: 100%; height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
.pageNumber { font-size: 16px; color: rgba(255,255,255,0.5); }
.deletePageBtn { position: absolute; top: -6px; right: -6px; background: #dc2626; border: none; color: white; cursor: pointer; font-size: 10px; width: 16px; height: 16px; border-radius: 50%; opacity: 0; display: flex; align-items: center; justify-content: center; }
.pageItem:hover .deletePageBtn { opacity: 1; }

.canvasMain { flex: 1; display: flex; min-width: 0; position: relative; gap: 0; }
.canvasScroll { flex: 1; min-width: 0; background: #0f0f0f; position: relative; overflow: hidden; }
.canvasWithRulers { position: relative; }
.canvasContainer { display: inline-block; }
.extendArea { background: repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #171717 10px, #171717 20px); box-shadow: 0 0 60px rgba(0,0,0,0.5); position: relative; }
.visibleArea { overflow: hidden; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.bgVideo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }

.canvasTimelinePanel {
  width: clamp(400px, 30%, 600px);
  flex-shrink: 0;
  border-left: 1px solid #262626;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
}
.canvasTimelinePanel .timelinePanelHeader { height: 32px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1px solid #262626; font-size: 11px; color: #a3a3a3; }
.canvasTimelinePanel .timelinePanelContent { flex: 1; }
.collapseBtn { background: transparent; border: none; color: #737373; cursor: pointer; font-size: 12px; padding: 2px 4px; }
.collapseBtn:hover { color: white; }
.expandTimelineBtn { position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: #0a0a0a; border: 1px solid #262626; border-right: none; color: #737373; padding: 8px 4px; cursor: pointer; font-size: 10px; writing-mode: vertical-rl; }
.expandTimelineBtn:hover { color: white; background: #171717; }

.emptyTip { color: #737373; text-align: center; padding: 40px 20px; }

.guideLine { position: absolute; pointer-events: none; z-index: 9998; }
.guideLine.horizontal { height: 1px; background: #f43f5e; box-shadow: 0 0 4px #f43f5e; }
.guideLine.vertical { width: 1px; background: #f43f5e; box-shadow: 0 0 4px #f43f5e; }

.rulerCorner { position: absolute; top: 0; left: 0; width: 20px; height: 20px; background: #1a1a1a; z-index: 102; }
.rulerH { position: absolute; top: 0; left: 0; right: 0; height: 20px; background: #1a1a1a; border-bottom: 1px solid #333; z-index: 101; }
.rulerV { position: absolute; top: 0; left: 0; bottom: 0; width: 20px; background: #1a1a1a; border-right: 1px solid #333; z-index: 101; }
.rulerMark { position: absolute; font-size: 8px; color: #666; }
.rulerH .rulerMark { height: 100%; display: flex; align-items: center; }
.rulerH .rulerMark span { transform: translateX(-50%); }
.rulerH .rulerMark::before { content: ''; position: absolute; bottom: 0; left: 0; width: 1px; height: 6px; background: #444; }
.rulerV .rulerMark { width: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 2px; }
.rulerV .rulerMark span { transform: rotate(-90deg); white-space: nowrap; }
.rulerV .rulerMark::before { content: ''; position: absolute; right: 0; top: 0; width: 6px; height: 1px; background: #444; }

</style>
