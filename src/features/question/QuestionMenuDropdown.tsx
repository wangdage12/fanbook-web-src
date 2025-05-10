import { Dropdown, DropDownProps, MenuProps } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { QuestionAnswerArticleStruct, QuestionAnswerStruct } from 'fb-components/question/types'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import { SwitchType } from 'fb-components/struct/type'
import { Key } from 'react'
import usePermissions from '../../base_services/permission/usePermissions'
import { showDeleteConfirmModal } from '../../components/delete_confirm_modal.tsx'
import MenuItemLabel from '../../components/MenuItemLabel'
import { useUserInfo } from '../../components/realtime_components/realtime_nickname/hooks'
import { ChannelPermission } from '../../services/PermissionService'
import { copyText } from '../../utils/clipboard'
import { report } from '../../utils/jump.tsx'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import QuestionApi, { ReadPermission } from './questionAPI'
import { QuestionContentStruct } from './questionSlice.ts'

export enum QuestionMenuItemKey {
  Top = 'top',
  Featured = 'featured',
  Collect = 'collect',
  Copy = 'copy',
  Public = 'public',
  Private = 'private',
  Report = 'report',
  Delete = 'delete',
}

export interface QuestionActions {
  onTop?: (res: SwitchType) => void
  onView?: () => void
  onCollect?: (res: SwitchType) => void
  onDeleteQuestion?: () => void
  onDigest?: (res: SwitchType) => void
  onUpdatePermission?: (changePermission: number) => void
  onAnswer?: (answer?: QuestionAnswerStruct) => void
}

interface QuestionMenuDropdownProps extends Omit<DropDownProps, 'menu'>, QuestionActions {
  article: QuestionContentStruct
  beforeHandler?: () => void
}

