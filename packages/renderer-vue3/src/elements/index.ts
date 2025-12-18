import type { Component } from 'vue'
import TextElement from './TextElement.vue'
import RichtextElement from './RichTextElement.vue'
import ImageElement from './ImageElement.vue'
import IconElement from './IconElement.vue'
import ButtonElement from './ButtonElement.vue'
import ShapeElement from './ShapeElement.vue'
import VideoElement from './VideoElement.vue'
import ChartElement from './ChartElement.vue'
import ProgressElement from './ProgressElement.vue'
import CounterElement from './CounterElement.vue'
import CountdownElement from './CountdownElement.vue'
import ListElement from './ListElement.vue'
import TagElement from './TagElement.vue'
import DividerElement from './DividerElement.vue'
import ElementRenderer from './ElementRenderer.vue'

export * from './types'

// 内置组件映射
const builtinElements: Record<string, Component> = {
  text: TextElement,
  richtext: RichtextElement,
  image: ImageElement,
  icon: IconElement,
  button: ButtonElement,
  shape: ShapeElement,
  video: VideoElement,
  chart: ChartElement,
  progress: ProgressElement,
  counter: CounterElement,
  countdown: CountdownElement,
  list: ListElement,
  tag: TagElement,
  divider: DividerElement
}

// 组件注册表（包含内置和自定义组件）
const elementRegistry = new Map<string, Component>(Object.entries(builtinElements))

/**
 * 注册自定义元素组件
 */
export function registerElement(type: string, component: Component) {
  elementRegistry.set(type, component)
}

/**
 * 获取元素组件
 */
export function getElementComponent(type: string): Component | undefined {
  return elementRegistry.get(type)
}

/**
 * 获取所有已注册的元素类型
 */
export function getRegisteredTypes(): string[] {
  return Array.from(elementRegistry.keys())
}

// 导出所有组件
export {
  ElementRenderer,
  TextElement,
  RichtextElement,
  ImageElement,
  IconElement,
  ButtonElement,
  ShapeElement,
  VideoElement,
  ChartElement,
  ProgressElement,
  CounterElement,
  CountdownElement,
  ListElement,
  TagElement,
  DividerElement
}
