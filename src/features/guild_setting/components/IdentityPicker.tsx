import { Button, Checkbox, Divider, Input, Tabs, TabsProps } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { TabLabel } from 'fb-components/base_ui/fb_tabs/TabLabel'
import { RoleType } from 'fb-components/struct/GuildStruct.ts'
import { isNil } from 'lodash-es'
import isEqual from 'lodash-es/isEqual'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import EmptyData from '../../../components/EmptyData'
import ItemSkeleton from '../../../components/realtime_components/item/ItemSkeleton'
import RoleItem from '../../../components/realtime_components/item/RoleItem'
import UserItem from '../../../components/realtime_components/item/UserItem'
import GuildAPI from '../../guild_container/guildAPI.ts'
import { guildListActions, guildListSelectors } from '../../guild_list/guildListSlice'
import MemberListAPI from '../../home/MemberListAPI.ts'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import { MemberUserStruct } from '../../member_list/MemberStruct'
import { GuildUserUtils } from '../../role/guildUserSlice.ts'

export enum IdentityType {
  User = 'user',
  Role = 'role',
}

const labelMap = {
  [IdentityType.User]: '成员',
  [IdentityType.Role]: '身份组',
}

export interface IdentityUserInfo {
  userId: string
  roleIds: string[]
  type: IdentityType.User
}

export interface IdentityRoleInfo {
  roleId: string
  roleType: RoleType
  type: IdentityType.Role
}

interface IdentityPickerContentProps {
  guildId: string
  channelId?: string
  /**确定时后是否返回已经默认被选中的选项, 初始化时有用, 但由于数据不一定完整的问题, 可能会返回漏 */
  selectedInValue?: boolean
  /**选项是否已经默认被选中, 用于禁用选项 */
  checkIfSelected?: (target: IdentityUserInfo | IdentityRoleInfo) => boolean
  onConfirm?: (
    selected: { roleIds: string[]; userIds: string[] },
    defaultSelected?: {
      roleIds: string[]
      userIds: string[]
    }
  ) => void | Promise<void>
  pickerMode?: IdentityType[]
  onCancel: () => void
}

