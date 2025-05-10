import { Popover, Slider, Tooltip } from 'antd'
import { Button } from 'antd/lib'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { isEqual } from 'lodash-es'
import { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import Benefit from '../guild_level/Benefit'
import GuildUtils from '../guild_list/GuildUtils'
import { GuildContext } from '../home/GuildWrapper'
import { JoinStatus } from './audiovisual-entity'
import { AudiovisualContext, useControl } from './audiovisual-hook'
import { currentRoomInfo } from './audiovisual-slice'

import './audiovisual-control.less'

const AudiovisualControl: React.FC = () => {
  const currentGuild = useContext(GuildContext)
  const { channelId: currentChannelId } = useParams()
  const manager = useContext(AudiovisualContext)
  const [volume, setVolume] = useState(manager?.volume ?? 50)

  const { channelId, guildId } = useAppSelector(currentRoomInfo, isEqual)
  const guild = guildId ? GuildUtils.getGuildById(guildId) : undefined
  let channel: ChannelStruct | undefined
  if (channelId && guildId) {
    channel = GuildUtils.getChannelById(guildId, channelId)
  }

  const { joinStatus, audioBan, videoBan, audioMuted, videoMuted, levelLimit, handleHandUp, handleAudio, handleVideo } = useControl(
    manager,
    currentGuild?.guild_id,
    currentChannelId
  )

  const handleVolumeChange = (volume: number) => {
    if (!manager) {
      return
    }
    manager.setVolume(volume)
    setVolume(volume)
  }

  if (!guild || !channel) return null
  return (
    <div className="flex w-full flex-col bg-[var(--fg-white-1)] px-[8px] py-[12px] shadow-[0_-20px_20px_0_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <iconpark-icon name="Signal" color="var(--function-green-1)" class="mr-[8px]" size={14}></iconpark-icon>
          语音已连接
        </div>
        <Popover
          trigger={'click'}
          overlayInnerStyle={{ padding: 0 }}
          arrow={false}
          content={
            <div className="flex h-[128px] w-[42px] justify-center py-[16px]">
              <Slider
                vertical
                className="audiovisual-control-slider my-0 py-0"
                value={volume}
                onChange={handleVolumeChange}
                styles={{
                  rail: { borderRadius: 4 },
                  track: { borderRadius: 4, background: 'var(--fg-blue-1)' },
                  handle: {
                    boxShadow: '0 2px 6px 0 rgba(26, 32, 51, 0.15)',
                    background: 'var(--fg-white-1)',
                    width: 10,
                    height: 10,
                    borderRadius: '100%',
                  },
                }}
              />
            </div>
          }
        >
          {volume > 0 ?
            <iconpark-icon name="Sound" color="var(--fg-blue-1)" size={14}></iconpark-icon>
          : <iconpark-icon name="Sound-Off" color="var(--fg-blue-1)" size={14}></iconpark-icon>}
        </Popover>
      </div>
      <div className="mb-[12px] mt-[16px] flex items-center text-[var(--fg-b60)]">
        {guild && <CosImage src={guild.icon} size={18} className="mr-[8px] rounded-[4px]" />}
        {channel?.name}
      </div>
      <div className="flex justify-between">
        <Tooltip placement="top" title={audioMuted ? '打开麦克风' : '关闭麦克风'} overlayInnerStyle={{ fontSize: 12 }}>
          <Button
            className="flex-center btn-secondary !w-[75px]"
            icon={
              audioBan ?
                <iconpark-icon
                  name="AudioStop2"
                  size={16}
                  class={joinStatus === JoinStatus.joining ? 'text-[var(--fg-b40)]' : 'text-[var(--fg-b100)]'}
                ></iconpark-icon>
              : audioMuted ?
                <iconpark-icon
                  name="AudioMuted2"
                  size={16}
                  class={joinStatus === JoinStatus.joining ? 'text-[var(--fg-b40)]' : 'text-[var(--function-red-1)]'}
                ></iconpark-icon>
              : <iconpark-icon
                  name="Audio2"
                  size={16}
                  class={joinStatus === JoinStatus.joining ? 'text-[var(--fg-b40)]' : 'text-[var(--fg-b100)]'}
                ></iconpark-icon>

            }
            disabled={joinStatus === JoinStatus.joining}
            onClick={handleAudio}
          />
        </Tooltip>
        <Tooltip
          placement="top"
          title={
            levelLimit ? `解锁社区等级 LV.${Benefit.videoSupport.requiredLevel} 后可使用`
            : videoMuted ?
              '打开摄像头'
            : '关闭摄像头'
          }
          overlayInnerStyle={{ fontSize: 12 }}
        >
          <Button
            className="flex-center btn-secondary !w-[75px]"
            icon={
              levelLimit ? <iconpark-icon name="Video" color="var(--fg-b40)" size={16}></iconpark-icon>
              : videoBan ?
                <iconpark-icon
                  name="VideoStop"
                  size={16}
                  class={joinStatus === JoinStatus.joining ? 'text-[var(--fg-b40)]' : 'text-[var(--fg-b100)]'}
                ></iconpark-icon>
              : videoMuted ?
                <iconpark-icon
                  name="VideoMuted"
                  size={16}
                  class={joinStatus === JoinStatus.joining ? 'text-[var(--fg-b40)]' : 'text-[var(--function-red-1)]'}
                ></iconpark-icon>
              : <iconpark-icon
                  name="Video"
                  size={16}
                  class={joinStatus === JoinStatus.joining ? 'text-[var(--fg-b40)]' : 'text-[var(--fg-b100)]'}
                ></iconpark-icon>

            }
            disabled={joinStatus === JoinStatus.joining || levelLimit}
            onClick={handleVideo}
          />
        </Tooltip>
        <Tooltip placement="top" title={'挂断'} overlayInnerStyle={{ fontSize: 12 }}>
          <Button
            className="flex-center !w-[75px]"
            danger
            type={'primary'}
            icon={<iconpark-icon name="Phone" color="var(--fg-white-1)" size={16} />}
            disabled={joinStatus === JoinStatus.joining}
            onClick={handleHandUp}
          />
        </Tooltip>
      </div>
    </div>
  )
}

export default AudiovisualControl
