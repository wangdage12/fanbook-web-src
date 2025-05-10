// noinspection JSBitwiseOperatorUsage

import EventEmitter from 'eventemitter3'
import { CircleChannelStruct } from 'fb-components/circle/types.ts'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type.ts'
import { cloneDeep, isNumber, pick } from 'lodash-es'
import { subscribe } from 'redux-subscriber'
import { store } from '../app/store'
import PermissionValue from '../base_services/permission/permissionValue'
import GuildUtils from '../features/guild_list/GuildUtils'
import { GuildRoleUpdateStruct, guildListActions } from '../features/guild_list/guildListSlice'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import { GuildUserUtils } from '../features/role/guildUserSlice'

/**
 * 请使用下面的 GuildPermission 等枚举, 不要直接使用 Permissions 这里仅列举所有所有权限
 * 不能使用 1 << n 的方式, 因为 n 可能超过 32 js 位运算只能处理 32 位的二进制数
 * @deprecated
 */
enum Permissions {
  CreateInstantInvite = 0x00000001, // 邀请链接
  KickMembers = 0x00000002, // 踢人管理
  BanMembers = 0x00000004,
  Administrator = 0x00000008, // 请勿动
  ManageChannels = 0x00000010, // 管理频道
  ManageGuild = 0x00000020, // 管理服务台
  AddReactions = 0x00000040, // 消息表态
  ViewAuditLog = 0x00000080,
  OpenLive = 0x00000100, // 开启直播
  ReplyPost = 0x00000200, // 回复动态
  ViewChannel = 0x00000400, // 查看频道
  SendMessages = 0x00000800, // 发消息
  CreatePost = 0x00001000, // 发布动态 // QuestionPost
  ManageMessages = 0x0002000, // 管理消息
  ManageBot = 0x0004000, // 管理机器人
  AttachFiles = 0x00008000, // 创建文档
  ReadMessageHistory = 0x00010000, // 查看历史消息
  MentionEveryone = 0x00020000, // 允许@所有人、@某个角色
  UseExternalEmojis = 0x00040000,
  CircleAddReaction = 0x00080000, // 点赞动态
  Connect = 0x00100000, // 语音频道-进入频道 //并入进入频道权限 https://idreamsky.feishu.cn/docx/JnfXdUt8GoC4goxfWU0cWNFmnXf
  Speak = 0x00200000, // 语音频道-发言
  MuteMembers = 0x00400000, // 语音频道-闭麦他人【控场】
  DeafenMembers = 0x00800000,
  MoveMembers = 0x01000000, // 语音频道-踢出成员【移除频道】
  Camera = 0x02000000, // 语音频道-视频
  UploadFile = 0x04000000, // 文件上传权限
  RichTextPost = 0x08000000, // 动态多段落
  ManageRoles = 0x10000000, // 管理角色成员
  ChannelManager = 0x20000000, // 频道管理员
  ManageEmojis = 0x40000000, // 管理表情符号
  ManageCircle = 0x80000000, // 管理圈子
  //前面使用了 8 位, 这里从 9 位开始
  ViewOperationLog = 0x100000000, // 查看管理日志
}

export enum GuildPermission {
  KickMembers = Permissions.KickMembers, // 踢人管理
  BanMembers = Permissions.BanMembers,
  ManageBot = Permissions.ManageBot,
  ManageGuild = Permissions.ManageGuild, // 管理服务台
  ManageRoles = Permissions.ManageRoles, // 管理角色成员
  ManageEmojis = Permissions.ManageEmojis, // 管理表情符号
  ManageChannels = Permissions.ManageChannels, // 管理频道
  ViewOperationLog = Permissions.ViewOperationLog, // 查看管理日志
  AttachFiles = Permissions.AttachFiles, // 创建在线文档
  DeafenMembers = Permissions.DeafenMembers, // 社区禁言
  ManageCircle = Permissions.ManageCircle, // 管理圈子
}

export enum QuestionPermission {
  Question = Permissions.CreatePost,
  Answer = Permissions.ReplyPost,
}

export enum SpecialPermission {
  Administrator = Permissions.Administrator,
}

