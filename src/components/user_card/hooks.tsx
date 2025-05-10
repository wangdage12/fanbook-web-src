import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { isEqual } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AppRoutes from '../../app/AppRoutes'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { router } from '../../app/router'
import { dmActions } from '../../features/dm/dmSlice.ts'
import { generateDMChannel } from '../../features/dm/utils'
import { guildListSelectors } from '../../features/guild_list/guildListSlice'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'
import showUnsupportedFeatureToast from '../../utils/showUnsupportedFeatureToast.tsx'
import { UserStruct } from '../realtime_components/realtime_nickname/UserAPI'
import { UserHelper } from '../realtime_components/realtime_nickname/userSlice'
import AddFriendModal from './AddFriendModal'
import { UserRelationStruct, getRelation } from './RelationAPI'
import { RelationType } from './entity'
import { CheckBanType, canAddFriend, canDm, checkUserBan } from './utils'

export function useUserAssociates(relationId?: string, options?: { guildId?: string; cache?: boolean }, initial = true) {
  const [relationShip, setRelationShip] = useState<UserRelationStruct>({
    relations: [],
    guilds: [],
    receive_friend_request: true,
    black_list: false,
    type: 0,
  })
  useEffect(() => {
    initial &&
      relationId &&
      getRelation({ guildId: options?.guildId, relationId }, { cache: options?.cache }).then(res => {
        setRelationShip(res)
      })
  }, [initial, relationId])
  const isFriend = useMemo(() => relationShip.type === RelationType.friend, [relationShip])
  return { associates: relationShip, isFriend }
}

export function useUserCardHandle(userId: string, guildId?: string, afterHandler?: () => void, open = true, cache = false) {
  const [user, setUser] = useState<UserStruct>()
  const [localUser, setLocalUser] = useState<UserStruct>()
  const { associates, isFriend } = useUserAssociates(userId, { guildId }, open)
  const guild = useAppSelector(guildListSelectors.guild(guildId), isEqual)
  const dispatch = useAppDispatch()

  const isCanDm = useMemo(() => canDm(userId, guild), [userId, guild])
  const isCanAddFriend = useMemo(() => canAddFriend(userId, guild), [userId, guild])

  const handleDMClick = useCallback(async () => {
    if (!isCanDm) {
      FbToast.open({ content: '当前社区没有开启私信', key: 'can-dm-tips' })
      return
    }
    const dmChannel = await generateDMChannel({ recipientId: userId, guildId })
    if (dmChannel) {
      // 临时置顶
      dispatch(dmActions.temporaryPin(dmChannel))
      router.navigate(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/${dmChannel.channel_id}`, { replace: true })
      afterHandler?.()
    }
  }, [isCanDm])
  const handleClick = useCallback(() => {
    showUnsupportedFeatureToast()
    //  afterHandler?.()
  }, [])

  const handleAddFriendClick = useCallback(async () => {
    if (!isCanAddFriend) {
      FbToast.open({ content: '当前社区没有开启添加好友', key: 'can-add-friend-tips' })
      return
    }
    // 客户没有开启下面提示
    // if (associates.type === RelationType.pendingOutgoing) {
    //   FbToast.open({ content: '待对方验证', key: 'can-add-friend-tips' })
    //   return
    // }
    // if (associates.type === RelationType.pendingIncoming) {
    //   await agree(LocalUserInfo.userId, userId)
    //   FbToast.open({ content: '同意请求', key: 'can-add-friend-tips' })
    //   return
    // }

    if (localUser && checkUserBan(localUser, CheckBanType.FriendAdd)) {
      FbToast.open({ content: '你的账号涉嫌违规，暂时无法添加好友', key: 'can-add-friend-tips' })
      return
    }

    // 对方是否允许好友请求
    const canAdd: boolean = associates.receive_friend_request ?? true
    // 对方是否将我屏蔽
    const inBlackList: boolean = associates.black_list ?? false
    if (!canAdd) {
      FbToast.open({ content: '对方不接受好友申请', key: 'can-add-friend-tips' })
      return
    }
    if (inBlackList) {
      FbToast.open({ content: '对方拒收了你的消息', key: 'can-add-friend-tips' })
      return
    }

    const { destroy: close } = showFbModal({
      title: '添加好友',
      width: 440,
      showOkButton: false,
      showCancelButton: false,
      content: <AddFriendModal userId={userId} guildId={guildId} nickname={user?.nickname} onClose={() => close()}></AddFriendModal>,
    })
    afterHandler?.()
  }, [isCanAddFriend, associates])

  // 点击用户卡片从社区刷新用户信息
  useEffect(() => {
    if (open) {
      UserHelper.getUser(userId, guildId, {
        fetchServer: !cache,
      }).then(user => setUser(user))
      UserHelper.getUser(LocalUserInfo.userId, guildId, {
        fetchServer: !cache,
      }).then(user => setLocalUser(user))
    }
  }, [open])

  return { isCanDm, isCanAddFriend, isFriend, handleDMClick, handleAddFriendClick, handleClick }
}
