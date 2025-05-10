import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { useEffect, useState } from 'react'
import GuildAPI from '../guild_container/guildAPI.ts'
import InviteApi, { InviteCodeInfo } from './invite_api.ts'
import { InviteUtils } from './utils.tsx'

export default function useInviteLink(url: string, returnGildInfo: boolean) {
  const [loading, setLoading] = useState(true)
  const [codeInfo, setCodeInfo] = useState<InviteCodeInfo | undefined>()
  const [guildInfo, setGuildInfo] = useState<GuildStruct | undefined>()

  const fetchData = async (code: string) => {
    try {
      const codeInfo = await InviteApi.getInviteCodeInfo(code)
      if (codeInfo.status == '1' && returnGildInfo) {
        const guildInfo = await GuildAPI.getGuildInfo(codeInfo.guild_id)
        setGuildInfo(guildInfo)
      }
      setCodeInfo(codeInfo)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    const code = InviteUtils.parseCodeFromLink(url)
    if (!code) {
      setLoading(false)
    } else {
      fetchData(code).then()
    }
  }, [])
  return { loading, codeInfo, guildInfo }
}
