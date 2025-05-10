import CryptoJS from 'crypto-js'

function readChunked(file: Blob, chunkCallback: (chunk: string) => void, endCallback: (err: Error | null) => void) {
  const fileSize = file.size
  const chunkSize = 50 * 1024 * 1024 // 50MB
  let offset = 0

  const reader = new FileReader()
  reader.onload = function () {
    if (reader.error) {
      endCallback(reader.error || {})
      return
    }
    const _chunk = (reader.result as string) ?? ''
    offset += (_chunk ?? '').length || chunkSize
    chunkCallback(reader.result as string)
    if (offset >= fileSize) {
      endCallback(null)
      return
    }
    readNext()
  }

  reader.onerror = function (err) {
    endCallback(err.target?.error || null)
  }

  function readNext() {
    const fileSlice = file.slice(offset, offset + chunkSize)
    reader.readAsBinaryString(fileSlice)
  }
  readNext()
}

export function calculateMD5(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const md5 = CryptoJS.algo.MD5.create()
    readChunked(
      blob,
      chunk => {
        md5.update(CryptoJS.enc.Latin1.parse(chunk))
      },
      err => {
        if (err) {
          reject(err)
        } else {
          const hash = md5.finalize()
          const hashHex = hash.toString(CryptoJS.enc.Hex)
          resolve(hashHex)
        }
      }
    )
  })
}
