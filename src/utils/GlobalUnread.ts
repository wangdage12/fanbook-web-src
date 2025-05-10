// @ts-expect-error 这个古老的库似乎对 TS 并不友好
import Favico from 'favico.js'
import { globalEmitter, GlobalEvent } from '../base_services/event.ts'

/**
 * 全局的未读数总和，用于显示系统角标。
 * 浏览器为标题角标，桌面端为系统角标。
 */
export default class GlobalUnread {
  static favicon = new Favico({ animation: 'none' })

  static count = 0
  static map = new Map()
  static dmCount = 0

  private static badge(count: number) {
    this.favicon.badge(count > 99 ? '99+' : count)
  }

  static updateDm(newCount: number) {
    const delta = newCount - this.dmCount
    if (delta === 0) return

    this.dmCount = newCount
    GlobalUnread.badge((this.count += delta))
  }

  static updateGuild(guildId: string, newCount: number) {
    const delta = newCount - (this.map.get(guildId) || 0)
    if (delta === 0) return

    this.map.set(guildId, newCount)
    GlobalUnread.badge((this.count += delta))
  }

  static reset() {
    this.count = 0
    this.map.clear()
    this.dmCount = 0
    GlobalUnread.badge(0)
  }
}

requestAnimationFrame(() => {
  globalEmitter.on(GlobalEvent.Logout, () => GlobalUnread.reset())
})
