<template>
  <div class="designerContainer">
    <!-- 左侧：组件库 -->
    <ComponentPanel
      :component-groups="COMPONENT_GROUPS"
      @add-element="addElement"
      @export="handleExport"
    />

    <!-- 中间：画布区域 -->
    <div class="centerPanel">
      <div class="toolbar">
        <div class="projectInfo">
          <span class="folderIcon">📁</span>
          <input v-model="project.title" class="projectTitle" placeholder="项目名称" />
        </div>
        <div class="toolbarActions">
          <button @click="undo" :disabled="!canUndo()" class="toolbarBtn undoBtn" title="撤销 (Ctrl+Z)">⟲</button>
          <button @click="redo" :disabled="!canRedo()" class="toolbarBtn redoBtn" title="重做 (Ctrl+Shift+Z)">⟳</button>
          <span class="toolbarDivider"></span>
          <button
            @click="showElementBorder = !showElementBorder"
            class="toolbarBtn"
            :class="{ active: showElementBorder }"
            title="显示元素边界"
          >⬚</button>
          <span class="zoomInfo">{{ Math.round(zoom * 100) }}%</span>
          <button @click="zoom = Math.max(0.5, zoom - 0.1)" class="zoomBtn">-</button>
          <button @click="zoom = Math.min(2, zoom + 0.1)" class="zoomBtn">+</button>
          <button @click="$emit('preview')" class="previewBtn">▶️ 预览</button>
        </div>
      </div>

      <!-- 对齐工具栏 -->
      <AlignToolbar
        :disabled="selectedElementIds.length === 0 && !selectedGroupId"
        :can-distribute="selectedElementIds.length >= 3 || (!!selectedGroupId && groupElementCount >= 3)"
        @align="handleAlign"
        @distribute="handleDistribute"
      />

      <CanvasArea
        :pages="project.pages"
        :active-page-id="activePageId"
        :selected-element-ids="selectedElementIds"
        :zoom="zoom"
        :right-tab="rightTab"
        :timeline-collapsed="timelineCollapsed"
        :data-source-collapsed="dataSourceCollapsed"
        :selected-element="selectedElement"
        :selected-element-animations="selectedElementAnimations"
        :keyframe-preview="keyframePreviewState"
        :guides="guides"
        :previewing-element="previewingElement"
        :canvas-width="CANVAS_WIDTH"
        :canvas-height="CANVAS_HEIGHT"
        :extend-width="CANVAS_EXTEND_WIDTH"
        :extend-height="CANVAS_EXTEND_HEIGHT"
        :show-element-border="showElementBorder"
        :group-bounds="groupBounds"
        :selected-group-id="selectedGroupId"
        :group-rotations="groupRotations"
        :data-sources="project.dataSources || []"
        :selected-data-source-id="selectedDataSourceId"
        @update:active-page-id="activePageId = $event"
        @select-element="selectElement"
        @select-group="selectGroup"
        @update:timeline-collapsed="timelineCollapsed = $event"
        @update:data-source-collapsed="dataSourceCollapsed = $event"
        @add-page="addPage"
        @delete-page="deletePage"
        @update-element="handleElementUpdate"
        @background-click="handleBackgroundClick"
        @context-menu="handleContextMenu"
        @context-menu-group="handleGroupContextMenu"
        @dragend="handleDragEnd(); handleGroupDragEnd()"
        @group-move="handleGroupMove"
        @group-resize="handleGroupResize"
        @group-rotate="handleGroupRotate"
        @add-animation="addAnimation"
        @update-animations="updateAnimations"
        @preview-animations="previewAnimations"
        @select-animation="selectedAnimIdx = $event"
        @select-data-source="selectedDataSourceId = $event"
        @add-data-source="addDataSource"
        @delete-data-source="deleteDataSource"
        @duplicate-data-source="duplicateDataSource"
        @test-data-source="testDataSource"
      />
    </div>

    <!-- 右侧：属性面板 -->
    <PropertiesPanel
      v-model:right-tab="rightTab"
    >
      <template #animation-panel>
        <AnimationConfigPanel
          :selected-element="selectedElement"
          :selected-anim="selectedAnim"
          :selected-keyframe-idx="selectedKeyframeIdx"
          :animation-groups="ANIMATION_GROUPS"
          :animation-triggers="ANIMATION_TRIGGERS"
          :easing-functions="EASING_FUNCTIONS"
          :disabled="selectedElement?.locked"
          @sync="syncAnimations"
          @add-keyframe="addKeyframe"
          @remove-keyframe="removeKeyframe"
          @preview-keyframe="previewKeyframe"
          @remove-animation="removeAnimation"
        />
      </template>
      <template #properties-content>
        <PropertiesPanelContent
          :project="project"
          :active-page="activePage"
          :selected-element="selectedElement"
          :upload-adapter="uploadAdapter"
          @update-page="updatePage(activePageId, $event)"
          @init-render-function="initRenderFunction"
          @update-text-data-sources="updateTextDataSources"
          @update-chart-data-sources="updateChartDataSources"
          @show-text-render-modal="showTextRenderModal = true"
          @show-chart-transform-modal="showChartTransformModal = true"
          @delete-element="deleteElement"
        />
      </template>
      <template #data-panel>
        <DataSourceConfigPanel
          :source="selectedDataSource"
          :testing="dataSourceTesting"
          :test-result="dataSourceTestResult"
          @update="updateDataSource"
          @test="testSelectedDataSource"
          @delete="deleteSelectedDataSource"
          @show-transform-modal="showTransformModal = true"
        />
      </template>
      <template #layer-panel>
        <LayerPanel
          :elements="activePage.elements"
          :selected-ids="selectedElementIds"
          :selected-group-id="selectedGroupId"
          :group-z-indexes="groupZIndexes"
          @select="selectElement"
          @select-group="selectGroup"
          @toggle-visible="handleToggleVisible"
          @toggle-lock="handleToggleLockById"
          @delete="handleLayerDelete"
          @delete-group="handleDeleteGroup"
          @ungroup="handleLayerUngroup"
          @reorder="handleLayerReorder"
          @rename="handleLayerRename"
        />
      </template>
    </PropertiesPanel>

    <!-- 元素右键菜单 -->
    <div v-if="contextMenu" class="contextMenu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
      <!-- 锁定状态：只显示解锁 -->
      <template v-if="contextElement?.locked">
        <button @click="handleToggleLock" class="menuItem">🔓 解锁</button>
      </template>
      <!-- 多选状态：只显示创建分组和删除 -->
      <template v-else-if="selectedElementIds.length >= 2">
        <button @click="handleCreateGroup" class="menuItem">📦 创建分组</button>
        <div class="menuDivider" />
        <button @click="handleBatchDelete" class="menuItem danger">🗑️ 删除</button>
      </template>
      <!-- 单选状态：显示完整菜单 -->
      <template v-else>
        <button @click="handleCopy" class="menuItem">📋 复制</button>
        <button @click="handleToggleLock" class="menuItem">🔒 锁定</button>
        <div class="menuDivider" />
        <button @click="handleZIndex(1)" class="menuItem">⬆️ 上移一层</button>
        <button @click="handleZIndex(-1)" class="menuItem">⬇️ 下移一层</button>
        <button @click="handleBringToFront" class="menuItem">⏫ 置于顶层</button>
        <button @click="handleSendToBack" class="menuItem">⏬ 置于底层</button>
        <div class="menuDivider" />
        <button @click="handleDelete" class="menuItem danger">🗑️ 删除</button>
      </template>
    </div>
    <div v-if="contextMenu" class="contextMenuOverlay" @mousedown="contextMenu = null" />

    <!-- 分组右键菜单 -->
    <div v-if="groupContextMenu" class="contextMenu" :style="{ left: groupContextMenu.x + 'px', top: groupContextMenu.y + 'px' }">
      <button @click="handleUngroupFromMenu" class="menuItem">📤 取消分组</button>
      <div class="menuDivider" />
      <button @click="handleGroupZIndex(1)" class="menuItem">⬆️ 上移一层</button>
      <button @click="handleGroupZIndex(-1)" class="menuItem">⬇️ 下移一层</button>
      <button @click="handleGroupBringToFront" class="menuItem">⏫ 置于顶层</button>
      <button @click="handleGroupSendToBack" class="menuItem">⏬ 置于底层</button>
      <div class="menuDivider" />
      <button @click="handleDeleteGroupFromMenu" class="menuItem danger">🗑️ 删除分组</button>
    </div>
    <div v-if="groupContextMenu" class="contextMenuOverlay" @mousedown="groupContextMenu = null" />

    <!-- 转换函数编辑器模态框 -->
    <EditorModal v-model="showChartTransformModal" title="编辑转换函数">
      <CodeEditor v-if="selectedElement?.dataBinding" v-model="selectedElement.dataBinding.transform" />
    </EditorModal>

    <!-- 文本渲染函数编辑器模态框 -->
    <EditorModal v-model="showTextRenderModal" title="编辑渲染函数">
      <CodeEditor v-if="selectedElement?.renderFunction !== undefined" v-model="selectedElement.renderFunction" />
    </EditorModal>

    <!-- 数据源转换函数编辑器模态框 -->
    <EditorModal v-model="showTransformModal" title="编辑转换函数">
      <CodeEditor
        v-if="selectedDataSource?.asyncConfig"
        :modelValue="selectedDataSource.asyncConfig.transform || TRANSFORM_TEMPLATE"
        @update:modelValue="updateTransformFunction"
      />
    </EditorModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import type { ProjectData, H5Element, UploadAdapter, DataSource, RequestAdapter } from '@year-report/core'
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_EXTEND_WIDTH, CANVAS_EXTEND_HEIGHT,
  ANIMATION_GROUPS, ANIMATION_TRIGGERS, EASING_FUNCTIONS, generateId
} from '@year-report/core'
import ComponentPanel from './components/ComponentPanel.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import PropertiesPanelContent from './components/PropertiesPanelContent.vue'
import AnimationConfigPanel from './components/AnimationConfigPanel.vue'
import DataSourceConfigPanel from './components/DataSourceConfigPanel.vue'
import CodeEditor from './components/CodeEditor.vue'
import EditorModal from './components/EditorModal.vue'
import { useElementOperations } from './composables/useElementOperations'
import { useDataSourceHandlers } from './composables/useDataSourceHandlers'
import { useAnimations } from './composables/useAnimations'
import { usePageOperations } from './composables/usePageOperations'
import { useContextMenu } from './composables/useContextMenu'
import { useKeyboardEvents } from './composables/useKeyboardEvents'
import { useHistory } from './composables/useHistory'
import { useSnapGuides } from './composables/useSnapGuides'
import { useGroupOperations } from './composables/useGroupOperations'
import { useAlignment, type AlignType, type DistributeType } from './composables/useAlignment'
import { useClipboard } from './composables/useClipboard'
import AlignToolbar from './components/AlignToolbar.vue'
import LayerPanel from './components/LayerPanel.vue'
import JSZip from 'jszip'
import 'animate.css'

