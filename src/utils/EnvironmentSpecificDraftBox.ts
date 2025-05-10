import EventEmitter from 'eventemitter3'

/**
 * `EnvironmentSpecificDraftBox` 不同于 `DraftSlice`，`EnvironmentSpecificDraftBox`
 * 在 Web 上是仅保存在内存里，而在 Electron 环境中会保存到本地文件系统中。
 */
abstract class EnvironmentSpecificDraftBox extends EventEmitter<{
  ['update']: (key: string, content: object | undefined) => void
}> {
  static UPDATE = 'update'
  /**
   * 保存草稿
   *
   * @param key 草稿的唯一标识
   * @param content 草稿内容
   */
  save(key: string, content: object): void {
    this.emit('update', key, content)
  }

  /**
   * 获取草稿
   *
   * @param key 草稿的唯一标识
   * @returns 草稿内容
   */
  abstract get<T>(key: string): T | undefined

  /**
   * 删除草稿
   *
   * @param key 草稿的唯一标识
   */
  delete(key: string): void {
    this.emit('update', key, undefined)
  }
}

class WebMemoryDraftBox extends EnvironmentSpecificDraftBox {
  box = new Map<string, object>()
  get<T>(key: string): T | undefined {
    return this.box.get(key) as T
  }
  delete(key: string): void {
    this.box.delete(key)
    super.delete(key)
  }

  save(key: string, content: object) {
    this.box.set(key, content)
    super.save(key, content)
  }
}

const environmentSpecificDraftBox: EnvironmentSpecificDraftBox = new WebMemoryDraftBox()
export default environmentSpecificDraftBox
