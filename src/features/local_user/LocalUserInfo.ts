// 这个类的存在主要是为了解决循环引用的问题，因此本文件不应该引入任何其他文件
// 未来可以把 redux 的 localUser 移动到这里

export default class LocalUserInfo {
  // 在用户未登录的情况下它是 undefined，但是取的场景都是在用户已经登录的情况下，所以类型定义为 truthy.
  static userId: string
}
