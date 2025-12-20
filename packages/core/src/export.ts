/**
 * 导出工具
 * 支持多种格式导出：图片、PDF、HTML、JSON
 *
 * 注意：部分功能需要额外安装依赖：
 * - 图片导出：pnpm add html2canvas
 * - PDF导出：pnpm add jspdf
 * - 二维码：pnpm add qrcode
 */

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'html' | 'json' | 'zip'
  quality?: number        // 图片质量 0-1
  scale?: number          // 缩放比例
  pages?: number[]        // 指定页面索引，不传则导出全部
  filename?: string       // 文件名
  includeAnimations?: boolean  // HTML导出是否包含动画
}

export interface ExportResult {
  success: boolean
  filename: string
  blob?: Blob
  url?: string
  error?: string
}

/**
 * 将 DOM 元素转为 Canvas
 */
export async function elementToCanvas(
  element: HTMLElement,
  options: { scale?: number; backgroundColor?: string } = {}
): Promise<HTMLCanvasElement> {
  const { scale = 2, backgroundColor = '#ffffff' } = options

  // 动态导入 html2canvas
  try {
    // @ts-ignore - optional dependency
    const html2canvasModule = await import('html2canvas')
    const html2canvas = html2canvasModule.default || html2canvasModule

    return html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false
    })
  } catch (e) {
    throw new Error('html2canvas not installed. Run: pnpm add html2canvas')
  }
}

/**
 * Canvas 转 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpg' = 'png',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas to blob failed'))
      },
      mimeType,
      quality
    )
  })
}

/**
 * 导出为图片
 */
export async function exportToImage(
  element: HTMLElement,
  options: { format?: 'png' | 'jpg'; quality?: number; scale?: number; filename?: string } = {}
): Promise<ExportResult> {
  const { format = 'png', quality = 0.92, scale = 2, filename = 'export' } = options

  try {
    const canvas = await elementToCanvas(element, { scale })
    const blob = await canvasToBlob(canvas, format, quality)
    const url = URL.createObjectURL(blob)

    return {
      success: true,
      filename: `${filename}.${format}`,
      blob,
      url
    }
  } catch (error) {
    return {
      success: false,
      filename: `${filename}.${format}`,
      error: error instanceof Error ? error.message : 'Export failed'
    }
  }
}

/**
 * 导出为 PDF
 */
export async function exportToPDF(
  elements: HTMLElement[],
  options: { filename?: string; scale?: number } = {}
): Promise<ExportResult> {
  const { filename = 'export', scale = 2 } = options

  try {
    // 动态导入 jspdf
    let jsPDF: any
    try {
      // @ts-ignore - optional dependency
      const jspdfModule = await import('jspdf')
      jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF
    } catch {
      throw new Error('jspdf not installed. Run: pnpm add jspdf')
    }

    // 创建 PDF（A4 竖向，适配移动端H5）
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [75, 133.5]  // 375x667 / 5
    })

    for (let i = 0; i < elements.length; i++) {
      if (i > 0) pdf.addPage()

      const canvas = await elementToCanvas(elements[i], { scale })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)

      pdf.addImage(imgData, 'JPEG', 0, 0, 75, 133.5)
    }

    const blob = pdf.output('blob')
    const url = URL.createObjectURL(blob)

    return {
      success: true,
      filename: `${filename}.pdf`,
      blob,
      url
    }
  } catch (error) {
    return {
      success: false,
      filename: `${filename}.pdf`,
      error: error instanceof Error ? error.message : 'PDF export failed'
    }
  }
}

/**
 * 生成独立 HTML 文件内容
 */
export function generateStandaloneHTML(
  projectData: any,
  options: { includeAnimations?: boolean; title?: string } = {}
): string {
  const { includeAnimations = true, title = 'H5 Page' } = options

  const animateCssLink = includeAnimations
    ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>'
    : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title}</title>
  ${animateCssLink}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      width: 375px;
      height: 667px;
      position: relative;
      overflow: hidden;
      background: #fff;
    }
    @media (max-width: 768px) {
      .container { width: 100vw; height: 100vh; }
    }
    .page {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      display: none;
    }
    .page.active { display: block; }
    .element {
      position: absolute;
    }
    .nav-hint {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      animation: bounce 1s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-10px); }
    }
  </style>