export enum ChannelPermission {
  CreateInstantInvite = Permissions.CreateInstantInvite,
  React = Permissions.AddReactions,
  ViewChannel = Permissions.ViewChannel,
  SendMessage = Permissions.SendMessages,
  ManageMessages = Permissions.ManageMessages, // 管理消息
  MentionRoles = Permissions.MentionEveryone, // 允许 @ 所有人、@ 某个角色
  ChannelManager = Permissions.ChannelManager, // 频道管理员
  MentionEveryone = Permissions.MentionEveryone,
  UploadFile = Permissions.UploadFile, // 文件上传权限
}

export enum PostPermission {
  ReplyPost = Permissions.ReplyPost, // 回复帖子（圈子 + 问答）
  CreatePost = Permissions.CreatePost, // 发布帖子（圈子 + 问答）
  RichTextPost = Permissions.RichTextPost, // 动态多段落
}

export enum AudiovisualPermission {
  Speak = Permissions.Speak,
  MuteMembers = Permissions.MuteMembers,
  MoveMembers = Permissions.MoveMembers,
  Camera = Permissions.Camera,
}

export enum LivePermission {
  OpenLive = Permissions.OpenLive,
}

export type Permission =
  | SpecialPermission
  | GuildPermission
  | ChannelPermission
  | AudiovisualPermission
  | LivePermission
  | QuestionPermission
  | PostPermission

export interface PermissionDescription {
  value: Permission
  channelType: ChannelType[]
  // 社区下面展示的名称
  communityName: string
  // 频道下面展示的名称
  channelName?: string
  // 社区下面展示的描述
  communityDesc: string
  // 频道下面的描述
  channelDesc?: string
}

export const permissionDescriptionMap: Partial<Record<Permission, PermissionDescription>> = {
  [GuildPermission.ManageGuild]: {
    value: GuildPermission.ManageGuild,
    channelType: [],
    communityName: '管理社区',
    communityDesc: '允许成员修改社区名称、头像和背景图、设置今日推荐频道；设置社区欢迎语开关及显示频道；管理机器人；查看社区数据。',
  },
  [GuildPermission.ManageChannels]: {
    value: GuildPermission.ManageChannels,
    channelType: [],
    communityName: '管理频道与话题',
    channelName: '编辑频道资料',
    communityDesc: '允许成员创建、编辑、删除频道和话题。',
    channelDesc: '拥有此权限的成员，可以更改频道名字、主题，删除频道；该权限继承社区下的“管理频道”',
  },
  [GuildPermission.ManageBot]: {
    value: GuildPermission.ManageBot,
    channelType: [ChannelType.guildText],
    communityName: '管理机器人',
    communityDesc: '允许成员添加、移除机器人，设置机器人的使用范围',
  },
  [GuildPermission.ManageEmojis]: {
    value: GuildPermission.ManageEmojis,
    channelType: [],
    communityName: '管理社区表情',
    communityDesc: '允许成员设置社区专属表情包。',
  },
  [GuildPermission.ViewOperationLog]: {
    value: GuildPermission.ViewOperationLog,
    channelType: [],
    communityName: '管理日志',
    communityDesc: '允许成员查看社区管理日志。',
  },
  [ChannelPermission.ManageMessages]: {
    value: ChannelPermission.ManageMessages,
    channelType: [ChannelType.guildText],
    communityName: '管理消息',
    channelName: '谁可以管理消息',
    communityDesc: '允许撤回频道内其他成员的消息，以及设置精选和置顶消息。',
    channelDesc: '拥有此权限的成员，可以撤回频道内其他成员的消息，以及设置精选和置顶消息。',
  },
  [GuildPermission.ManageCircle]: {
    value: GuildPermission.ManageCircle,
    channelType: [],
    communityName: '管理圈子',
    communityDesc: '允许成员修改圈子资料、设置圈子置顶、删除动态和回复。',
  },
  [GuildPermission.AttachFiles]: {
    value: GuildPermission.AttachFiles,
    channelType: [],
    communityName: '创建在线文档',
    communityDesc: '允许成员在社区内创建在线文档。',
  },
  [ChannelPermission.CreateInstantInvite]: {
    value: ChannelPermission.CreateInstantInvite,
    channelType: [],
    communityName: '创建邀请',
    communityDesc: '允许成员创建邀请链接邀请好友加入社区。',
    channelDesc: '拥有此权限的成员，可以邀请好友加入频道',
  },
  [GuildPermission.KickMembers]: {
    value: ChannelPermission.CreateInstantInvite,
    channelType: [],
    communityName: '移除和拉黑成员',
    communityDesc: '允许成员移出比自身身份组权限低的其他身份组成员，管理社区黑名单。',
  },
  [GuildPermission.ManageRoles]: {
    value: GuildPermission.ManageRoles,
    channelType: [],
    communityName: '管理身份组',
    communityDesc: '允许成员创建新身份组，可编辑或删除比自身身份组权限低的身份组。',
    channelName: '管理频道权限',
    channelDesc:
      '拥有此权限的成员，可以在当前频道范围内，管理其他身份组的权限（其中，其他身份组在身份组列表中低于该身份组及成员，权限只能是该身份组及成员已拥有的）；该权限继承社区下的“管理身份组”',
  },
  [GuildPermission.DeafenMembers]: {
    value: GuildPermission.DeafenMembers,
    channelType: [],
    communityName: '社区禁言',
    communityDesc: '允许成员禁言在身份组列表中低于自身身份组的其他成员；禁言范围包括聊天、圈子互动以及音视频发言。',
  },
  [SpecialPermission.Administrator]: {
    value: SpecialPermission.Administrator,
    channelType: [],
    communityName: '超级管理员',
    communityDesc: '允许成员拥有完整的管理权限，也能绕开频道的特定权限或限制（比如：访问所有私密频道）。此权限属于高危权限，请谨慎授予。',
  },
  [ChannelPermission.ChannelManager]: {
    value: ChannelPermission.ChannelManager,
    channelType: [],
    communityName: '管理频道内容和设置项',
    channelName: '频道管理员',
    communityDesc: '允许成员管理具备权限的频道的内容及对应设置项。',
  },
}