const COMPONENT_GROUPS = [
  { title: "基础", items: [
    { type: 'text', icon: '📝', label: "文本" },
    { type: 'richtext', icon: '📄', label: "富文本" },
    { type: 'image', icon: '🖼️', label: "图片" },
    { type: 'shape', icon: '⬜', label: "形状" },
    { type: 'button', icon: '🔘', label: "按钮" },
    { type: 'icon', icon: '⭐', label: "图标" },
    { type: 'divider', icon: '➖', label: "分割线" },
  ]},
  { title: "数据", items: [
    { type: 'progress', icon: '📶', label: "进度条" },
    { type: 'counter', icon: '🔢', label: "计数器" },
    { type: 'countdown', icon: '⏱️', label: "倒计时" },
    { type: 'chart', icon: '📊', label: "图表" },
    { type: 'list', icon: '📋', label: "列表" },
    { type: 'tag', icon: '🏷️', label: "标签" },
  ]},
  { title: "媒体", items: [{ type: 'video', icon: '🎬', label: "视频" }]},
]

interface Props {
  project: ProjectData
  uploadAdapter?: UploadAdapter
  requestAdapter?: RequestAdapter
}

const props = defineProps<Props>()
const { project: _, uploadAdapter, requestAdapter } = toRefs(props)
const emit = defineEmits<{
  'update:project': [project: ProjectData]
  'preview': []
}>()

