import { ParsedUrl } from 'query-string'
import { LinkHandler } from './LinkHandler'

export default class WebsiteLinkHandler extends LinkHandler {
  canHandle(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://')
  }

  protected handle(url: ParsedUrl, _: object, originUrl: string): void {
    window.open(originUrl, '_blank')
  }
}
