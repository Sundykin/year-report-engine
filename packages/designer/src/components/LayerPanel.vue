<template>
  <div class="layerPanel">
    <div class="layerHeader">
      <span>图层</span>
      <span class="layerCount">{{ elements.length }}</span>
    </div>
    <div class="layerList">
      <template v-for="(item, idx) in layerTree" :key="item.id">
        <!-- 分组 -->
        <div v-if="item.isGroup" class="layerGroup">
          <div
            class="layerItem groupHeader"
            :class="{ selected: selectedGroupId === item.id, dragOver: dragOverIdx === idx }"
            draggable="true"
            @dragstart="handleDragStart(idx)"
            @dragover.prevent="handleDragOver(idx)"
            @dragleave="dragOverIdx = -1"
            @drop="handleDrop(idx)"
            @dragend="handleDragEnd"
            @click="$emit('select-group', item.id)"
            @contextmenu.prevent="showContextMenu($event, item.id, 'group')"
          >
            <span class="dragHandle">⋮⋮</span>
            <span class="expandBtn" @click.stop="toggleGroup(item.id)">
              {{ expandedGroups.has(item.id) ? '▼' : '▶' }}
            </span>
            <span class="layerIcon">📦</span>
            <span class="layerName">分组 ({{ item.children?.length || 0 }})</span>
          </div>
          <div v-if="expandedGroups.has(item.id)" class="groupChildren">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="layerItem childItem"
              :class="{ selected: selectedIds.includes(child.id), locked: child.locked }"
              @click.stop="$emit('select', child.id, $event.ctrlKey || $event.metaKey)"
              @dblclick.stop="startRename(child.id, child.name || getLabel(child))"
              @contextmenu.prevent="showContextMenu($event, child.id, 'element')"
            >
              <span class="layerIcon">{{ getIcon(child.type) }}</span>
              <input
                v-if="renamingId === child.id"
                v-model="renameValue"
                class="renameInput"
                @blur="finishRename"
                @keydown.enter="finishRename"
                @keydown.esc="cancelRename"
                @click.stop
                ref="renameInputRef"
              />
              <span v-else class="layerName">{{ child.name || getLabel(child) }}</span>
              <div class="layerActions">
                <button class="layerBtn" @click.stop="$emit('toggle-visible', child.id)">
                  {{ child.hidden ? '👁️‍🗨️' : '👁️' }}
                </button>
                <button class="layerBtn" @click.stop="$emit('toggle-lock', child.id)">
                  {{ child.locked ? '🔒' : '🔓' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- 普通元素 -->
        <div
          v-else
          class="layerItem"
          :class="{ selected: selectedIds.includes(item.id), locked: item.locked, dragOver: dragOverIdx === idx }"
          draggable="true"
          @dragstart="handleDragStart(idx)"
          @dragover.prevent="handleDragOver(idx)"
          @dragleave="dragOverIdx = -1"
          @drop="handleDrop(idx)"
          @dragend="handleDragEnd"
          @click="$emit('select', item.id, $event.ctrlKey || $event.metaKey)"
          @dblclick="startRename(item.id, item.name || getLabel(item))"
          @contextmenu.prevent="showContextMenu($event, item.id, 'element')"
        >
          <span class="dragHandle">⋮⋮</span>
          <span class="layerIcon">{{ getIcon(item.type) }}</span>
          <input
            v-if="renamingId === item.id"
            v-model="renameValue"
            class="renameInput"
            @blur="finishRename"
            @keydown.enter="finishRename"
            @keydown.esc="cancelRename"
            @click.stop
            ref="renameInputRef"
          />
          <span v-else class="layerName">{{ item.name || getLabel(item) }}</span>
          <div class="layerActions">
            <button class="layerBtn" @click.stop="$emit('toggle-visible', item.id)">
              {{ item.hidden ? '👁️‍🗨️' : '👁️' }}
            </button>
            <button class="layerBtn" @click.stop="$emit('toggle-lock', item.id)">
              {{ item.locked ? '🔒' : '🔓' }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenu" class="contextMenu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
      <button v-if="contextMenu.type === 'element'" @click="handleRenameFromMenu" class="menuItem">✏️ 重命名</button>
      <button v-if="contextMenu.type === 'group'" @click="handleUngroup" class="menuItem">📤 取消分组</button>
      <button @click="handleDelete" class="menuItem danger">🗑️ 删除</button>
    </div>
    <div v-if="contextMenu" class="contextMenuOverlay" @mousedown="contextMenu = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { H5Element } from '@year-report/core'

interface LayerItem {
  id: string
  isGroup?: boolean
  children?: H5Element[]
  type?: string
  name?: string
  locked?: boolean
  hidden?: boolean
  zIndex?: number
  content?: string
}

const props = defineProps<{
  elements: H5Element[]
  selectedIds: string[]
  selectedGroupId?: string | null
  groupZIndexes?: Record<string, number>
}>()

const emit = defineEmits<{
  select: [id: string, multiSelect: boolean]
  'select-group': [groupId: string]
  'toggle-visible': [id: string]
  'toggle-lock': [id: string]
  delete: [id: string]
  'delete-group': [groupId: string]
  ungroup: [groupId: string]
  reorder: [fromIdx: number, toIdx: number, items: { id: string; isGroup: boolean }[]]
  rename: [id: string, name: string]
}>()

const expandedGroups = ref(new Set<string>())
const contextMenu = ref<{ x: number; y: number; id: string; type: 'element' | 'group' } | null>(null)

// 重命名状态
const renamingId = ref<string | null>(null)
const renameValue = ref('')

const startRename = (id: string, currentName: string) => {
  renamingId.value = id
  renameValue.value = currentName
  nextTick(() => {
    const input = document.querySelector('.renameInput') as HTMLInputElement
    input?.focus()
    input?.select()
  })
}

const finishRename = () => {
  if (renamingId.value && renameValue.value.trim()) {
    emit('rename', renamingId.value, renameValue.value.trim())
  }
  renamingId.value = null
}

const cancelRename = () => {
  renamingId.value = null
}

const handleRenameFromMenu = () => {
  if (!contextMenu.value || contextMenu.value.type !== 'element') return
  const el = props.elements.find(e => e.id === contextMenu.value!.id)
  if (el) {
    startRename(el.id, el.name || getLabel(el))
  }
  contextMenu.value = null
}

// 拖拽排序
const dragIdx = ref(-1)
const dragOverIdx = ref(-1)

const handleDragStart = (idx: number) => { dragIdx.value = idx }
const handleDragOver = (idx: number) => { if (dragIdx.value !== idx) dragOverIdx.value = idx }
const handleDrop = (toIdx: number) => {
  if (dragIdx.value >= 0 && dragIdx.value !== toIdx) {
    const items = layerTree.value.map(item => ({ id: item.id, isGroup: !!item.isGroup }))
    emit('reorder', dragIdx.value, toIdx, items)
  }
  handleDragEnd()
}
const handleDragEnd = () => { dragIdx.value = -1; dragOverIdx.value = -1 }

// 构建图层树（分组 + 独立元素）
const layerTree = computed(() => {
  const groups = new Map<string, H5Element[]>()
  const standalone: H5Element[] = []

  props.elements.forEach(el => {
    if (el.groupId) {
      if (!groups.has(el.groupId)) groups.set(el.groupId, [])
      groups.get(el.groupId)!.push(el)
    } else {
      standalone.push(el)
    }
  })

  const result: LayerItem[] = []

  // 添加分组（使用 groupZIndexes）
  groups.forEach((children, groupId) => {
    const groupZ = props.groupZIndexes?.[groupId] ?? Math.max(...children.map(c => c.zIndex || 0))
    // 组内元素按 zIndex 降序
    children.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
    result.push({ id: groupId, isGroup: true, children, zIndex: groupZ })
  })

  // 添加独立元素
  standalone.forEach(el => {
    result.push({ id: el.id, type: el.type, name: el.name, locked: el.locked, hidden: el.hidden, zIndex: el.zIndex, content: el.content })
  })

  // 按 zIndex 降序排序
  return result.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
})

const toggleGroup = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

const getIcon = (type?: string) => {
  const icons: Record<string, string> = {
    text: '📝', richtext: '📄', image: '🖼️', shape: '⬜',
    video: '🎬', chart: '📊', button: '🔘', icon: '⭐',
    divider: '➖', progress: '📶', counter: '🔢'
  }
  return icons[type || ''] || '📦'
}

const typeNames: Record<string, string> = {
  text: '文本', richtext: '富文本', image: '图片', shape: '形状',
  video: '视频', chart: '图表', button: '按钮', icon: '图标',
  divider: '分割线', progress: '进度条', counter: '计数器',
  countdown: '倒计时', list: '列表', tag: '标签'
}

const getLabel = (el: LayerItem | H5Element) => {
  return typeNames[el.type || ''] || el.type || '元素'
}

const showContextMenu = (e: MouseEvent, id: string, type: 'element' | 'group') => {
  contextMenu.value = { x: e.clientX, y: e.clientY, id, type }
}

const handleDelete = () => {
  if (!contextMenu.value) return
  if (contextMenu.value.type === 'group') {
    emit('delete-group', contextMenu.value.id)
  } else {
    emit('delete', contextMenu.value.id)
  }
  contextMenu.value = null
}

const handleUngroup = () => {
  if (!contextMenu.value) return
  emit('ungroup', contextMenu.value.id)
  contextMenu.value = null
}
</script>

<style scoped>
.layerPanel { display: flex; flex-direction: column; height: 100%; background: #1a1a1a; }
.layerHeader { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; font-size: 12px; color: #888; border-bottom: 1px solid #333; }
.layerCount { background: #333; padding: 2px 6px; border-radius: 10px; font-size: 10px; }
.layerList { flex: 1; min-height: 0; overflow-y: auto; }
.layerList::-webkit-scrollbar { width: 6px; }
.layerList::-webkit-scrollbar-track { background: transparent; }
.layerList::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
.layerList::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

.layerItem { display: flex; align-items: center; gap: 8px; padding: 6px 12px; cursor: pointer; border-bottom: 1px solid #262626; transition: background 0.15s; }
.layerItem:hover { background: #262626; }
.layerItem.selected { background: #2563eb33; border-left: 2px solid #2563eb; }
.layerItem.locked { opacity: 0.6; }
.layerItem.dragOver { background: #2563eb55; border-top: 2px solid #2563eb; }

.dragHandle { color: #555; cursor: grab; font-size: 10px; margin-right: -4px; }
.dragHandle:hover { color: #888; }

.groupHeader { background: #222; }
.groupChildren { border-left: 2px solid #404040; margin-left: 12px; }
.childItem { padding-left: 20px; }

.expandBtn { width: 16px; font-size: 10px; color: #666; cursor: pointer; }
.expandBtn:hover { color: #fff; }

.layerIcon { font-size: 14px; }
.layerName { flex: 1; font-size: 12px; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.renameInput {
  flex: 1;
  background: #333;
  border: 1px solid #2563eb;
  border-radius: 2px;
  color: white;
  font-size: 12px;
  padding: 2px 4px;
  outline: none;
}

.layerActions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
.layerItem:hover .layerActions { opacity: 1; }
.layerBtn { width: 20px; height: 20px; background: transparent; border: none; cursor: pointer; font-size: 12px; opacity: 0.5; }
.layerBtn:hover { opacity: 1; }

.contextMenu { position: fixed; z-index: 10000; background: #262626; border: 1px solid #404040; border-radius: 4px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); padding: 4px; min-width: 120px; }
.menuItem { width: 100%; text-align: left; padding: 6px 10px; font-size: 12px; color: white; background: transparent; border: none; cursor: pointer; border-radius: 2px; }
.menuItem:hover { background: #404040; }
.menuItem.danger { color: #ef4444; }
.contextMenuOverlay { position: fixed; inset: 0; z-index: 9999; }
</style>
