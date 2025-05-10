export interface TouchLike {
  clientX: number
  clientY: number
}

export function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
}

export function midpoint(p1: { x: number; y: number }, p2: { x: number; y: number }): { x: number; y: number } {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}

export function touchPt(touch: TouchLike): { x: number; y: number } {
  return { x: touch.clientX, y: touch.clientY }
}

export function touchDistance(t0: TouchLike, t1: TouchLike): number {
  const p0 = touchPt(t0)
  const p1 = touchPt(t1)
  return distance(p0, p1)
}

// The amount that a value of a dimension will change given a new scale
export const coordChange = (coordinate: number, scaleRatio: number) => {
  return scaleRatio * coordinate - coordinate
}

export function roundToDecimalPlaces(number: number, digit = 2): number {
  return Number(number.toFixed(digit))
}