export const PERMISSION_ALL = new PermissionValue(~0)
const CHANNEL_PERMISSION_ALL = (Object.values(ChannelPermission).filter(p => isNumber(p)) as number[]).reduce((a, b) => a | b, 0)
export const PERMISSION_NONE = new PermissionValue(0)

export enum PermissionEvent {
  GuildRoleAssigned = 'guildRoleCreatedOrDeleted',
  OverwriteUpdated = 'overwriteUpdated',
  GuildRoleUpdated = 'guildRoleUpdated',
  GuildCircleUpdated = 'guildCircleUpdated',
}

export interface GuildRoleAssignmentEvent {
  guildId: string
  userId: string
}

type PartialGuildStruct = Pick<GuildStruct, 'guild_id' | 'roles' | 'permissions' | 'owner_id'>

export class PermissionService {
  static stream = new EventEmitter()

  /**
   * 获取社区的 everyone 权限值
   * @param guild
   */
  private static getEveryonePermission(guild: GuildStruct): number {
    return guild.roles[guild.guild_id]?.permissions ?? 0
  }

  /**
   * 计算社区的基础权限，可用于判断社区权限。
   *
   * 关于判断拥有任意权限，或者是某个权限，或是全部权限的方法，参见 `PermissionValue` 类型。
   *
   * @see PermissionValue
   * @param guild
   * @param member 用户 ID
   * @private
   */
  public static computeGuildPermission(guild: PartialGuildStruct | null | undefined, member: string): PermissionValue {
    if (!guild) return PERMISSION_ALL
    if (member == guild.owner_id) {
      return PERMISSION_ALL
    }
    let permissions = guild.permissions | this.getEveryonePermission(guild as never)

    const roles = GuildUserUtils.getRoleIds(guild.guild_id, member)
      .map(roleId => guild.roles[roleId])
      .filter(e => !!e)

    for (const role of roles) {
      permissions |= role.permissions
    }

    if (permissions & SpecialPermission.Administrator) {
      return PERMISSION_ALL
    }

    return new PermissionValue(permissions)
  }

