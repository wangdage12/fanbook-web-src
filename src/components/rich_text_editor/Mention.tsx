import { TextMentionSign } from 'fb-components/rich_text/types'
import InlineWrapper from 'fb-components/rich_text_editor/InlineWrapper'
import { MentionElement } from 'fb-components/rich_text_editor/custom-editor'
import ColorUtils from 'fb-components/utils/ColorUtils'
import { RenderElementProps } from 'slate-react'
import RoleName from '../realtime_components/RoleName'
import { RealtimeNickname } from '../realtime_components/realtime_nickname/RealtimeUserInfo'

export default function Mention({ element, attributes, children }: RenderElementProps) {
  const { sign, id, roleColor } = element as MentionElement
  return (
    <span className="mx-0.5" {...attributes}>
      {sign === TextMentionSign.Role ?
        <RoleName
          contentEditable={false}
          prefix={'@'}
          roleId={id}
          style={{
            color: ColorUtils.convertToCssColor(roleColor),
          }}
        />
      : <RealtimeNickname contentEditable={false} className={'text-[var(--fg-blue-1)]'} userId={id} prefix={'@'} />}
      <InlineWrapper>{children}</InlineWrapper>
    </span>
  )
}
