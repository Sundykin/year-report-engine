// 预设动画效果（用 animejs V4 实现）
// 属性名使用 x/y 而不是 translateX/translateY
export const presetAnimations: Record<string, any> = {
  // 无动画
  none: {},

  // 淡入
  fadeIn: { opacity: [0, 1] },
  fadeInUp: { y: [30, 0], opacity: [0, 1] },
  fadeInDown: { y: [-30, 0], opacity: [0, 1] },
  fadeInLeft: { x: [30, 0], opacity: [0, 1] },
  fadeInRight: { x: [-30, 0], opacity: [0, 1] },

  // 淡出
  fadeOut: { opacity: [1, 0] },
  fadeOutUp: { y: [0, -30], opacity: [1, 0] },
  fadeOutDown: { y: [0, 30], opacity: [1, 0] },

  // 滑入
  slideInLeft: { x: [-200, 0], opacity: [0, 1] },
  slideInRight: { x: [200, 0], opacity: [0, 1] },
  slideInUp: { y: [-200, 0], opacity: [0, 1] },
  slideInDown: { y: [200, 0], opacity: [0, 1] },

  // 滑出
  slideOutLeft: { x: [0, -200], opacity: [1, 0] },
  slideOutRight: { x: [0, 200], opacity: [1, 0] },
  slideOutUp: { y: [0, -200], opacity: [1, 0] },
  slideOutDown: { y: [0, 200], opacity: [1, 0] },

  // 缩放
  zoomIn: { scale: [0, 1], opacity: [0, 1] },
  zoomInUp: { scale: [0, 1], y: [30, 0], opacity: [0, 1] },
  zoomInDown: { scale: [0, 1], y: [-30, 0], opacity: [0, 1] },
  zoomOut: { scale: [1, 0], opacity: [1, 0] },

  // 弹跳
  bounceIn: { scale: [0, 1.1, 0.9, 1.05, 0.95, 1], opacity: [0, 1, 1, 1, 1, 1] },
  bounceInUp: { y: [100, -20, 10, -5, 0], opacity: [0, 1, 1, 1, 1] },
  bounceInDown: { y: [-100, 20, -10, 5, 0], opacity: [0, 1, 1, 1, 1] },
  bounceOut: { scale: [1, 0.95, 1.05, 0.9, 1.1, 0], opacity: [1, 1, 1, 1, 1, 0] },

  // 旋转
  rotateIn: { rotate: [-200, 0], opacity: [0, 1] },
  rotateOut: { rotate: [0, 200], opacity: [1, 0] },

  // 翻转
  flipInX: { rotateX: [90, 0], opacity: [0, 1] },
  flipInY: { rotateY: [90, 0], opacity: [0, 1] },
  flipOutX: { rotateX: [0, 90], opacity: [1, 0] },
  flipOutY: { rotateY: [0, 90], opacity: [1, 0] },

  // 强调动画
  bounce: { y: [0, -30, 0, -15, 0] },
  flash: { opacity: [1, 0, 1, 0, 1] },
  pulse: { scale: [1, 1.05, 1] },
  rubberBand: { scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1], scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1] },
  shake: { x: [0, -10, 10, -10, 10, -10, 10, -5, 5, 0] },
  swing: { rotate: [0, 15, -10, 5, -5, 0] },
  tada: { scale: [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1], rotate: [0, -3, -3, 3, -3, 3, -3, 3, -3, 0] },
  wobble: { x: [0, -25, 20, -15, 10, -5, 0], rotate: [0, -5, 3, -3, 2, -1, 0] },
  jello: { skewX: [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0], skewY: [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0] },
  heartBeat: { scale: [1, 1.3, 1, 1.3, 1] }
}
