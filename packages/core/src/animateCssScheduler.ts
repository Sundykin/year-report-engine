import { createTimeline } from 'animejs'
import type { AnimationConfig } from './types'

interface ElementAnimationTask {
  elementId: string
  element: HTMLElement
  animations: AnimationConfig[]
  initialPosition: { x: number; y: number }
}

interface AnimState {
  lastStartTime: number
  lastEndTime: number
}

// animate.css 类名映射
const animateCssMap: Record<string, string> = {
  fadeIn: 'fadeIn',
  fadeInUp: 'fadeInUp',
  fadeInDown: 'fadeInDown',
  fadeInLeft: 'fadeInLeft',
  fadeInRight: 'fadeInRight',
  fadeOut: 'fadeOut',
  fadeOutUp: 'fadeOutUp',
  fadeOutDown: 'fadeOutDown',
  slideInUp: 'slideInUp',
  slideInDown: 'slideInDown',
  slideInLeft: 'slideInLeft',
  slideInRight: 'slideInRight',
  slideOutUp: 'slideOutUp',
  slideOutDown: 'slideOutDown',
  slideOutLeft: 'slideOutLeft',
  slideOutRight: 'slideOutRight',
  zoomIn: 'zoomIn',
  zoomInUp: 'zoomInUp',
  zoomInDown: 'zoomInDown',
  zoomOut: 'zoomOut',
  bounceIn: 'bounceIn',
  bounceInUp: 'bounceInUp',
  bounceInDown: 'bounceInDown',
  bounceOut: 'bounceOut',
  rotateIn: 'rotateIn',
  rotateOut: 'rotateOut',
  flipInX: 'flipInX',
  flipInY: 'flipInY',
  flipOutX: 'flipOutX',
  flipOutY: 'flipOutY',
  bounce: 'bounce',
  flash: 'flash',
  pulse: 'pulse',
  rubberBand: 'rubberBand',
  shake: 'shakeX',
  swing: 'swing',
  tada: 'tada',
  wobble: 'wobble',
  jello: 'jello',
  heartBeat: 'heartBeat'
}

/**
 * 动画编排器 - 使用 animate.css 实现预设动画
 * 关键帧动画仍使用 anime.js
 */
export class AnimateCssScheduler {
  private enterTasks: ElementAnimationTask[] = []
  private exitTasks: ElementAnimationTask[] = []
  private clickTasks: Map<string, ElementAnimationTask> = new Map()
  private activeAnimations: Set<HTMLElement> = new Set()
  private keyframeTimeline: any = null

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

    // 收集所有动画任务并计算时间
    const allAnimTasks: {
      task: ElementAnimationTask
      anim: AnimationConfig
      startTime: number
      duration: number
    }[] = []

    this.enterTasks.forEach(task => {
      const sortedAnims = [...task.animations]
        .filter(a => a.type !== 'none')
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      if (sortedAnims.length === 0) return

      const state: AnimState = { lastStartTime: 0, lastEndTime: 0 }

      sortedAnims.forEach((anim, index) => {
        const duration = anim.duration * 1000
        let startTime: number

        if (index === 0) {
          startTime = (anim.delay || 0) * 1000
        } else {
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

        state.lastStartTime = startTime
        state.lastEndTime = startTime + duration

        allAnimTasks.push({ task, anim, startTime, duration })
      })
    })

    if (allAnimTasks.length === 0) {
      onComplete?.()
      return
    }

    // 计算总时长
    const totalDuration = Math.max(...allAnimTasks.map(t => t.startTime + t.duration))
    let completedCount = 0
    const totalCount = allAnimTasks.length

    const checkComplete = () => {
      completedCount++
      if (completedCount >= totalCount) {
        onComplete?.()
      }
    }

    // 按时间调度动画
    allAnimTasks.forEach(({ task, anim, startTime, duration }) => {
      setTimeout(() => {
        if (anim.type === 'custom' && anim.keyframes && anim.keyframes.length > 0) {
          this.playKeyframeAnimation(task.element, anim, task.initialPosition, checkComplete)
        } else {
          this.playAnimateCss(task.element, anim, duration, checkComplete)
        }
      }, startTime)
    })
  }

