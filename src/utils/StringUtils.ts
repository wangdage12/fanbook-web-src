export default class StringUtils {
  private static getCharVisualLength(char: string) {
    if (char.charCodeAt(0) <= 255) return 1

    try {
      if (encodeURI(char).length > 2) {
        return 2
      } else {
        return 1
      }
    } catch (e) {
      return 2
    }
  }
  /**
   * 检查（视觉上）字符串长度，规则为 `limit` 个英文字符或 `limit / 2` 个中文字符（或其他语言）
   */
  static getVisualLength(input: string): number {
    if (!input) {
      return 0
    }

    let length = 0
    for (const char of input) {
      length += StringUtils.getCharVisualLength(char)
    }
    return length
  }
}
