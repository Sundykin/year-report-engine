import { createTimeline, animate } from 'animejs'
import type { AnimationConfig } from './types'
import { presetAnimations } from './presetAnimations'

export class AnimationPlayer {
  private timeline: any = null

  // 播放动画序列（使用 Timeline）
  playAnimations(
    animations: AnimationConfig[],
    getElement: (id?: string) => HTMLElement | null,
    onComplete?: () => void
  ) {
    const element = getElement()
    if (!element) {
      onComplete?.()
      return
    }

    const sortedAnims = [...animations]
      .filter(a => a.type !== 'none')
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    if (sortedAnims.length === 0) {
      onComplete?.()
      return
    }

    // 创建时间线（每个实例独立）
    this.timeline = createTimeline({
      autoplay: true,
      onComplete
    })

    // 添加动画到时间线
    sortedAnims.forEach((anim, index) => {
      // 计算位置参数（使用 Anime.js V4 的相对位置语法）
      let position: number | string
      if (index === 0) {
        // 第一个动画：使用绝对位置
        position = (anim.delay || 0) * 1000
      } else if (anim.trigger === 'afterPrevious') {
        // 在上一个动画结束后开始
        position = '<'
      } else if (anim.trigger === 'withPrevious') {
        // 与上一个动画同时开始
        position = '<<'
      } else {
        // 默认：在上一个动画结束后开始
        position = '<'
      }

      const duration = anim.duration * 1000

      console.log(`[AnimationPlayer] Adding animation ${index}: type=${anim.type}, position=${position}, duration=${duration}`)

      if (anim.type === 'custom' && anim.keyframes && anim.keyframes.length > 0) {
        this.addKeyframeAnimation(element, anim, position)
      } else {
        this.addPresetAnimation(element, anim, position)
      }
    })

    console.log('[AnimationPlayer] Timeline created, total animations:', sortedAnims.length)

    // 显式播放时间线
    this.timeline.play()
  }

  // 添加预设动画到 timeline
  private addPresetAnimation(
    element: HTMLElement,
    anim: AnimationConfig,
    position: number | string
  ) {
    const preset = presetAnimations[anim.type]
    if (!preset || Object.keys(preset).length === 0) {
      console.warn(`[AnimationPlayer] Preset not found or empty: ${anim.type}`)
      return
    }

    const animParams = {
      ...preset,
      duration: anim.duration * 1000,
      ease: this.convertEasing(anim.easing || 'ease')
    }

    console.log(`[AnimationPlayer] addPresetAnimation:`, anim.type, animParams, 'at position:', position)

    this.timeline.add(element, animParams, position)
  }

  // 添加关键帧动画到 timeline
  private addKeyframeAnimation(
    element: HTMLElement,
    anim: AnimationConfig,
    position: number | string
  ) {
    if (!anim.keyframes || anim.keyframes.length === 0) return

    const sortedKeyframes = [...anim.keyframes].sort((a, b) => a.percent - b.percent)
    const duration = anim.duration * 1000

    // 获取元素初始位置
    const rect = element.getBoundingClientRect()
    const parent = element.offsetParent as HTMLElement
    const parentRect = parent?.getBoundingClientRect()
    const initialX = rect.left - (parentRect?.left || 0)
    const initialY = rect.top - (parentRect?.top || 0)

    // 构建 keyframes
    const animeKeyframes = sortedKeyframes.map(kf => {
      const frame: any = {}
      if (kf.x !== undefined) frame.x = kf.x - initialX
      if (kf.y !== undefined) frame.y = kf.y - initialY
      if (kf.scale !== undefined) frame.scale = kf.scale
      if (kf.rotate !== undefined) frame.rotate = kf.rotate
      if (kf.opacity !== undefined) frame.opacity = kf.opacity
      return { ...frame, percent: kf.percent }
    })

    // 确保 0% 和 100%
    if (!animeKeyframes.some(kf => kf.percent === 0)) {
      animeKeyframes.unshift({ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, percent: 0 })
    }
    if (!animeKeyframes.some(kf => kf.percent === 100) && animeKeyframes.length > 0) {
      const lastFrame = animeKeyframes[animeKeyframes.length - 1]
      animeKeyframes.push({ ...lastFrame, percent: 100 })
    }

    // 计算每个关键帧的时长
    const keyframesWithDuration = animeKeyframes.map((kf, i) => {
      const nextPercent = i < animeKeyframes.length - 1 ? animeKeyframes[i + 1].percent : 100
      const frameDuration = ((nextPercent - kf.percent) / 100) * duration
      const { percent, ...frameWithoutPercent } = kf
      return { ...frameWithoutPercent, duration: frameDuration }
    })

    this.timeline.add(element, {
      keyframes: keyframesWithDuration,
      ease: this.convertEasing(anim.easing || 'ease')
    }, position)
  }

  stop() {
    if (this.timeline) {
      this.timeline.pause?.()
      this.timeline = null
    }
  }

  private convertEasing(cssEasing: string): string {
    const easingMap: Record<string, string> = {
      'linear': 'linear',
      'ease': 'outQuad',
      'ease-in': 'inQuad',
      'ease-out': 'outQuad',
      'ease-in-out': 'inOutQuad'
    }
    return easingMap[cssEasing] || 'outQuad'
  }
}
