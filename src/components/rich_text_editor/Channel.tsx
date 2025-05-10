import InlineWrapper from 'fb-components/rich_text_editor/InlineWrapper'
import { ChannelElement } from 'fb-components/rich_text_editor/custom-editor'
import { RenderElementProps } from 'slate-react'
import RealtimeChannelName from '../realtime_components/RealtimeChannel'

export default function Channel({ element, attributes, children }: RenderElementProps) {
  const { id } = element as ChannelElement
  return (
    <span className="mx-0.5" {...attributes}>
      <RealtimeChannelName
        contentEditable={false}
        className="text-[var(--fg-blue-1)]"
        prefixChannelIcon
        iconSpacing={2}
        channelId={id}
        defaultChannelName={'#频道已删除'}
      />
      <InlineWrapper>{children}</InlineWrapper>
    </span>
  )
}
