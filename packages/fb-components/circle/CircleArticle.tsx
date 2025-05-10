import { TopLevelBlock } from '@contentful/rich-text-types/dist/types/types'
import clsx from 'clsx'
import { isEmpty } from 'lodash-es'
import { forwardRef, useMemo } from 'react'
import GuildInfoBox from '../components/GuildInfoBox'
import FbImage from '../components/image/FbImage'
import FbVideo from '../components/video/FbVideo'
import { VideoWrapper } from '../components/video/VideoWrapper'
import RichTextRenderer from '../rich_text/RichTextRenderer'
import '../rich_text/rich-text.css'
import transformRichText from '../rich_text/transform_rich_text'
import { EmbeddedAssetType } from '../rich_text/types'
import { GuildInfoStruct } from '../struct/type'
import DateTimeUtils from '../utils/DateTimeUtils'
import { safeDivision } from '../utils/common.ts'
import CircleImageSlider from './CircleImageSlider'
import './circle-article.css'
import useCircleContent from './hooks/useCircleContent'
import { CircleComponentConfig, CircleContentStruct, MultiParaItemStruct, PostType } from './types'

type CircleArticleProps = {
  detail: CircleContentStruct
  /** 展示位置所在的服务器 id */
  currentGuildId?: string
  // 父容器宽度，内容包括图片和视频时，需传此参数
  parentWidth?: number
  hidePostTime?: boolean
} & CircleComponentConfig

const CircleArticle = forwardRef<HTMLDivElement, CircleArticleProps>(
  ({ detail, hidePostTime, currentGuildId, guildVisible, onGuildClick, parentWidth = 360, buildMentionUser }: CircleArticleProps, ref) => {
    const { guild, post } = detail
    const { created_at, updated_at, post_type, mentions, mentions_info } = post
    const { body } = useCircleContent(detail.post.content, detail.post.post_type)
    return (
      <div ref={ref}>
        {((): JSX.Element | JSX.Element[] => {
          if (post_type != PostType.multi_para) {
            return (
              <>
                <div className={'pb-1 pt-4 text-[18px] font-medium leading-[30px]'}>{post.title}</div>
                <div>
                  <div className={'message-rich-text circle-article text-base'}>
                    <RichTextRenderer
                      data={body as TopLevelBlock[]}
                      guildId={currentGuildId}
                      limitSize={{ width: parentWidth, height: 99999999 }}
                      renderImage={({ nodeData, onClick }) => {
                        const { width, height, localSrc, src } = nodeData
                        return (
                          <div className="flex-center w-full py-1">
                            <FbImage
                              width={width}
                              height={Math.min(parentWidth, width) / safeDivision(width, height)}
                              className={'cursor-zoom-in rounded-lg'}
                              src={localSrc ?? src}
                              onClick={onClick}
                            ></FbImage>
                          </div>
                        )
                      }}
                      renderVideo={({ nodeData }) => {
                        const { width, height, src, localSrc, preview } = nodeData
                        return (
                          <div className="flex-center my-1 h-full w-full overflow-hidden rounded-lg bg-black">
                            <VideoWrapper
                              url={localSrc ?? src}
                              originSize={{ width, height }}
                              limitSize={{ width: parentWidth, height: parentWidth }}
                            >
                              {size => <FbVideo width={size.width} height={size.height} poster={preview} src={localSrc ?? src} />}
                            </VideoWrapper>
                          </div>
                        )
                      }}
                    />
                  </div>
                </div>
              </>
            )
          } else {
            const paras = body as MultiParaItemStruct[]
            return paras.map((e, i) => <MultiParaItem key={i} data={e} guildId={post.guild_id} isFirstPara={i === 0} parentWidth={parentWidth} />)
          }
        })()}
        <div className={'h-4'}></div>
        {!isEmpty(mentions) && (
          <div className={'mb-1 mt-2'}>
            文中提到了
            {mentions.map(e => buildMentionUser?.({ ...mentions_info[e], user_id: e }))}
          </div>
        )}
        {!hidePostTime && (
          <div className={'pt-2 text-xs text-[var(--fg-b40)]'}>
            <div>
              <span>
                {created_at != updated_at ? '编辑于' : '发布于'}&nbsp;{DateTimeUtils.format(updated_at ?? created_at)}
              </span>
              <span>&nbsp;{post.geo_region}</span>
            </div>
          </div>
        )}
        {guildVisible && (
          <div className={'pt-3'}>
            <GuildInfoBox data={guild as unknown as GuildInfoStruct} onClick={onGuildClick} />
          </div>
        )}
      </div>
    )
  }
)

CircleArticle.displayName = 'CircleArticle'

export default CircleArticle

function MultiParaItem({
  data,
  guildId,
  isFirstPara,
  parentWidth = 360,
}: {
  data: MultiParaItemStruct
  guildId: string
  isFirstPara: boolean
  parentWidth?: number
}) {
  const { title, content, assets } = data
  const richText = useMemo(() => {
    return transformRichText(content ?? [])
  }, [data])
  const isVideo = assets && assets.length > 0 && assets[0]._type == EmbeddedAssetType.Video
  const isImage = assets && assets.length > 0 && assets[0]._type == EmbeddedAssetType.Image

  const slideHeight = useMemo(() => {
    if (!assets || assets.length == 0) return 0
    const firstImgRadio = assets[0].width / assets[0].height
    return parentWidth / Math.max(1, firstImgRadio)
  }, [data, parentWidth])

  return (
    <div className={'flex flex-col'}>
      <div
        className={clsx(['pb-2 pt-4 font-medium', isFirstPara ? 'text-[22px] font-medium leading-[36px]' : 'text-[18px] font-medium leading-[30px]'])}
      >
        {title}
      </div>
      {isImage && (
        <div style={{ height: slideHeight }} className={' overflow-hidden rounded-lg border-[0.5px] border-[var(--fg-b10)]'}>
          <CircleImageSlider
            width={parentWidth}
            height={slideHeight}
            rootClassName={clsx(['circle-detail-carousel', isFirstPara ? 'order-[-1]' : 'order-[1]'])}
            images={assets.map(e => e.source)}
            imageStyle={{
              backgroundSize: 'contain',
              margin: '0 auto',
              maxWidth: parentWidth,
              maxHeight: slideHeight,
            }}
          />
        </div>
      )}
      {isVideo && (
        <div className="flex-center my-1 h-full w-full overflow-hidden rounded-lg bg-black">
          <VideoWrapper
            className={'overflow-hidden rounded-lg'}
            url={assets[0].source}
            originSize={{ width: assets[0].width, height: assets[0].height }}
            limitSize={{ width: parentWidth ?? 360, height: parentWidth ?? 360 }}
          >
            {size => {
              return <FbVideo width={size.width} height={size.height} poster={assets[0].thumbUrl} src={assets[0].source} />
            }}
          </VideoWrapper>
        </div>
      )}
      {richText.length > 0 && (
        <div className={'message-rich-text text-base'}>
          <RichTextRenderer data={richText} guildId={guildId} />
        </div>
      )}
    </div>
  )
}