const project = computed({
  get: () => props.project,
  set: (val) => emit('update:project', val)
})

const activePageId = ref(project.value.pages[0].id)
const selectedElementIds = ref<string[]>([])
const zoom = ref(1)
const rightTab = ref<'props' | 'animation' | 'data' | 'layer'>('props')
const timelineCollapsed = ref(false)
const dataSourceCollapsed = ref(false)
const showChartTransformModal = ref(false)
const showTextRenderModal = ref(false)
const showElementBorder = ref(false)
const selectedGroupId = ref<string | null>(null)

// 分组内元素数量（用于判断是否可分布）
const groupElementCount = computed(() => {
  if (!selectedGroupId.value) return 0
  return activePage.value.elements.filter(e => e.groupId === selectedGroupId.value).length
})

// 数据源相关状态
const selectedDataSourceId = ref<string | null>(null)
const dataSourceTesting = ref(false)
const dataSourceTestResult = ref<{ success: boolean; message: string } | null>(null)
const showTransformModal = ref(false)

// 转换函数模板
const TRANSFORM_TEMPLATE = `// data 是原始响应数据
// 返回处理后的数据
return data.result`

const activePage = computed(() => project.value.pages.find(p => p.id === activePageId.value)!)

// 从项目数据加载分组旋转角度
const groupRotations = computed(() => {
  const map = new Map<string, number>()
  const rotations = activePage.value.groupRotations
  if (rotations) {
    Object.entries(rotations).forEach(([k, v]) => map.set(k, v))
  }
  return map
})

// 分组层级
const groupZIndexes = computed(() => activePage.value.groupZIndexes || {})

// 主选中元素（用于属性面板等）
const selectedElementId = ref<string | null>(null)
const selectedElement = computed(() => activePage.value.elements.find(e => e.id === selectedElementId.value))

// 选择元素（支持多选）
const selectElement = (id: string | null, multiSelect = false) => {
  console.log('[selectElement] id:', id, 'multiSelect:', multiSelect)
  if (!id) {
    selectedGroupId.value = null
    selectedElementIds.value = []
    selectedElementId.value = null
    return
  }
  // 检查元素是否在分组中
  const el = activePage.value.elements.find(e => e.id === id)
  console.log('[selectElement] element:', el?.id, 'groupId:', el?.groupId)
  if (el?.groupId) {
    // 如果元素在分组中，应该选中分组而不是元素
    console.log('[selectElement] element is in group, selecting group instead')
    selectGroup(el.groupId)
    return
  }
  // 清除分组选中（只有在选中非分组元素时才清除）
  selectedGroupId.value = null
  if (multiSelect) {
    const idx = selectedElementIds.value.indexOf(id)
    if (idx >= 0) {
      selectedElementIds.value.splice(idx, 1)
      selectedElementId.value = selectedElementIds.value[0] || null
    } else {
      selectedElementIds.value.push(id)
      selectedElementId.value = id
    }
  } else {
    selectedElementIds.value = [id]
    selectedElementId.value = id
  }
}

// 选择分组
const selectGroup = (groupId: string) => {
  console.log('[selectGroup] groupId:', groupId)
  selectedGroupId.value = groupId
  selectedElementIds.value = []
  selectedElementId.value = null
}

// Composables
const { addElement, updateElement, deleteElement } = useElementOperations(project, activePageId, selectedElementId)
const { updateChartDataSources, updateTextDataSources, initRenderFunction } = useDataSourceHandlers(selectedElement)
const {
  selectedAnimIdx,
  selectedKeyframeIdx,
  keyframePreviewState,
  previewingElement,
  selectedElementAnimations,
  selectedAnim,
  addAnimation,
  addKeyframe,
  removeKeyframe,
  previewKeyframe,
  removeAnimation,
  syncAnimations,
  updateAnimations,
  previewAnimations,
  updateKeyframePosition,
  clearKeyframeSelection
} = useAnimations(selectedElement, updateElement)
const { addPage, deletePage, updatePage } = usePageOperations(project, activePageId)
const {
  contextMenu,
  contextElement,
  handleContextMenu,
  handleCopy,
  handleDelete,
  handleZIndex,
  handleBringToFront,
  handleSendToBack,
  handleToggleLock
} = useContextMenu(project, activePageId, selectedElementId, updateElement)
// 历史记录（撤销/重做）
const { undo, redo, canUndo, canRedo, initSnapshot, saveSnapshotImmediate } = useHistory(project)
initSnapshot()

const { guides, calcGuides, snapPosition, snapSize, snapGroupPosition, calcGroupGuides, snapGroupSize, clearGuides, getSnapPoints } = useSnapGuides(project, activePageId, CANVAS_WIDTH, CANVAS_HEIGHT)
const { groupBounds, getGroupElements, createGroup, ungroup } = useGroupOperations(project, activePageId, selectedElementId, updateElement)
const { alignElements, distributeElements } = useAlignment(project, activePageId, selectedElementIds, CANVAS_WIDTH, CANVAS_HEIGHT, selectedGroupId)
const { copyElements, copyStyle, paste, pasteStyle, cut } = useClipboard(project, activePageId, selectedElementIds, selectedElementId)

