import { Progress } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import CosImageUtils from 'fb-components/utils/CosImageUtils.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import { get as _get, isEmpty, isEqual } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts'
import PermissionBuilder from '../../base_services/permission/PermissionBuilder.tsx'
import AuthenticationIcon from '../../components/AuthenticationIcon.tsx'
import EmptyData from '../../components/EmptyData.tsx'
import { BoostBadgeIcon } from '../../components/boost/BoostBadge.tsx'
import GuildCard from '../../components/guild_card'
import { showInviteModal } from '../../components/invite_modal/InviteModal.tsx'
import { ChannelPermission, GuildPermission, PermissionService } from '../../services/PermissionService.ts'
import { bannerSlideSelector, fetchBannerSlideData } from '../banner_slide/bannerSlideSlice.ts'
import { GuildLevelHelper, VerificationStatus, guildLevelSelectors } from '../guild_level/guild-level-slice.ts'
import { guildListActions, guildListSelectors } from '../guild_list/guildListSlice.ts'
import MemberListAPI from '../home/MemberListAPI.ts'
import { InviteUtils } from '../invite/utils.tsx'
import BannerSlider from './BannerSlider.tsx'
import CircleChannelItem from './components/CircleChannelItem.tsx'
import GuildChannelList from './components/GuildChannelList.tsx'
import './guild-container.less'

