import { animated, useSpring } from '@react-spring/web'
import { Badge, Button, Dropdown, DropdownProps, Menu, Space } from 'antd'
import MenuItem from 'antd/es/menu/MenuItem'
import clsx from 'clsx'
import { PostType } from 'fb-components/circle/types.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { parseInt } from 'lodash-es'
import { useAppSelector } from '../../../app/hooks.ts'
import { store } from '../../../app/store.ts'
import usePermissions from '../../../base_services/permission/usePermissions.ts'
import { RealtimeAvatar } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import useEnvironmentSpecificDraftBox from '../../../hooks/useEnvironmentSpecificDraftBox.ts'
import { PostPermission } from '../../../services/PermissionService.ts'
import environmentSpecificDraftBox from '../../../utils/EnvironmentSpecificDraftBox.ts'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import openCirclePublisher from '../CirclePublisher.tsx'
import { PublishArticleArgs, PublishPostArgs, circleSelectors } from '../circleSlice.ts'
import './circle-tabs.less'

/**
 * 圈子发布按钮，可能是按钮，可能是下拉菜单
 * @param onClick
 * @param hasDraft
 * @param guild
 * @param showPublisher
 * @constructor
 */
function PublishButton({
  onClick,
  hasDraft,
  guild,
  showPublisher,
}: {
  guild: GuildStruct
  onClick?: () => void
  hasDraft?: boolean
  showPublisher?: boolean
}) {
  const progress = useAppSelector(circleSelectors.progress(guild.guild_id))
  const progressValue = useSpring({
    width: ((progress?.currentStep ?? 0) / (progress?.totalSteps ?? 1)) * 100 + '%',
  })

  return (
    <Badge count={!progress && hasDraft ? 1 : 0} dot offset={[-4, 0]}>
      <div className={'relative'}>
        <Button
          className={clsx(
            {
              'invisible': progress,
              'h-12 flex items-center text-base pl-2': showPublisher,
            },
            ' min-w-[88px]'
          )}
          type={'primary'}
          onClick={onClick}
        >
          <Space>
            {showPublisher ?
              <RealtimeAvatar className="border-fgWhite1 !border-[1.5px]" size={32} userId={LocalUserInfo.userId}></RealtimeAvatar>
            : null}
            发布动态
            {!onClick && <iconpark-icon class={'anticon'} size={16} name="Down" />}
          </Space>
        </Button>
        {progress && (
          <div className={'absolute left-0 right-0 top-0 bottom-0 rounded-full bg-fgBlue1/40 text-fgWhite1 overflow-hidden font-medium'}>
            <animated.div
              className={'bg-fgBlue1 h-full'}
              style={{
                ...progressValue,
              }}
            />
            <div className={'absolute top-0 bottom-0 left-0 right-0 flex-center'}>
              上传中&nbsp;
              <animated.span>{progressValue.width.to(v => parseInt(v))}</animated.span>%
            </div>
          </div>
        )}
      </div>
    </Badge>
  )
}

export function PublishDropDownButton({
  channelId,
  guild,
  placement = 'bottomRight',
  showPublisher,
  tag,
}: {
  // 默认带上的 tag
  tag?: string
  guild: GuildStruct
  channelId: string
  placement?: DropdownProps['placement']
  showPublisher?: boolean
}) {
  const guildId = guild.guild_id
  const duringPublishing = !!useAppSelector(circleSelectors.progress(guildId))
  const imageDraft = useEnvironmentSpecificDraftBox<PublishPostArgs>(`circle-${PostType.image}-${guildId}`)
  const articleDraft = useEnvironmentSpecificDraftBox<PublishArticleArgs>(`circle-${PostType.article}-${guildId}`)

  const hasDraft = !!(imageDraft || articleDraft)

  function defaultPostWithTag(): Partial<PublishPostArgs | PublishArticleArgs> | undefined {
    if (tag) {
      const name = store.getState().circle.recommendTagList.find(item => item.tag_id === tag)?.tag_name
      if (!name) return

      return {
        content: [
          {
            insert: `${name}`,
            attributes: {
              tag,
              _type: 'hashtag',
            },
          },
          // 缺少这个会导致 slate 聚焦时报错，可以尝试更新 slate 解决
          {
            insert: '\n',
          },
        ],
        tag_ids: [tag],
      }
    }
  }

  const menu = (
    <Menu>
      <MenuItem
        icon={<iconpark-icon class={'text-fgBlue1 mr-2'} name={'PictureFill'} size={16} />}
        onClick={() =>
          openCirclePublisher({
            type: PostType.image,
            reedit: imageDraft ?? defaultPostWithTag(),
            guildId,
          })
        }
      >
        <Badge dot count={!duringPublishing && imageDraft ? 1 : 0} offset={[4, 0]}>
          发布动态
        </Badge>
      </MenuItem>
      <MenuItem
        icon={<iconpark-icon class={'text-auxiliaryViolet mr-2'} name={'Article'} size={16} />}
        onClick={() =>
          openCirclePublisher({
            type: PostType.article,
            reedit: articleDraft ?? defaultPostWithTag(),
            guildId,
          })
        }
      >
        <Badge dot count={!duringPublishing && articleDraft ? 1 : 0} offset={[4, 0]}>
          发布长文
        </Badge>
      </MenuItem>
    </Menu>
  )

  const permission = usePermissions({
    guildId,
    channelId,
    permission: PostPermission.CreatePost | PostPermission.RichTextPost,
  })
  if (permission.has(PostPermission.CreatePost)) {
    // 用户有发布长文权限 及 社区开启发布长文权限
    if (permission.has(PostPermission.RichTextPost) && guild.post_multi_para == SwitchType.Yes) {
      return (
        <Dropdown
          className={'[&_.anticon]:translate-y-[1px]'}
          dropdownRender={() => menu}
          disabled={duringPublishing}
          placement={placement}
          overlayClassName={'w-[176px] [&_.ant-dropdown-menu-item]:!px-2.5'}
        >
          {/* 缺少这层 div 会导致 dropdown 不工作*/}
          <div>
            <PublishButton showPublisher={showPublisher} hasDraft={hasDraft} guild={guild} />
          </div>
        </Dropdown>
      )
    }
    return (
      <PublishButton
        showPublisher={showPublisher}
        onClick={() => {
          const imageDraft = environmentSpecificDraftBox.get<PublishPostArgs>(`circle-${PostType.image}-${guildId}`)
          openCirclePublisher({ type: PostType.image, reedit: imageDraft ?? defaultPostWithTag(), guildId })
        }}
        hasDraft={hasDraft}
        guild={guild}
      />
    )
  }
}