useKeyboardEvents(selectedElement, updateElement, deleteElement, {
  undo, redo,
  copy: copyElements,
  paste: () => {
    const ids = paste()
    if (ids.length > 0) {
      selectedElementIds.value = ids
      selectedElementId.value = ids[0]
    }
    return ids
  },
  cut,
  copyStyle,
  pasteStyle
})

const handleAlign = (type: AlignType) => alignElements(type)
const handleDistribute = (type: DistributeType) => distributeElements(type)

// 图层面板操作
const handleToggleVisible = (id: string) => {
  const el = activePage.value.elements.find(e => e.id === id)
  if (el) updateElement(id, { hidden: !el.hidden })
}

const handleToggleLockById = (id: string) => {
  const el = activePage.value.elements.find(e => e.id === id)
  if (el) updateElement(id, { locked: !el.locked })
}

const handleLayerRename = (id: string, name: string) => {
  updateElement(id, { name })
}

const handleLayerReorder = (fromIdx: number, toIdx: number, items: { id: string; isGroup: boolean }[]) => {
  // 移动项目
  const newItems = [...items]
  const [moved] = newItems.splice(fromIdx, 1)
  newItems.splice(toIdx, 0, moved)

  // 重新分配层级（从高到低）
  const newGroupZIndexes: Record<string, number> = {}
  const elementUpdates: { id: string; zIndex: number }[] = []

  newItems.forEach((item, i) => {
    const zIndex = (newItems.length - i) * 100 // 留出空间给组内元素
    if (item.isGroup) {
      newGroupZIndexes[item.id] = zIndex
      // 更新组内元素的 zIndex
      const groupElements = activePage.value.elements.filter(e => e.groupId === item.id)
      groupElements.forEach((el, j) => {
        elementUpdates.push({ id: el.id, zIndex: zIndex - j - 1 })
      })
    } else {
      elementUpdates.push({ id: item.id, zIndex })
    }
  })

  project.value = {
    ...project.value,
    pages: project.value.pages.map(p =>
      p.id === activePageId.value
        ? {
            ...p,
            groupZIndexes: newGroupZIndexes,
            elements: p.elements.map(e => {
              const u = elementUpdates.find(x => x.id === e.id)
              return u ? { ...e, zIndex: u.zIndex } : e
            })
          }
        : p
    )
  }
}

// 图层面板删除元素
const handleLayerDelete = (id: string) => {
  const el = activePage.value.elements.find(e => e.id === id)
  const groupId = el?.groupId

  project.value = {
    ...project.value,
    pages: project.value.pages.map(p => {
      if (p.id !== activePageId.value) return p
      let elements = p.elements.filter(e => e.id !== id)
      // 如果删除后分组只剩1个元素，自动取消分组
      if (groupId) {
        const remaining = elements.filter(e => e.groupId === groupId)
        if (remaining.length <= 1) {
          elements = elements.map(e => e.groupId === groupId ? { ...e, groupId: undefined } : e)
        }
      }
      return { ...p, elements }
    })
  }
  if (selectedElementId.value === id) selectedElementId.value = null
  selectedElementIds.value = selectedElementIds.value.filter(i => i !== id)
  if (groupId && selectedGroupId.value === groupId) selectedGroupId.value = null
}

// 删除分组（删除分组内所有元素）
const handleDeleteGroup = (groupId: string) => {
  project.value = {
    ...project.value,
    pages: project.value.pages.map(p =>
      p.id === activePageId.value
        ? { ...p, elements: p.elements.filter(e => e.groupId !== groupId) }
        : p
    )
  }
  if (selectedGroupId.value === groupId) selectedGroupId.value = null
}

// 图层面板取消分组
const handleLayerUngroup = (groupId: string) => {
  ungroup(groupId)
}

// 数据源操作
const selectedDataSource = computed(() => {
  if (!selectedDataSourceId.value) return null
  return (project.value.dataSources || []).find(s => s.id === selectedDataSourceId.value) || null
})

const updateDataSources = (sources: DataSource[]) => {
  project.value = { ...project.value, dataSources: sources }
}

const addDataSource = () => {
  const newSource: DataSource = {
    id: generateId(),
    name: `数据源${(project.value.dataSources?.length || 0) + 1}`,
    type: 'static',
    staticData: {}
  }
  updateDataSources([...(project.value.dataSources || []), newSource])
  selectedDataSourceId.value = newSource.id
}

const updateDataSource = (source: DataSource) => {
  const sources = project.value.dataSources || []
  const idx = sources.findIndex(s => s.id === source.id)
  if (idx >= 0) {
    const newSources = [...sources]
    newSources[idx] = source
    updateDataSources(newSources)
  }
}

const deleteDataSource = (id: string) => {
  const sources = (project.value.dataSources || []).filter(s => s.id !== id)
  updateDataSources(sources)
  if (selectedDataSourceId.value === id) {
    selectedDataSourceId.value = null
  }
}

const deleteSelectedDataSource = () => {
  if (selectedDataSourceId.value) {
    deleteDataSource(selectedDataSourceId.value)
  }
}

const duplicateDataSource = (id: string) => {
  const source = (project.value.dataSources || []).find(s => s.id === id)
  if (source) {
    const newSource: DataSource = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateId(),
      name: `${source.name} (副本)`
    }
    updateDataSources([...(project.value.dataSources || []), newSource])
    selectedDataSourceId.value = newSource.id
  }
}

const testDataSource = async (id: string) => {
  const source = (project.value.dataSources || []).find(s => s.id === id)
  if (source && source.type === 'async' && source.asyncConfig?.url && requestAdapter?.value) {
    dataSourceTesting.value = true
    dataSourceTestResult.value = null
    try {
      await requestAdapter.value({
        url: source.asyncConfig.url,
        method: source.asyncConfig.method || 'GET',
        headers: source.asyncConfig.headers,
        body: source.asyncConfig.body
      })
      dataSourceTestResult.value = { success: true, message: '连接成功' }
    } catch (error: any) {
      dataSourceTestResult.value = { success: false, message: `连接失败: ${error.message}` }
    } finally {
      dataSourceTesting.value = false
    }
  }
}

