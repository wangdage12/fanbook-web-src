import dayjs, { Dayjs, isDayjs } from 'dayjs'
import { isString } from 'lodash-es'

/**
 * 项目里不应该存在各种各样的格式，如果这个文件里的方法太大，请让产品统一规范
 */
export default class DateTimeUtils {
  /**
   * 格式化时间，完整的格式是 yyyy年M月d日 HH:mm，如果是今年的时间，可以省略年份，
   * 如果是今天的时间，可以省略日期；
   * 如果是昨天的时间，日期部分显示「昨天」
   *
   * @param date             输入时间，可以是 `dayjs.Dayjs` 类型或者是 `number` 类型
   * @param options          更多选项
   * @param options.showTimeBeyondOneDay  距离此时超出一天是否显示时间，默认为 `true`，如果不显示时间则只有年月日
   * @param options.showJustNow  一分钟内是否显示刚刚更新，默认为 `false`, 如果为 `true`，则一分钟内显示「刚刚更新」, 否则显示时间 如果传入字符串则显示传入的字符串
   * @param options.showWithinDay 一天内是否显示分钟前或者小时前，默认为 `false`，如果为 `true`，则一天内显示「x分钟前」或者「x小时前」
   */
  static format(
    date: Dayjs | number,
    options?: {
      showJustNow?: boolean | string
      showWithinDay?: boolean
      showTimeBeyondOneDay?: boolean
    }
  ) {
    const { showTimeBeyondOneDay = true, showJustNow = false, showWithinDay = false } = options ?? {}
    date = dayjs(date)
    // 如果不是 dayjs 类型或者不是有效的时间，则返回空字符串

    if (!isDayjs(date) || !date.isValid()) {
      return ''
    }

    const now = dayjs()
    if (date.year() === now.year()) {
      if (date.isSame(now, 'day')) {
        const diff = +now - +date
        if (showJustNow) {
          if (diff < 60000) {
            return isString(showJustNow) ? showJustNow : '刚刚更新'
          }
        }
        if (showWithinDay) {
          if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000)
            return `${minutes} 分钟前`
          } else if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000)
            return `${hours} 小时前`
          }
        }
        return date.format('HH:mm')
      } else if (date.isSame(now.subtract(dayjs.duration(1, 'day')), 'day')) {
        return date.format(showTimeBeyondOneDay ? '昨天 HH:mm' : '昨天')
      } else {
        return date.format(showTimeBeyondOneDay ? 'M月D日 HH:mm' : 'M月D日')
      }
    }
    return date.format(showTimeBeyondOneDay ? 'YYYY年M月D日 HH:mm' : 'YYYY年M月D日')
  }

  /**
   * 格式化日期，如果是同一年，则显示月日，否则显示年月日
   */
  static formatDate(date: Dayjs) {
    const now = dayjs()
    if (date.year() === now.year()) {
      return date.format('M月D日')
    }
    return date.format('YYYY年M月D日')
  }
}
