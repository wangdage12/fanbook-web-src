// - fanbook业务服务器WS推送监听
import { notification } from 'fb-components/base_component/entry'
import AppRoutes from '../../app/AppRoutes'
import { router } from '../../app/router'
import { store } from '../../app/store'
import Ws, { WsAction } from '../../base_services/ws'
import { RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { RelationAction, RelationData } from '../../components/user_card/entity'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { applyUnreadAsync } from './contact-list-slice'

export interface WsHandlerParams {
  handleRelation?: ({ data }: { data: RelationData }) => void
}

export function contactWsHandler({ handleRelation }: WsHandlerParams) {
  handleRelation && Ws.instance.on(WsAction.Relation, handleRelation)
  return () => {
    handleRelation && Ws.instance.off(WsAction.Relation, handleRelation)
  }
}

export const handleRelation = ({ data }: { data: RelationData }) => {
  const { type, request_id, relation_id } = data
  switch (type) {
    case RelationAction.apply: {
      store.dispatch(applyUnreadAsync())
      if (request_id !== LocalUserInfo.userId && relation_id === LocalUserInfo.userId) {
        notification.open({
          key: `${request_id}_apply_friend`,
          closeIcon: <iconpark-icon name="Close" fill="var(--fg-b100)" size={18}></iconpark-icon>,
          message: (
            <div>
              <RealtimeNickname userId={request_id} />
              <span>申请好友，快去通过吧~</span>
            </div>
          ),
          onClick: () => {
            router.navigate(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/${AppRoutes.CONTACT}/${AppRoutes.CONTACT_APPLY}`, { replace: true })
          },
        })
      }
      break
    }
    case RelationAction.friend:
    case RelationAction.cancel:
    case RelationAction.delete:
    case RelationAction.refuse:
    default:
      break
  }
}