const testSelectedDataSource = () => {
  if (selectedDataSourceId.value) {
    testDataSource(selectedDataSourceId.value)
  }
}

const updateTransformFunction = (value: string) => {
  if (selectedDataSource.value?.asyncConfig) {
    updateDataSource({
      ...selectedDataSource.value,
      asyncConfig: {
        ...selectedDataSource.value.asyncConfig,
        transform: value
      }
    })
  }
}

// 取消分组（从分组右键菜单）
const handleUngroupFromMenu = () => {
  if (groupContextMenu.value) {
    ungroup(groupContextMenu.value.groupId)
    groupContextMenu.value = null
    selectedGroupId.value = null
  }
}

// 删除分组（从分组右键菜单）
const handleDeleteGroupFromMenu = () => {
  if (groupContextMenu.value) {
    handleDeleteGroup(groupContextMenu.value.groupId)
    groupContextMenu.value = null
  }
}

// 获取图层列表（分组+独立元素）
const getLayerItems = () => {
  const groups = new Map<string, typeof activePage.value.elements>()
  const standalone: typeof activePage.value.elements = []

  activePage.value.elements.forEach(el => {
    if (el.groupId) {
      if (!groups.has(el.groupId)) groups.set(el.groupId, [])
      groups.get(el.groupId)!.push(el)
    } else {
      standalone.push(el)
    }
  })

  const items: { id: string; isGroup: boolean; zIndex: number }[] = []
  groups.forEach((_, groupId) => {
    items.push({ id: groupId, isGroup: true, zIndex: groupZIndexes.value[groupId] || 0 })
  })
  standalone.forEach(el => {
    items.push({ id: el.id, isGroup: false, zIndex: el.zIndex || 0 })
  })
  return items.sort((a, b) => b.zIndex - a.zIndex)
}

// 分组层级调整
const handleGroupZIndex = (delta: number) => {
  if (!groupContextMenu.value) return
  const groupId = groupContextMenu.value.groupId
  const items = getLayerItems()
  const idx = items.findIndex(i => i.id === groupId)
  if (idx < 0) return

  const targetIdx = delta > 0 ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= items.length) return

  // 交换位置
  const newItems = [...items]
  ;[newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]]

  applyLayerOrder(newItems)
  groupContextMenu.value = null
}

const handleGroupBringToFront = () => {
  if (!groupContextMenu.value) return
  const groupId = groupContextMenu.value.groupId
  const items = getLayerItems()
  const idx = items.findIndex(i => i.id === groupId)
  if (idx <= 0) return

  const [item] = items.splice(idx, 1)
  items.unshift(item)
  applyLayerOrder(items)
  groupContextMenu.value = null
}

const handleGroupSendToBack = () => {
  if (!groupContextMenu.value) return
  const groupId = groupContextMenu.value.groupId
  const items = getLayerItems()
  const idx = items.findIndex(i => i.id === groupId)
  if (idx < 0 || idx === items.length - 1) return

  const [item] = items.splice(idx, 1)
  items.push(item)
  applyLayerOrder(items)
  groupContextMenu.value = null
}

// 应用图层顺序
const applyLayerOrder = (items: { id: string; isGroup: boolean }[]) => {
  const newGroupZIndexes: Record<string, number> = {}
  const elementUpdates: { id: string; zIndex: number }[] = []

  items.forEach((item, i) => {
    const zIndex = (items.length - i) * 100
    if (item.isGroup) {
      newGroupZIndexes[item.id] = zIndex
      const groupElements = activePage.value.elements.filter(e => e.groupId === item.id)
      groupElements.forEach((el, j) => {
        elementUpdates.push({ id: el.id, zIndex: zIndex - j - 1 })
      })
    } else {
      elementUpdates.push({ id: item.id, zIndex })
    }
  })

  project.value = {
    ...project.value,
    pages: project.value.pages.map(p =>
      p.id === activePageId.value
        ? {
            ...p,
            groupZIndexes: newGroupZIndexes,
            elements: p.elements.map(e => {
              const u = elementUpdates.find(x => x.id === e.id)
              return u ? { ...e, zIndex: u.zIndex } : e
            })
          }
        : p
    )
  }
}

// 背景点击
const handleBackgroundClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('canvasScroll') ||
      (e.target as HTMLElement).classList.contains('canvasContainer') ||
      (e.target as HTMLElement).classList.contains('extendArea')) {
    selectElement(null)
    selectedGroupId.value = null
    contextMenu.value = null
  }
}

// 分组右键菜单
const groupContextMenu = ref<{ x: number; y: number; groupId: string } | null>(null)
const handleGroupContextMenu = (e: MouseEvent, groupId: string) => {
  selectGroup(groupId)
  groupContextMenu.value = { x: e.clientX, y: e.clientY, groupId }
}

// 分组移动（记录初始位置，带边界限制和吸附）
const groupMoveStart = ref<{
  groupId: string
  elements: { id: string; x: number; y: number }[]
  initialBounds: { x: number; y: number; width: number; height: number }
} | null>(null)

