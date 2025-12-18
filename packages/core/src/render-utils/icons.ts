/**
 * 图标字符映射
 */
export const ICON_MAP: Record<string, string> = {
  // 基础
  star: '⭐', heart: '❤️', check: '✓', close: '✕',
  arrow: '→', home: '🏠', user: '👤', settings: '⚙️',
  // 通讯
  search: '🔍', mail: '✉️', phone: '📞', location: '📍',
  // 时间
  calendar: '📅', clock: '🕐', bell: '🔔', bookmark: '🔖',
  // 文件
  folder: '📁', file: '📄', image: '🖼️', video: '🎬',
  music: '🎵', link: '🔗', share: '📤', download: '⬇️',
  upload: '⬆️', edit: '✏️', trash: '🗑️', plus: '➕',
  minus: '➖',
  // 状态
  info: 'ℹ️', warning: '⚠️', error: '❌', success: '✅',
  question: '❓', lock: '🔒', unlock: '🔓', eye: '👁️',
  // 自然
  gift: '🎁', fire: '🔥', lightning: '⚡', sun: '☀️',
  moon: '🌙', cloud: '☁️', rain: '🌧️', snow: '❄️',
  wind: '💨', leaf: '🍃', flower: '🌸', tree: '🌳',
  mountain: '⛰️', wave: '🌊', rocket: '🚀',
  // 交通
  car: '🚗', plane: '✈️', ship: '🚢', train: '🚂',
  bike: '🚲', walk: '🚶', run: '🏃', swim: '🏊',
  // 成就
  trophy: '🏆', medal: '🏅', crown: '👑', diamond: '💎',
  // 商业
  money: '💰', card: '💳', cart: '🛒', bag: '👜',
  // 生活
  coffee: '☕', food: '🍔', drink: '🍹', cake: '🎂',
  // 娱乐
  game: '🎮', dice: '🎲', puzzle: '🧩', target: '🎯',
  // 工具
  flag: '🚩', pin: '📌', tag: '🏷️', key: '🔑',
  tool: '🔧', hammer: '🔨', wrench: '🔩', gear: '⚙️',
  bulb: '💡', battery: '🔋', wifi: '📶', bluetooth: '🔵',
  // 设备
  camera: '📷', mic: '🎤', speaker: '🔊', headphone: '🎧',
  tv: '📺', laptop: '💻', desktop: '🖥️', mobile: '📱',
  tablet: '📱', watch: '⌚', printer: '🖨️', keyboard: '⌨️',
  mouse: '🖱️', usb: '🔌', cd: '💿', floppy: '💾'
}

/**
 * 获取图标字符
 */
export function getIconChar(name?: string): string {
  return ICON_MAP[name || 'star'] || '⭐'
}

/**
 * 获取所有图标选项（用于选择器）
 */
export function getIconOptions() {
  return Object.entries(ICON_MAP).map(([value, icon]) => ({
    value,
    label: `${icon} ${value}`
  }))
}
