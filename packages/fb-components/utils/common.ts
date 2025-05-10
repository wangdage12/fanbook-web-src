/**
 * https://idreamsky.feishu.cn/docx/AiQYd7EeSop4FxxltvscfSTan91?contentTheme=DARK&feed_id=7288522369139130396&last_doc_message_id=7296017591615881220&sourceType=feed&theme=light&useNewLarklet=1#part-Pj66dMzL6olqHlx59qwcYRzlnWc
 *
 * count=0时,不显示数字 或 defaultFormat
 *
 * count∈[1,9999]时,显示具体数字
 *
 * count∈[10000,9999999]时,显示xx万,精确到小数点后一位,向下取整.例如:11.2万；当小数点后一位为0时，直接取整数.如：3万
 *
 * count∈[10000000,+∞]时,显示 "999万+"
 *
 * 问答卡片的评论数计数也使用此规则
 *
 * @param count 数量
 * @param defaultFormat 默认文本
 * @returns 格式文本
 */
export function formatCount(count?: number, defaultFormat = '0') {
  if (count === 0 || !count) {
    return defaultFormat ?? '0'
  }

  if (count >= 1 && count <= 9999) {
    return count.toString()
  }

  if (count >= 10000 && count <= 9990000) {
    const formattedCounts = Math.floor(count / 1000)
    const digits = formattedCounts % 10 === 0 ? 0 : 1
    return (formattedCounts / 10).toFixed(digits) + '万'
  }

  if (count >= 9990001) {
    // 超过 999999999 的 仅展示 99999万+
    const _count = Math.min(999999999, count).toString()
    return `${_count.substring(0, _count.length - 4)}万+`
  }

  return defaultFormat
}

export function checkIsLocalURL(url: string = '') {
  return /^(blob:(http|file)|data:)/.test(url)
}

export function safeDivision(left: number, right: number) {
  return right === 0 ? Infinity : left / right
}

export function matchAndReplace(text: string, keyword: string, size = 24) {
  const index = text.indexOf(keyword) // 查找关键字第一次出现的下标

  if (index > size) {
    // 如果关键字第一次出现的下标大于22，就截取前面22个字符
    const spiltIndex = index - size <= 2 ? index - size + 4 : index - size
    text = '...' + text.substring(spiltIndex) // 替换前面的22个字符为省略号
  }

  return text
}
