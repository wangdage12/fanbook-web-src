import { cloneDeep, isEqual } from 'lodash-es'

export default class ObjectUtils {
  /**
   * 比较两个对象的差异
   * @param oldObj  旧对象
   * @param newObj  新对象，差异值会从这个对象中取
   */
  static shallowDiff<T extends Record<string, any>>(oldObj: T, newObj: T): Partial<T> {
    const diff: Partial<T> = {}
    for (const key in oldObj) {
      if (!isEqual(oldObj[key], newObj[key])) {
        diff[key] = newObj[key]
      }
    }
    return cloneDeep(diff)
  }
}
