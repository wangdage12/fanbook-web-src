import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { Block, BLOCKS, Hyperlink, Inline, INLINES, NodeData, Text, TopLevelBlock } from '@contentful/rich-text-types'
import { last } from 'lodash-es'
import React, { ReactNode, useContext, useEffect, useState } from 'react'
import EmojiIcon from '../components/EmojiIcon'
import ChatImage from '../components/image/ChatImage'
import VideoThumbnail from '../components/image/VideoThumbnail'
import LinkCard from '../components/LinkCard'
import { MediaPreviewItem, useMediaPreviewer } from '../components/previewer/MediaPreviewer'
import { LimitSize } from '../components/type'
import { VideoWrapper } from '../components/video/VideoWrapper'
import MallCard, { MALL_LINK_PATTERN } from '../link_cards/MallCard'
import QuestionBaseCard from '../question/card/QuestionBaseCard'
import QuestionContext from '../question/QuestionContext'
import { QuestionStruct } from '../question/types'
import RichTextContext from './RichTextContext'
import { EmbeddedAssetType, EmbeddedResourceType, InlineEntryHyperlinkType } from './types'

// 圈子频道正则
export const CIRCLE_TOPIC_PATTERN = /(^#T(\d+)-(\d+))/

interface RichTextRendererProps {
  data: TopLevelBlock[]
  onPreview?: (mediaIndex?: number) => void
  guildId?: string
  limitSize?: LimitSize
  renderImage?: (props: { nodeData: NodeData; onClick: () => void }) => React.ReactNode
  renderVideo?: (props: { nodeData: NodeData; onClick: () => void }) => React.ReactNode
  renderLinkCard?: (props: { nodeData: NodeData }) => React.ReactNode
}

export default function RichTextRenderer({ data, guildId, limitSize, renderVideo, renderImage, renderLinkCard, onPreview }: RichTextRendererProps) {
  const richTextContext = useContext(RichTextContext)
  const mediaPreviewer = useMediaPreviewer()
  const medias: MediaPreviewItem[] = []
  let mediaIndex = 0
  const handlePreview = (mediaIndex: number = 0) => {
    if (onPreview) {
      onPreview(mediaIndex)
      return
    }
    mediaPreviewer?.open({
      medias,
      initialIndex: mediaIndex,
    })
  }

  // 图片或视频在富文本消息中的下标

  const nodeMap = new Map<Block | Inline, number>()
  return documentToReactComponents(
    {
      nodeType: BLOCKS.DOCUMENT,
      content: data,
      data: {},
    },
    {
      renderMark: {
        strike: text => <s>{text}</s>,
      },
      renderText: text => {
        if (text === '\n') return <br />
        return <span className="break-all">{text}</span>
      },
      renderNode: {
        [INLINES.HYPERLINK]: (node, children) => {
          const { data, content } = node as Hyperlink

          // 商城分享链接卡片
          if (MALL_LINK_PATTERN.test(data.uri)) {
            return (
              <MallCard
                url={data.uri}
                style={{ border: '0.5px solid var(--fg-b10)' }}
                onClick={() => richTextContext.handleUrl(data.uri, { guildId })}
              />
            )
          }

          // #T535344449769701376-535344449408991232 为圈子频道
          if (CIRCLE_TOPIC_PATTERN.test(data.uri)) {
            const [, , id] = data.uri.match(CIRCLE_TOPIC_PATTERN) ?? []
            const [{ value = '' }] = content ?? []
            if (id) {
              return richTextContext.renderChannel({ id, text: value })
            }
          }
          return <a onClick={() => richTextContext.handleUrl(data.uri, { guildId })}>{children}</a>
        },
        [INLINES.ENTRY_HYPERLINK]: (node: Block | Inline) => {
          const { id, type, text } = node.data
          const { marks, value } = node as never as Text
          switch (type as InlineEntryHyperlinkType) {
            case InlineEntryHyperlinkType.MentionRole:
              return richTextContext.renderRole({ id, marks, text, guildId })
            case InlineEntryHyperlinkType.MentionUser:
              return richTextContext.renderUser({ id, marks, text, guildId })
            case InlineEntryHyperlinkType.Channel:
              return richTextContext.renderChannel({ id, text: value })
            case InlineEntryHyperlinkType.Topic:
              return richTextContext.renderTopic({ id, text: value, guildId })
          }
        },

        [INLINES.EMBEDDED_ENTRY]: (node: Block | Inline) => {
          return <EmojiIcon name={node.data.name} size={16} className={'message-inline-embed'} />
        },
        [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
          const { type, width, height, src, preview, localSrc, localPreview, duration } = node.data
          const _url = localSrc ?? src
          const _preview = localPreview ?? preview
          switch (type as EmbeddedAssetType) {
            case EmbeddedAssetType.Image:
              medias.push({
                width,
                height,
                type,
                url: _url,
              })
              nodeMap.set(node, mediaIndex++)
              return (
                renderImage?.({ nodeData: node.data, onClick: () => handlePreview(nodeMap.get(node)) }) ?? (
                  <ChatImage
                    onClick={() => handlePreview(nodeMap.get(node))}
                    originSize={{ width, height }}
                    limitSize={limitSize}
                    className={'message-image cursor-zoom-in'}
                    src={_url}
                  />
                )
              )
            case EmbeddedAssetType.Video:
              medias.push({
                width,
                height,
                type,
                url: _url,
                preview: _preview,
              })
              nodeMap.set(node, mediaIndex++)
              return (
                renderVideo?.({ nodeData: node.data, onClick: () => handlePreview(nodeMap.get(node)) }) ?? (
                  <VideoWrapper url={_url} originSize={{ width, height }} limitSize={limitSize}>
                    <VideoThumbnail
                      onClick={() => handlePreview(nodeMap.get(node))}
                      width={width}
                      height={height}
                      limitSize={limitSize}
                      className={'message-video inline-flex self-start'}
                      src={_url}
                      thumbSrc={_preview}
                      duration={duration}
                    />
                  </VideoWrapper>
                )
              )
          }
        },

        [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline, children: ReactNode) => {
          switch (node.data.type) {
            case 'code':
              return <pre>{children}</pre>
            case 'link':
              return renderLinkCard ?
                  renderLinkCard({ nodeData: node.data })
                : <LinkCard url={node.data.uri} onClick={() => richTextContext.handleUrl(node.data.uri, { guildId })} />
          }
        },
        [BLOCKS.EMBEDDED_RESOURCE]: (node: Block | Inline, children: ReactNode) => {
          if (node.data.type === EmbeddedResourceType.Question)
            return (
              <>
                <QuestionCard link={node.data.link} guildId={guildId} />
                {children}
              </>
            )
        },
      },
    }
  )
}

function QuestionCard({ link, guildId }: { link: string; guildId?: string }) {
  let questionId: string | undefined
  try {
    questionId = last(new URL(link).pathname.split('/'))
  } catch (e) {
    questionId = undefined
  }

  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<QuestionStruct | undefined>(undefined)
  const richTextContext = useContext(RichTextContext)

  useEffect(() => {
    if (!questionId) return
    richTextContext
      .fetchQuestion(questionId)
      .then(res => {
        setDetail(res)
      })
      .finally(() => setLoading(false))
  }, [questionId])

  const { openedArticleId = '' } = useContext(QuestionContext)

  const handleClick = () => {
    if (!questionId || !detail) return
    richTextContext.openQuestionLink(detail.guild?.guild_id || '', detail.question.channel_id || '', questionId, openedArticleId)
  }

  const authorName =
    detail?.author ?
      richTextContext.renderUserName ?
        richTextContext.renderUserName({
          id: detail.author.user_id,
          marks: [],
          text: detail.author.nickname || '',
          guildId,
        })
      : richTextContext.renderUser({
          id: detail.author.user_id,
          marks: [],
          text: detail.author.nickname || '',
          guildId,
        })
    : null

  if (!questionId || (!loading && !detail)) return null
  return <QuestionBaseCard className={'!bg-[var(--bg-bg-2)]'} loading={loading} detail={detail} onClick={handleClick} authorName={authorName} />
}
