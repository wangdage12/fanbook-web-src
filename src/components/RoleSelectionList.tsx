import { Button, Checkbox, Divider, Popover } from 'antd'
import clsx from 'clsx'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import ColorUtils from 'fb-components/utils/ColorUtils.ts'
import { difference } from 'lodash-es'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GuildUtils from '../features/guild_list/GuildUtils.tsx'
import { GuildUserUtils } from '../features/role/guildUserSlice.ts'
import { rolesGroupedByType } from '../features/role/util.ts'
import { UserRole } from './UserRoles.tsx'

/**
 * 通用的角色列表，可以用于多选
 *
 * @param selected  已选中的角色
 * @param roles     角色列表
 * @param onChange  角色列表变化时的回调
 */
export function RoleSelectionList({
  value,
  guildId,
  userId,
  roles,
  onChange,
}: {
  guildId: string
  userId?: string
  value: string[]
  roles: RoleStruct[]
  onChange: (selectedRoles: string[]) => void
}) {
  const checkboxGroupRef = useRef<HTMLDivElement>(null)
  const getContainer = () => {
    return checkboxGroupRef.current ? checkboxGroupRef.current : document.body
  }
  const normalMemberRole = useMemo(() => roles.find(role => role.t == RoleType.NormalMember), [roles])
  const handleChange = useCallback(
    (selectedRoles: string[]) => {
      const normalMemberRoleId = normalMemberRole?.role_id
      const hasNormalMemberRole = normalMemberRoleId ? selectedRoles.includes(normalMemberRoleId) : false

      if (normalMemberRoleId && !value.includes(normalMemberRoleId) && hasNormalMemberRole) {
        const { destroy: close } = FbModal.info({
          content: '确定选择普通成员身份组吗？选择普通成员身份组后，将会撤销成员已有的其他身份组。',
          closable: false,
          maskClosable: false,
          getContainer,
          onOk: () => {
            onChange([normalMemberRoleId])
            close()
          },
        })
        return
      }

      normalMemberRoleId && value.includes(normalMemberRoleId) ?
        onChange(selectedRoles.filter(roleId => roleId !== normalMemberRoleId))
      : onChange(selectedRoles)
    },
    [onChange, value, normalMemberRole]
  )

  const sortedRoles = useMemo(() => {
    return rolesGroupedByType(roles).flat(1)
  }, [roles])

  return (
    <Checkbox.Group ref={checkboxGroupRef} value={value} onChange={handleChange as never} className={'flex flex-col py-1'}>
      {sortedRoles.map(role => {
        // 频道主不能添加到普通成员, 不能操作比自己高的身份组
        const hasPermission =
          GuildUserUtils.hasHigherRoleThanRole(guildId, role.role_id) &&
          (role.t != RoleType.NormalMember || !userId || (role.t == RoleType.NormalMember && !GuildUserUtils.hasOwnerRole(guildId, userId)))

        return (
          <Fragment key={role.role_id}>
            {role.t == RoleType.NormalMember ?
              <Divider className={'my-1'} />
            : null}
            <Checkbox
              value={role.role_id}
              className={'w-full [&>span:nth-child(2)]:flex-1 [&>span:nth-child(2)]:overflow-hidden'}
              disabled={!hasPermission}
            >
              <div className={'flex h-10 w-full flex-1 items-center'}>
                <iconpark-icon name="UserShield" size={16} color={ColorUtils.convertToCssColor(role.color)} />
                <span className={'truncate pl-2 text-[var(--fg-b100)]'}>{role.name}</span>
              </div>
            </Checkbox>
          </Fragment>
        )
      })}
    </Checkbox.Group>
  )
}

/**
 * 选择角色的弹窗
 */
