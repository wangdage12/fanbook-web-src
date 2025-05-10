/* eslint-disable */
import './circle-menu-dropdown.less'

import { Dropdown, DropDownProps, MenuProps, Modal } from 'antd'
import dayjs from 'dayjs'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal.tsx'
import { default as fb_toast, default as FbToast } from 'fb-components/base_ui/fb_toast'
import { CircleContentStruct, CircleDisplay, CircleStatus, CircleVisibility, PostType, SubInfo, TagStruct } from 'fb-components/circle/types.ts'
import { splitMediaAndBody } from 'fb-components/rich_text/split.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { useEffect, useMemo, useState } from 'react'
import usePermissions from '../../../base_services/permission/usePermissions.ts'
import ServerTime from '../../../base_services/ServerTime.ts'
import { showDeleteConfirmModal } from '../../../components/delete_confirm_modal.tsx'
import MenuItemLabel from '../../../components/MenuItemLabel.tsx'
import { useUserInfo } from '../../../components/realtime_components/realtime_nickname/hooks.ts'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { ChannelPermission, GuildPermission, PostPermission } from '../../../services/PermissionService.ts'
import serverSideConfig from '../../../services/ServeSideConfigService.ts'
import ContentAuditUtils, { ContentAuditType } from '../../../utils/ContentAuditUtils.ts'
import DurationUtils from '../../../utils/DurationUtils.ts'
import { report } from '../../../utils/jump.tsx'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import useCountdown from '../../login/count_down.ts'
import CircleApi, { CircleHotInfo } from '../circle_api.ts'
import openCirclePublisher from '../CirclePublisher.tsx'
import { PublishArticleArgs, PublishPostArgs } from '../circleSlice.ts'
import { CircleUtils } from '../CircleUtils.tsx'
import { AnswerReplyMenuItemKey } from './CircleCommentReplyMenuDropdown.tsx'
import { showCircleDetailTagManageModal } from './CircleDetailTagManage.tsx'
import { showCircleRecommendSettingModal } from './CircleRecommendSetting.tsx'
import { CircleStatistics } from './CircleStatistics.tsx'

export enum CircleMenuItemKey {
  Top = 'top',
  Data = 'Data',
  Hot = 'hot',
  // 优先推荐
  Recommend = 'recommend',
  // 设置不推荐
  UnRecommend = 'unRecommend',
  Visibility = 'visibility',
  Report = 'report',
  Delete = 'delete',
  Edit = 'edit',
  Tag = 'tag',
}

export interface CircleActions {
  onTop?: (data: boolean, detail: CircleContentStruct) => void
  onView?: () => void
  onCollect?: (data: SwitchType) => void
  onLike?: (subInfo: Partial<SubInfo>) => void
  onDelete?: () => void
  onDigest?: (data: SwitchType) => void
  onUpdateVisibility?: (display: CircleDisplay) => void
  onUpdateUnRecommend?: (recommend: SwitchType) => void
  onUpdateRecommend?: (recommendDay: number) => void
  onUpdateTags?: (tags: TagStruct[]) => void
}

interface CircleMenuDropdownProps extends Omit<DropDownProps, 'menu'>, CircleActions {
  detail: CircleContentStruct
  beforeHandler?: () => void
}

