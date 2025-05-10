/**
 * 此类维护服务端的时间
 */
export default class ServerTime {
  // 服务端使用 秒数
  static serverTime = Date.now() / 1000
  static updateAt = performance.now()

  // 使用服务端时间更新本地时间
  static updateServerTime(serverTime: number) {
    // 服务端使用 秒数
    this.serverTime = serverTime
    this.updateAt = performance.now()
  }

  /**
   * 获取服务端的当前时间 单位 秒数
   */
  static now() {
    return (this.serverTime + (performance.now() - this.updateAt) / 1000) | 0
  }
}
