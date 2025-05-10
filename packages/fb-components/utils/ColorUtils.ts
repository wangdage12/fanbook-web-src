export default class ColorUtils {
  /**
   * 将 CSS 颜色值转换为溢出的 int 值
   * @param color
   */
  static convertToOverflowedInt(color: string): number {
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      return parseInt(hex, 16) | ~0xffffff
    }
    return 0
  }
  /**
   * Fanbook 服务端返回的颜色数据是溢出的 int 值，需要转换成 CSS 颜色值
   * @param value
   */
  static convertToCssColor(value?: number, defaultColor = 'var(--fg-blue-1)'): string {
    return value && value !== 0 ? `#${(value & 0xffffff).toString(16).padStart(6, '0')}`.toUpperCase() : defaultColor
  }
}
