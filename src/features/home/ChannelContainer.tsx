import React, { createContext, HTMLAttributes, useMemo, useState } from 'react'

interface ChannelContainerProps {
  header?: React.ReactNode
  sidebarRender?: (sidebarMenu?: SidebarMenu) => React.ReactNode
}

// 侧边栏内容的枚举
export enum SidebarMenu {
  Pin = 'Pin',
  MemberList = 'MemberList',
  Bot = 'Bot',
  None = 'None',
}

export interface ChannelContainerContextData<T = object> {
  sidebarMenu?: SidebarMenu
  changeSidebarMenu: (targetMenu: SidebarMenu) => void
  extraInfo?: T
  changeExtraInfo: (extraInfo: T) => void
}

export const ChannelContainerContext = createContext<ChannelContainerContextData | undefined>(undefined)

export default function ChannelContainer({ className, header, children, sidebarRender }: ChannelContainerProps & HTMLAttributes<never>) {
  const [sidebarMenu, setSidebarMenu] = useState<SidebarMenu>(SidebarMenu.None)
  const [extraInfo, setExtraInfo] = useState<object | undefined>(undefined)

  const changeSidebarMenu = (targetMenu: SidebarMenu) => {
    if (sidebarMenu != targetMenu) {
      setSidebarMenu(targetMenu)
    } else {
      setSidebarMenu(SidebarMenu.None)
    }
  }

  const changeExtraInfo = (extraInfo: object) => {
    setExtraInfo(prevExtraInfo => {
      return {
        ...prevExtraInfo,
        ...extraInfo,
      }
    })
  }

  const containerContext = useMemo(() => {
    return {
      sidebarMenu,
      extraInfo,
      changeSidebarMenu,
      changeExtraInfo,
    }
  }, [sidebarMenu, changeSidebarMenu, extraInfo, setExtraInfo])
  return (
    <ChannelContainerContext.Provider value={containerContext}>
      <div className={`flex h-full w-full ${className}`}>
        <div className={'flex h-full w-0 flex-grow flex-col bg-[var(--bg-bg-2)]'}>
          {header}
          {children}
        </div>
        {sidebarRender && (
          <div
            className={`${
              sidebarMenu !== SidebarMenu.None ? 'w-[250px]' : 'w-0'
            } flex-shrink-0 border-0 border-l-[0.5px] border-solid bg-[var(--bg-bg-2)] transition-all`}
          >
            {sidebarRender(sidebarMenu)}
          </div>
        )}
      </div>
    </ChannelContainerContext.Provider>
  )
}