function QuestionMenuDropdown({
  children,
  beforeHandler,
  article,
  onTop,
  onDeleteQuestion,
  onCollect,
  onDigest,
  onUpdatePermission,
  ...props
}: QuestionMenuDropdownProps) {
  const {
    question_id: questionId,
    guild_id: guildId,
    channel_id: channelId,
    is_digest,
    is_collected,
    is_top,
    read_permission = ReadPermission.All,
  } = article.question ?? {}
  const { user_id: authorId } = article.author ?? {}
  const { user } = useUserInfo(authorId, guildId)
  const permission = usePermissions({
    permission: ChannelPermission.ChannelManager,
    guildId,
    channelId,
  })

  const items: MenuProps['items'] = (
    [
      [
        ...(permission.has(ChannelPermission.ChannelManager) ?
          [
            {
              label: (
                <MenuItemLabel
                  label="置顶"
                  icon={<iconpark-icon name="Top"></iconpark-icon>}
                  oppositeLabel="取消置顶"
                  oppositeIcon={<iconpark-icon name="TopMuted"></iconpark-icon>}
                  opposite={is_top === SwitchType.Yes ?? false}
                />
              ),
              key: QuestionMenuItemKey.Top,
            },
            {
              label: (
                <MenuItemLabel
                  label="设为精选"
                  icon={<iconpark-icon name="Crown"></iconpark-icon>}
                  oppositeLabel="取消精选"
                  oppositeIcon={<iconpark-icon name="CrownMuted"></iconpark-icon>}
                  opposite={is_digest === SwitchType.Yes ?? false}
                />
              ),
              key: QuestionMenuItemKey.Featured,
            },
            {
              label: (
                <div className="inline-flex flex-col">
                  <MenuItemLabel
                    label="可见性"
                    icon={<iconpark-icon name="Eye"></iconpark-icon>}
                    oppositeIcon={<iconpark-icon name="EyeInvisible"></iconpark-icon>}
                    opposite={read_permission === ReadPermission.All ?? false}
                  />
                  <span className="pl-[24px] text-[12px] text-[var(--fg-b40)]">
                    {read_permission === ReadPermission.All ?? false ? '公开可见' : '频道内不可见'}
                  </span>
                </div>
              ),
              key: 'visibility',
              children: [
                {
                  label: (
                    <div className="inline-flex w-[160px] flex-col">
                      <div className="flex justify-between">
                        <span>公开可见</span>
                        {read_permission === ReadPermission.All && <iconpark-icon name="Check" class="text-[var(--fg-blue-1)]"></iconpark-icon>}
                      </div>
                      <span className="text-[12px] text-[var(--fg-b40)]">该问题的可见性不做任何限制</span>
                    </div>
                  ),
                  key: QuestionMenuItemKey.Public,
                },
                {
                  label: (
                    <div className="inline-flex w-[160px] flex-col">
                      <div className="flex justify-between">
                        <span>频道内不可见</span>
                        {read_permission !== 0 && <iconpark-icon name="Check" class="text-[var(--fg-blue-1)]"></iconpark-icon>}
                      </div>
                      <span className="text-[12px] text-[var(--fg-b40)]">该问题不会展示在除作者以外的用户的问题列表页中</span>
                    </div>
                  ),
                  key: QuestionMenuItemKey.Private,
                },
              ],
            },
          ]
        : []),
        {
          label: (
            <MenuItemLabel
              label="收藏问题"
              icon={<iconpark-icon name="Star"></iconpark-icon>}
              oppositeLabel="已收藏"
              oppositeIcon={<iconpark-icon class="text-[var(--function-yellow-1)]" name="StarFill"></iconpark-icon>}
              opposite={is_collected === SwitchType.Yes ?? false}
            />
          ),
          key: QuestionMenuItemKey.Collect,
        },
      ],
      [
        ...(authorId !== LocalUserInfo.userId ?
          [
            {
              label: <MenuItemLabel label="举报" icon={<iconpark-icon name="Warming"></iconpark-icon>} />,
              key: QuestionMenuItemKey.Report,
            },
          ]
        : []),
        ...(authorId === LocalUserInfo.userId || permission.has(ChannelPermission.ChannelManager) ?
          [
            {
              label: <MenuItemLabel label="删除" icon={<iconpark-icon name="Delete"></iconpark-icon>} type="danger" />,
              key: QuestionMenuItemKey.Delete,
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
    try {
      is_top === SwitchType.Yes ?
        await QuestionApi.questionTopCancel({ questionId, channelId })
      : await QuestionApi.questionTopAdd({ questionId, channelId })
      const res = is_top === SwitchType.Yes ? SwitchType.No : SwitchType.Yes
      const content = !res ? '已取消置顶' : '已置顶'
      FbToast.open({ content, key: QuestionMenuItemKey.Top })
      onTop?.(res)
    } catch (err) {
      console.log(err)
    }
  }

  async function handleDigest() {
    try {
      is_digest === SwitchType.Yes ?
        await QuestionApi.questionDigestCancel({ questionId, channelId })
      : await QuestionApi.questionDigestAdd({ questionId, channelId })
      const res = is_digest === SwitchType.Yes ? SwitchType.No : SwitchType.Yes
      const content = !res ? '已取消精选' : '已设为精选'
      FbToast.open({ content, key: QuestionMenuItemKey.Featured })
      onDigest?.(res)
    } catch (err) {
      console.log(err)
    }
  }

  async function handleCollect() {
    try {
      is_collected === SwitchType.Yes ?
        await QuestionApi.collectionCancel({ questionId, channelId })
      : await QuestionApi.collectionAdd({ questionId, channelId })
      const res = is_collected === SwitchType.Yes ? SwitchType.No : SwitchType.Yes
      const content = !res ? '已取消收藏' : '已收藏'
      FbToast.open({ content, key: QuestionMenuItemKey.Collect })
      onCollect?.(res)
    } catch (err) {
      console.log(err)
    }
  }

  async function handleUpdatePermission(key: Key) {
    const changePermission = key === QuestionMenuItemKey.Public ? ReadPermission.All : ReadPermission.Owner
    if (changePermission === read_permission) {
      return
    }
    try {
      await QuestionApi.questionReadPermissionUpdate({
        questionId,
        channelId,
        readPermission: changePermission,
      })
      FbToast.open({
        content: '可见性设置成功',
        key: `${QuestionMenuItemKey.Public}_${QuestionMenuItemKey.Private}`,
      })
      onUpdatePermission?.(changePermission)
    } catch (err) {
      console.log(err)
    }
  }

  const menu: MenuProps = {
    items,
    className: 'min-w-[160px]',
    onClick: async info => {
      const { key, domEvent } = info
      domEvent.stopPropagation()
      beforeHandler?.()

      switch (key) {
        case QuestionMenuItemKey.Top: {
          await handleTop()
          break
        }
        case QuestionMenuItemKey.Featured: {
          await handleDigest()
          break
        }
        case QuestionMenuItemKey.Collect: {
          await handleCollect()
          break
        }
        case QuestionMenuItemKey.Copy: {
          const { parsed } = article as QuestionAnswerArticleStruct
          parsed && (await copyText(richText2PlainText(parsed)))
          break
        }
        case QuestionMenuItemKey.Public:
        case QuestionMenuItemKey.Private: {
          await handleUpdatePermission(key)
          break
        }
        case QuestionMenuItemKey.Report:
          report({ accusedUserId: authorId, accusedName: user?.nickname, guildId: guildId })
          break
        case QuestionMenuItemKey.Delete: {
          handleDeleteQuestion()
          break
        }
        default:
          break
      }
    },
  }

  const handleDeleteQuestion = () => {
    if (!questionId || !channelId) return
    showDeleteConfirmModal({
      deleteText: '问题',
      confirmPromise: async (reasonType, label, reason) => {
        await QuestionApi.questionDelete({
          questionId,
          channelId,
          reason: reasonType === 255 ? reason : undefined,
          reasonType: reasonType,
        })
      },
      onDelete: onDeleteQuestion,
    }).then()
  }

  return (
    <Dropdown trigger={['click']} menu={menu} {...props}>
      {children}
    </Dropdown>
  )
}

export default QuestionMenuDropdown
