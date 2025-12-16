// 工具函数

import type { H5Element, AnimationConfig, CSSStyle } from './types'

// 生成唯一ID
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 获取动画CSS样式
export const getAnimationStyles = (animation?: AnimationConfig): CSSStyle => {
  if (!animation || animation.type === 'none') return {}

  const { type, duration, delay } = animation

  return {
    animationName: type,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationFillMode: 'both',
  }
}

// 动画关键帧CSS
export const ANIMATION_KEYFRAMES = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-up {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-in-left {
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes zoom-in {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}
`