export default function RoleSelectionPopover({
  guildId,
  roles,
  userId,
  onConfirm,
  value,
  defaultToCommonRole,
}: {
  roles: RoleStruct[]
  guildId: string
  userId?: string
  value: string[]
  onConfirm?: (value: string[]) => void
  defaultToCommonRole?: boolean
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [opened, setOpened] = useState(false)
  const handleOpenChange = useCallback((open: boolean) => {
    setOpened(open)
  }, [])
  const normalMemberRole = useMemo(() => {
    if (!defaultToCommonRole) return
    return roles.find(role => role.t == RoleType.NormalMember)
  }, [roles])

  const getContainer = () => {
    return contentRef.current ? contentRef.current : document.body
  }

  const handleConfirm = () => {
    const normalMemberRoleId = normalMemberRole?.role_id
    if (selected.length === 0 && normalMemberRoleId) {
      const { destroy: close } = FbModal.info({
        content: '确定选择普通成员身份组吗？选择普通成员身份组后，将会撤销成员已有的其他身份组。',
        closable: false,
        maskClosable: false,
        getContainer,
        onOk: () => {
          close()
          onConfirm?.([normalMemberRoleId])
          setOpened(false)
        },
      })
      return
    }
    onConfirm?.(selected)
    setOpened(false)
  }

  useEffect(() => {
    setSelected(value)
  }, [value])

  return (
    <Popover
      destroyTooltipOnHide
      open={opened}
      onOpenChange={handleOpenChange}
      arrow={false}
      placement={'right'}
      trigger={'click'}
      content={
        <div ref={contentRef} className={'flex flex-col'}>
          <div className={'h-[268px] w-[216px] overflow-y-scroll px-2'}>
            <RoleSelectionList guildId={guildId} userId={userId} value={selected} roles={roles} onChange={setSelected} />
          </div>
          <div className={'mx-[-12px] flex justify-end border-t-[0.5px] border-t-[var(--fg-b10)] p-3 pb-0'}>
            <Button onClick={handleConfirm} type={'primary'} size={'small'} shape={'round'}>
              确定
            </Button>
          </div>
        </div>
      }
    >
      <iconpark-icon
        class={'h-6 w-6 animate-[background-color] cursor-pointer rounded-full bg-[var(--fg-b5)] duration-300 hover:bg-[var(--fg-b10)]'}
        name={'Plus'}
        size={12}
        color={'var(--fg-b60)'}
      />
    </Popover>
  )
}

/**
 * 符合 antd 表单参数规则的角色选择组件，包含一个角色 action chip 列表和右侧的添加按钮
 */
export function RoleSelectionWithRoleTags({
  guildId,
  className,
  value,
  onChange,
  fixedRoles,
  enableChannelManager,
  enableCommonMember,
}: {
  guildId: string
  className?: string
  value?: string[]
  onChange?: (ids: string[]) => void
  // 这些固定角色会从选择列表中排除，仅固定展示在已选角色最前面
  fixedRoles?: string[]
  enableChannelManager?: boolean
  enableCommonMember?: boolean
}) {
  const guild = useMemo(() => GuildUtils.getGuildById(guildId), [guildId])
  const orderedRoles = useMemo(() => {
    return Object.values(guild?.roles ?? {})
      .filter(role => {
        if (role.managed) return false
        if (fixedRoles?.includes(role.role_id) === true) return false
        if (enableChannelManager && role.t == RoleType.ChannelManager) return true
        if (role.t == RoleType.SeniorManager) return true
        if (enableCommonMember && role.t == RoleType.NormalMember) return true
        return role.t == RoleType.Other
      })
      .sort((a, b) => b.position - a.position)
  }, [guild, enableChannelManager])

  function handleDelete(id: string) {
    onChange?.(value?.filter(e => e !== id)?.concat(fixedRoles ?? []) ?? [])
  }

  function handleConfirm(ids: string[]) {
    onChange?.(ids?.concat(fixedRoles ?? []))
  }

  return (
    <div className={clsx('flex flex-wrap gap-2', className)}>
      {fixedRoles?.map(id => {
        const role = guild?.roles[id]
        if (!role) return
        return <UserRole key={id} role={role} />
      })}
      {difference(value, fixedRoles ?? [])?.map(id => {
        const role = guild?.roles[id]
        if (!role) return
        return <UserRole deletable key={id} role={role} onDelete={handleDelete} />
      })}
      {/* 添加角色按钮 */}
      <RoleSelectionPopover value={value ?? []} onConfirm={handleConfirm} roles={orderedRoles} guildId={guildId} />
    </div>
  )
}
