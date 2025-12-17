<template>
  <div class="section">
    <h4 class="sectionTitle">🎨 样式效果</h4>

    <!-- 描边 -->
    <div class="effectGroup">
      <div class="effectHeader" @click="showBorder = !showBorder">
        <span>描边</span>
        <span class="toggle">{{ showBorder ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showBorder" class="effectContent">
        <div class="grid3">
          <div class="inputGroup">
            <label class="inputLabel">宽度</label>
            <input
              :value="borderWidth"
              @input="updateBorder('width', ($event.target as HTMLInputElement).value)"
              type="number"
              min="0"
              class="inputSmall"
              :disabled="disabled"
            />
          </div>
          <div class="inputGroup">
            <label class="inputLabel">样式</label>
            <select
              :value="borderStyle"
              @change="updateBorder('style', ($event.target as HTMLSelectElement).value)"
              class="selectSmall"
              :disabled="disabled"
            >
              <option value="none">无</option>
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
            </select>
          </div>
          <div class="inputGroup">
            <label class="inputLabel">颜色</label>
            <input
              :value="borderColor"
              @input="updateBorder('color', ($event.target as HTMLInputElement).value)"
              type="color"
              class="colorInput"
              :disabled="disabled"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 阴影 -->
    <div class="effectGroup">
      <div class="effectHeader" @click="showShadow = !showShadow">
        <span>{{ isTextElement ? '文字阴影' : '阴影' }}</span>
        <span class="toggle">{{ showShadow ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showShadow" class="effectContent">
        <div class="grid4">
          <div class="inputGroup">
            <label class="inputLabel">X</label>
            <input
              :value="shadowX"
              @input="updateShadow('x', ($event.target as HTMLInputElement).value)"
              type="number"
              class="inputSmall"
              :disabled="disabled"
            />
          </div>
          <div class="inputGroup">
            <label class="inputLabel">Y</label>
            <input
              :value="shadowY"
              @input="updateShadow('y', ($event.target as HTMLInputElement).value)"
              type="number"
              class="inputSmall"
              :disabled="disabled"
            />
          </div>
          <div class="inputGroup">
            <label class="inputLabel">模糊</label>
            <input
              :value="shadowBlur"
              @input="updateShadow('blur', ($event.target as HTMLInputElement).value)"
              type="number"
              min="0"
              class="inputSmall"
              :disabled="disabled"
            />
          </div>
          <div class="inputGroup">
            <label class="inputLabel">颜色</label>
            <input
              :value="shadowColor"
              @input="updateShadow('color', ($event.target as HTMLInputElement).value)"
              type="color"
              class="colorInput"
              :disabled="disabled"
            />
          </div>
        </div>
        <div v-if="!isTextElement" class="inputGroup">
          <label class="inputLabel">扩展</label>
          <input
            :value="shadowSpread"
            @input="updateShadow('spread', ($event.target as HTMLInputElement).value)"
            type="number"
            class="inputSmall"
            style="width: 80px;"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>

    <!-- 滤镜（图片/视频） -->
    <div v-if="isImageElement" class="effectGroup">
      <div class="effectHeader" @click="showFilter = !showFilter">
        <span>滤镜</span>
        <span class="toggle">{{ showFilter ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showFilter" class="effectContent">
        <div class="filterItem">
          <label class="inputLabel">模糊</label>
          <input type="range" min="0" max="20" :value="filterBlur" @input="updateFilter('blur', $event)" :disabled="disabled" />
          <span class="filterValue">{{ filterBlur }}px</span>
        </div>
        <div class="filterItem">
          <label class="inputLabel">亮度</label>
          <input type="range" min="0" max="200" :value="filterBrightness" @input="updateFilter('brightness', $event)" :disabled="disabled" />
          <span class="filterValue">{{ filterBrightness }}%</span>
        </div>
        <div class="filterItem">
          <label class="inputLabel">对比度</label>
          <input type="range" min="0" max="200" :value="filterContrast" @input="updateFilter('contrast', $event)" :disabled="disabled" />
          <span class="filterValue">{{ filterContrast }}%</span>
        </div>
        <div class="filterItem">
          <label class="inputLabel">饱和度</label>
          <input type="range" min="0" max="200" :value="filterSaturate" @input="updateFilter('saturate', $event)" :disabled="disabled" />
          <span class="filterValue">{{ filterSaturate }}%</span>
        </div>
        <div class="filterItem">
          <label class="inputLabel">灰度</label>
          <input type="range" min="0" max="100" :value="filterGrayscale" @input="updateFilter('grayscale', $event)" :disabled="disabled" />
          <span class="filterValue">{{ filterGrayscale }}%</span>
        </div>
        <button @click="resetFilters" class="resetBtn" :disabled="disabled">重置滤镜</button>
      </div>
    </div>

    <!-- 图片翻转 -->
    <div v-if="isImageElement" class="effectGroup">
      <div class="effectHeader" @click="showFlip = !showFlip">
        <span>翻转</span>
        <span class="toggle">{{ showFlip ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showFlip" class="effectContent">
        <div class="flipBtns">
          <button @click="toggleFlip('x')" :class="{ active: flipX }" :disabled="disabled">↔ 水平翻转</button>
          <button @click="toggleFlip('y')" :class="{ active: flipY }" :disabled="disabled">↕ 垂直翻转</button>
        </div>
      </div>
    </div>

    <!-- 文字渐变 -->
    <div v-if="isTextElement" class="effectGroup">
      <div class="effectHeader" @click="showGradient = !showGradient">
        <span>渐变填充</span>
        <span class="toggle">{{ showGradient ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showGradient" class="effectContent">
        <div class="inputGroup">
          <label class="inputLabel">启用渐变</label>
          <input type="checkbox" :checked="hasGradient" @change="toggleGradient" :disabled="disabled" />
        </div>
        <template v-if="hasGradient">
          <div class="grid2">
            <div class="inputGroup">
              <label class="inputLabel">起始色</label>
              <input v-model="gradientStart" type="color" class="colorInput" @change="updateGradient" :disabled="disabled" />
            </div>
            <div class="inputGroup">
              <label class="inputLabel">结束色</label>
              <input v-model="gradientEnd" type="color" class="colorInput" @change="updateGradient" :disabled="disabled" />
            </div>
          </div>
          <div class="inputGroup">
            <label class="inputLabel">方向</label>
            <select v-model="gradientDirection" class="selectSmall" @change="updateGradient" :disabled="disabled">
              <option value="to right">从左到右</option>
              <option value="to left">从右到左</option>
              <option value="to bottom">从上到下</option>
              <option value="to top">从下到上</option>
              <option value="to bottom right">左上到右下</option>
              <option value="to bottom left">右上到左下</option>
            </select>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { H5Element } from '@year-report/core'

const props = defineProps<{
  element: H5Element
  disabled?: boolean
}>()

const showBorder = ref(false)
const showShadow = ref(false)
const showFilter = ref(false)
const showFlip = ref(false)
const showGradient = ref(false)

const isTextElement = computed(() => props.element.type === 'text' || props.element.type === 'richtext')
const isImageElement = computed(() => props.element.type === 'image' || props.element.type === 'video')

// 描边解析
const borderWidth = computed(() => parseInt(props.element.style.borderWidth || '0'))
const borderStyle = computed(() => props.element.style.borderStyle || 'none')
const borderColor = computed(() => props.element.style.borderColor || '#000000')

const updateBorder = (prop: string, value: string) => {
  if (prop === 'width') {
    props.element.style.borderWidth = value + 'px'
  } else if (prop === 'style') {
    props.element.style.borderStyle = value as any
  } else if (prop === 'color') {
    props.element.style.borderColor = value
  }
  // 组合 border
  const w = props.element.style.borderWidth || '0px'
  const s = props.element.style.borderStyle || 'solid'
  const c = props.element.style.borderColor || '#000'
  if (s !== 'none' && parseInt(w) > 0) {
    props.element.style.border = `${w} ${s} ${c}`
  } else {
    props.element.style.border = undefined
  }
}

// 阴影解析
const parseShadow = () => {
  const shadow = isTextElement.value ? props.element.style.textShadow : props.element.style.boxShadow
  if (!shadow) return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000' }
  const match = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s*(\d+px)?\s*(#[0-9a-fA-F]{6}|rgba?\([^)]+\))?/)
  if (match) {
    return {
      x: parseInt(match[1]) || 0,
      y: parseInt(match[2]) || 0,
      blur: parseInt(match[3]) || 0,
      spread: parseInt(match[4]) || 0,
      color: match[5] || '#000000'
    }
  }
  return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000' }
}

const shadowX = computed(() => parseShadow().x)
const shadowY = computed(() => parseShadow().y)
const shadowBlur = computed(() => parseShadow().blur)
const shadowSpread = computed(() => parseShadow().spread)
const shadowColor = computed(() => parseShadow().color)

const updateShadow = (prop: string, value: string) => {
  const s = parseShadow()
  if (prop === 'x') s.x = parseInt(value) || 0
  if (prop === 'y') s.y = parseInt(value) || 0
  if (prop === 'blur') s.blur = parseInt(value) || 0
  if (prop === 'spread') s.spread = parseInt(value) || 0
  if (prop === 'color') s.color = value

  if (isTextElement.value) {
    props.element.style.textShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.color}`
  } else {
    props.element.style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
  }
}

// 滤镜解析
const parseFilter = () => {
  const filter = props.element.style.filter || ''
  const blur = filter.match(/blur\((\d+)px\)/)?.[1] || '0'
  const brightness = filter.match(/brightness\((\d+)%\)/)?.[1] || '100'
  const contrast = filter.match(/contrast\((\d+)%\)/)?.[1] || '100'
  const saturate = filter.match(/saturate\((\d+)%\)/)?.[1] || '100'
  const grayscale = filter.match(/grayscale\((\d+)%\)/)?.[1] || '0'
  return { blur: parseInt(blur), brightness: parseInt(brightness), contrast: parseInt(contrast), saturate: parseInt(saturate), grayscale: parseInt(grayscale) }
}

const filterBlur = computed(() => parseFilter().blur)
const filterBrightness = computed(() => parseFilter().brightness)
const filterContrast = computed(() => parseFilter().contrast)
const filterSaturate = computed(() => parseFilter().saturate)
const filterGrayscale = computed(() => parseFilter().grayscale)

const updateFilter = (type: string, e: Event) => {
  const value = (e.target as HTMLInputElement).value
  const f = parseFilter()
  if (type === 'blur') f.blur = parseInt(value)
  if (type === 'brightness') f.brightness = parseInt(value)
  if (type === 'contrast') f.contrast = parseInt(value)
  if (type === 'saturate') f.saturate = parseInt(value)
  if (type === 'grayscale') f.grayscale = parseInt(value)

  const parts: string[] = []
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`)
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`)
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`)
  if (f.saturate !== 100) parts.push(`saturate(${f.saturate}%)`)
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale}%)`)

  props.element.style.filter = parts.length > 0 ? parts.join(' ') : undefined
}

const resetFilters = () => {
  props.element.style.filter = undefined
}

// 翻转
const flipX = computed(() => props.element.style.scaleX === -1)
const flipY = computed(() => props.element.style.scaleY === -1)

const toggleFlip = (axis: 'x' | 'y') => {
  if (axis === 'x') {
    props.element.style.scaleX = flipX.value ? undefined : -1
  } else {
    props.element.style.scaleY = flipY.value ? undefined : -1
  }
}

// 文字渐变
const gradientStart = ref('#ff0000')
const gradientEnd = ref('#0000ff')
const gradientDirection = ref('to right')

const hasGradient = computed(() => !!props.element.style.backgroundImage?.includes('linear-gradient'))

const toggleGradient = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    updateGradient()
  } else {
    props.element.style.backgroundImage = undefined
    props.element.style.backgroundClip = undefined
    props.element.style.WebkitBackgroundClip = undefined
    props.element.style.WebkitTextFillColor = undefined
  }
}

const updateGradient = () => {
  props.element.style.backgroundImage = `linear-gradient(${gradientDirection.value}, ${gradientStart.value}, ${gradientEnd.value})`
  props.element.style.backgroundClip = 'text'
  props.element.style.WebkitBackgroundClip = 'text'
  props.element.style.WebkitTextFillColor = 'transparent'
}
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.effectGroup { margin-bottom: 8px; background: #1a1a1a; border-radius: 4px; overflow: hidden; }
.effectHeader { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; cursor: pointer; font-size: 12px; color: #ccc; }
.effectHeader:hover { background: #222; }
.toggle { font-size: 10px; color: #666; }
.effectContent { padding: 10px; border-top: 1px solid #333; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.grid4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.inputSmall { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 4px 6px; border-radius: 4px; font-size: 12px; }
.selectSmall { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 4px 6px; border-radius: 4px; font-size: 12px; }
.colorInput { width: 100%; height: 28px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer; }
.filterItem { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.filterItem .inputLabel { width: 50px; margin: 0; }
.filterItem input[type="range"] { flex: 1; }
.filterValue { width: 50px; font-size: 11px; color: #888; text-align: right; }
.resetBtn { width: 100%; padding: 6px; background: #333; border: 1px solid #444; color: #aaa; border-radius: 4px; cursor: pointer; font-size: 11px; }
.resetBtn:hover:not(:disabled) { background: #444; color: white; }
.flipBtns { display: flex; gap: 8px; }
.flipBtns button { flex: 1; padding: 8px; background: #2a2a2a; border: 1px solid #444; color: #aaa; border-radius: 4px; cursor: pointer; font-size: 11px; }
.flipBtns button:hover:not(:disabled) { background: #333; }
.flipBtns button.active { background: #3b82f6; border-color: #3b82f6; color: white; }
.flipBtns button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
