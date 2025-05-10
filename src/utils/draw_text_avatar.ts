export default function drawTextAvatar(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 96
  const ctx = canvas.getContext('2d')!
  // 绘制背景
  ctx.fillStyle = '#228af2'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制文字
  ctx.font = '48px Arial'
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, (canvas.height + 10) / 2)
  const dataURL = canvas.toDataURL('image/png')
  // 将数据 URL 转换为 Blob 对象
  const blob = dataURLToBlob(dataURL)
  return new File([blob], 'screenshot.png', { type: 'image/png' })
}

// 将数据 URL 转换为 Blob 对象的辅助函数
function dataURLToBlob(dataURL: string) {
  const byteString = atob(dataURL.split(',')[1])
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}
