import { LogClassify, LogModule } from '../../guild_container/guildAPI'

export const classifyLabel = {
  [LogClassify.GuildAdd]: '创建社区',
  [LogClassify.GuildSetting]: '更新社区设置',
  [LogClassify.ChannelAdd]: '创建频道',
  [LogClassify.ChannelCategoryAdd]: '创建频道分类',
  [LogClassify.ChannelSetting]: '更新频道设置',
  [LogClassify.RoleAdd]: '创建身份组',
  [LogClassify.RoleSetting]: '更新身份组设置',
  [LogClassify.LinkUpdate]: '更新邀请链接',
  [LogClassify.UserSetting]: '管理成员',
  [LogClassify.LinkSetting]: '设置关联应用',
  [LogClassify.EmojiSetting]: '更新表情包',
  [LogClassify.CircleSubChannelSetting]: '更新圈子频道设置',
  [LogClassify.CircleSetting]: '更新圈子设置',
  [LogClassify.CircleDynamicSetting]: '更新动态设置',
}

export const moduleMap = {
  [LogModule.Guild]: { name: '社区', sub: [LogClassify.GuildAdd, LogClassify.GuildSetting] },
  [LogModule.Channel]: { name: '频道', sub: [LogClassify.ChannelAdd, LogClassify.ChannelCategoryAdd, LogClassify.ChannelSetting] },
  [LogModule.Role]: { name: '身份组', sub: [LogClassify.RoleAdd, LogClassify.RoleSetting] },
  [LogModule.User]: { name: '成员管理', sub: [LogClassify.LinkUpdate, LogClassify.UserSetting] },
  [LogModule.Other]: { name: '其他', sub: [LogClassify.LinkSetting, LogClassify.EmojiSetting] },
  [LogModule.Circle]: { name: '圈子', sub: [LogClassify.CircleSubChannelSetting, LogClassify.CircleSetting, LogClassify.CircleDynamicSetting] },
}

const defaultColor = 'var(--fg-b40)'
const addColor = 'var(--function-green-1)'
const settingColor = 'var(--fg-blue-1)'

export const defaultIcon = { name: 'UnknownOperation', color: [defaultColor, settingColor] }

export const logItemIconMap = {
  [LogClassify.GuildAdd]: { name: 'ServerAdd', color: [defaultColor, addColor] },
  [LogClassify.GuildSetting]: { name: 'ServerSetting', color: [defaultColor, settingColor] },
  [LogClassify.ChannelAdd]: { name: 'ChannelAdd', color: [defaultColor, addColor] },
  [LogClassify.ChannelCategoryAdd]: { name: 'ChannelAdd', color: [defaultColor, addColor] },
  [LogClassify.ChannelSetting]: { name: 'ChannelSetting', color: [defaultColor, settingColor] },
  [LogClassify.RoleAdd]: { name: 'UserShieldAdd', color: [defaultColor, addColor] },
  [LogClassify.RoleSetting]: { name: 'UserShieldSetting', color: [defaultColor, settingColor] },
  [LogClassify.LinkUpdate]: { name: 'LinkAdd', color: [defaultColor, addColor] },
  [LogClassify.UserSetting]: { name: 'UserSetting', color: [defaultColor, settingColor] },
  [LogClassify.LinkSetting]: { name: 'LinkSetting', color: [defaultColor, settingColor] },
  [LogClassify.EmojiSetting]: { name: 'EmojiSetting', color: [defaultColor, settingColor] },
  [LogClassify.CircleSubChannelSetting]: { name: 'DoubleCircleSetting', color: [defaultColor, settingColor] },
  [LogClassify.CircleSetting]: { name: 'DoubleCircleSetting', color: [defaultColor, settingColor] },
  [LogClassify.CircleDynamicSetting]: { name: 'DoubleCircleSetting', color: [defaultColor, settingColor] },
}
