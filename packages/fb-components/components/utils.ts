import { isNumber } from 'lodash-es'
import { LimitSize, Size } from './type'

export function extractSize(size: number | Size): Size {
  if (isNumber(size)) {
    return { width: size, height: size }
  }
  return size
}

export function fullLimitSize(limitSize: LimitSize, defaultMin: number | Size, defaultMax: number | Size) {
  let _limitSize = limitSize as { max: Size; min: Size }
  if (isNumber(_limitSize)) {
    _limitSize = { max: extractSize(_limitSize), min: extractSize(defaultMin) }
  } else if (isNumber((limitSize as Size).width as number) && isNumber((limitSize as Size).height as number)) {
    _limitSize = { max: _limitSize as unknown as Size, min: extractSize(defaultMin) }
  } else {
    const { max = defaultMax, min = defaultMin } = limitSize as { max: Size | number; min: Size | number }
    _limitSize = { max: extractSize(max), min: extractSize(min) }
  }
  return _limitSize
}
