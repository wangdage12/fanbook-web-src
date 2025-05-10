import { tryJSONParse } from 'fb-components/utils/safeJSONParse'

// 'guild_member_dm_friend_setting', 'banner_config', 'icon_dynamic'
export function handleUpdate<T extends Record<string, any>>(data: Record<string, any>) {
  const result = {} as T
  for (const [key, value] of Object.entries(data)) {
    const [needReplace, handleValue] = tryJSONParse(value)
    //@ts-expect-error 暂时屏蔽
    result[key] = needReplace ? handleValue : value
  }
  return result
}