  /**
   * 计算频道权限覆盖
   *
   * @param basePermission  由 `computeBasePermission` 得出的基础权限值
   * @param member          用户 ID
   * @param guildId
   * @param channelId
   * @private
   */
  static computeOverwrite(basePermission: number | PermissionValue, member: string, guildId: string, channelId: string): PermissionValue {
    if (new PermissionValue(basePermission.valueOf()).and(SpecialPermission.Administrator).valueOf()) {
      return PERMISSION_ALL
    }
    // 可能是圈子频道
    const channel = GuildUtils.getAnyChannelById(guildId, channelId)

    if (!channel || !channel.overwrite) {
      return PERMISSION_NONE
    }

    // 应用频道 everyone 权限
    let permissions = basePermission.valueOf()
    const overwriteEveryone = channel.overwrite[channel.guild_id]
    if (overwriteEveryone) {
      permissions &= ~overwriteEveryone.deny
      permissions |= overwriteEveryone.allows
    }

    // 应用角色权限
    let allow = PERMISSION_NONE
    let deny = PERMISSION_NONE

    const roles = GuildUserUtils.getRoleIds(channel.guild_id, member)
    for (const roleId of roles) {
      const overwriteRole = channel.overwrite[roleId]
      if (overwriteRole) {
        allow = new PermissionValue(allow.valueOf() | overwriteRole.allows)
        deny = new PermissionValue(allow.valueOf() | overwriteRole.deny)
      }
    }

    permissions &= ~deny
    permissions |= allow.valueOf()

    // 应用用户权限覆盖
    const overwriteMember = channel.overwrite[member]
    if (overwriteMember) {
      permissions &= ~overwriteMember.deny
      permissions |= overwriteMember.allows
    }

    if (permissions & ChannelPermission.ChannelManager) {
      return new PermissionValue(permissions | CHANNEL_PERMISSION_ALL)
    }

    return new PermissionValue(permissions)
  }

  /**
   * 计算用户的权限值，这个值可以拿来计算用户是否具有某个频道权限，内部调用 `computeBasePermission` 和 `computeOverwrite`。
   *
   * 关于判断拥有任意权限，或者是某个权限，或是全部权限的方法，参见 `PermissionValue` 类型。
   *
   * @see PermissionValue
   *
   * @param guild     社区
   * @param channelId
   * @param member    用户 ID
   * @private
   */
  public static computeChannelPermissions(guild: GuildStruct | undefined | null, channelId: string, member: string): PermissionValue {
    if (!guild) return PERMISSION_ALL
    const basePermissions = this.computeGuildPermission(guild, member)
    return this.computeOverwrite(basePermissions.valueOf(), member, guild.guild_id, channelId)
  }

  /**
   * 计算某个权限是否指定人员拥有
   * @param guildId     社区id
   * @param channelId   频道id
   * @param permission  需要判断的权限，默认为查看频道
   */
  public static isPrivateChannel(guildId: string, channelId: string, permission: Permission = ChannelPermission.ViewChannel): boolean {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return false
    // 可能是圈子频道
    const channel = GuildUtils.getAnyChannelById(guild, channelId)
    if (!channel || !channel.overwrite) return false

    let permissions = guild.permissions | this.getEveryonePermission(guild)
    const overwriteEveryone = channel.overwrite[channel.guild_id]
    if (overwriteEveryone) {
      permissions &= ~overwriteEveryone.deny
      permissions |= overwriteEveryone.allows
    }

    return !(permissions & permission)
  }

  /**
   * 计算某个频道的频道管理员人员 ids
   * @param guildId     社区id
   * @param channelId   频道id
   */
  public static getChannelManagerIds(guildId: string, channelId: string): string[] {
    return this.splitAllowedRolesAndUsersFromOverwrites(guildId, channelId, ChannelPermission.ChannelManager).users
  }

  /// 计算指定角色在频道权限覆盖下所拥有的权限值
  static computeOverwriteWithRole(guildId: string, channelId: string, roleId: string) {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return PERMISSION_NONE
    let permissions = new PermissionValue(guild.permissions).add(this.getEveryonePermission(guild))
    const role = guild?.roles[roleId]
    if (!role) return permissions

    // 计算everyone基础权限
    const everyOneRole = guild.roles[guild.guild_id]
    if (everyOneRole) permissions = permissions.add(everyOneRole.permissions)

    // 计算指定角色基础权限
    permissions = permissions.add(role.permissions)

    // 获取指定频道下的权限覆盖
    const channel = GuildUtils.getAnyChannelById(guild, channelId)
    const overwrite = channel?.overwrite ?? {}

    // 计算指定频道下everyone角色的overwrite
    const everyoneOverwrite = overwrite[guild.guild_id]
    if (everyoneOverwrite) {
      permissions = permissions.remove(everyoneOverwrite.deny)
      permissions = permissions.add(everyoneOverwrite.allows)
    }

    // 计算指定频道下的指定角色的overwrite
    const roleOverwrite = overwrite[roleId]
    if (roleOverwrite) {
      permissions = permissions.remove(roleOverwrite.deny)
      permissions = permissions.add(roleOverwrite.allows)
    }

    return permissions
  }

