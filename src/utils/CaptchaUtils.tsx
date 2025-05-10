enum TencentCaptchaCallbackReturn {
  Success,
  UserCancelled = 2,
}

export class CaptchaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CaptchaError'
  }
}

// enum TencentCaptchaCallbackErrorCode {
//   // TCaptcha.js 加载错误
//   JsLoadFailed = 1001,
//   // 调用 show 方法超时
//   InvokeShowTimeout = 1002,
//   // 中间 js 加载超时
//   MiddleJsTimeout = 1003,
//   // 中间 js 加载错误
//   MiddleJsLoadFailed = 1004,
//   // 中间 js 运行错误
//   MiddleJsRunFailed = 1005,
//   // 拉取验证码配置错误/超时
//   FetchCaptchaFailedOrTimeout = 1006,
//   // iframe 加载超时
//   IframeTimeout = 1007,
//   // iframe 加载错误
//   IframeLoadFailed = 1008,
//   // jquery 加载错误
//   JQueryLoadFailed = 1009,
//   // 滑块 js 加载错误
//   SliderJsLoadFailed = 1010,
//   // 滑块 js 运行错误
//   SliderJsRunFailed = 1011,
//   // 刷新连续错误3次
//   RefreshError3Times = 1012,
//   // 验证网络连续错误3次
//   VerifyError3Times = 1013,
// }

/**
 * CaptchaUtils 用来弹出人机验证
 */
export default class CaptchaUtils {
  /**
   * 默认的人机验证的 appid，会被服务端接口更新
   */
  static CaptchaAppId = '199808866'

  /**
   * 弹出一个人机验证，如果用户取消了验证，或者是其他一些错误，会抛出 CaptchaError
   */
  static newCaptcha(): Promise<TencentCaptchaCallbackArguments> {
    return new Promise((resolve, reject) => {
      function callback(res: TencentCaptchaCallbackArguments) {
        if (res.ret === TencentCaptchaCallbackReturn.UserCancelled) {
          reject(new CaptchaError('user cancelled'))
        } else if (res.ret === TencentCaptchaCallbackReturn.Success) {
          resolve(res)
        } else {
          reject(new CaptchaError(res.errorMessage))
        }
      }

      function loadErrorCallback() {
        // 生成容灾票据或自行做其它处理
        const ticket = 'terror_1001_' + CaptchaUtils.CaptchaAppId + '_' + Math.floor(new Date().getTime() / 1000)
        callback({
          ret: 0,
          randstr: '@' + Math.random().toString(36).substring(2),
          ticket,
          errorCode: 1001,
          errorMessage: 'jsload_error',
        })
      }

      try {
        new TencentCaptcha(CaptchaUtils.CaptchaAppId, callback, {
          enableDarkMode: false,
          userLanguage: navigator.language,
        }).show()
      } catch (e) {
        loadErrorCallback()
      }
    })
  }
}
