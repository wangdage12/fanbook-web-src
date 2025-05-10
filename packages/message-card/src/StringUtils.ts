export default class StringUtils {
  static camel2kebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
  }
}
