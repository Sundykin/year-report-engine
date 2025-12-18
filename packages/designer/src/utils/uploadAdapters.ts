import type { UploadAdapter } from '@year-report/core'

/**
 * 默认上传适配器示例 - 使用 FormData 上传到服务器
 */
export const createDefaultUploadAdapter = (uploadUrl: string): UploadAdapter => {
  return async ({ file, fileType, onProgress }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', fileType)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          onProgress?.(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            // 假设服务器返回 { url: string, filename?: string, size?: number }
            resolve(response)
          } catch (error) {
            reject(new Error('解析响应失败'))
          }
        } else {
          reject(new Error(`上传失败: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('网络错误'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('上传已取消'))
      })

      xhr.open('POST', uploadUrl)
      xhr.send(formData)
    })
  }
}

/**
 * 阿里云 OSS 上传适配器示例
 */
export const createAliyunOSSUploadAdapter = (_config: {
  region: string
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  endpoint?: string
}): UploadAdapter => {
  // 注意：这里需要引入 ali-oss 包
  // import OSS from 'ali-oss'

  return async ({ file, fileType, onProgress }) => {
    // 实际实现需要使用 ali-oss SDK
    // const client = new OSS({
    //   region: config.region,
    //   accessKeyId: config.accessKeyId,
    //   accessKeySecret: config.accessKeySecret,
    //   bucket: config.bucket,
    //   endpoint: config.endpoint
    // })

    // const result = await client.put(`uploads/${fileType}/${Date.now()}_${file.name}`, file, {
    //   progress: onProgress
    // })

    // return {
    //   url: result.url,
    //   filename: file.name,
    //   size: file.size
    // }

    // 示例代码
    throw new Error('请安装 ali-oss 包并实现具体上传逻辑')
  }
}

/**
 * 腾讯云 COS 上传适配器示例
 */
export const createTencentCOSUploadAdapter = (_config: {
  SecretId: string
  SecretKey: string
  Bucket: string
  Region: string
}): UploadAdapter => {
  // 注意：这里需要引入 cos-js-sdk-v5 包
  // import COS from 'cos-js-sdk-v5'

  return async ({ file, fileType, onProgress }) => {
    // 实际实现需要使用腾讯云 COS SDK
    // const cos = new COS({
    //   SecretId: config.SecretId,
    //   SecretKey: config.SecretKey
    // })

    // return new Promise((resolve, reject) => {
    //   cos.putObject({
    //     Bucket: config.Bucket,
    //     Region: config.Region,
    //     Key: `uploads/${fileType}/${Date.now()}_${file.name}`,
    //     Body: file,
    //     onProgress: (data) => {
    //       const progress = (data.loaded / data.total) * 100
    //       onProgress?.(progress)
    //     }
    //   }, (err, data) => {
    //     if (err) {
    //       reject(err)
    //     } else {
    //       resolve({
    //         url: `https://${data.Location}`,
    //         filename: file.name,
    //         size: file.size
    //       })
    //     }
    //   })
    // })

    // 示例代码
    throw new Error('请安装 cos-js-sdk-v5 包并实现具体上传逻辑')
  }
}

/**
 * 七牛云上传适配器示例
 */
export const createQiniuUploadAdapter = (config: {
  uploadUrl: string
  token: string
  domain: string
}): UploadAdapter => {
  return async ({ file, fileType, onProgress }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('token', config.token)
    formData.append('key', `uploads/${fileType}/${Date.now()}_${file.name}`)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          onProgress?.(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve({
              url: `${config.domain}/${response.key}`,
              filename: file.name,
              size: file.size
            })
          } catch (error) {
            reject(new Error('解析响应失败'))
          }
        } else {
          reject(new Error(`上传失败: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('网络错误'))
      })

      xhr.open('POST', config.uploadUrl)
      xhr.send(formData)
    })
  }
}