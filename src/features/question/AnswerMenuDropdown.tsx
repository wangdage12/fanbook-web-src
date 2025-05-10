import { Dropdown, DropDownProps, MenuProps } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { QuestionAnswerStruct } from 'fb-components/question/types'
import { SwitchType } from 'fb-components/struct/type'
import { useAppDispatch } from '../../app/hooks'
import usePermissions from '../../base_services/permission/usePermissions'
import MenuItemLabel from '../../components/MenuItemLabel'
import { useUserInfo } from '../../components/realtime_components/realtime_nickname/hooks'
import { ChannelPermission } from '../../services/PermissionService'
import { report } from '../../utils/jump.tsx'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import QuestionApi from './questionAPI'
import { questionActions } from './questionSlice'

export enum QuestionMenuItemKey {
  Suggest = 'suggest',
  Report = 'report',
  Delete = 'delete',
}

interface QuestionMenuDropdownProps extends Omit<DropDownProps, 'menu'> {
  article: QuestionAnswerStruct
  beforeHandler?: () => void
  onDeleteAnswer?: () => void
  onToggleSuggest?: (res: SwitchType) => void
}

export function AnswerMenuDropdown({ children, beforeHandler, article, onDeleteAnswer, onToggleSuggest, ...props }: QuestionMenuDropdownProps) {
  const { author, answer } = article
  const authorId = author?.user_id
  const { guild_id: guildId, channel_id: channelId, question_id: questionId, answer_id: answerId } = answer
  const { user } = useUserInfo(author?.user_id, guildId)
  const dispatch = useAppDispatch()
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
                  label="设为推荐答案"
                  icon={<iconpark-icon name="CheckCircle"></iconpark-icon>}
                  oppositeLabel="取消推荐答案"
                  oppositeIcon={<iconpark-icon name="CheckCircleMuted"></iconpark-icon>}
                  opposite={article.answer?.is_choose === SwitchType.Yes ?? false}
                />
              ),
              key: QuestionMenuItemKey.Suggest,
            },
          ]
        : []),
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

  const menu: MenuProps = {
    items,
    className: 'min-w-[160px]',
    onClick: async info => {
      const { key, domEvent } = info
      domEvent.stopPropagation()
      beforeHandler?.()

      switch (key) {
        case QuestionMenuItemKey.Suggest: {
          handleToggleSuggest()
          break
        }
        case QuestionMenuItemKey.Report:
          report({ accusedUserId: authorId, accusedName: user?.nickname, guildId: guildId })
          break
        case QuestionMenuItemKey.Delete: {
          handleDeleteAnswer()
          break
        }
        default:
          break
      }
    },
  }

  const handleToggleSuggest = async () => {
    try {
      const { is_choose = SwitchType.No, question_id, channel_id, answer_id } = answer ?? {}
      is_choose === SwitchType.Yes ?
        await QuestionApi.answerUnchosen({ questionId: question_id, answerId: answer_id, channelId: channel_id })
      : await QuestionApi.answerChoose({ questionId: question_id, answerId: answer_id, channelId: channel_id })
      const res = is_choose === SwitchType.Yes ? SwitchType.No : SwitchType.Yes
      const content = !res ? '已取消推荐答案' : '已设为推荐答案'
      FbToast.open({ content, key: QuestionMenuItemKey.Suggest })
      onToggleSuggest?.(res)
    } catch (err) {
      console.log(err)
    }
  }

  const handleDeleteAnswer = () => {
    FbModal.error({
      title: '确定删除此回答吗？',
      okText: '删除',
      cancelText: '取消',
      closable: false,

      onOk: async () => {
        try {
          await QuestionApi.answerDelete({ questionId, answerId, channelId })
          dispatch(questionActions.updateAnswerCount({ questionId, updateCount: -1 }))
          FbToast.open({
            content: '已删除回答',
            key: QuestionMenuItemKey.Delete,
          })
          onDeleteAnswer?.()
        } catch (err) {
          console.log(err)
        }
      },
    })
  }

  return (
    <Dropdown trigger={['click']} menu={menu} {...props}>
      {children}
    </Dropdown>
  )
}
