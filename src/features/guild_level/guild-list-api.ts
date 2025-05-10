import axios from 'axios'

export interface GuildLevelData {
  guild_id: string
  hierarchy: number
  points: number
}

export type GuildLevelConfigData = number[]

export interface HierarchyResponse {
  guild_list: GuildLevelData[]
  config: GuildLevelConfigData
}

export async function getLevel(guildIds: string[]): Promise<HierarchyResponse> {
  const res = await axios.post<undefined, HierarchyResponse>(
    '/guild/zhuli/getHierarchy',
    {
      guild_list: guildIds.map(guildId => ({ guild_id: guildId })),
    },
    {
      baseURL: import.meta.env.FANBOOK_GUILD_HOST,
    }
  )
  const config = res.config as unknown as Record<string, number>
  if (!config['0']) config['0'] = 0
  res.config = Object.values(config).sort((a, b) => a - b)
  return res
}
