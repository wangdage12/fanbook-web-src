import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'

const indexMap: Partial<Record<RoleType, number>> = {
  [RoleType.Owner]: 0,
  [RoleType.SeniorManager]: 0,
  [RoleType.ChannelManager]: 0,
  [RoleType.Other]: 1,
  [RoleType.NormalMember]: 2,
  [RoleType.Visitor]: 3,
}
/**
 * 将角色按照类型分组, 应该在使用该方法前把 roles 过滤一遍,
 *
 * 只保留需要的角色, 同时通过 position 排序, 不应该在分组后再排序 (表单场景会混乱)
 * @param roles
 * @returns roles[][]
 */
export function rolesGroupedByType(roles: RoleStruct[]): RoleStruct[][] {
  return roles.reduce<RoleStruct[][]>((arr, role) => {
    const index = indexMap[role.t]
    if (index !== undefined) {
      let sub = arr[index]
      if (!sub) {
        sub = []
        arr[index] = sub
      }
      sub.push(role)
    }
    return arr
  }, [])
}
