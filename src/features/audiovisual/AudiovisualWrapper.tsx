import { isEqual } from 'lodash-es'
import { useAppSelector } from '../../app/hooks'
import AudiovisualConfirmDialog from './AudiovisualConfirmDialog'
import AudiovisualFloatingWindow from './AudiovisualFloatingWindow'
import { AudiovisualContext, useManager } from './audiovisual-hook'
import { currentRoomInfo, isRoomConnecting } from './audiovisual-slice'

const AudiovisualWrapper: React.FC<React.PropsWithChildren> = ({ children }: React.PropsWithChildren) => {
  const isAudiovisualConnecting = useAppSelector(isRoomConnecting)
  const { channelId: currentChannelId, guildId: currentGuildId } = useAppSelector(currentRoomInfo, isEqual)
  const manager = useManager(currentGuildId, currentChannelId, true)
  return (
    <AudiovisualContext.Provider value={manager}>
      {children}
      {isAudiovisualConnecting && <AudiovisualFloatingWindow />}
      <AudiovisualConfirmDialog />
    </AudiovisualContext.Provider>
  )
}
export default AudiovisualWrapper
