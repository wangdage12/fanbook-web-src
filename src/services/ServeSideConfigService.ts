import axios from 'axios'
import { SwitchType } from 'fb-components/struct/type.ts'
import CaptchaUtils from '../utils/CaptchaUtils.tsx'

interface ServerSideConfig {
  upgrade: Upgrade
  h5_url: never
  tx_doc: TxDoc
  image_audit: string
  text_audit: string
  audit_type: number
  isoCode: string
  geo_region: string
  upload_setting: UploadSetting
  video_max: number
  bot: Bot
  invite_code_exclude: string[]
  grey_rule: GreyRule
  send_msg: number
  guser_outside_max_role: number
  guser_outside_max_role_member: number
  flow_guild: string
  grey: Grey
  circle: CircleSetting
  change_guild_name_time: number
  client_content_review: number
  discover_white_guilds: string[]
  abtest_hot_circle: number
  abtest_guilds: string[]
  member_list_version: number
  url_unparsed: number
  guild_level_config: { [key: string]: number }[]
  equity_level_bots: string[]
  equity_payment: number
  note: Note
  device_list_hide: number
  public_topic_open: number
  live_guild_shop_url: Record<string, string>
  t_captcha: { app_id: string }
  setting?: {
    risk_domain: string
    risk_intercept_url: string
    risk_switch: 0 | 1
  }
  circle_top: SwitchType
  // 圈子标签数量限制
  post_tag_limit: number
  // 圈子@数量限制
  post_at_limit: number
  // 通用方法
  isCircleUseRainbowHot: (guildId: string) => boolean
}

interface Bot {
  official_operation_bot_id: string
  auto_reply_audit_failed_messages: AutoReplyAuditFailedMessage[]
}

interface AutoReplyAuditFailedMessage {
  bot_id: string
  content?: string
}

interface CircleSetting {
  post_tag_limit: number
  post_at_limit: number
  recommend_tag_limit: number
  tag_post_filter_all: number
}

interface Grey {
  permission_enable: number
}

interface GreyRule {
  circle_list_icon: string
  circle_pic_view: string
}

interface Note {
  live: string
}

interface TxDoc {
  env_id: string
  env_name: string
  can_comment: boolean
}

interface Upgrade {
  is_upgrade: string
  version: string
  download: string
  is_enforce: string
  content: string
}

interface UploadSetting {
  size: number
  upload_number: number
  download_number: number
  download_last_day: number
}

const serverSideConfig: ServerSideConfig = Object.create({
  isCircleUseRainbowHot: (guildId: string) => {
    const { abtest_hot_circle = 0, abtest_guilds = [] } = serverSideConfig
    return abtest_hot_circle == 2 || (abtest_hot_circle == 1 && abtest_guilds.includes(guildId))
  },
  post_tag_limit: 20,
  post_at_limit: 20,
  upload_setting: {
    size: 500,
  },
} as ServerSideConfig)

export function initServerSideConfigService() {
  axios
    .post<never, ServerSideConfig>('/api/common/setting', {
      'axios-retry': {
        retries: Infinity,
      },
    })
    .then(res => {
      Object.assign(serverSideConfig, res)
    })
}

export function initServerSideConfigServiceWithNoAuth() {
  axios
    .post<never, ServerSideConfig>('/api/common/alipay', {
      'axios-retry': {
        retries: Infinity,
      },
    })
    .then(res => {
      Object.assign(serverSideConfig, res)
      if (res.t_captcha.app_id) CaptchaUtils.CaptchaAppId = res.t_captcha.app_id
    })
}
export default serverSideConfig
