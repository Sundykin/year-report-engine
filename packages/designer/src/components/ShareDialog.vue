<template>
  <div class="shareDialog" v-if="visible">
    <div class="dialogOverlay" @click="$emit('close')"></div>
    <div class="dialogContent">
      <div class="dialogHeader">
        <h3>🔗 分享项目</h3>
        <button class="closeBtn" @click="$emit('close')">×</button>
      </div>

      <div class="dialogBody">
        <!-- 分享链接 -->
        <div class="shareSection">
          <h4>分享链接</h4>
          <div class="linkRow">
            <input
              type="text"
              :value="shareUrl"
              readonly
              class="linkInput"
              ref="linkInput"
            />
            <button class="copyBtn" @click="copyLink">
              {{ copied ? '✓ 已复制' : '📋 复制' }}
            </button>
          </div>
          <p class="linkTip">
            <span class="tipIcon">💡</span>
            将此链接分享给他人，即可在线查看您的作品
          </p>
        </div>

        <!-- 二维码 -->
        <div class="qrcodeSection">
          <h4>扫码访问</h4>
          <div class="qrcodeBox">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" class="qrcodeImage" />
            <div v-else class="qrcodePlaceholder">
              <span class="loadingIcon">⏳</span>
              生成中...
            </div>
          </div>
          <button class="downloadQRBtn" @click="downloadQRCode" :disabled="!qrCodeUrl">
            下载二维码
          </button>
        </div>

        <!-- 分享选项 -->
        <div class="optionsSection">
          <h4>分享设置</h4>
          <div class="optionRow">
            <label>
              <input type="checkbox" v-model="options.passwordProtected" />
              设置访问密码
            </label>
          </div>
          <div class="optionRow" v-if="options.passwordProtected">
            <input
              type="text"
              v-model="options.password"
              placeholder="输入访问密码"
              class="passwordInput"
            />
          </div>
          <div class="optionRow">
            <label>链接有效期</label>
            <select v-model="options.expireTime">
              <option :value="0">永久有效</option>
              <option :value="24">24小时</option>
              <option :value="72">3天</option>
              <option :value="168">7天</option>
              <option :value="720">30天</option>
            </select>
          </div>
        </div>

        <!-- 社交分享 -->
        <div class="socialSection">
          <h4>分享到</h4>
          <div class="socialButtons">
            <button class="socialBtn wechat" @click="shareToWechat">
              <span class="socialIcon">💬</span>
              微信
            </button>
            <button class="socialBtn weibo" @click="shareToWeibo">
              <span class="socialIcon">📢</span>
              微博
            </button>
            <button class="socialBtn qq" @click="shareToQQ">
              <span class="socialIcon">🐧</span>
              QQ
            </button>
          </div>
        </div>
      </div>

      <div class="dialogFooter">
        <button class="closeFooterBtn" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { generateQRCode, downloadBlob } from '@year-report/core'

interface Props {
  visible: boolean
  projectId: string
  projectTitle: string
  baseUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  baseUrl: ''
})

const emit = defineEmits<{
  close: []
}>()

// 抑制未使用警告（模板中使用 $emit）
void emit

const linkInput = ref<HTMLInputElement | null>(null)
const copied = ref(false)
const qrCodeUrl = ref<string>('')

const options = reactive({
  passwordProtected: false,
  password: '',
  expireTime: 0
})

// 生成分享链接
const shareUrl = ref('')

watch(() => props.visible, async (visible) => {
  if (visible && props.projectId) {
    // 生成分享链接（实际项目中需要后端支持）
    const baseUrl = props.baseUrl || window.location.origin
    shareUrl.value = `${baseUrl}/view/${props.projectId}`

    // 生成二维码
    try {
      qrCodeUrl.value = await generateQRCode(shareUrl.value, 200)
    } catch {
      qrCodeUrl.value = ''
    }
  }
}, { immediate: true })

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
    if (linkInput.value) {
      linkInput.value.select()
      document.execCommand('copy')
      copied.value = true
      setTimeout(() => { copied.value = false }, 2000)
    }
  }
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeUrl.value) return

  // 将 base64 转为 blob
  const base64 = qrCodeUrl.value.split(',')[1]
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([array], { type: 'image/png' })
  downloadBlob(blob, `${props.projectTitle || 'qrcode'}.png`)
}

// 社交分享
const shareToWechat = () => {
  // 微信分享需要微信JS-SDK，这里只显示二维码
  alert('请使用微信扫描二维码分享')
}

const shareToWeibo = () => {
  const url = encodeURIComponent(shareUrl.value)
  const title = encodeURIComponent(props.projectTitle || 'H5作品')
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank')
}

const shareToQQ = () => {
  const url = encodeURIComponent(shareUrl.value)
  const title = encodeURIComponent(props.projectTitle || 'H5作品')
  window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`, '_blank')
}
</script>

<style scoped>
.shareDialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialogOverlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.dialogContent {
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dialogHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
}

.dialogHeader h3 {
  font-size: 16px;
  color: #fff;
  margin: 0;
}

.closeBtn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
}

.closeBtn:hover { color: #fff; }

.dialogBody {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.shareSection h4,
.qrcodeSection h4,
.optionsSection h4,
.socialSection h4 {
  font-size: 13px;
  color: #a3a3a3;
  margin: 0 0 12px 0;
}

.linkRow {
  display: flex;
  gap: 8px;
}

.linkInput {
  flex: 1;
  background: #262626;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 10px 12px;
  color: #fff;
  font-size: 12px;
}

.copyBtn {
  background: #3b82f6;
  border: none;
  color: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 12px;
}

.copyBtn:hover { background: #2563eb; }

.linkTip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  color: #737373;
}

.tipIcon { font-size: 14px; }

.qrcodeSection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #333;
  text-align: center;
}

.qrcodeBox {
  background: #fff;
  border-radius: 8px;
  width: 200px;
  height: 200px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcodeImage {
  width: 100%;
  height: 100%;
}

.qrcodePlaceholder {
  color: #999;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.loadingIcon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.downloadQRBtn {
  background: #262626;
  border: 1px solid #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.downloadQRBtn:hover { background: #333; }
.downloadQRBtn:disabled { opacity: 0.5; cursor: not-allowed; }

.optionsSection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #333;
}

.optionRow {
  margin-bottom: 12px;
}

.optionRow label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #a3a3a3;
  cursor: pointer;
}

.optionRow input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.optionRow select {
  background: #262626;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 6px 10px;
  color: #fff;
  font-size: 12px;
  margin-left: 8px;
}

.passwordInput {
  width: 100%;
  background: #262626;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px 10px;
  color: #fff;
  font-size: 12px;
}

.socialSection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #333;
}

.socialButtons {
  display: flex;
  gap: 12px;
}

.socialBtn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
  color: #fff;
}

.socialBtn.wechat { background: #07c160; }
.socialBtn.weibo { background: #e6162d; }
.socialBtn.qq { background: #1296db; }

.socialBtn:hover { opacity: 0.9; }

.socialIcon { font-size: 20px; }

.dialogFooter {
  display: flex;
  justify-content: center;
  padding: 16px 20px;
  border-top: 1px solid #333;
}

.closeFooterBtn {
  background: #333;
  border: none;
  color: #fff;
  padding: 10px 40px;
  border-radius: 6px;
  cursor: pointer;
}

.closeFooterBtn:hover { background: #404040; }
</style>
