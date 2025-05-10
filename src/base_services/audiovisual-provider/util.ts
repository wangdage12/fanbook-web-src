export function createMemberId(userId: string, deviceId: string, extra?: string) {
  return `${userId}_${deviceId}${extra ? `_${extra}` : ''}`
}
