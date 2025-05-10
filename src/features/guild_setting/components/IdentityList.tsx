import FbModal from 'fb-components/base_ui/fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast'
import { CircleChannelStruct } from 'fb-components/circle/types'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type'
import { isEqual } from 'lodash-es'
import { useEffect, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useAppSelector } from '../../../app/hooks'
import EmptyPage from '../../../components/EmptyPage'
import ItemSkeleton from '../../../components/realtime_components/item/ItemSkeleton'
import UserItem from '../../../components/realtime_components/item/UserItem'
import { ChannelPermission, PERMISSION_NONE, PermissionService, handleChannelPermissionUpdate } from '../../../services/PermissionService'
import GuildUtils from '../../guild_list/GuildUtils'
import { guildListSelectors } from '../../guild_list/guildListSlice'
import { RoleAPI, RoleMemberItem } from '../../role/roleAPI'
import showIdentityPickerModal, { IdentityType } from './IdentityPicker'

type Editable = {
  add?: boolean
  remove?: boolean
}

function processEditable(editable: boolean | Editable): Editable {
  if (typeof editable === 'boolean') {
    return {
      add: editable,
      remove: editable,
    }
  } else {
    return {
      add: editable.add ?? false,
      remove: editable.remove ?? false,
    }
  }
}