export function IdentityPickerContent({
  guildId,
  channelId,
  pickerMode = [IdentityType.User], // [IdentityType.Role, IdentityType.User],
  onConfirm,
  selectedInValue,
  checkIfSelected = () => false,
  onCancel,
}: IdentityPickerContentProps) {
  const [keyword, setKeyword] = useState('')
  const dispatch = useAppDispatch()
  const [userList, setUserList] = useState<IdentityUserInfo[]>([])
  const [searchList, setSearchList] = useState<IdentityUserInfo[]>([])
  const roles = useAppSelector(guildListSelectors.roles(guildId), isEqual)

  const defaultSelectedRef = useRef<{ roleIds: string[]; userIds: string[] }>({ roleIds: [], userIds: [] })

  const defaultDisabledRef = useRef<Record<string, boolean>>({})

  const handleCheckIfSelected = (target: IdentityUserInfo | IdentityRoleInfo) => {
    let checked = false
    switch (target.type) {
      case IdentityType.Role:
        checked = defaultSelectedRef.current.roleIds.includes(target.roleId)
        if (!checked) {
          checked = checkIfSelected(target)
          checked && defaultSelectedRef.current.roleIds.push(target.roleId)
        }
        break
      case IdentityType.User:
        checked = defaultSelectedRef.current.userIds.includes(target.userId)
        if (!checked) {
          checked = checkIfSelected(target)
          checked && defaultSelectedRef.current.userIds.push(target.userId)
        }
        break
      default:
        break
    }
    return checked
  }

  const handleCheckIsDisabled = (target: IdentityUserInfo) => {
    const { userId } = target
    const disabled = defaultDisabledRef.current[userId]
    if (!isNil(disabled)) {
      return disabled
    }
    // 频道主和比目标高的角色都可以操作
    const hasPermission = GuildUserUtils.hasOwnerRole(guildId, LocalUserInfo.userId) || GuildUserUtils.hasHigherRoleThan(guildId, userId)
    defaultDisabledRef.current[userId] = !hasPermission
    return defaultDisabledRef.current[userId]
  }

  const roleList = useMemo(() => {
    if (!roles) return []
    return Object.values(roles)
      .filter(role => !role.managed && ![RoleType.Bot, RoleType.Manager].includes(role.t))
      .sort((prev, next) => next.position - prev.position)
      .map(role => {
        return {
          roleId: role.role_id,
          roleType: role.t,
          type: IdentityType.Role,
        } as IdentityRoleInfo
      })
  }, [roles])

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [selectedIdentity, setSelectedIdentity] = useState<(IdentityUserInfo | IdentityRoleInfo)[]>([])
  const isSearch = !!keyword.trim()
  const [activeKey, setActiveKey] = useState<IdentityType>(pickerMode[0] ?? IdentityType.User)

  const memberSearch = async (keyword: string) => {
    setSearchLoading(true)
    try {
      const res = await GuildAPI.searchMember(guildId, keyword, { withRoles: true })
      setSearchList(
        res
          .filter(item => !item.bot)
          .map(item => {
            return {
              userId: item.user_id,
              roleIds: item.role_ids ?? [],
              type: IdentityType.User,
            }
          })
      )
    } catch (error) {
      console.log(error)
    }
    setSearchLoading(false)
  }

  const getUserList = async () => {
    if (!guildId) return
    setLoading(true)
    const result = await MemberListAPI.fetchMembers({ guildId, channelId: '0', start: 0, end: 99, not_sync: true })
    const { list } = result
    setTimeout(() => {
      setUserList(
        (list.filter(item => item.type === 'user') as MemberUserStruct[]).map(item => {
          return {
            userId: item.user_id,
            roleIds: item.roles ? item.roles.map(role => role.role_id) : [],
            type: IdentityType.User,
          }
        })
      )
      setLoading(false)
    }, 100)
  }

  const handleConfirm = async () => {
    setSubmitLoading(true)
    try {
      await onConfirm?.(
        {
          roleIds: selectedRoleIds,
          userIds: selectedUserIds,
        },
        selectedInValue ? defaultSelectedRef.current : undefined
      )
      onCancel()
    } catch (error) {
      console.log(error)
    }
    setSubmitLoading(false)
  }

  const deleteRole = (roleId: string) => {
    const index = selectedRoleIds.findIndex(id => id === roleId)
    if (index === -1) return
    const newSelectedRoleIds = [...selectedRoleIds]
    newSelectedRoleIds.splice(index, 1)
    setSelectedRoleIds(newSelectedRoleIds)
    setSelectedIdentity(prev => prev.filter(item => item.type !== IdentityType.Role || item.roleId !== roleId))
  }

  const deleteUser = (userId: string) => {
    const index = selectedUserIds.findIndex(id => id === userId)
    if (index === -1) return
    const newSelectedUserIds = [...selectedUserIds]
    newSelectedUserIds.splice(index, 1)
    setSelectedUserIds(newSelectedUserIds)
    setSelectedIdentity(prev => prev.filter(item => item.type !== IdentityType.User || item.userId !== userId))
  }

  const handleUserClick = (info: IdentityUserInfo) => {
    setSelectedUserIds(prev => {
      if (prev.includes(info.userId)) {
        return prev.filter(id => id !== info.userId)
      }
      return [...prev, info.userId]
    })
    setSelectedIdentity(prev => {
      if (prev.find(item => item.type === IdentityType.User && item.userId === info.userId)) {
        return prev.filter(item => item.type !== IdentityType.User || item.userId !== info.userId)
      }
      return [...prev, info]
    })
  }

  const handleRoleClick = (info: IdentityRoleInfo) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(info.roleId)) {
        return prev.filter(id => id !== info.roleId)
      }
      return [...prev, info.roleId]
    })
    setSelectedIdentity(prev => {
      if (prev.find(item => item.type === IdentityType.Role && item.roleId === info.roleId)) {
        return prev.filter(item => item.type !== IdentityType.Role || item.roleId !== info.roleId)
      }
      return [...prev, info]
    })
  }

  const onDelete = (info?: IdentityRoleInfo | IdentityUserInfo) => {
    if (!info) {
      setSelectedUserIds([])
      setSelectedRoleIds([])
      setSelectedIdentity([])
      return
    }
    switch (info.type) {
      case IdentityType.Role:
        deleteRole(info.roleId)
        break
      case IdentityType.User:
        deleteUser(info.userId)
        break
      default:
        break
    }
  }

  const items: TabsProps['items'] = useMemo(
    () =>
      pickerMode.map(mode => ({
        key: mode,
        label: <TabLabel selected={activeKey === mode}>{labelMap[mode]}</TabLabel>,
      })),
    [pickerMode]
  )

  useEffect(() => {
    getUserList()
  }, [])

  useEffect(() => {
    if (!keyword.trim()) {
      setSearchList([])
      return
    }
    memberSearch(keyword.trim())
  }, [keyword])

  useEffect(() => {
    guildId && pickerMode.includes(IdentityType.Role) && dispatch(guildListActions.getGuildRoles({ guildId }))
  }, [pickerMode])

  return (
    <div className="flex h-[468px] w-full flex-col">
      <div className="flex h-0 flex-1 overflow-hidden rounded-xl border-[1px] border-[var(--fg-b10)]">
        <div className="mt-4 flex flex-1 flex-col">
          <Input
            value={keyword}
            className="mx-4 mb-2 w-[calc(100%-32px)] rounded-full"
            onChange={evt => setKeyword(evt.target.value)}
            placeholder="搜索成员昵称或 ID"
            prefix={<iconpark-icon class="anticon text-[var(--fg-b40)] mr-1" name="Search" size={16}></iconpark-icon>}
          />
          <div className="flex h-[calc(100%-16px)] flex-1 flex-col">
            {isSearch ?
              searchList.length > 0 ?
                <Virtuoso
                  data={searchList}
                  fixedItemHeight={60}
                  className="mx-2 mb-2 flex-1 [&>*]:!w-[calc(100%-4px)] [&_[data-index]]:mx-2"
                  itemContent={(_, user) => {
                    const selected = handleCheckIfSelected(user)
                    const checked = selectedUserIds.includes(user.userId)
                    const disabled = handleCheckIsDisabled(user)
                    return (
                      <UserItem
                        guildId={guildId}
                        prefix={<Checkbox checked={selected || checked} disabled={disabled}></Checkbox>}
                        onClick={() => {
                          if (selected || disabled) return
                          handleUserClick(user)
                        }}
                        key={user.userId}
                        value={user.userId}
                      />
                    )
                  }}
                />
              : searchLoading ?
                <div className={'flex flex-col'}>
                  {new Array(8).fill(0).map((_, index) => (
                    <ItemSkeleton key={index} />
                  ))}
                </div>
              : <div className={'flex h-full w-full items-center justify-center'}>
                  <EmptyData type="search" message={'暂无搜索结果'}></EmptyData>
                </div>

            : null}
            <Tabs
              activeKey={activeKey}
              tabBarGutter={16}
              className={`w-full ${!isSearch ? '' : 'hidden'}`}
              indicatorSize={20}
              renderTabBar={(props, DefaultTabBar) => {
                return pickerMode.length < 2 ? <></> : <DefaultTabBar {...props} className="px-4 before:!content-[none]"></DefaultTabBar>
              }}
              items={items}
              onChange={key => setActiveKey(key as IdentityType)}
            />
            {pickerMode.includes(IdentityType.Role) ?
              <Virtuoso
                data={roleList}
                fixedItemHeight={60}
                className={`mx-2 mb-2 flex-1 [&>*]:!w-[calc(100%-4px)] [&_[data-index]]:mx-2 ${
                  activeKey === IdentityType.Role && !isSearch ? '' : 'hidden'
                }`}
                itemContent={(index, info) => {
                  const selected = handleCheckIfSelected(info)
                  const checked = selectedRoleIds.includes(info.roleId)
                  return (
                    <RoleItem
                      guildId={guildId}
                      channelId={channelId}
                      prefix={<Checkbox checked={selected || checked} disabled={selected}></Checkbox>}
                      onClick={() => {
                        if (selected) return
                        handleRoleClick(info)
                      }}
                      key={info.roleId}
                      value={info.roleId}
                    />
                  )
                }}
              />
            : null}
            {pickerMode.includes(IdentityType.User) ?
              userList.length > 0 ?
                <Virtuoso
                  data={userList}
                  fixedItemHeight={60}
                  className={`mx-2 mb-2 flex-1 [&>*]:!w-[calc(100%-4px)] [&_[data-index]]:mx-2 ${
                    activeKey === IdentityType.User && !isSearch ? '' : 'hidden'
                  }`}
                  itemContent={(index, info) => {
                    const selected = handleCheckIfSelected(info)
                    const checked = selectedUserIds.includes(info.userId)
                    const disabled = handleCheckIsDisabled(info)
                    return (
                      <UserItem
                        guildId={guildId}
                        prefix={<Checkbox checked={selected || checked} disabled={disabled}></Checkbox>}
                        onClick={() => {
                          if (selected || disabled) return
                          handleUserClick(info)
                        }}
                        key={info.userId}
                        value={info.userId}
                      />
                    )
                  }}
                />
              : loading ?
                <div className={'flex flex-col'}>
                  {new Array(8).fill(0).map((_, index) => (
                    <ItemSkeleton key={index} />
                  ))}
                </div>
              : null
            : null}
          </div>
        </div>
        <Divider type="vertical" className="mx-0 h-full" />
        <div className="mt-2 flex flex-1 flex-col">
          <div className="flex flex-shrink-0 gap-2 px-4">
            <div className="flex-1 py-2 text-sm font-medium text-[var(--fg-b100)]">已选择：{selectedUserIds.length + selectedRoleIds.length}</div>
            <div className="flex cursor-pointer items-center gap-2 font-bold text-[var(--fg-blue-1)]" onClick={() => onDelete()}>
              全部清除
            </div>
          </div>
          <Virtuoso
            data={selectedIdentity}
            className="mx-2 px-2 [&>*]:!w-[calc(100%-12px)] [&_[data-index]]:mx-2"
            itemContent={(index, info) => {
              switch (info.type) {
                case IdentityType.Role:
                  return (
                    <RoleItem
                      key={info.roleId}
                      value={info.roleId}
                      guildId={guildId}
                      channelId={channelId}
                      className="group/identity-item"
                      suffix={
                        <iconpark-icon
                          class={'invisible cursor-pointer text-[var(--fg-b40)] hover:text-[var(--function-red-1)] group-hover/identity-item:visible'}
                          name="CloseCircleFill"
                          size={16}
                          onClick={() => {
                            onDelete(info)
                          }}
                        ></iconpark-icon>
                      }
                    />
                  )
                case IdentityType.User:
                  return (
                    <UserItem
                      key={info.userId}
                      value={info.userId}
                      guildId={guildId}
                      className="group/user-item"
                      suffix={
                        <iconpark-icon
                          class={'invisible cursor-pointer text-[var(--fg-b40)] hover:text-[var(--function-red-1)] group-hover/user-item:visible'}
                          name="CloseCircleFill"
                          size={16}
                          onClick={() => {
                            onDelete(info)
                          }}
                        ></iconpark-icon>
                      }
                    />
                  )
                default:
                  return null
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-shrink-0 justify-end gap-4 py-[18px]">
        <Button className="btn-middle" onClick={onCancel}>
          取消
        </Button>
        <Button type={'primary'} className="btn-middle" loading={submitLoading} onClick={handleConfirm}>
          确定
        </Button>
      </div>
    </div>
  )
}

const showIdentityPickerModal = ({
  title = '添加成员',
  ...props
}: Omit<IdentityPickerContentProps, 'onCancel'> & {
  title?: string
}) => {
  const { destroy: close } = showFbModal({
    className: 'rounded-[8px]',
    width: 720,
    title,
    content: (
      <IdentityPickerContent
        {...props}
        onCancel={() => {
          close()
        }}
      />
    ),
    showCancelButton: false,
    showOkButton: false,
  })
}

export default showIdentityPickerModal
