import clsx from 'clsx'
import TenSizeTag from 'fb-components/components/TenSizeTag.tsx'
import CosImageUtils from 'fb-components/utils/CosImageUtils.ts'
import { defaultsDeep, isNumber } from 'lodash-es'
import React, { HTMLAttributes, ReactNode, createContext, forwardRef, useContext, useState } from 'react'
import { useAppSelector } from '../../../app/hooks'
import { GuildContext } from '../../../features/home/GuildWrapper'
import { guildUserSelectors } from '../../../features/role/guildUserSlice'
import { UserStruct } from './UserAPI'
import { useUserInfo } from './hooks'

interface RealtimeUserInfoProps {
  userId: string
  guildId?: string
  loading?: ReactNode
  prefix?: ReactNode
  botTag?: boolean
  displayRoleColor?: boolean
}

export interface RealtimeUser extends UserStruct {
  remark?: string
  guildNickname?: string
}

export const UserContext = createContext<RealtimeUser | null>(null)

/**
 * 自动更新的用户头像
 *
 * @param guildId   这个参数通常不用传，处于 GuildContext 中会自动获取`
 * @param userId    用户 id
 * @param children  该函数用户构建任何用户信息
 * @param loading
 * @constructor
 */
export function RealtimeUserInfo({
  guildId,
  userId,
  children,
  loading,
}: RealtimeUserInfoProps & {
  children: ReactNode | ((user: RealtimeUser) => ReactNode)
}) {
  const { user, guildNickname, remark } = useUserInfo(userId, guildId)
  if (user) {
    return (
      <UserContext.Provider value={{ ...user, guildNickname, remark }}>
        {typeof children === 'function' ? children({ ...user, guildNickname, remark }) : children}
      </UserContext.Provider>
    )
  } else {
    return loading ?? null
  }
}

/**
 * 自动更新的用户昵称
 *
 * @param className
 * @param displayRoleColor  昵称显示角色颜色
 * @param botTag
 * @param props
 * @param prefix          昵称前缀，通常用来加 @ 符号
 * @param props.userId    用户 id
 * @param props.guildId   这个参数通常不用传，处于 GuildContext 中会自动获取
 * @param loading
 * @constructor
 */
export function RealtimeNickname({
  userId,
  guildId,
  botTag,
  loading,
  prefix,
  className,
  displayRoleColor,
  ...props
}: RealtimeUserInfoProps & Omit<HTMLAttributes<never>, 'prefix'>) {
  const guildContext = useContext(GuildContext)
  guildId ??= guildContext?.guild_id
  const roleColor = useAppSelector(guildUserSelectors.userRoleColor(guildId ?? '', userId))
  const userContext = useContext(UserContext)
  const nicknameRender = (user: RealtimeUser) => {
    const hasBotTag = botTag && user.bot
    const realtimeName = (
      // 防止用户名出现ltr攻击，嵌套一个行内块元素可以避免
      <span
        className={clsx([className, 'break-keep'], { 'inline-block flex-shrink truncate': hasBotTag })}
        style={{
          color: displayRoleColor ? roleColor : '',
        }}
        {...props}
      >
        <span>
          {prefix}
          {user.remark || user.guildNickname || user.nickname}
        </span>
      </span>
    )
    return hasBotTag ?
        <div className="flex items-center">
          {realtimeName}
          <TenSizeTag className="mx-[4px] flex-shrink-0" text="机器人" />
        </div>
      : realtimeName
  }

  return userContext ?
      nicknameRender(userContext)
    : <RealtimeUserInfo loading={loading} userId={userId} guildId={guildId}>
        {nicknameRender}
      </RealtimeUserInfo>
}

/**
 * 自动更新的用户头像
 *
 * @param htmlAttr
 * @param size
 * @param userId    用户 id
 * @param guildId   这个参数通常不用传，处于 GuildContext 中会自动获取
 * @param loading
 * @constructor
 */
export const RealtimeAvatar = forwardRef(
  (
    {
      size = 32,
      rounded = true,
      loading,
      guildId,
      userId,
      className,
      ...htmlAttributes
    }: {
      size?: number | string
      rounded?: boolean
    } & RealtimeUserInfoProps &
      HTMLAttributes<never>,
    ref: React.Ref<HTMLImageElement>
  ) => {
    const [hasError, setHasError] = useState(false)
    defaultsDeep(htmlAttributes, {
      style: {
        width: size,
        height: size,
      },
    })

    loading ??= (
      <div
        {...htmlAttributes}
        className={clsx(className, 'flex-shrink-0', { 'rounded-full': rounded })}
        style={{
          width: size,
          height: size,
        }}
      ></div>
    )
    const userContext = useContext(UserContext)
    const avatarRender = (user: RealtimeUser) => {
      const borderClass = 'border-opacity-0.1 border-[0.5px] border-[var(--fg-b10)]'
      let src = user.avatar
      if (isNumber(size)) {
        src = CosImageUtils.thumbnailMin(user.avatar, size)
      }

      if (hasError) return <div {...htmlAttributes} className={clsx([className, borderClass], { 'rounded-full': rounded })}></div>

      return (
        <img
          ref={ref}
          data-id={userId}
          className={clsx([className, borderClass, 'flex-shrink-0 select-none object-cover'], { 'rounded-full': rounded })}
          {...htmlAttributes}
          draggable={false}
          src={src}
          loading={'lazy'}
          alt={''}
          onError={() => setHasError(true)}
        />
      )
    }
    return userContext ?
        avatarRender(userContext)
      : <RealtimeUserInfo loading={loading} userId={userId} guildId={guildId}>
          {avatarRender}
        </RealtimeUserInfo>
  }
)

RealtimeAvatar.displayName = 'RealtimeAvatar'