function CircleMenuDropdown({
  children,
  beforeHandler,
  detail,
  onTop,
  onDelete,
  onUpdateVisibility,
  onUpdateUnRecommend,
  onUpdateRecommend,
  onUpdateTags,
  ...props
}: CircleMenuDropdownProps) {
  const {
    guild_id: guildId,
    channel_id: channelId,
    post_id,
    topic_id,
    title,
    post_type,
    content,
    status = CircleStatus.success,
    recommend = SwitchType.Yes,
    visibility = CircleVisibility.all,
    recommend_day = 0,
    tags = [],
  } = detail.post ?? {}
  const visibilityIsAll = visibility == CircleVisibility.all
  const guild = GuildUtils.getGuildById(guildId)
  const { is_top = false } = detail.sub_info ?? {}
  const { user_id: authorId } = detail.user ?? {}
  const { user } = useUserInfo(authorId, guildId)

  const [hotInfo, setHotInfo] = useState<CircleHotInfo | null>(null)

  const manageCirclePerm = usePermissions({
    permission: GuildPermission.ManageCircle,
    guildId,
  })
  const permission = usePermissions({
    permission: ChannelPermission.ChannelManager | PostPermission.CreatePost,
    guildId,
    channelId,
  })
  const isAuthor = authorId === LocalUserInfo.userId
  const canModify = useMemo(() => {
    let canModify: boolean
    switch (post_type) {
      case PostType.article:
      case PostType.multi_para:
        // 文章和多段文章，只有作者可以编辑 同时需要开启多段文章 且还在社区中
        canModify = GuildUtils.isInGuild(guildId) && guild?.post_multi_para == SwitchType.Yes && isAuthor
        break
      default:
        // 只有作者可以编辑 且还在社区中 有编辑权限 或者开启多段文章
        canModify =
          GuildUtils.isInGuild(guildId) && (permission.has(PostPermission.CreatePost) || guild?.post_multi_para == SwitchType.Yes) && isAuthor
        break
    }
    return canModify
  }, [post_type, isAuthor, permission])

  async function getHotInfo() {
    // 有权限和需要才去请求
    if (serverSideConfig.isCircleUseRainbowHot(guildId) && permission.has(ChannelPermission.ChannelManager)) {
      const data = await CircleApi.circlePostGetHot(post_id)
      setHotInfo(data)
    }
  }

  useEffect(() => {
    getHotInfo()
  }, [])

  const serverTime = ServerTime.now()
  const limitDays = dayjs(serverTime, 'X').diff(dayjs(detail.post.created_at, 'x'), 'day')
  const isLimit30Days = limitDays > 30
  const isLimit14Days = limitDays > 14

  const items: MenuProps['items'] = (
    [
      [
        // 状态为审核中或审核失败 有风险 不展示推荐置顶操作
        ...(manageCirclePerm.any() && status === CircleStatus.success && visibilityIsAll ?
          [
            ...(serverSideConfig.circle_top === SwitchType.Yes ?
              [
                {
                  label: (
                    <MenuItemLabel
                      label="置顶动态"
                      icon={<iconpark-icon name="Top"></iconpark-icon>}
                      oppositeLabel="取消置顶"
                      oppositeIcon={<iconpark-icon name="TopMuted"></iconpark-icon>}
                      opposite={is_top}
                    />
                  ),
                  key: CircleMenuItemKey.Top,
                },
              ]
            : []),
            // 是否使用 彩虹算法 热门
            ...(serverSideConfig.isCircleUseRainbowHot(guildId) ?
              [
                {
                  label: (
                    <div className="inline-flex flex-col w-full">
                      <MenuItemLabel
                        tooltip={isLimit14Days ? { zIndex: 3000, title: '发布时间超过14天，不支持上热门' } : undefined}
                        label="上热门"
                        icon={<iconpark-icon name="Fire"></iconpark-icon>}
                      />
                      <span className="pl-[24px] text-[12px] text-[var(--fg-b40)]">{hotInfo?.end_time ? '已加热' : '未设置'}</span>
                    </div>
                  ),
                  key: CircleMenuItemKey.Hot,
                  disabled: isLimit14Days,
                  children:
                    !hotInfo?.end_time ?
                      [
                        {
                          label: <span className="text-xs">选择加热时长</span>,
                          type: 'group',
                          key: 'hot-title',
                        },
                        {
                          label: '2小时',
                          key: 2,
                        },
                        {
                          label: '6小时',
                          key: 6,
                        },
                        {
                          label: '12小时',
                          key: 12,
                        },
                        {
                          label: '24小时',
                          key: 24,
                        },
                        {
                          label: '2天',
                          key: 48,
                        },
                        {
                          label: '3天',
                          key: 72,
                        },
                        {
                          label: '4天',
                          key: 96,
                        },
                        {
                          label: '5天',
                          key: 120,
                        },
                        {
                          label: '6天',
                          key: 144,
                        },
                        {
                          label: '7天',
                          key: 168,
                        },
                      ]
                    : [
                        {
                          label: <HotStatus hotInfo={hotInfo} />,
                          type: 'group',
                          key: 'hot-title',
                        },
                        {
                          label: <MenuItemLabel label="停止加热" type="primary" />,
                          key: 'cancel',
                        },
                      ],
                },
              ]
            : [
                {
                  label: (
                    <div className="inline-flex flex-col">
                      <MenuItemLabel label="优先推荐" icon={<iconpark-icon name="Fire"></iconpark-icon>} />
                      <span className="pl-[24px] text-[12px] text-[var(--fg-b40)]">{recommend_day > 0 ? `剩余 ${recommend_day} 天` : '未设置'}</span>
                    </div>
                  ),
                  key: CircleMenuItemKey.Recommend,
                  children:
                    recommend_day > 0 ?
                      [
                        {
                          label: <MenuItemLabel label="重设时间" />,
                          key: 'set-time',
                        },
                        {
                          label: <MenuItemLabel label="撤销优先推荐" type="primary" />,
                          key: 'cancel',
                        },
                      ]
                    : undefined,
                },
              ]),
            {
              label: (
                <div className="inline-flex flex-col">
                  <MenuItemLabel label="设为不推荐" icon={<iconpark-icon name="Like" class="rotate-180"></iconpark-icon>} />
                  <span className="pl-[24px] text-[12px] text-[var(--fg-b40)]">{recommend == SwitchType.Yes ? '未设置' : '已设置'}</span>
                </div>
              ),
              key: CircleMenuItemKey.UnRecommend,
            },
          ]
        : []),
        ...(permission.has(ChannelPermission.ChannelManager) ?
          [
            {
              label: <MenuItemLabel label="话题管理" icon={<iconpark-icon name="Channel-Setting"></iconpark-icon>} />,
              key: CircleMenuItemKey.Tag,
            },
          ]
        : []),
      ],
      [
        ...(isAuthor ?
          [
            {
              label: (
                <MenuItemLabel
                  tooltip={isLimit30Days ? { zIndex: 3000, title: '发布时间超过30天，不支持查看数据' } : undefined}
                  label="动态数据"
                  icon={<iconpark-icon name="Data"></iconpark-icon>}
                />
              ),
              key: CircleMenuItemKey.Data,
              disabled: isLimit30Days,
            },
          ]
        : []),
        ...(canModify ?
          [
            {
              label: <MenuItemLabel label="编辑动态" icon={<iconpark-icon name="Edit"></iconpark-icon>} />,
              key: CircleMenuItemKey.Edit,
            },
          ]
        : []),
        ...(isAuthor ?
          [
            {
              label: (
                <div className="inline-flex flex-col">
                  <MenuItemLabel
                    label="公开可见"
                    icon={<iconpark-icon name="Unlock"></iconpark-icon>}
                    oppositeLabel="仅自己可见"
                    oppositeIcon={<iconpark-icon name="Lock"></iconpark-icon>}
                    opposite={visibility !== CircleVisibility.all}
                  />
                </div>
              ),
              key: 'visibility',
              children: [
                {
                  label: (
                    <MenuItemLabel
                      label="公开可见"
                      icon={<iconpark-icon name="Unlock" />}
                      trailing={visibility === CircleVisibility.all && <iconpark-icon name="Check" class="text-[var(--fg-blue-1)]"></iconpark-icon>}
                    />
                  ),
                  key: CircleVisibility.all,
                },
                {
                  label: (
                    <MenuItemLabel
                      label="仅自己可见"
                      icon={<iconpark-icon name="Lock"></iconpark-icon>}
                      trailing={visibility !== CircleVisibility.all && <iconpark-icon name="Check" class="text-[var(--fg-blue-1)]"></iconpark-icon>}
                    />
                  ),
                  key: CircleVisibility.onlyMe,
                },
              ],
            },
          ]
        : []),
        ...(!isAuthor ?
          [
            {
              label: <MenuItemLabel label="举报动态" icon={<iconpark-icon name="Warming"></iconpark-icon>} />,
              key: CircleMenuItemKey.Report,
            },
          ]
        : []),
        ...(authorId === LocalUserInfo.userId || permission.has(ChannelPermission.ChannelManager) ?
          [
            {
              label: <MenuItemLabel label="删除动态" icon={<iconpark-icon name="Delete"></iconpark-icon>} type="danger" />,
              key: CircleMenuItemKey.Delete,
            },
          ]
        : []),
      ],
    ] as MenuProps['items'][]
  )
    .reduce<Required<MenuProps>['items']>((flattened, subList) => {
      // 忽略空数组
      if (subList && subList.length > 0) {
        flattened.push(...subList, { type: 'divider' as const })
      }
      return flattened
    }, [])
    .slice(0, -1)

  async function handleTop() {
    if (recommend == SwitchType.No) {
      FbToast.open({ content: '该动态已被设为不推荐，无法置顶', key: CircleMenuItemKey.Top })
      return
    }
    try {
      await CircleApi.togglePin({
        postId: post_id,
        channelId,
        topicId: topic_id,
        status: is_top ? '0' : '1',
        title: is_top ? undefined : title,
      })
      const data = !is_top
      const content = !data ? '已取消置顶' : '置顶动态成功，可在‘推荐’查看'
      FbToast.open({ type: 'success', content, key: CircleMenuItemKey.Top })
      onTop?.(data, detail)
    } catch (err) {
      console.log(err)
    }
  }

  async function handleUpdateHot(action: string) {
    if (recommend == SwitchType.No) {
      FbToast.open({ content: '该动态已被设为不推荐，无法设置上热门', key: CircleMenuItemKey.Hot })
      return
    }
    const minutes = Number(action)
    // 取消加热
    if (isNaN(minutes)) {
      await CircleApi.circleTopHot(post_id, SwitchType.No)
    } else {
      await CircleApi.circleTopHot(post_id, SwitchType.Yes, minutes * 60)
    }
    getHotInfo()
    FbToast.open({ type: 'success', content: isNaN(minutes) ? '已停止加热' : '已设置加热', key: CircleMenuItemKey.Hot })
  }

  async function handleUpdateRecommend(action: string) {
    if (recommend == SwitchType.No) {
      FbToast.open({ content: '该动态已被设为不推荐，无法设置优先推荐', key: CircleMenuItemKey.Recommend })
      return
    }
    const isSetTime = action === 'set-time'
    try {
      const recommendedDay = isSetTime ? await showCircleRecommendSettingModal() : 0
      await CircleApi.circlePostRecommend(post_id, recommendedDay)
      FbToast.open({
        type: 'success',
        content: isSetTime ? '已优先推荐' : '已取消优先推荐',
        key: CircleMenuItemKey.Recommend,
      })
      onUpdateRecommend?.(recommendedDay)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUpdateUnRecommend() {
    if (is_top) {
      FbToast.open({ content: '该动态已被置顶，无法设为不推荐', key: CircleMenuItemKey.UnRecommend })
      return false
    }
    const _recommend = recommend === SwitchType.Yes ? SwitchType.No : SwitchType.Yes
    if (recommend) {
      FbModal.error({
        title: '设为不推荐',
        content: '此动态当前为公开可见，设为不推荐后，此动态将在本社区的圈子内不可见。',
        okText: '设为不推荐',
        cancelText: '取消',
        onOk: async () => {
          await CircleApi.circlePostUnRecommend(post_id, _recommend)
          FbToast.open({
            type: 'success',
            content: '已设为不推荐',
            key: CircleMenuItemKey.UnRecommend,
          })
          onUpdateUnRecommend?.(_recommend)
        },
      })
    } else {
      FbModal.info({
        title: '动态说明',
        okText: '取消不推荐',
        content: (
          <ul className="p-0 list-none [&>li]:relative [&>li]:flex [&>li]:before:inline-block [&>li]:before:w-1 [&>li]:before:h-1 [&>li]:before:bg-fgBlue1 [&>li]:before:rounded-full [&>li]:before:flex-shrink-0 [&>li]:before:mt-2 [&>li]:gap-2">
            <li>该动态已被设置为不推荐，当前已被限制可见范围，在本社区的圈子内不可见</li>
            <li>如需解除可见范围的限制，请取消不推荐</li>
          </ul>
        ),
        cancelText: '暂不处理',
        onOk: async () => {
          await CircleApi.circlePostUnRecommend(post_id, _recommend)
          FbToast.open({
            type: 'success',
            content: _recommend === SwitchType.Yes ? '已设为推荐' : '已设为不推荐',
            key: CircleMenuItemKey.Recommend,
          })
          onUpdateUnRecommend?.(_recommend)
        },
      })
    }
  }

  async function handleUpdateVisibility(display: CircleDisplay) {
    const _display = typeof display === 'string' ? Number(display) : display
    await CircleApi.setPostVisibility(post_id, _display)
    FbToast.open({
      type: 'success',
      content: _display === CircleVisibility.all ? '已设为公开可见' : '已设为仅自己可见',
      key: CircleMenuItemKey.Visibility,
    })
    onUpdateVisibility?.(_display)
  }

  async function handleUpdateTag() {
    const contentTags = CircleUtils.getTagsFromContent(content, true)
    const validTagIds = new Set(tags.map(tag => tag.tag_id))
    const validTags = contentTags.filter(tag => !tag.isFromOld && validTagIds.has(tag.tag_id))
    const invalidTags = contentTags.filter(tag => !tag.isFromOld && !validTagIds.has(tag.tag_id))
    showCircleDetailTagManageModal({
      validTags,
      invalidTags,
      post_id,
      onChange: tags => {
        onUpdateTags?.(tags)
      },
    })
  }

  async function handleDelete() {
    const fetchDelete = async (reasonType: number, label: string, reason?: string) => {
      await CircleApi.deletePost({
        postId: post_id,
        channelId,
        topicId: topic_id,
        isNotification: reasonType !== 0,
        reason: reasonType == 255 ? reason : label,
      })
      FbToast.open({
        content: '已删除动态',
        key: AnswerReplyMenuItemKey.Delete,
      })
    }
    if (authorId == LocalUserInfo.userId) {
      FbModal.error({
        title: '确定删除此动态吗？',
        okText: '删除',
        cancelText: '取消',
        closable: false,
        onOk: async () => {
          await fetchDelete(0, '')
          onDelete?.()
        },
      })
    } else {
      showDeleteConfirmModal({
        deleteText: '动态',
        confirmPromise: async (reasonType, label, reason) => {
          await fetchDelete(reasonType, label, reason)
        },
        onDelete: onDelete,
      }).then()
    }
  }

  const menu: MenuProps = {
    items,
    className: 'min-w-[160px]',
    onClick: async info => {
      const { key, keyPath, domEvent } = info
      domEvent.stopPropagation()
      beforeHandler?.()
      let menuKey = key as CircleMenuItemKey
      if (keyPath.length > 1) {
        menuKey = keyPath[1] as CircleMenuItemKey
      }

      switch (menuKey) {
        case CircleMenuItemKey.Top: {
          await handleTop()
          break
        }
        case CircleMenuItemKey.Data: {
          if (isLimit30Days) {
            FbToast.open({ type: 'warning', content: '发布时间超过30天不支持查看数据', key: CircleMenuItemKey.Data })
            return
          }

          showFbModal({
            title: '动态数据',
            className: 'circle-data-modal',
            footer: null,
            content: <CircleStatistics detail={detail} />,
          })
          break
        }
        case CircleMenuItemKey.Hot: {
          await handleUpdateHot(key)
          break
        }
        case CircleMenuItemKey.Recommend: {
          const action = key === menuKey ? 'set-time' : key
          await handleUpdateRecommend(action)
          break
        }
        case CircleMenuItemKey.UnRecommend: {
          await handleUpdateUnRecommend()
          break
        }
        case CircleMenuItemKey.Visibility: {
          await handleUpdateVisibility(key as unknown as CircleDisplay)
          break
        }
        case CircleMenuItemKey.Report:
          report({ accusedUserId: authorId, accusedName: user?.nickname, guildId: guildId })
          break
        case CircleMenuItemKey.Delete: {
          await handleDelete()
          break
        }
        case CircleMenuItemKey.Tag: {
          await handleUpdateTag()
          break
        }
        case CircleMenuItemKey.Edit: {
          //人工过审的帖子readOnly = 1
          if (detail.post.read_only === 1) {
            fb_toast.open({ content: '人工申诉通过的内容不再支持修改' })
            return
          }

          const rep = await ContentAuditUtils.checkStatus(ContentAuditType.post, guildId, channelId)
          if (rep.pending_list?.length) {
            fb_toast.open({ content: '当前存在申诉中的内容，无法创建新内容' })
            return
          }
          let reedit: PublishArticleArgs | PublishPostArgs = {
            guildId,
            title,
            post_id,
            cover: detail.post.cover,
            mentions: Object.values(detail.post.mentions_info).map(user => ({
              label: user.nickname!,
              value: user.user_id,
            })),
            visibility: detail.post.display,
            content: detail.post.content,
            tag_ids: detail.post.tag_ids,
          }
          if (post_type === PostType.image) {
            const res = splitMediaAndBody(detail.post.content)
            if (!('images' in res)) return
            const { images } = res
            reedit = {
              ...reedit,
              images: images.map(image => ({
                url: image.insert.source,
                cropInfo: {
                  originalArea: {
                    x: 0,
                    y: 0,
                    width: image.insert.width,
                    height: image.insert.height,
                  },
                },
              })),
              content: res.body,
            } as PublishPostArgs
          } else if (post_type === PostType.video) {
            const res = splitMediaAndBody(detail.post.content)
            if (!('video' in res)) return
            const { video } = res
            reedit = {
              ...reedit,
              video,
              content: res.body,
            } as PublishPostArgs
          }
          Modal.destroyAll()
          openCirclePublisher({ type: post_type, reedit, guildId })
          break
        }
        default:
          break
      }
    },
  }

  return (
    <Dropdown trigger={['click']} placement="bottomRight" menu={menu} {...props}>
      {children}
    </Dropdown>
  )
}

function HotStatus({ hotInfo }: { hotInfo: CircleHotInfo }) {
  const { end_time, update_user_id } = hotInfo
  const { time, start } = useCountdown({ initialTime: end_time - ServerTime.now() * 1000 })
  useEffect(() => {
    start()
  }, [])
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs">加热中，剩余时长：</span>
      <span className=" text-[var(--fg-b100)]">{end_time ? DurationUtils.formatSeconds(time / 1000) : '未设置'}</span>
      <div className="flex items-center gap-2">
        <RealtimeUserInfo userId={update_user_id}>
          <RealtimeAvatar userId={update_user_id} />
          <RealtimeNickname userId={update_user_id} />
        </RealtimeUserInfo>
        <span className="text-xs">设置了加热</span>
      </div>
    </div>
  )
}

export default CircleMenuDropdown
