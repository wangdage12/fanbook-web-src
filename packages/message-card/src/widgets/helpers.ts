import { isString, pickBy } from 'lodash-es'
import { CSSProperties } from 'react'
import { TextStyleData } from './TextWidget'
import { Widget } from './Widget'

export function parseEdgeInsets(data?: string): string | undefined {
  if (!data) return undefined

  if (!isString(data)) {
    throw new Error(`Invalid EdgeInsets: ${data}, type should be string`)
  }

  // App 支持负数值，但是负数值会导致 CSS 样式错误，所以这里取绝对值
  const parts = data.split(',').map(v => parseFloat(v))
  if (parts.length == 1) return `${Math.abs(parts[0])}px`
  // 格式与 CSS 相反
  if (parts.length == 2) return `${Math.abs(parts[1])}px ${Math.abs(parts[0])}px`
  // 原始格式是 LTRB，CSS 格式是 TRLB
  if (parts.length == 4) return `${Math.abs(parts[1])}px ${Math.abs(parts[2])}px ${Math.abs(parts[3])}px ${Math.abs(parts[0])}px`

  return undefined
}

export function parseCommonCssProperties(data: Partial<Widget>): CSSProperties {
  return pickBy(
    {
      width: data.width,
      height: data.height,
      padding: parseEdgeInsets(data.padding),
      flexGrow: data.flex === 'tight' ? 1 : undefined,
      flexShrink: data.flex === 'loose' ? 1 : undefined,
      ...textStyle2CssProperties(data.textStyle),
    },
    v => Boolean(v)
  )
}
export function color2css(color?: string) {
  if (!color) {
    return undefined
  }

  if (color.startsWith('#')) {
    color = color.substring(1)
  }

  // flutter 的颜色格式是 ARGB，而 css 的是 RGBA
  if (color.length > 6) {
    color = `${color.substring(2)}${color.substring(0, 2)}`
  }

  return `#${color}`
}
export function textStyle2CssProperties(data?: TextStyleData): CSSProperties {
  if (!data) {
    return {}
  }

  if (data.fontWeight === 'medium') data.fontWeight = '500'

  return {
    color: color2css(data.color),
    backgroundColor: color2css(data.backgroundColor),
    fontSize: data.fontSize,
    fontWeight: data.fontWeight ?? 'normal',
  }
}

export function imageAlignment2css(alignment: string) {
  return parseAlignment(alignment)
    .map(v => `${v * 100}%`)
    .join(' ')
}

export function parseAlignment(alignment: string): [number, number] {
  const parts = alignment.split(',')
  if (parts.length == 1) return [parseFloat(parts[0]), parseFloat(parts[0])]
  return parts.map(part => parseFloat(part)) as [number, number]
}

export function constraints2css(json?: string): CSSProperties {
  if (!json) return {}
  const v = json.split(',')
  return {
    minWidth: parseFloat(v[0]) ?? undefined,
    minHeight: v.length > 1 ? parseFloat(v[1]) : undefined,
    maxWidth: v.length > 2 ? parseFloat(v[2]) : undefined,
    maxHeight: v.length > 3 ? parseFloat(v[3]) : undefined,
  }
}

export interface GradientData {
  colors: string[]
  stops?: number[]
  begin?: string
  end?: string
}

export function gradient2css(json?: GradientData) {
  if (!json) return undefined
  const { colors, begin, end } = json
  const beginPos = begin ? parseAlignment(begin) : [0, 0.5]
  const endPos = end ? parseAlignment(end) : [1, 0.5]
  const stops = json.stops ?? [0, 1]
  const deg = Math.atan2(endPos[1] - beginPos[1], endPos[0] - beginPos[0]) * (180 / Math.PI) + 90
  return `linear-gradient(${deg}deg, ${colors
    .map((color, index) => {
      // eslint-disable-next-line
      const stop = (stops![index] ?? 1) * 100 + '%'
      return `${color2css(color)} ${stop}`
    })
    .join(',')})`
}