</head>
<body>
  <div class="container" id="app">
    <!-- Pages will be rendered here -->
  </div>

  <script>
    const projectData = ${JSON.stringify(projectData)};

    // 渲染逻辑
    let currentPage = 0;
    const container = document.getElementById('app');

    function renderPages() {
      projectData.pages.forEach((page, index) => {
        const pageEl = document.createElement('div');
        pageEl.className = 'page' + (index === 0 ? ' active' : '');
        pageEl.id = 'page-' + index;

        // 背景
        if (page.backgroundType === 'color') {
          pageEl.style.backgroundColor = page.backgroundColor || '#ffffff';
        } else if (page.backgroundType === 'gradient' && page.backgroundGradient) {
          const g = page.backgroundGradient;
          const colors = g.colors.map(c => c.color + ' ' + (c.position || '')).join(', ');
          pageEl.style.background = g.type === 'linear'
            ? 'linear-gradient(' + (g.direction || 'to bottom') + ', ' + colors + ')'
            : 'radial-gradient(circle, ' + colors + ')';
        } else if (page.backgroundType === 'image' && page.backgroundImage) {
          pageEl.style.backgroundImage = 'url(' + page.backgroundImage + ')';
          pageEl.style.backgroundSize = 'cover';
        }

        // 元素
        page.elements.forEach(el => {
          const elDiv = renderElement(el);
          if (elDiv) pageEl.appendChild(elDiv);
        });

        container.appendChild(pageEl);
      });

      // 添加导航提示
      if (projectData.pages.length > 1) {
        const hint = document.createElement('div');
        hint.className = 'nav-hint';
        hint.textContent = '↓ 滑动翻页';
        container.appendChild(hint);
      }
    }

    function renderElement(el) {
      const div = document.createElement('div');
      div.className = 'element';
      div.style.cssText = \`
        left: \${el.x}px;
        top: \${el.y}px;
        width: \${el.width}px;
        height: \${el.height}px;
        \${el.rotation ? 'transform: rotate(' + el.rotation + 'deg);' : ''}
        \${el.zIndex ? 'z-index: ' + el.zIndex + ';' : ''}
      \`;

      // 应用样式
      if (el.style) {
        Object.entries(el.style).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            div.style[key] = value;
          }
        });
      }

      // 根据类型渲染内容
      switch (el.type) {
        case 'text':
        case 'richtext':
          div.innerHTML = el.content || '';
          break;
        case 'image':
          if (el.src) {
            const img = document.createElement('img');
            img.src = el.src;
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
            div.appendChild(img);
          }
          break;
        case 'video':
          if (el.src) {
            const video = document.createElement('video');
            video.src = el.src;
            video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            div.appendChild(video);
          }
          break;
        default:
          div.textContent = el.content || '';
      }

      // 入场动画
      const anim = el.animations?.[0] || el.animation;
      if (anim && anim.type !== 'none') {
        div.style.setProperty('--animate-duration', anim.duration + 's');
        if (anim.delay) div.style.setProperty('--animate-delay', anim.delay + 's');
        div.classList.add('animate__animated', 'animate__' + anim.type);
      }

      return div;
    }

    // 页面切换
    let touchStartY = 0;
    container.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; });
    container.addEventListener('touchend', e => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentPage < projectData.pages.length - 1) {
          switchPage(currentPage + 1);
        } else if (diff < 0 && currentPage > 0) {
          switchPage(currentPage - 1);
        }
      }
    });

    function switchPage(index) {
      document.getElementById('page-' + currentPage).classList.remove('active');
      document.getElementById('page-' + index).classList.add('active');
      currentPage = index;
    }

    renderPages();
  </script>
</body>
</html>`
}

/**
 * 导出为 HTML 文件
 */
export async function exportToHTML(
  projectData: any,
  options: { filename?: string; includeAnimations?: boolean } = {}
): Promise<ExportResult> {
  const { filename = 'export', includeAnimations = true } = options

  try {
    const html = generateStandaloneHTML(projectData, {
      includeAnimations,
      title: projectData.title || 'H5 Page'
    })

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    return {
      success: true,
      filename: `${filename}.html`,
      blob,
      url
    }
  } catch (error) {
    return {
      success: false,
      filename: `${filename}.html`,
      error: error instanceof Error ? error.message : 'HTML export failed'
    }
  }
}

/**
 * 触发下载
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 生成分享链接（需要后端支持，这里只是接口定义）
 */
export interface ShareOptions {
  projectId: string
  expireTime?: number  // 过期时间（小时）
  password?: string    // 访问密码
}

export interface ShareResult {
  success: boolean
  url?: string
  qrCode?: string      // Base64 二维码图片
  expireAt?: string
  error?: string
}

/**
 * 生成二维码（使用 qrcode 库）
 */
export async function generateQRCode(text: string, size = 200): Promise<string> {
  try {
    let QRCode: any
    try {
      // @ts-ignore - optional dependency
      const qrcodeModule = await import('qrcode')
      QRCode = qrcodeModule.default || qrcodeModule
    } catch {
      // 二维码库未安装，返回空
      console.warn('qrcode not installed. Run: pnpm add qrcode')
      return ''
    }

    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch {
    return ''
  }
}
