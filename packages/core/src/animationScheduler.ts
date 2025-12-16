import { createTimeline } from 'animejs'
import type { AnimationConfig } from './types'
import { presetAnimations } from './presetAnimations'

// 元素动画任务
interface ElementAnimationTask {
  elementId: string
  element: HTMLElement
  animations: AnimationConfig[]
  initialPosition: { x: number; y: number }
}

// 元素动画状态（用于计算位置）
interface ElementAnimState {
  lastStartTime: number
  lastEndTime: number
}

/**
 * 动画编排器 - 管理页面所有元素的动画
 * 所有动画直接添加到主时间线，通过绝对位置实现同时播放
 */
export class AnimationScheduler {
  private mainTimeline: any = null
  private enterTasks: ElementAnimationTask[] = []
  private exitTasks: ElementAnimationTask[] = []
  private clickTasks: Map<string, ElementAnimationTask> = new Map()

  registerElement(
    elementId: string,
    element: HTMLElement,
    animations: AnimationConfig[],
    initialPosition: { x: number; y: number }
  ) {
    if (!animations || animations.length === 0) return

    const enterAnims = animations.filter(a =>
      a.trigger === 'onEnter' || a.trigger === 'afterPrevious' ||
      a.trigger === 'withPrevious' || a.trigger === 'onDelay' || !a.trigger
    )
    const exitAnims = animations.filter(a => a.trigger === 'onExit')
    const clickAnims = animations.filter(a => a.trigger === 'onClick')

    if (enterAnims.length > 0) {
      this.enterTasks.push({ elementId, element, animations: enterAnims, initialPosition })
    }
    if (exitAnims.length > 0) {
      this.exitTasks.push({ elementId, element, animations: exitAnims, initialPosition })
    }
    if (clickAnims.length > 0) {
      this.clickTasks.set(elementId, { elementId, element, animations: clickAnims, initialPosition })
    }
  }

  playEnterAnimations(onComplete?: () => void) {
    if (this.enterTasks.length === 0) {
      onComplete?.()
      return
    }

    this.mainTimeline = createTimeline({
      autoplay: false,
      onComplete
    })

    // 所有元素的动画直接添加到主时间线
    this.enterTasks.forEach(task => {
      this.addElementAnimationsToTimeline(this.mainTimeline, task)
    })

    this.mainTimeline.play()
  }

  playExitAnimations(onComplete?: () => void) {
    if (this.exitTasks.length === 0) {
      onComplete?.()
      return
    }

    const exitTimeline = createTimeline({
      autoplay: false,
      onComplete
    })

    this.exitTasks.forEach(task => {
      this.addElementAnimationsToTimeline(exitTimeline, task)
    })

    exitTimeline.play()
  }

  playClickAnimation(elementId: string) {
    const task = this.clickTasks.get(elementId)
    if (!task) return

    const timeline = createTimeline({ autoplay: false })
    this.addElementAnimationsToTimeline(timeline, task)
    timeline.play()
  }

  // 将元素的所有动画添加到时间线（使用绝对位置）
  private addElementAnimationsToTimeline(timeline: any, task: ElementAnimationTask) {
    const { element, animations, initialPosition } = task
    const sortedAnims = [...animations]
      .filter(a => a.type !== 'none')
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    if (sortedAnims.length === 0) return

    // 跟踪该元素的动画时间状态
    const state: ElementAnimState = { lastStartTime: 0, lastEndTime: 0 }

    sortedAnims.forEach((anim, index) => {
      const duration = anim.duration * 1000
      let startTime: number

      if (index === 0) {
        // 第一个动画：从 delay 开始
        startTime = (anim.delay || 0) * 1000
      } else {
        // 后续动画：根据触发时机计算绝对位置
        switch (anim.trigger) {
          case 'withPrevious':
            startTime = state.lastStartTime
            break
          case 'onDelay':
            startTime = state.lastStartTime + (anim.delay || 0) * 1000
            break
          case 'afterPrevious':
          default:
            startTime = state.lastEndTime
            break
        }
      }

      // 更新状态
      state.lastStartTime = startTime
      state.lastEndTime = startTime + duration

      // 添加动画到时间线
      if (anim.type === 'custom' && anim.keyframes && anim.keyframes.length > 0) {
        this.addKeyframeAnimation(timeline, element, anim, initialPosition, startTime)
      } else {
        this.addPresetAnimation(timeline, element, anim, startTime)
      }
    })
  }

  private addPresetAnimation(
    timeline: any,
    element: HTMLElement,
    anim: AnimationConfig,
    position: number
  ) {
    const preset = presetAnimations[anim.type]
    if (!preset || Object.keys(preset).length === 0) return

    timeline.add(element, {
      ...preset,
      duration: anim.duration * 1000,
      ease: this.convertEasing(anim.easing || 'ease')
    }, position)
  }

  private addKeyframeAnimation(
    timeline: any,
    element: HTMLElement,
    anim: AnimationConfig,
    initialPosition: { x: number; y: number },
    position: number
  ) {
    if (!anim.keyframes || anim.keyframes.length === 0) return

    const sortedKeyframes = [...anim.keyframes].sort((a, b) => a.percent - b.percent)
    const duration = anim.duration * 1000

    const animeKeyframes = sortedKeyframes.map(kf => {
      const frame: any = {}
      if (kf.x !== undefined) frame.x = kf.x - initialPosition.x
      if (kf.y !== undefined) frame.y = kf.y - initialPosition.y
      if (kf.scale !== undefined) frame.scale = kf.scale
      if (kf.rotate !== undefined) frame.rotate = kf.rotate
      if (kf.opacity !== undefined) frame.opacity = kf.opacity
      return { ...frame, percent: kf.percent }
    })

    if (!animeKeyframes.some(kf => kf.percent === 0)) {
      animeKeyframes.unshift({ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, percent: 0 })
    }
    if (!animeKeyframes.some(kf => kf.percent === 100) && animeKeyframes.length > 0) {
      const lastFrame = animeKeyframes[animeKeyframes.length - 1]
      animeKeyframes.push({ ...lastFrame, percent: 100 })
    }

    const keyframesWithDuration = animeKeyframes.map((kf, i) => {
      const nextPercent = i < animeKeyframes.length - 1 ? animeKeyframes[i + 1].percent : 100
      const frameDuration = ((nextPercent - kf.percent) / 100) * duration
      const { percent, ...frameWithoutPercent } = kf
      return { ...frameWithoutPercent, duration: frameDuration }
    })

    timeline.add(element, {
      keyframes: keyframesWithDuration,
      ease: this.convertEasing(anim.easing || 'ease')
    }, position)
  }

  stop() {
    if (this.mainTimeline) {
      this.mainTimeline.pause()
      this.mainTimeline = null
    }
  }

  clear() {
    this.stop()
    this.enterTasks = []
    this.exitTasks = []
    this.clickTasks.clear()
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