const handleGroupMove = (groupId: string, deltaX: number, deltaY: number) => {
  const group = groupBounds.value.find(g => g.groupId === groupId)
  if (!group) return

  if (!groupMoveStart.value || groupMoveStart.value.groupId !== groupId) {
    const elements = activePage.value.elements.filter(e => e.groupId === groupId)
    groupMoveStart.value = {
      groupId,
      elements: elements.map(e => ({ id: e.id, x: e.x, y: e.y })),
      initialBounds: { x: group.x, y: group.y, width: group.width, height: group.height }
    }
  }

  const { initialBounds, elements } = groupMoveStart.value

  // 计算新的分组位置
  let newGroupX = initialBounds.x + deltaX
  let newGroupY = initialBounds.y + deltaY

  // 边界限制（考虑旋转）
  const minX = -CANVAS_EXTEND_WIDTH / 2
  const maxX = CANVAS_WIDTH + CANVAS_EXTEND_WIDTH / 2
  const minY = -CANVAS_EXTEND_HEIGHT / 2
  const maxY = CANVAS_HEIGHT + CANVAS_EXTEND_HEIGHT / 2

  const groupRotation = groupRotations.value.get(groupId) || 0
  const rotatedBounds = getRotatedBounds(newGroupX, newGroupY, initialBounds.width, initialBounds.height, groupRotation)

  // 根据旋转后的边界进行限制
  if (rotatedBounds.left < minX) {
    newGroupX += (minX - rotatedBounds.left)
  } else if (rotatedBounds.right > maxX) {
    newGroupX -= (rotatedBounds.right - maxX)
  }
  if (rotatedBounds.top < minY) {
    newGroupY += (minY - rotatedBounds.top)
  } else if (rotatedBounds.bottom > maxY) {
    newGroupY -= (rotatedBounds.bottom - maxY)
  }

  // 吸附（传入旋转角度）
  const elementIds = elements.map(e => e.id)
  const snapped = snapGroupPosition(initialBounds, elementIds, newGroupX, newGroupY, groupRotation)
  calcGroupGuides(initialBounds, elementIds, snapped.x, snapped.y, groupRotation)

  // 计算实际偏移
  const actualDeltaX = snapped.x - initialBounds.x
  const actualDeltaY = snapped.y - initialBounds.y

  // 更新所有元素位置
  const updates = elements.map(({ id, x, y }) => ({
    id,
    x: x + actualDeltaX,
    y: y + actualDeltaY
  }))

  const idSet = new Set(updates.map(u => u.id))
  const updateMap = new Map(updates.map(u => [u.id, u]))
  project.value = {
    ...project.value,
    pages: project.value.pages.map(p =>
      p.id === activePageId.value
        ? {
            ...p,
            elements: p.elements.map(e =>
              idSet.has(e.id) ? { ...e, x: updateMap.get(e.id)!.x, y: updateMap.get(e.id)!.y } : e
            )
          }
        : p
    )
  }
}

// 分组缩放（记录初始状态，带吸附和边界限制）
const groupResizeStart = ref<{
  groupId: string
  elements: { id: string; x: number; y: number; width: number; height: number }[]
  initialBounds: { x: number; y: number; width: number; height: number }
} | null>(null)

const handleGroupResize = (groupId: string, scaleX: number, scaleY: number, anchorX: number, anchorY: number) => {
  const group = groupBounds.value.find(g => g.groupId === groupId)
  if (!group) return

  const groupRotation = groupRotations.value.get(groupId) || 0

  if (!groupResizeStart.value || groupResizeStart.value.groupId !== groupId) {
    const elements = activePage.value.elements.filter(e => e.groupId === groupId)
    groupResizeStart.value = {
      groupId,
      elements: elements.map(e => ({ id: e.id, x: e.x, y: e.y, width: e.width, height: e.height })),
      initialBounds: { x: group.x, y: group.y, width: group.width, height: group.height }
    }
  }

  const { initialBounds, elements } = groupResizeStart.value
  const elementIds = elements.map(e => e.id)

  // 计算新尺寸
  let newWidth = initialBounds.width * scaleX
  let newHeight = initialBounds.height * scaleY

  // 边界限制
  const minX = -CANVAS_EXTEND_WIDTH / 2
  const maxX = CANVAS_WIDTH + CANVAS_EXTEND_WIDTH / 2
  const minY = -CANVAS_EXTEND_HEIGHT / 2
  const maxY = CANVAS_HEIGHT + CANVAS_EXTEND_HEIGHT / 2

  // 无论旋转与否都调用snap
  const snapped = snapGroupSize(initialBounds, elementIds, newWidth, newHeight, anchorX, anchorY, groupRotation)
  newWidth = snapped.width
  newHeight = snapped.height

  if (groupRotation === 0) {
    // 非旋转状态：简单边界检测
    const finalScaleX = newWidth / initialBounds.width
    const finalScaleY = newHeight / initialBounds.height
    const newBoundsX = anchorX + (initialBounds.x - anchorX) * finalScaleX
    const newBoundsRight = anchorX + (initialBounds.x + initialBounds.width - anchorX) * finalScaleX
    const newBoundsY = anchorY + (initialBounds.y - anchorY) * finalScaleY
    const newBoundsBottom = anchorY + (initialBounds.y + initialBounds.height - anchorY) * finalScaleY

    if (newBoundsX < minX || newBoundsRight > maxX || newBoundsY < minY || newBoundsBottom > maxY) {
      return
    }
  }

  const finalScaleX = newWidth / initialBounds.width
  const finalScaleY = newHeight / initialBounds.height

  const rad = groupRotation * Math.PI / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // 初始分组中心
  const oldCenterX = initialBounds.x + initialBounds.width / 2
  const oldCenterY = initialBounds.y + initialBounds.height / 2

  // 从固定点世界坐标反推固定点本地坐标（相对于分组中心）
  // anchorWorld = oldCenter + rotate(anchorLocal)
  // 所以 anchorLocal = rotate^(-1)(anchorWorld - oldCenter)
  const anchorRelX = anchorX - oldCenterX
  const anchorRelY = anchorY - oldCenterY
  const anchorLocalX = anchorRelX * cos + anchorRelY * sin
  const anchorLocalY = -anchorRelX * sin + anchorRelY * cos

  // 新的固定点本地坐标（尺寸变化后）
  const newAnchorLocalX = anchorLocalX * finalScaleX
  const newAnchorLocalY = anchorLocalY * finalScaleY

  // 新的分组中心（保持固定点世界坐标不变）
  // anchorWorld = newCenter + rotate(newAnchorLocal)
  // 所以 newCenter = anchorWorld - rotate(newAnchorLocal)
  const newCenterX = anchorX - (newAnchorLocalX * cos - newAnchorLocalY * sin)
  const newCenterY = anchorY - (newAnchorLocalX * sin + newAnchorLocalY * cos)

  // 旋转状态下的边界检测：计算四个角的实际坐标
  if (groupRotation !== 0) {
    const halfW = newWidth / 2
    const halfH = newHeight / 2
    // 四个角的本地坐标
    const corners = [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH }
    ]
    // 转换到世界坐标
    for (const c of corners) {
      const worldX = newCenterX + c.x * cos - c.y * sin
      const worldY = newCenterY + c.x * sin + c.y * cos
      if (worldX < minX || worldX > maxX || worldY < minY || worldY > maxY) {
        return // 超出边界
      }
    }
  }

  // 计算所有元素的新位置和尺寸
  const updates = elements.map(({ id, x, y, width, height }) => {
    const cx = x + width / 2
    const cy = y + height / 2

    // 元素相对于旧分组中心的本地坐标
    const localX = cx - oldCenterX
    const localY = cy - oldCenterY

    // 缩放后的本地坐标
    const newLocalX = localX * finalScaleX
    const newLocalY = localY * finalScaleY

    // 新的世界坐标 = 新分组中心 + 新本地坐标
    const newCx = newCenterX + newLocalX
    const newCy = newCenterY + newLocalY

    const elNewWidth = width * finalScaleX
    const elNewHeight = height * finalScaleY
    return {
      id,
      x: newCx - elNewWidth / 2,
      y: newCy - elNewHeight / 2,
      width: elNewWidth,
      height: elNewHeight
    }
  })

  // 批量更新
  const updateMap = new Map(updates.map(u => [u.id, u]))
  project.value = {
    ...project.value,
    pages: project.value.pages.map(p =>
      p.id === activePageId.value
        ? {
            ...p,
            elements: p.elements.map(e => {
              const u = updateMap.get(e.id)
              return u ? { ...e, x: u.x, y: u.y, width: u.width, height: u.height } : e
            })
          }
        : p
    )
  }
}