export default function GuildContainer() {
  const dispatch = useAppDispatch()
  const { guildId } = useParams()
  const guild = useAppSelector(guildListSelectors.guild(guildId), isEqual)
  const bannerRef = useRef<HTMLImageElement>(null)
  const bannerList = useAppSelector(bannerSlideSelector(guildId!))
  const activeGuildPosters = useMemo(() => {
    if (!guild?.guild_set_banner) return []
    return (bannerList ?? []).filter(e => dayjs().isBetween(dayjs(e.start_at, 'X'), dayjs(e.end_at, 'X')))
  }, [bannerList])
  useEffect(() => {
    if (!guild) return
    !guild.member_count &&
      MemberListAPI.getGuildMemberCount(guild.guild_id).then(res =>
        dispatch(
          guildListActions.mergeGuild({
            guild_id: guild.guild_id,
            member_count: res,
          })
        )
      )
    !bannerList && dispatch(fetchBannerSlideData(guild.guild_id))
  }, [guild])

  if (!guild) return null
  const {
    banner_default = guild.banner,
    banner_static = guild.banner,
    banner_dynamic = guild.banner,
    banner_use = 1,
  } = guild.banner_config ?? {
    banner_default: guild.banner,
    banner_dynamic: guild.banner,
    banner_static: guild.banner,
    banner_use: 1,
  }
  const currentBanner = [banner_default, banner_static, banner_dynamic][banner_use - 1]
  const normalMode = isEmpty(activeGuildPosters)
  const bgSize = 128
  const bannerHeight = normalMode ? bgSize : 120 + 73
  const banner = CosImageUtils.thumbnailHeight(currentBanner, normalMode ? bgSize : 120)
  const textColor = normalMode ? 'var(--fg-white-1)' : 'var(--fg-b100)'
  const subTextColor = normalMode ? 'var(--fg-white-1)' : 'var(--fg-b40)'
  const onInvite = () => {
    showInviteModal(guild.guild_id)
  }
  const showPickRole = guild.user_pending && [2, 3].includes(guild.verification_level)
  const showLevel = !VerificationStatus.officialVerified(guild.guild_id) && guild.assist_display == SwitchType.Yes
  return (
    <div className={'flex h-0 flex-shrink flex-grow flex-col overflow-hidden rounded-tl-[10px] bg-[var(--bg-bg-3)]'}>
      {/* 社区 banner */}
      <div className={`banner-container ${normalMode ? 'normal' : ''}`}>
        <div
          className={'w-full'}
          style={{
            height: bannerHeight,
            transitionProperty: 'height',
            transitionDuration: '300ms',
          }}
        >
          <div className={clsx(['relative w-full aspect-[2]'])}>
            <img
              ref={bannerRef}
              className={'banner h-full w-full object-cover'}
              src={banner}
              alt=""
              draggable={false}
              onError={() => {
                bannerRef.current && (bannerRef.current.src = currentBanner)
              }}
            />
            {!normalMode && (
              <div
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.80) 3%, #FFFFFF 45%, #FFFFFF 100%)' }}
                className={'top-0 absolute w-full aspect-[2]'}
              ></div>
            )}
          </div>

          <div className={'absolute left-0 right-0 top-0 p-4'}>
            <div className={'mb-[4px] flex w-full flex-row items-center'}>
              {/* 社区名称 */}
              <div className={`guild-name text-[${textColor}]`}>{guild.name}</div>
              <AuthenticationIcon guild={guild} className={'mx-1 flex-shrink-0'} canHover={true}></AuthenticationIcon>
              <div className={'flex-1'}></div>
              <PermissionBuilder permission={ChannelPermission.CreateInstantInvite}>
                {allow =>
                  allow && (
                    <div className={'flex h-[24px] w-[24px] cursor-pointer items-center'} onClick={onInvite}>
                      <iconpark-icon name="UserAdd" color={`${textColor}`} size={18}></iconpark-icon>
                    </div>
                  )
                }
              </PermissionBuilder>

              {/* 社区信息卡片 */}
              <GuildCard guild={guild} memberCount={guild.member_count}>
                <div className={'flex h-[24px] w-[24px] cursor-pointer items-center'}>
                  <iconpark-icon name="More" color={`${textColor}`} class="m-1" size={18} />
                </div>
              </GuildCard>
            </div>
            {/* 社区人数*/}
            <div className={'guild-member-count'} style={{ color: `${subTextColor}` }}>
              {formatCount(guild.member_count, '0')}位成员
            </div>
            {!normalMode && (
              <BannerSlider
                rootClassName={'banner-carousel ml-[-8px] mt-[12px] h-[120px] w-[240px] rounded-[8px] overflow-hidden'}
                images={activeGuildPosters!}
                imageStyle={{
                  backgroundSize: 'cover',
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/*领取身份组、服务器等级*/}
      {(showPickRole || showLevel) && (
        <div className={'m-[8px] flex flex-row gap-2'}>
          {showPickRole && <PickRoleSection guildId={guild.guild_id} vertical={showLevel} />}
          {showLevel && <LevelSection guildId={guild.guild_id} vertical={showPickRole} />}
        </div>
      )}
      {/* 频道列表 */}
      <div className={'overflow-y-auto'}>
        {guild.circle_display && !_get(window, 'globalConfig.hideCircleEntrance', false) && <CircleChannelItem guild={guild} />}
        <PermissionBuilder guildId={guild.guild_id} permission={GuildPermission.ManageChannels}>
          {hasManagePermission => {
            let showEmptyUi
            if (hasManagePermission) {
              showEmptyUi = Object.keys(guild.channels).length == 0
            } else {
              showEmptyUi = Object.values(guild.channels).every(element => element.type == ChannelType.Category)
              if (!showEmptyUi) {
                showEmptyUi = Object.values(guild.channels)
                  .filter(element => element.type != ChannelType.Category)
                  .every(e => {
                    return PermissionService.isPrivateChannel(guild.guild_id, e.channel_id)
                  })
              }
            }
            return (
              <div className="mb-2 flex-1">
                {showEmptyUi ?
                  <div className={'flex h-full w-full items-center justify-center'}>
                    <EmptyData message={'暂无频道'} type="channel" />
                  </div>
                : <GuildChannelList guild={guild} hasManagePermission={hasManagePermission} />}
              </div>
            )
          }}
        </PermissionBuilder>
      </div>
    </div>
  )
}

function PickRoleSection({ guildId, vertical = false }: { guildId: string; vertical?: boolean }) {
  return (
    <div
      onClick={() => InviteUtils.showRoleQuestionnaireModal({ guildId })}
      className={
        'border-[0.5px solid rgba(25, 140, 254, 0.1)] flex h-[56px] w-full flex-1 cursor-pointer items-center gap-[8px] overflow-hidden whitespace-nowrap rounded-[8px] bg-[var(--fg-blue-3)] p-[8px]'
      }
    >
      <div className={'h-[14px] w-[14px] self-start'}>
        <iconpark-icon name="UserShieldFill" size={14} color={'var(--fg-blue-1)'}></iconpark-icon>
      </div>
      <div className={'flex-1'}>
        <div className={'text-sm font-medium text-[var(--fg-blue-1)]'}>领取身份组</div>
        <div className={'mt-[4px] text-xs text-[var(--fg-b30)]'}>解锁更多频道</div>
      </div>
      {!vertical && <iconpark-icon name="IdentityGroup" size={40} class={'text-[var(--fg-blue-3)]'}></iconpark-icon>}
    </div>
  )
}

function LevelSection({ guildId, vertical = false }: { guildId: string; vertical?: boolean }) {
  const guildLevelInfo = useAppSelector(guildLevelSelectors.guildLevelInfoByGuildId(guildId))
  useEffect(() => {
    const count = GuildLevelHelper.computePercent(guildId)
    setLevelPercent(count)
  }, [guildLevelInfo])
  const [levelPercent, setLevelPercent] = useState(0)

  return (
    <div
      className={
        'border-[0.5px solid rgba(25, 140, 254, 0.1)] flex h-[56px] w-full flex-1 items-center gap-[8px] overflow-hidden whitespace-nowrap rounded-[8px] bg-[var(--function-yellow-3)] p-[8px]'
      }
    >
      <div className={'mt-[2px] h-[14px] w-[14px] self-start'}>
        <BoostBadgeIcon size={14}></BoostBadgeIcon>
      </div>
      <div className={'flex-1'}>
        <div className={clsx(['flex items-center gap-1', vertical ? 'flex-col' : 'flex-row'])}>
          <div className={'text-sm font-medium text-[var(--function-yellow-1)]'}>助力社区</div>
          {!vertical && <div className={'flex-1'}></div>}
          <div className={clsx(['text-[13px] text-[var(--fg-b40)]', vertical ? '' : ''])}>当前等级 LV.{guildLevelInfo?.hierarchy ?? 0}</div>
        </div>
        {!vertical && (
          <Progress
            className={'!leading-none'}
            rootClassName={'m-0 !leading-none h-4'}
            strokeColor={'var(--function-yellow-1)'}
            trailColor={'var(--function-yellow-2)'}
            showInfo={false}
            percent={levelPercent}
            size={['100%', 4]}
          />
        )}
      </div>
    </div>
  )
}