  playExitAnimations(onComplete?: () => void) {
    if (this.exitTasks.length === 0) {
      onComplete?.()
      return
    }

    const allAnimTasks: {
      task: ElementAnimationTask
      anim: AnimationConfig
      startTime: number
      duration: number
    }[] = []

    this.exitTasks.forEach(task => {
      const sortedAnims = [...task.animations]
        .filter(a => a.type !== 'none')
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      if (sortedAnims.length === 0) return

      const state: AnimState = { lastStartTime: 0, lastEndTime: 0 }

      sortedAnims.forEach((anim, index) => {
        const duration = anim.duration * 1000
        let startTime: number

        if (index === 0) {
          startTime = (anim.delay || 0) * 1000
        } else {
          switch (anim.trigger) {
            case 'withPrevious':
              startTime = state.lastStartTime
              break
            case 'afterPrevious':
            default:
              startTime = state.lastEndTime
              break
          }
        }

        state.lastStartTime = startTime
        state.lastEndTime = startTime + duration

        allAnimTasks.push({ task, anim, startTime, duration })
      })
    })

    if (allAnimTasks.length === 0) {
      onComplete?.()
      return
    }

    let completedCount = 0
    const totalCount = allAnimTasks.length

    const checkComplete = () => {
      completedCount++
      if (completedCount >= totalCount) {
        onComplete?.()
      }
    }

    allAnimTasks.forEach(({ task, anim, startTime, duration }) => {
      setTimeout(() => {
        if (anim.type === 'custom' && anim.keyframes && anim.keyframes.length > 0) {
          this.playKeyframeAnimation(task.element, anim, task.initialPosition, checkComplete)
        } else {
          this.playAnimateCss(task.element, anim, duration, checkComplete)
        }
      }, startTime)
    })
  }

  playClickAnimation(elementId: string) {
    const task = this.clickTasks.get(elementId)
    if (!task) return

    task.animations.forEach(anim => {
      if (anim.type === 'custom' && anim.keyframes && anim.keyframes.length > 0) {
        this.playKeyframeAnimation(task.element, anim, task.initialPosition)
      } else {
        this.playAnimateCss(task.element, anim, anim.duration * 1000)
      }
    })
  }

  private playAnimateCss(
    element: HTMLElement,
    anim: AnimationConfig,
    duration: number,
    onComplete?: () => void
  ) {
    const cssClass = animateCssMap[anim.type]
    if (!cssClass) {
      onComplete?.()
      return
    }

    // 清理之前的动画类
    this.cleanAnimateClasses(element)

    // 设置动画时长和缓动
    element.style.setProperty('--animate-duration', `${duration}ms`)

    // 添加动画类
    element.classList.add('animate__animated', `animate__${cssClass}`)
    this.activeAnimations.add(element)

    const handleEnd = () => {
      element.removeEventListener('animationend', handleEnd)
      this.activeAnimations.delete(element)
      onComplete?.()
    }

    element.addEventListener('animationend', handleEnd)
  }

  private playKeyframeAnimation(
    element: HTMLElement,
    anim: AnimationConfig,
    initialPosition: { x: number; y: number },
    onComplete?: () => void
  ) {
    if (!anim.keyframes || anim.keyframes.length === 0) {
      onComplete?.()
      return
    }

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

    this.keyframeTimeline = createTimeline({
      autoplay: false,
      onComplete
    })

    this.keyframeTimeline.add(element, {
      keyframes: keyframesWithDuration,
      ease: this.convertEasing(anim.easing || 'ease')
    })

    this.keyframeTimeline.play()
  }

  private cleanAnimateClasses(element: HTMLElement) {
    const classes = Array.from(element.classList)
    classes.forEach(cls => {
      if (cls.startsWith('animate__')) {
        element.classList.remove(cls)
      }
    })
  }

  stop() {
    this.activeAnimations.forEach(el => {
      this.cleanAnimateClasses(el)
    })
    this.activeAnimations.clear()

    if (this.keyframeTimeline) {
      this.keyframeTimeline.pause()
      this.keyframeTimeline = null
    }
  }

  unregisterElement(elementId: string) {
    this.enterTasks = this.enterTasks.filter(t => t.elementId !== elementId)
    this.exitTasks = this.exitTasks.filter(t => t.elementId !== elementId)
    this.clickTasks.delete(elementId)
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