function IdentityList({
  editable = true,
  beforeEdit = () => {},
  title = '当前人员',
  role,
  channel,
  className = '',
}: {
  editable?: boolean | Editable
  beforeEdit?: () => void | Promise<void>
  title?: string
  role?: RoleStruct
  channel?: ChannelStruct | CircleChannelStruct
  className?: string
}) {
  const guildId = GuildUtils.getCurrentGuildId()
  const { add, remove } = processEditable(editable)
  const { role_id: roleId, t: roleType } = role ?? ({} as RoleStruct)
  const rootRole = useAppSelector(guildListSelectors.rootRole(guildId), isEqual)
  const [list, setList] = useState<RoleMemberItem[]>([])
  const memberCount = (role?.t == RoleType.ChannelManager ? list?.length : role?.member_count) ?? 0
  const [loading, setLoading] = useState<boolean>(false)
  const lastIdRef = useRef<string | undefined>(undefined)
  const loadingRef = useRef<boolean>(false)
  const hasMoreRef = useRef<boolean>(true)
  const getMemberList = async (init?: boolean) => {
    if (init) {
      setList([])
      lastIdRef.current = undefined
      hasMoreRef.current = true
    }
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    setLoading(true)
    if (!guildId || !roleId) return
    const result = await RoleAPI.getRoleMembers({ guildId, roleId, lastId: lastIdRef.current })
    const { data, last_id, next } = result
    setList(_list => [..._list, ...data])
    setLoading(false)
    lastIdRef.current = last_id
    hasMoreRef.current = next == '1'
    loadingRef.current = false
  }

  const [selectedChannelManagerId, setSelectedChannelManagerId] = useState<string[]>([])

  const getSelectedChannelManagerId = () => {
    if (!guildId || !channel?.channel_id || roleType != RoleType.ChannelManager) {
      setSelectedChannelManagerId([])
      return
    }
    setSelectedChannelManagerId(PermissionService.getChannelManagerIds(guildId, channel.channel_id))
  }

  useEffect(() => {
    getSelectedChannelManagerId()
  }, [guildId, channel?.channel_id, roleType])

  const onDelete = (userId: string) => {
    FbModal.error({
      title: '删除确认',
      content: '确认删除该成员吗？',
      onOk: async () => {
        try {
          if (!guildId || !roleId) throw new Error('guildId or roleId is undefined')
          // 频道管理员
          if (roleType == RoleType.ChannelManager) {
            await RoleAPI.updateOverwrite({
              id: userId,
              guildId,
              channelId: channel?.channel_id,
              allows: PERMISSION_NONE.valueOf(),
              deny: PERMISSION_NONE.valueOf(),
              actionType: 'user',
            })
            const overwrite: PermissionOverwrite = {
              id: userId,
              guild_id: guildId,
              channel_id: channel?.channel_id ?? '',
              allows: PERMISSION_NONE.valueOf(),
              deny: PERMISSION_NONE.valueOf(),
              action_type: 'user',
            }
            handleChannelPermissionUpdate({ data: overwrite })
            getSelectedChannelManagerId()
          } else {
            await RoleAPI.deleteRoleMember({ guildId, roleId, userIds: [userId] })
            getMemberList(true)
          }
        } catch (error) {
          console.error(error)
          FbToast.open({ type: 'error', content: '删除成员失败', key: 'deleteMember' })
          return
        }
        FbToast.open({ type: 'success', content: '删除成员成功', key: 'deleteMember' })
      },
    })
  }

  const onAdd = async () => {
    await beforeEdit()
    if (!guildId || !roleId) return
    showIdentityPickerModal({
      guildId,
      channelId: channel?.channel_id,
      onConfirm: async ({ userIds }) => {
        try {
          if (!guildId || !roleId) throw new Error('guildId or roleId is undefined')
          // 频道管理员
          if (roleType == RoleType.ChannelManager) {
            const permissionOverwrites = userIds.map(userId => ({
              id: userId,
              allows: ChannelPermission.ChannelManager,
              deny: PERMISSION_NONE.valueOf(),
              action_type: 'user',
            })) as Omit<PermissionOverwrite, 'channel_id' | 'guild_id'>[]

            await RoleAPI.updateOverwrites({
              guildId,
              channelId: channel?.channel_id ?? '',
              permissionOverwrites,
            })
            permissionOverwrites.forEach(overwrite => {
              handleChannelPermissionUpdate({
                data: {
                  ...overwrite,
                  guild_id: guildId,
                  channel_id: channel?.channel_id ?? '',
                },
              })
            })
            getSelectedChannelManagerId()
          } else {
            await RoleAPI.addRoleMember({ guildId, roleId, userIds })
            getMemberList(true)
          }
        } catch (error) {
          console.error(error)
          FbToast.open({ type: 'error', content: '添加成员失败', key: 'addMember' })
          return
        }
        FbToast.open({ type: 'success', content: '添加成员成功', key: 'addMember' })
      },
      checkIfSelected: info => {
        if (info.type === IdentityType.Role) return false
        return (
          selectedChannelManagerId.includes(info.userId) ||
          // 频道主不能添加到普通成员
          (role?.t == RoleType.NormalMember && info.roleIds.includes(rootRole?.role_id ?? '')) ||
          list.some(item => item.user_id === info.userId)
        )
      },
    })
  }

  useEffect(() => {
    if (role?.t == RoleType.ChannelManager) {
      setList(
        channel ?
          selectedChannelManagerId.map(
            userId =>
              ({
                user_id: userId,
              }) as RoleMemberItem
          )
        : []
      )
    } else {
      getMemberList(true)
    }
  }, [role, selectedChannelManagerId])

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div className={'flex gap-2'}>
        <div className={'flex-1 py-2 text-sm font-medium text-[var(--fg-b100)]'}>
          {title}
          {memberCount > 0 ? `（${memberCount} 人）` : null}
        </div>
        {add && (
          <div className={'flex cursor-pointer items-center gap-2 text-[var(--fg-blue-1)]'} onClick={onAdd}>
            <iconpark-icon name="UserAdd"></iconpark-icon>
            添加成员
          </div>
        )}
      </div>

      <div className={'flex-1'}>
        {list.length > 0 || !loading ?
          list.length > 0 ?
            <Virtuoso
              data={list}
              className="mx-[-24px] px-[24px] [&>*]:!w-[calc(100%-48px)]"
              endReached={() => {
                if (role?.t == RoleType.ChannelManager) return
                getMemberList()
              }}
              itemContent={(index, user) => {
                return (
                  <UserItem
                    key={user.user_id}
                    value={user.user_id}
                    guildId={guildId}
                    className="group/user-item"
                    suffix={
                      <iconpark-icon
                        class={`${
                          remove ? 'invisible' : '!invisible'
                        } cursor-pointer text-[var(--fg-b40)] hover:text-[var(--function-red-1)] group-hover/user-item:visible`}
                        name="CloseCircleFill"
                        size={16}
                        onClick={() => {
                          remove && onDelete(user.user_id)
                        }}
                      ></iconpark-icon>
                    }
                  />
                )
              }}
            />
          : <div className={'flex h-full w-full items-center justify-center'}>
              <EmptyPage message="" context={'暂未添加成员'}></EmptyPage>
            </div>

        : <div className={'flex flex-col'}>
            {new Array(8).fill(0).map((_, index) => (
              <ItemSkeleton key={index} />
            ))}
          </div>
        }
      </div>
    </div>
  )
}

export default IdentityList