// 计算旋转后的边界框
const getRotatedBounds = (x: number, y: number, width: number, height: number, rotation: number) => {
  if (rotation === 0) {
    return { left: x, right: x + width, top: y, bottom: y + height }
  }
  const cx = x + width / 2
  const cy = y + height / 2
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const halfW = width / 2
  const halfH = height / 2

  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: -halfW, y: halfH },
    { x: halfW, y: halfH }
  ].map(c => ({
    x: cx + c.x * cos - c.y * sin,
    y: cy + c.x * sin + c.y * cos
  }))

  return {
    left: Math.min(...corners.map(c => c.x)),
    right: Math.max(...corners.map(c => c.x)),
    top: Math.min(...corners.map(c => c.y)),
    bottom: Math.max(...corners.map(c => c.y))
  }
}

// 分组旋转（带边界检测）
const handleGroupRotate = (groupId: string, angle: number) => {
  const group = groupBounds.value.find(g => g.groupId === groupId)
  if (!group) return

  // 边界限制
  const minX = -CANVAS_EXTEND_WIDTH / 2
  const maxX = CANVAS_WIDTH + CANVAS_EXTEND_WIDTH / 2
  const minY = -CANVAS_EXTEND_HEIGHT / 2
  const maxY = CANVAS_HEIGHT + CANVAS_EXTEND_HEIGHT / 2

  // 检查旋转后是否超出边界
  const rotatedBounds = getRotatedBounds(group.x, group.y, group.width, group.height, angle)
  if (rotatedBounds.left < minX || rotatedBounds.right > maxX ||
      rotatedBounds.top < minY || rotatedBounds.bottom > maxY) {
    return // 超出边界，不更新
  }

  project.value = {
    ...project.value,
    pages: project.value.pages.map(p =>
      p.id === activePageId.value
        ? { ...p, groupRotations: { ...p.groupRotations, [groupId]: angle } }
        : p
    )
  }
}

// 分组操作结束，清除初始状态
const handleGroupDragEnd = () => {
  groupMoveStart.value = null
  groupResizeStart.value = null
  clearGuides()
}

// 创建分组
const handleCreateGroup = () => {
  if (selectedElementIds.value.length >= 2) {
    const groupId = `group_${Date.now()}`
    const idSet = new Set(selectedElementIds.value)

    // 获取选中元素的最大 zIndex
    const selectedEls = activePage.value.elements.filter(e => idSet.has(e.id))
    const maxZ = Math.max(...selectedEls.map(e => e.zIndex || 0))

    // 一次性更新：设置 groupId 和 groupZIndexes
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value
          ? {
              ...p,
              elements: p.elements.map(e => idSet.has(e.id) ? { ...e, groupId } : e),
              groupZIndexes: { ...p.groupZIndexes, [groupId]: maxZ }
            }
          : p
      )
    }

    selectedGroupId.value = groupId
    selectedElementIds.value = []
    selectedElementId.value = null
  }
  contextMenu.value = null
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedElementIds.value.length === 0) return
  const idsToDelete = new Set(selectedElementIds.value)
  project.value = {
    ...project.value,
    pages: project.value.pages.map(p =>
      p.id === activePageId.value
        ? { ...p, elements: p.elements.filter(e => !idsToDelete.has(e.id)) }
        : p
    )
  }
  selectedElementIds.value = []
  selectedElementId.value = null
  contextMenu.value = null
}

// 导出
const handleExport = async () => {
  const zip = new JSZip()
  zip.file("project.json", JSON.stringify(project.value, null, 2))
  const content = await zip.generateAsync({ type: "blob" })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(content)
  a.download = "h5_project.zip"
  a.click()
}

