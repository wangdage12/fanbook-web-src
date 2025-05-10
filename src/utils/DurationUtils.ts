export default class DurationUtils {
  /**
   * 把 `seconds` 格式化为 `ss秒` 的格式；
   * 如果超过 60 秒，则格式化为 `mm分ss秒` 的格式，如果此时秒数刚好是 0，则隐藏秒数，显示为 `mm分`
   * 如果超过 60 分钟，则格式化为 `hh时mm分ss秒` 的格式，如果此时分钟数刚好是 0，则隐藏分钟数，显示为 `hh时`
   * 如果超过 24 小时，则格式化为 `dd天hh时mm分ss秒` 的格式，如果此时小时数刚好是 0，则隐藏小时数，显示为 `dd天`
   *
   * @param seconds
   */
  static formatSeconds(seconds: number): string {
    const { days, hours, minutes, seconds: secondsLeft } = DurationUtils.calculateTime(seconds)
    return `${days ? `${days}天` : ''}${hours ? `${hours}小时` : ''}${minutes ? `${minutes}分钟` : ''}${secondsLeft ? `${secondsLeft}秒` : ''}`
  }

  /**
   * 如果秒数超过一分钟，则去掉不足一分钟的秒数
   * 如果秒数不足一分钟，则补足一分钟
   * @param {number} seconds - 总秒数
   * @returns {number} 处理后的秒数
   */
  static processSeconds(seconds: number): number {
    const oneMinute = 60

    if (seconds >= oneMinute) {
      // 超过一分钟的情况
      const remainingSeconds = seconds % oneMinute
      return seconds - remainingSeconds
    } else {
      // 不足一分钟的情况
      return oneMinute
    }
  }

  static calculateTime(seconds: number): { days: number; hours: number; minutes: number; seconds: number } {
    seconds = Math.floor(seconds)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    return {
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    }
  }

  static calculateSeconds({ days, hours, minutes, seconds }: { days?: number; hours?: number; minutes?: number; seconds?: number }) {
    let totalSeconds = 0
    totalSeconds += (days ?? 0) * 24 * 60 * 60
    totalSeconds += (hours ?? 0) * 60 * 60
    totalSeconds += (minutes ?? 0) * 60
    totalSeconds += seconds ?? 0

    return totalSeconds
  }
}
