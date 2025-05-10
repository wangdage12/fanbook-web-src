import { Divider, Input, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import CircularLoading from 'fb-components/components/CircularLoading'
import { isNil } from 'lodash-es'
import { ReactNode, useEffect, useRef, useState } from 'react'
import UserItem from '../../../components/realtime_components/item/UserItem'
import useScrollIntoView from '../../../hooks/useScrollIntoView'
import GuildAPI, { LogClassify } from '../../guild_container/guildAPI'
import MemberListAPI from '../../home/MemberListAPI.ts'
import { MemberGroupStruct, MemberUserStruct } from '../../member_list/MemberStruct'
import { classifyLabel, logItemIconMap, moduleMap } from './constant'

function EmptyTip({ title }: { title: string }) {
  return <div className="flex-center h-[60px] text-[var(--fg-b60)]">{title}</div>
}

function CategoryItem({ title }: { title: string }) {
  return <div className="h-[36px] flex-shrink-0 flex items-center text-xs text-[var(--fg-b60)]">{title}</div>
}

export function FilterItem({
  onClick,
  title = '全部',
  checked,
  className = '',
}: {
  onClick?: () => void
  title?: ReactNode
  checked?: boolean
  className?: string
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  useScrollIntoView(itemRef, checked, { edgeDistance: 10, extraScroll: 60, parentLevel: 3 })
  return (
    <div
      ref={itemRef}
      className={`h-[40px] flex flex-shrink-0 items-center hover:bg-[var(--bg-bg-1)] cursor-pointer rounded-lg px-2 -mx-2 ${className}`}
      onClick={onClick}
    >
      <span className="flex-1">{title}</span>
      {checked && <iconpark-icon class="text-[var(--fg-blue-1)]" name="Check"></iconpark-icon>}
    </div>
  )
}

export function MemberContent({
  onChange,
  value,
  open,
  guildId,
}: {
  guildId?: string
  open?: boolean
  value?: string
  onChange?: (userId?: string) => void
}) {
  const [keyword, setKeyword] = useState<string>('')
  const isSearch = !!keyword.trim()
  const [userList, setUserList] = useState<(MemberUserStruct | MemberGroupStruct)[]>([])
  const [searchList, setSearchList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const memberSearch = async (keyword: string) => {
    if (!guildId) return
    setSearchLoading(true)
    try {
      const res = await GuildAPI.searchMember(guildId, keyword)
      setSearchList(
        res
          .filter(item => !item.bot)
          .map(item => {
            return item.user_id
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
    setUserList(list)
    setLoading(false)
  }

  useEffect(() => {
    open && getUserList()
  }, [open])

  useEffect(() => {
    if (!keyword.trim()) {
      setSearchList([])
      return
    }
    memberSearch(keyword.trim())
  }, [keyword])

  useEffect(() => {
    if (!open) {
      setKeyword('')
    }
  }, [open])
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={keyword}
        className="rounded-full"
        onChange={evt => setKeyword(evt.target.value)}
        placeholder="搜索成员昵称或 ID"
        allowClear
        prefix={<iconpark-icon class="anticon text-[var(--fg-b40)] mr-1" name="Search" size={16}></iconpark-icon>}
      />
      {!isSearch && (
        <>
          <FilterItem onClick={() => onChange?.()} title="全部成员" checked={isNil(value)} />
          <Divider className="m-0"></Divider>
        </>
      )}
      {!isSearch ?
        loading ?
          <div className="w-full h-[200px] flex-center">
            <CircularLoading />
          </div>
        : <div className="flex flex-col max-h-[500px] overflow-auto -mx-3 px-3">
            {userList.map(item => {
              if (item.type === 'group') {
                return <CategoryItem key={`group_${item.id}`} title={item.name}></CategoryItem>
              }
              return (
                <UserItem
                  key={item.user_id}
                  bordered={false}
                  value={item.user_id}
                  guildId={guildId}
                  onClick={() => onChange?.(item.user_id)}
                  suffix={value === item.user_id && <iconpark-icon class="text-[var(--fg-blue-1)]" name="Check"></iconpark-icon>}
                ></UserItem>
              )
            })}
          </div>

      : null}

      {isSearch ?
        searchLoading ?
          <div className="w-full h-[200px] flex-center">
            <CircularLoading />
          </div>
        : <div className="flex flex-col max-h-[500px] overflow-auto -mx-3 px-3">
            {searchList.map(item => {
              return (
                <UserItem
                  key={item}
                  bordered={false}
                  value={item}
                  guildId={guildId}
                  onClick={() => onChange?.(item)}
                  suffix={value === item && <iconpark-icon class="text-[var(--fg-blue-1)]" name="Check"></iconpark-icon>}
                ></UserItem>
              )
            })}
            {searchList.length === 0 && !searchLoading && <EmptyTip title="未搜索到相关成员" />}
          </div>

      : null}
    </div>
  )
}

export function OperationContent({ onChange, value, open }: { open?: boolean; value?: LogClassify; onChange?: (classify?: LogClassify) => void }) {
  const [keyword, setKeyword] = useState<string>('')
  const isSearch = !!keyword.trim()
  useEffect(() => {
    if (!open) {
      setKeyword('')
    }
  }, [open])

  const itemRenderer = () => {
    const _keyword = keyword.trim()
    const items = Object.entries(moduleMap)
      .map(([module, item]) => {
        const { name, sub } = item
        let _sub = sub
        if (isSearch) {
          _sub = _sub.filter(classify => classifyLabel[classify].includes(_keyword))
        }
        if (_sub.length === 0) return []

        const subItems = _sub.map(classify => {
          const { name, color } = logItemIconMap[classify]
          return (
            <FilterItem
              key={`classify_${classify}`}
              onClick={() => onChange?.(classify)}
              title={
                <div className="flex items-center gap-2">
                  <iconpark-icon class="flex-shrink-0" name={name} color={color} size={16}></iconpark-icon>
                  <span>{classifyLabel[classify]}</span>
                </div>
              }
              checked={value === classify}
            />
          )
        })
        return [<CategoryItem key={`module_${module}`} title={name}></CategoryItem>, ...subItems]
      })
      .flat(1)
    return items.length === 0 ? <EmptyTip title="未搜索到相关操作" /> : items
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={keyword}
        className="rounded-full"
        onChange={evt => setKeyword(evt.target.value)}
        placeholder="搜索操作名称"
        allowClear
        prefix={<iconpark-icon class="anticon text-[var(--fg-b40)] mr-1" name="Search" size={16}></iconpark-icon>}
      />
      {!isSearch && (
        <>
          <FilterItem onClick={() => onChange?.()} title="全部操作" checked={isNil(value)} />
          <Divider className="m-0"></Divider>
        </>
      )}
      <div className="flex flex-col max-h-[500px] overflow-auto -mx-3 px-3">{itemRenderer()}</div>
    </div>
  )
}

export function FilterTrigger({
  title,
  conditions,
  content,
  open = false,
  onOpenChange,
  iconBuilder,
  placement = 'bottomLeft',
  className = '',
  overlayClassName = '',
}: {
  title: ReactNode
  conditions?: ReactNode
  content: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  iconBuilder?: () => ReactNode
  placement?: TooltipPlacement
  className?: string
  overlayClassName?: string
}) {
  const [innerOpen, setInnerOpen] = useState<boolean>(open)

  useEffect(() => {
    setInnerOpen(open)
  }, [open])

  return (
    <Popover
      className={className}
      open={innerOpen}
      fresh={true}
      overlayClassName={`[&_.ant-popover-inner]:p-4 ${overlayClassName}`}
      onOpenChange={_open => {
        onOpenChange?.(_open)
        setInnerOpen(_open)
      }}
      trigger="click"
      content={content}
      placement={placement}
      arrow={false}
    >
      <div className="flex items-center hover:bg-[var(--bg-bg-1)] cursor-pointer rounded-lg px-2 -mx-2">
        {title}
        <span className={`ml-3 mr-1 ${isNil(conditions) ? 'text-[var(--fg-b40)]' : 'text-[var(--fg-blue-1)]'}`}>{conditions ?? '全部'}</span>
        {iconBuilder?.() || <iconpark-icon name="Down" class={`transition-transform ${open ? '-rotate-180' : ''}`} size={12}></iconpark-icon>}
      </div>
    </Popover>
  )
}
