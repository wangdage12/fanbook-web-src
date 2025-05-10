import Browser from 'bowser'

// 获取套壳 Chrome 浏览器版本
function getLikeChromeVersion(userAgent: string) {
  const isChrome = userAgent.indexOf('Chrome') > -1
  if (isChrome) {
    return userAgent.match(/Chrome\/(\S+)/)?.[1]
  }
  return void 0
}

export function validBrowser(checkTree: Browser.Parser.checkTree) {
  const userAgent = window.navigator.userAgent
  const browser = Browser.getParser(userAgent)
  const isValidBrowser = browser.satisfies(checkTree)
  if (!isValidBrowser && browser.getBrowserName().toLocaleLowerCase() !== 'chrome') {
    const currentBrowser = getLikeChromeVersion(userAgent)
    const checkVersion = checkTree['chrome'] as string
    return currentBrowser ? compareVersion(checkVersion, currentBrowser) : false
  }
  return isValidBrowser
}
// node_modules/bowser/src/utils.js
class Utils {
  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  static getVersionPrecision(version: string): number {
    return version.split('.').length
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions('1.10.2.1', '1.8.2.1.90')    // 1
   *   compareVersions('1.010.2.1', '1.09.2.1.90');  // 1
   *   compareVersions('1.10.2.1', '1.10.2.1');     // 0
   *   compareVersions('1.10.2.1', '1.0800.2');     // -1
   *   compareVersions('1.10.2.1', '1.10', true);   // 0
   *
   * @param {string} versionA versions versions to compare
   * @param {string} versionB versions versions to compare
   * @param {boolean} [isLoose] enable loose comparison
   * @return {number} comparison result: -1 when versionA is lower,
   * 1 when versionA is bigger, 0 when both equal
   */
  /* eslint consistent-return: 1 */
  static compareVersions(versionA: string, versionB: string, isLoose = false): number | undefined {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    const versionAPrecision = Utils.getVersionPrecision(versionA)
    const versionBPrecision = Utils.getVersionPrecision(versionB)

    let precision = Math.max(versionAPrecision, versionBPrecision)
    let lastPrecision = 0

    const chunks = Utils.map([versionA, versionB], (version: string) => {
      const delta = precision - Utils.getVersionPrecision(version)

      // 2) "9" -> "9.0" (for precision = 2)
      const _version = version + new Array(delta + 1).join('.0')

      // 3) "9.0" -> ["000000000"", "000000009"]
      return Utils.map(_version.split('.'), (chunk: any) => new Array(20 - chunk.length).join('0') + chunk).reverse()
    })

    // adjust precision for loose comparison
    if (isLoose) {
      lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision)
    }

    // iterate in reverse order by reversed chunks array
    precision -= 1
    while (precision >= lastPrecision) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1
      }

      if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === lastPrecision) {
          // all version chunks are same
          return 0
        }

        precision -= 1
      } else if (chunks[0][precision] < chunks[1][precision]) {
        return -1
      }
    }

    return undefined
  }

  /**
   * Array::map polyfill
   *
   * @param  {any[]} arr
   * @param  {Function} iterator
   * @return {any[]}
   */
  static map<U>(arr: any[], iterator: (value: any, index: number, array: any[]) => U): any[] {
    const result = []
    let i
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator)
    }
    for (i = 0; i < arr.length; i += 1) {
      result.push(iterator(arr[i], i, arr))
    }
    return result
  }
}

// node_modules/bowser/src/parser.js
function compareVersion(version: string, currentBrowserVersion: string) {
  let expectedResults = [0]
  let comparableVersion = version
  let isLoose = false

  if (typeof currentBrowserVersion !== 'string') {
    return void 0
  }

  if (version[0] === '>' || version[0] === '<') {
    comparableVersion = version.slice(1)
    if (version[1] === '=') {
      isLoose = true
      comparableVersion = version.slice(2)
    } else {
      expectedResults = []
    }
    if (version[0] === '>') {
      expectedResults.push(1)
    } else {
      expectedResults.push(-1)
    }
  } else if (version[0] === '=') {
    comparableVersion = version.slice(1)
  } else if (version[0] === '~') {
    isLoose = true
    comparableVersion = version.slice(1)
  }
  const compare = Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose)
  return compare ? expectedResults.indexOf(compare) > -1 : false
}