  /**
   * 获取频道管理员数量, 如果传入channelId则返回该频道管理员数量, 否则返回所有频道管理员数量
   * @returns
   */
  public static getChannelManagerCount({ guildId, channelId }: { guildId?: string; channelId?: string }): number {
    if (!guildId) return 0
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return 0
    const tempChannels = Object.values(guild.channels)
    const roleViewChannels = tempChannels.filter(channel => {
      // 圈子频道 即将下线 忽略 FIXME
      if (channel.type === ChannelType.Category || channel.type === ChannelType.unsupported || channel.type === ChannelType.CircleTopic) return false
      //过滤自己不能查看的频道
      return PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId).has(ChannelPermission.ViewChannel)
    })

    if (channelId) {
      const channel = tempChannels.find(e => e.channel_id === channelId) ?? (guild.circle?.channel_id === channelId ? guild.circle : undefined)
      return channel ? PermissionService.getChannelManagerIds(guildId, channel.channel_id).length : 0
    }
    // 圈子频道 即将下线 忽略 FIXME
    // const circleChannels = await CircleUtil.getCircleChannels(guildId)
    // if (circleChannels.length > 0) {
    //   const idSet = new Set(roleViewChannels.map(e => e.id))
    //   circleChannels = circleChannels.filter(e => !idSet.has(e.id) && PermissionUtils.isChannelVisible(guildPermission, e.id))
    //   roleViewChannels.push(...circleChannels)
    // }
    let count = roleViewChannels.reduce((count, channel) => count + PermissionService.getChannelManagerIds(guildId, channel.channel_id).length, 0)
    count = guild.circle ? PermissionService.getChannelManagerIds(guildId, guild.circle.channel_id).length + count : count
    return count
  }

  /**
   * 从频道权限覆盖中分离出允许的角色和用户
   *
   * @param guildId     社区id
   * @param channelId   频道id
   * @param permission
   */
  public static splitAllowedRolesAndUsersFromOverwrites(guildId: string, channelId: string, permission: Permission) {
    const overwrites = GuildUtils.getAnyChannelById(guildId, channelId)?.overwrite
    if (!overwrites) return { roles: [], users: [] }

    const roles: string[] = []
    const users: string[] = []
    for (const overwrite of Object.values(overwrites)) {
      if (!new PermissionValue(overwrite.allows).has(permission)) continue

      if (overwrite.action_type === 'role') {
        roles.push(overwrite.id)
      } else {
        users.push(overwrite.id)
      }
    }
    return { roles, users }
  }

  /**
   * 计算所有频道可见性
   */
  static computeAllChannelsVisibility = (guildId?: string): Record<string, boolean> => {
    const map: Record<string, boolean> = {}
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return map
    const hasManageChannelPermission = PermissionService.computeGuildPermission(guild, LocalUserInfo.userId).has(GuildPermission.ManageChannels)
    let category: ChannelStruct | undefined
    for (const channel of guild.channel_lists.map(id => guild.channels[id])) {
      if (!channel) continue
      if (channel.type === ChannelType.Category) {
        category = channel
        map[category.channel_id] = hasManageChannelPermission
      } else {
        map[channel.channel_id] = PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId).has(
          ChannelPermission.ViewChannel
        )
        // 如果任意一个子频道可见，那么分类可见
        if (category && !map[category.channel_id] && map[channel.channel_id]) {
          map[category.channel_id] = true
        }
      }
    }
    return map
  }

  /**
   * 监听指定权限的变化，当权限发生变化时，会触发回调。此方法会控制触发粒度，如果权限相关设置变化不会影响到指定的权限，那么不会触发回调。
   *
   * 如果权限设置影响到了指定的权限，即使计算结果一致，还是会触发回调，不过这一种情况应该不会触发，不需要担心影响性能。
   *
   * 在能够使用 hooks 的场景直接使用 `usePermissions` 更简单。
   *
   * @param permissions       需要监听的权限，可以传入多个权限，用 | 运算组合
   * @param callback          回调函数，当权限发生变化时会触发
   * @param guildId           社区 ID，如果不传，那么会认为不在社区维度，所有权限都是允许的
   * @param channelId         如果监听的是频道权限需要传入频道 ID
   * @param immediateTrigger  是否立即触发回调，如果为 true，那么会立即触发回调，否则只有当权限发生变化时才会触发回调
   */
  public static listenPermissions(
    permissions: number,
    callback: (permissionVal: PermissionValue) => void,
    { guildId, channelId, immediateTrigger }: { guildId?: string; channelId?: string; immediateTrigger?: boolean }
  ): () => void {
    const emptyCallback = () => {
      /* */
    }
    // 不在社区维度不存在权限，所有直接视为允许，并不会触发更新回调
    if (!guildId || guildId === '0') {
      if (immediateTrigger) callback(PERMISSION_ALL)
      return emptyCallback
    }

    const guild = pick(GuildUtils.getGuildById(guildId), ['guild_id', 'roles', 'permissions', 'owner_id']) as PartialGuildStruct
    // 如果角色权限值变化，需要更新以确保计算正确，所以要深拷贝一份
    guild.roles = cloneDeep(guild.roles)
    if (!guild) return emptyCallback

    const uid = LocalUserInfo.userId

    // 监听用户在社区内的角色发生变化
    const unsubscribeGuildRolesUpdated = subscribe(`guildUsers.${guildId}.${uid}.roles`, recalculate)

    // 监听社区圈子信息的变化
    function listenGuildCircleUpdated(data: CircleChannelStruct) {
      // 如果当前圈子频道是变化的频道
      if (data.channel_id === channelId) {
        recalculate()
      }
    }

    PermissionService.stream.on(PermissionEvent.GuildCircleUpdated, listenGuildCircleUpdated)

    // 监听频道权限变化事件
    function listenOverwriteUpdated(data: PermissionOverwrite) {
      // 如果当前频道是变化的频道
      if (data.channel_id === channelId) {
        // 如果是当前频道的角色权限变化
        if (data.action_type === 'role') {
          // 如果改变的是 everyone，需要重新计算
          if (data.id === guildId) {
            recalculate()
          } else {
            if (guildId) {
              const roles = GuildUserUtils.getRoleIds(guildId, uid)
              // 如果改变的角色包含我的角色，需要重新计算
              if (roles.includes(data.id)) {
                recalculate()
              }
            }
          }
        }
        // 如果改变的用户的权限
        else {
          // 如果改变的是我的权限，需要重新计算
          if (data.id === uid) {
            recalculate()
          }
        }
      }
    }

    PermissionService.stream.on(PermissionEvent.OverwriteUpdated, listenOverwriteUpdated)

    // 监听和处理角色权限发生变化
    function listenRoleUpdated(data: GuildRoleUpdateStruct) {
      // 如果改变的是当前社区
      if (data.guild_id == guildId) {
        const roles = GuildUserUtils.getRoleIds(guildId, uid)
        // 如果改变的角色包含我的角色，需要重新计算
        if (roles.includes(data.roles.role_id)) {
          if (guild?.roles?.[data.roles.role_id]?.permissions) {
            guild.roles[data.roles.role_id].permissions = data.roles.permissions
          }
          recalculate()
        }
      }
    }

    PermissionService.stream.on(PermissionEvent.GuildRoleUpdated, listenRoleUpdated)

    function recalculate() {
      if (guildId && guild) {
        let permissionVal = PermissionService.computeGuildPermission(guild, uid)
        if (channelId) {
          permissionVal = PermissionService.computeOverwrite(permissionVal, uid, guild.guild_id, channelId)
        }
        callback(new PermissionValue(permissionVal.and(permissions).valueOf()))
      } else {
        // 不在社区维度不存在权限，所有直接视为允许
        callback(PERMISSION_ALL)
      }
    }

    if (immediateTrigger) recalculate()

    return () => {
      unsubscribeGuildRolesUpdated()
      PermissionService.stream.off(PermissionEvent.OverwriteUpdated, listenOverwriteUpdated)
      PermissionService.stream.off(PermissionEvent.GuildRoleUpdated, listenRoleUpdated)
      PermissionService.stream.off(PermissionEvent.GuildCircleUpdated, listenGuildCircleUpdated)
    }
  }
}

export const handleChannelPermissionUpdate = ({ data }: { data: PermissionOverwrite }) => {
  store.dispatch(guildListActions.updateChannelPermission(data))
  PermissionService.stream.emit(PermissionEvent.OverwriteUpdated, data)
}
