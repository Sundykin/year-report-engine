import { type Ref, ref, computed, watch } from 'vue'
import type { H5Element, AnimationConfig } from '@year-report/core'
import { generateId, AnimateCssScheduler } from '@year-report/core'

export function useAnimations(
  selectedElement: Ref<H5Element | undefined>,
  updateElement: (id: string, updates: Partial<H5Element>) => void
) {
  const selectedAnimIdx = ref(0)
  const selectedKeyframeIdx = ref(-1)
  const keyframePreviewState = ref<{ x?: number; y?: number; opacity?: number; rotate?: number; scale?: number } | null>(null)
  const previewingElement = ref<string | null>(null)

  // 元素切换时重置动画选择状态（只在 id 变化时重置，避免拖拽更新属性时清除状态）
  watch(() => selectedElement.value?.id, () => {
    selectedAnimIdx.value = 0
    selectedKeyframeIdx.value = -1
    keyframePreviewState.value = null
  })

  const selectedElementAnimations = computed(() => {
    if (!selectedElement.value) return []
    if (selectedElement.value.animations) return selectedElement.value.animations
    if (selectedElement.value.animation) return [selectedElement.value.animation]
    return []
  })

  const selectedAnim = computed(() => {
    const anims = selectedElementAnimations.value
    if (selectedAnimIdx.value >= 0 && selectedAnimIdx.value < anims.length) {
      return anims[selectedAnimIdx.value]
    }
    return null
  })

  const addAnimation = () => {
    if (!selectedElement.value) return
    const anims = selectedElementAnimations.value
    const newAnim: AnimationConfig = {
      id: generateId(),
      type: 'fadeIn',
      duration: 1,
      delay: 0,
      trigger: 'onEnter',
      order: anims.length
    }
    const newAnims = [...anims, newAnim]
    updateElement(selectedElement.value.id, { animations: newAnims })
    selectedAnimIdx.value = newAnims.length - 1
  }

  const addKeyframe = () => {
    const anim = selectedAnim.value
    if (!anim) return
    if (!anim.keyframes) {
      anim.keyframes = []
    }
    const lastPercent = anim.keyframes.length > 0
      ? anim.keyframes[anim.keyframes.length - 1].percent
      : 0
    anim.keyframes.push({
      percent: Math.min(100, lastPercent + 25),
      x: selectedElement.value?.x,
      y: selectedElement.value?.y,
      opacity: 1,
      rotate: 0,
      scale: 1
    })
    syncAnimations()
  }

  const removeKeyframe = (idx: number) => {
    const anim = selectedAnim.value
    if (!anim?.keyframes) return
    anim.keyframes.splice(idx, 1)
    if (selectedKeyframeIdx.value === idx) {
      selectedKeyframeIdx.value = -1
      keyframePreviewState.value = null
    }
    syncAnimations()
  }

  const previewKeyframe = (idx: number) => {
    const anim = selectedAnim.value
    if (!anim?.keyframes || !selectedElement.value) return

    selectedKeyframeIdx.value = idx
    const kf = anim.keyframes[idx]

    keyframePreviewState.value = {
      x: kf.x,
      y: kf.y,
      opacity: kf.opacity,
      rotate: kf.rotate,
      scale: kf.scale
    }
  }

  // 更新关键帧位置（拖拽时调用，实时同步）
  const updateKeyframePosition = (x: number, y: number) => {
    const anim = selectedAnim.value
    if (!anim?.keyframes || selectedKeyframeIdx.value < 0) return

    const kf = anim.keyframes[selectedKeyframeIdx.value]
    kf.x = x
    kf.y = y

    keyframePreviewState.value = {
      ...keyframePreviewState.value,
      x,
      y
    }
  }

  // 清除关键帧选中状态
  const clearKeyframeSelection = () => {
    selectedKeyframeIdx.value = -1
    keyframePreviewState.value = null
  }

  const removeAnimation = () => {
    if (!selectedElement.value || selectedAnimIdx.value < 0) return
    const anims = selectedElementAnimations.value
    const newAnims = anims.filter((_, i) => i !== selectedAnimIdx.value)
    updateElement(selectedElement.value.id, { animations: newAnims })
    selectedAnimIdx.value = Math.min(selectedAnimIdx.value, newAnims.length - 1)
  }

  const syncAnimations = () => {
    if (!selectedElement.value) return
    const anims = selectedElementAnimations.value
    updateElement(selectedElement.value.id, { animations: [...anims] })

    // 同步更新关键帧预览状态
    const anim = selectedAnim.value
    if (anim?.keyframes && selectedKeyframeIdx.value >= 0) {
      const kf = anim.keyframes[selectedKeyframeIdx.value]
      if (kf) {
        keyframePreviewState.value = {
          x: kf.x,
          y: kf.y,
          opacity: kf.opacity,
          rotate: kf.rotate,
          scale: kf.scale
        }
      }
    }
  }

  const updateAnimations = (anims: AnimationConfig[]) => {
    if (!selectedElement.value) return
    updateElement(selectedElement.value.id, { animations: anims })
  }

  const previewAnimations = (anims: AnimationConfig[]) => {
    if (!selectedElement.value) return
    // 清除关键帧预览状态，让元素回到初始位置
    selectedKeyframeIdx.value = -1
    keyframePreviewState.value = null
    previewingElement.value = selectedElement.value.id
    playElementAnimation(selectedElement.value.id, anims)
  }

  const playElementAnimation = (elementId: string, anims: AnimationConfig[]) => {
    const element = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement
    if (!element || !selectedElement.value) return

    // 使用 AnimateCssScheduler 播放单个元素的动画
    const scheduler = new AnimateCssScheduler()
    scheduler.registerElement(
      elementId,
      element,
      anims,
      { x: selectedElement.value.x, y: selectedElement.value.y }
    )

    scheduler.playEnterAnimations(() => {
      // 动画完成后停顿 1 秒再清理
      setTimeout(() => {
        if (element) {
          // 清理 animate.css 类
          const classes = Array.from(element.classList)
          classes.forEach(cls => {
            if (cls.startsWith('animate__')) {
              element.classList.remove(cls)
            }
          })
          element.style.transform = ''
          element.style.opacity = ''
        }
        scheduler.clear()
        previewingElement.value = null
      }, 1000)
    })
  }

  return {
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
  }
}
