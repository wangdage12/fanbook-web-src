export default {
  isAndroid: function () {
    return !!navigator.userAgent.match(/Android/i)
  },
  isMobileQQ: function () {
    const ua = navigator.userAgent
    return /(iPad|iPhone|iPod).*? (IPad)?QQ\/([\d.]+)/.test(ua) || /\bV1_AND_SQI?_([\d.]+)(.*? QQ\/([\d.]+))?/.test(ua)
  },
  isIOS: function () {
    return !!navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  isWx: function () {
    return !!navigator.userAgent.match(/micromessenger/i)
  },
  isChrome: function () {
    return !!(navigator.userAgent.match(/Chrome\/([\d.]+)/) || navigator.userAgent.match(/CriOS\/([\d.]+)/))
  },
  isBaidu: function () {
    return !!navigator.userAgent.match(/baidubrowser/i)
  },
  isUC: function () {
    return !!navigator.userAgent.match(/UCBrowser/i)
  },
  isSafari: function () {
    return !!navigator.userAgent.match(/safari/i)
  },
  isQQBrowser: function () {
    return !!navigator.userAgent.match(/MQQBrowser/i)
  },
  isWeibo: function () {
    return !!navigator.userAgent.match(/weibo/i)
  },
  isAlipay: function () {
    return !!navigator.userAgent.match(/Alipay/i)
  },
  isMobile: function () {
    return navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
  },
  isMac: function () {
    return /macintosh|mac os x/i.test(navigator.userAgent)
  },
  isWindows: function () {
    return /windows|win32/i.test(navigator.userAgent)
  },
  isWindowsWechat: function () {
    return /WindowsWechat/i.test(navigator.userAgent)
  },
  isDesktop: function () {
    return /electron/i.test(navigator.userAgent)
  },
}
