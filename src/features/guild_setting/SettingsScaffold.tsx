import { Divider } from 'antd'
import clsx from 'clsx'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { isEqual } from 'lodash-es'
import React, { Fragment, Suspense, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '../../app/hooks.ts'
import { FormModalContext } from '../../components/form/FormModalContext.tsx'
import { Permission, PermissionService } from '../../services/PermissionService.ts'
import showUnsupportedFeatureToast from '../../utils/showUnsupportedFeatureToast.tsx'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import { guildListSelectors } from '../guild_list/guildListSlice.ts'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'

export interface MenuItem {
  label: string
  children: SubMenuItem[]
}

interface SubMenuItem {
  label: string
  key: string
  icon: string
  disabled?: boolean
  dangerous?: boolean
  component?: React.ReactNode
  onClick?: () => void
  permissions?: Permission
  whiteListField?: keyof GuildStruct
}

export default function SettingsScaffold({
  menus,
  loading,
  title,
  channelId,
  onClose,
}: {
  title: string
  loading?: boolean
  channelId?: string
  menus: MenuItem[]
  onClose?: () => void
}) {
  const [activeKey, setActiveKey] = useState<string | undefined>(menus[0].children[0].key)
  const guildId = GuildUtils.getCurrentGuildId()
  const guild = useAppSelector(guildListSelectors.guild(guildId), isEqual)!
  const permissionValue = useMemo(() => {
    return channelId ?
        PermissionService.computeChannelPermissions(guild, channelId, LocalUserInfo.userId)
      : PermissionService.computeGuildPermission(guild, LocalUserInfo.userId)
  }, [channelId])

  const filterMenus = useMemo(() => {
    const newMenus: MenuItem[] = []
    menus.forEach(m => {
      const menuPermission = m.children.some(e => permissionValue.has(e.permissions ?? 0))
      if (menuPermission) {
        const newMenu: MenuItem = { ...m, children: [] }
        newMenus.push(newMenu)
        m.children.forEach(s => {
          if (!s.permissions) {
            newMenu.children.push(s)
          } else {
            const subMenuPermission = permissionValue.has(s.permissions ?? 0)
            // 白名单条件
            const isWhiteAndOn = !(s.whiteListField && guild[s.whiteListField] == SwitchType.No)
            subMenuPermission && isWhiteAndOn && newMenu.children.push(s)
          }
        })
      }
    })
    return newMenus
  }, [permissionValue, guild, menus])

  // 这里使用 useMemo 会导致频道设置-权限设置 出问题
  const child = (() => {
    for (const menu of menus) {
      for (const item of menu.children) {
        if (activeKey == item.key) return item.component ?? null
      }
    }
    return null
  })()

  const beforeClose = useRef<(() => Promise<boolean>) | null>()

  function handleClose() {
    if (beforeClose.current) {
      beforeClose.current().then(shouldClose => {
        if (shouldClose) {
          onClose?.()
        } else {
          FbModal.error({
            title: '退出编辑',
            content: '你做的修改尚未保存，确定退出吗？',
            okText: '退出',
            cancelText: '继续编辑',
            onOk: () => {
              onClose?.()
            },
          })
        }
      })
    } else {
      onClose?.()
    }
  }

  function handleSwitchTab(item: SubMenuItem) {
    function doSwitch() {
      if (item.onClick) {
        item.onClick()
      } else {
        if (item.component) {
          setActiveKey(item.key)
        } else {
          showUnsupportedFeatureToast()
        }
      }
    }

    if (beforeClose.current) {
      beforeClose.current().then(shouldClose => {
        if (shouldClose) {
          doSwitch?.()
        } else {
          FbModal.error({
            title: '切换编辑',
            content: '你做的修改尚未保存，确定切换吗？',
            okText: '切换',
            cancelText: '继续编辑',
            onOk: () => {
              doSwitch?.()
            },
          })
        }
      })
    } else {
      doSwitch?.()
    }
  }

  return (
    <FormModalContext.Provider
      value={{
        setBeforeClose(fn) {
          beforeClose.current = fn
        },
      }}
    >
      <div className="flex h-[calc(100vh-80px)] w-[960px] flex-col">
        <div className="flex h-14 w-full items-center justify-between pl-6 pr-[18px]">
          <span className="mr-4 truncate text-[18px] font-medium">{title}</span>
          <HoverBox onClick={handleClose} className="h-8 w-8 !p-1.5">
            <iconpark-icon name="Close" fill="var(--fg-b100)" size={20}></iconpark-icon>
          </HoverBox>
        </div>
        <Divider className={'m-0 w-full'}></Divider>
        {loading && (
          <div className="flex-center h-full w-full">
            <CircularLoading></CircularLoading>
          </div>
        )}
        <div className={`flex flex-1 flex-row overflow-hidden ${loading ? '!hidden' : ''}`}>
          <div className="flex w-[240px] flex-shrink-0 flex-col gap-2 overflow-auto px-4 py-2 pb-4">
            {filterMenus.map(item => {
              return (
                <Fragment key={item.label}>
                  <div className={clsx(['flex flex-col gap-1 py-1'])}>
                    <div className={'px-2 text-[12px] leading-9 text-[var(--fg-b60)]'}>{item.label}</div>
                    {item.children.map((item, i) => {
                      return (
                        <HoverBox
                          key={i}
                          disabled={item.disabled}
                          radius={10}
                          className={clsx([
                            'h-10 w-full items-center !justify-start px-2',
                            activeKey == item.key && '!bg-[var(--fg-blue-3)] !text-[var(--fg-blue-1)]',
                            item.dangerous ?
                              item.disabled ?
                                'text-[var(--function-red-2)] !opacity-100'
                              : 'text-[var(--function-red-1)]'
                            : 'text-[var(--fg-b100)]',
                          ])}
                          onClick={() => handleSwitchTab(item)}
                        >
                          <iconpark-icon size={16} class={'mr-2'} name={item.icon || 'Exclamation'}></iconpark-icon>
                          <span>{item.label}</span>
                        </HoverBox>
                      )
                    })}
                  </div>
                </Fragment>
              )
            })}
          </div>
          <Divider className={'m-0 h-full'} type={'vertical'}></Divider>
          <div className="h-full flex-1 overflow-hidden bg-[var(--bg-bg-2)]">
            <div className="m-[12px] flex h-[calc(100%-24px)] w-[calc(100%-24px)] flex-col overflow-hidden rounded-[8px] bg-[var(--bg-bg-3)]">
              <Suspense fallback={<div />}>{child}</Suspense>
            </div>
          </div>
        </div>
      </div>
    </FormModalContext.Provider>
  )
}
