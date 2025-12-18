import type { FormGroupSchema } from '../types'

// 图标选项
const ICON_OPTIONS = [
  { label: '⭐ 星星', value: 'star' },
  { label: '❤️ 爱心', value: 'heart' },
  { label: '✓ 勾选', value: 'check' },
  { label: '✕ 关闭', value: 'close' },
  { label: '🏠 首页', value: 'home' },
  { label: '👤 用户', value: 'user' },
  { label: '⚙️ 设置', value: 'settings' },
  { label: '🔍 搜索', value: 'search' },
  { label: '✉️ 邮件', value: 'mail' },
  { label: '📞 电话', value: 'phone' },
  { label: '📍 位置', value: 'location' },
  { label: '📅 日历', value: 'calendar' },
  { label: '🕐 时钟', value: 'clock' },
  { label: '🔔 铃铛', value: 'bell' },
  { label: '🔖 书签', value: 'bookmark' },
  { label: '📁 文件夹', value: 'folder' },
  { label: '📄 文件', value: 'file' },
  { label: '🖼️ 图片', value: 'image' },
  { label: '🎬 视频', value: 'video' },
  { label: '🎵 音乐', value: 'music' },
  { label: '🔗 链接', value: 'link' },
  { label: '📤 分享', value: 'share' },
  { label: '⬇️ 下载', value: 'download' },
  { label: '⬆️ 上传', value: 'upload' },
  { label: '✏️ 编辑', value: 'edit' },
  { label: '🗑️ 删除', value: 'trash' },
  { label: '➕ 添加', value: 'plus' },
  { label: '➖ 减少', value: 'minus' },
  { label: 'ℹ️ 信息', value: 'info' },
  { label: '⚠️ 警告', value: 'warning' },
  { label: '❌ 错误', value: 'error' },
  { label: '✅ 成功', value: 'success' },
  { label: '❓ 问号', value: 'question' },
  { label: '🔒 锁定', value: 'lock' },
  { label: '🔓 解锁', value: 'unlock' },
  { label: '👁️ 眼睛', value: 'eye' },
  { label: '🎁 礼物', value: 'gift' },
  { label: '🔥 火焰', value: 'fire' },
  { label: '⚡ 闪电', value: 'lightning' },
  { label: '☀️ 太阳', value: 'sun' },
  { label: '🌙 月亮', value: 'moon' },
  { label: '☁️ 云朵', value: 'cloud' },
  { label: '🚀 火箭', value: 'rocket' },
  { label: '🏆 奖杯', value: 'trophy' },
  { label: '👑 皇冠', value: 'crown' },
  { label: '💎 钻石', value: 'diamond' },
  { label: '💰 金钱', value: 'money' },
  { label: '🛒 购物车', value: 'cart' },
  { label: '☕ 咖啡', value: 'coffee' },
  { label: '🎮 游戏', value: 'game' },
  { label: '🎯 目标', value: 'target' },
  { label: '🔑 钥匙', value: 'key' },
  { label: '💡 灯泡', value: 'bulb' },
  { label: '📷 相机', value: 'camera' },
  { label: '🎤 麦克风', value: 'mic' },
  { label: '📱 手机', value: 'mobile' },
  { label: '💻 电脑', value: 'laptop' }
]

export const iconSchema: FormGroupSchema[] = [
  {
    title: '图标设置',
    fields: [
      {
        field: 'iconName',
        label: '图标',
        type: 'select',
        options: ICON_OPTIONS
      },
      {
        field: 'iconColor',
        label: '颜色',
        type: 'color'
      }
    ]
  }
]
