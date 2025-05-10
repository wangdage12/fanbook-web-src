import queryString, { ParsedUrl } from 'query-string'

export abstract class LinkHandler {
  next?: LinkHandler

  setNext(next: LinkHandler) {
    this.next = next
    // 如果 `next` 是一个链，需要返回链尾部的节点
    while (next.next) next = next.next
    return next
  }

  abstract canHandle(url: string): boolean

  protected abstract handle(url: ParsedUrl, extra: object | undefined, originUrl: string): void

  handleUrl(originUrl: string, extra?: object): void {
    if (!this.canHandle(originUrl)) this.next?.handleUrl(originUrl, extra)
    else this.handle(queryString.parseUrl(originUrl), extra, originUrl)
  }
}