// 元素拖拽更新（带吸附）
const handleElementUpdate = (id: string, updates: Partial<H5Element> & { _resizeDir?: string; _rotation?: number; _anchorX?: number; _anchorY?: number }) => {
  const el = activePage.value.elements.find(e => e.id === id)
  if (!el) return

  // 如果在关键帧编辑模式，更新关键帧位置而非元素位置
  if (selectedKeyframeIdx.value >= 0 && (updates.x !== undefined || updates.y !== undefined)) {
    const newX = updates.x ?? keyframePreviewState.value?.x ?? el.x
    const newY = updates.y ?? keyframePreviewState.value?.y ?? el.y
    updateKeyframePosition(newX, newY)
    return
  }

  const isResize = updates.width !== undefined || updates.height !== undefined
  const isMove = updates.x !== undefined || updates.y !== undefined

  if (isResize && updates._resizeDir) {
    // 缩放：只吸附尺寸，不改变固定角位置
    const rotation = updates._rotation ?? el.rotation ?? 0
    const direction = updates._resizeDir
    const anchorX = updates._anchorX
    const anchorY = updates._anchorY
    const originalWidth = updates.width ?? el.width
    const originalHeight = updates.height ?? el.height

    const snapped = snapSize(el, originalWidth, originalHeight, direction, rotation)

    // 如果尺寸被吸附改变了，需要根据固定点重新计算位置
    if (rotation !== 0 && anchorX !== undefined && anchorY !== undefined &&
        (snapped.width !== originalWidth || snapped.height !== originalHeight)) {
      // 根据固定点和新尺寸重新计算位置
      const rad = rotation * Math.PI / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      // 计算新的本地锚点位置
      let newAnchorLocalX = 0, newAnchorLocalY = 0
      if (direction.includes('e')) newAnchorLocalX = -snapped.width / 2
      if (direction.includes('w')) newAnchorLocalX = snapped.width / 2
      if (direction.includes('s')) newAnchorLocalY = -snapped.height / 2
      if (direction.includes('n')) newAnchorLocalY = snapped.height / 2

      // 根据固定点计算新中心
      const newCenterX = anchorX - (newAnchorLocalX * cos - newAnchorLocalY * sin)
      const newCenterY = anchorY - (newAnchorLocalX * sin + newAnchorLocalY * cos)

      updates.x = newCenterX - snapped.width / 2
      updates.y = newCenterY - snapped.height / 2
    } else if (rotation === 0) {
      // 非旋转状态下，如果是向左/上缩放，需要重新计算位置
      if (direction.includes('w')) {
        updates.x = el.x + el.width - snapped.width
      }
      if (direction.includes('n')) {
        updates.y = el.y + el.height - snapped.height
      }
    }

    updates.width = snapped.width
    updates.height = snapped.height
    delete updates._resizeDir
    delete updates._rotation
    delete updates._anchorX
    delete updates._anchorY
  } else if (isMove && !isResize) {
    // 纯移动：吸附位置
    const newX = updates.x ?? el.x
    const newY = updates.y ?? el.y
    const snapped = snapPosition(el, newX, newY)
    calcGuides(el, snapped.x, snapped.y)
    updates.x = snapped.x
    updates.y = snapped.y

    // 如果元素在分组中，同时移动分组内其他元素
    if (el.groupId) {
      const deltaX = snapped.x - el.x
      const deltaY = snapped.y - el.y
      if (deltaX !== 0 || deltaY !== 0) {
        const groupElements = getGroupElements(el.id)
        groupElements.forEach(groupEl => {
          if (groupEl.id !== el.id) {
            updateElement(groupEl.id, {
              x: groupEl.x + deltaX,
              y: groupEl.y + deltaY
            })
          }
        })
      }
    }
  }

  updateElement(id, updates)
}

// 拖拽结束处理
const handleDragEnd = () => {
  clearGuides()
}
</script>

<style scoped>
.designerContainer {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #171717;
  color: white;
  overflow: hidden;
  user-select: none;
}

.designerContainer *,
.designerContainer *::before,
.designerContainer *::after {
  box-sizing: border-box;
}

.designerContainer input,
.designerContainer textarea {
  user-select: text;
}

.centerPanel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.toolbar { height: 48px; border-bottom: 1px solid #262626; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: #0a0a0a; }
.projectInfo { display: flex; align-items: center; gap: 8px; }
.projectTitle { background: transparent; border: none; color: white; font-size: 14px; width: 200px; outline: none; }
.toolbarActions { display: flex; align-items: center; gap: 8px; }
.zoomInfo { font-size: 12px; color: #737373; min-width: 40px; }
.zoomBtn { width: 28px; height: 28px; background: #262626; border: 1px solid #404040; border-radius: 4px; color: white; cursor: pointer; }
.toolbarBtn { width: 28px; height: 28px; background: #262626; border: 1px solid #404040; border-radius: 4px; color: #737373; cursor: pointer; font-size: 14px; }
.toolbarBtn:hover:not(:disabled) { border-color: #525252; color: white; }
.toolbarBtn:disabled { opacity: 0.4; cursor: not-allowed; }
.toolbarBtn.active { background: #2563eb; border-color: #2563eb; color: white; }
.toolbarDivider { width: 1px; height: 20px; background: #404040; margin: 0 4px; }
.previewBtn { background: #2563eb; color: white; padding: 6px 12px; border-radius: 4px; font-size: 13px; border: none; cursor: pointer; }
.previewBtn:hover { background: #1d4ed8; }

.contextMenu { position: fixed; z-index: 10000; background: #262626; border: 1px solid #404040; border-radius: 4px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); padding: 4px; min-width: 120px; }
.menuItem { width: 100%; text-align: left; padding: 6px 10px; font-size: 12px; color: white; background: transparent; border: none; cursor: pointer; border-radius: 2px; }
.menuItem:hover { background: #404040; }
.menuItem.danger { color: #fca5a5; }
.menuDivider { height: 1px; background: #404040; margin: 4px 0; }
.contextMenuOverlay { position: fixed; inset: 0; z-index: 9999; }
</style>
