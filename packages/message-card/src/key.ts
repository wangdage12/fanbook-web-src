export type KeyData = Record<string, KeyRecord | undefined>

export interface KeyRecord {
  me: boolean
  count: number
  user_ids?: string
}

export class KeyUtils {
  static hasAnyKeyMySelf(keys?: KeyData) {
    if (!keys) return undefined

    for (const [key, record] of Object.entries(keys)) {
      if (record?.me) {
        return key
      }
    }
  }

  static getKeyCount(keys: KeyData | undefined, key: string) {
    if (!keys) return 0
    return keys[key]?.count ?? 0
  }

  static hasKeyMyself(keys: KeyData | undefined, key: string) {
    if (!keys) return false
    return !!keys[key]?.me
  }

  static getEmptyKey(keys: KeyData | undefined, max: number) {
    if (!keys) return '0'
    for (let i = 0; i < max; i++) {
      const key = i.toString()
      if (!(key in keys)) return key
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (keys[key]!.count === 0) return key
    }
  }
}
