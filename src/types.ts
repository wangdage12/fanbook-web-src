/**
 * 只能存放全局通用的类型定义
 */

import { SwitchType } from 'fb-components/struct/type'

export enum LoadStatus {
  idle,
  loading,
  success,
  failed,
}

export interface FbHttpResponse<T> {
  status: boolean
  data: T
  code: number
  message: string
  desc: string
}

/**
 * 分页接口的返回值
 */

interface CommonFields {
  next: number | string
  hasMore?: boolean
}

export type PaginationResp<T, ListFieldName extends string = 'list'> = {
  [k in ListFieldName]: T[]
} & {
  last_id?: string
  session?: string
} & CommonFields

export type PaginationResp2<T> = {
  list: T[]
  from?: string
  session?: string
} & CommonFields

export type PaginationResp3<T, ListFieldName extends string = 'records', LastIdFieldName extends string = 'list_id', ExtraFields = CommonFields> = {
  [k in ListFieldName]: T[]
} & { [k in LastIdFieldName]?: string } & { size?: number } & ExtraFields

export type PaginationResp4<T> = {
  list_id: string
  page: number
  page_size: number
  next: boolean
  list: T[]
}

// 取反函数
export function invertSwitchType(switchType: SwitchType): SwitchType {
  return switchType === SwitchType.No ? SwitchType.Yes : SwitchType.No
}
