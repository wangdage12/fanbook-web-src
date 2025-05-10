export enum RelationType {
  none,

  friend,

  blocked,

  pendingIncoming,

  pendingOutgoing,

  unrelated = 99,
}

//类型，1=我发起的，2=我接收
export enum RequestType {
  From = 1,
  To = 2,
}

export enum RelationAction {
  // 1=申请好友；
  apply = 1,
  // 2=好友建立完成；
  friend = 2,
  // 3=好友被删除；
  delete = 3,
  // 4=被人拒绝添加好友;
  refuse = 4,
  // 5=申请者取消
  cancel = 5,
}

export interface RelationData {
  relation_id: string
  type: RelationAction
  timestamp: number
  request_id: string
  record_id: string
}
