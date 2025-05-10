/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { closestCenter, DndContext, DragEndEvent, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { UniqueIdentifier } from '@dnd-kit/core/dist/types'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDebounceFn, useInfiniteScroll } from 'ahooks'
import { Button, Divider, Form, Input, Radio, SelectProps, Tabs, Tag, theme, Tooltip, Upload, UploadFile } from 'antd'
import { useForm } from 'antd/es/form/Form'
import clsx from 'clsx'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal.tsx'
import FbSelect from 'fb-components/base_ui/fb_select/index.tsx'
import { default as fb_toast, default as FbToast } from 'fb-components/base_ui/fb_toast'
import FbAlert from 'fb-components/base_ui/FbAlert.tsx'
import { CircleDisplay, PostStruct, PostType, SubInfo, TagStruct } from 'fb-components/circle/types.ts'
import SizeAnimation from 'fb-components/components/animation/SizeAnimation.tsx'
import FbImage from 'fb-components/components/image/FbImage.tsx'
import { CustomElement, TopicElement } from 'fb-components/rich_text_editor/custom-editor'
import { useSearchFeature, UseSearchFeatureResult } from 'fb-components/rich_text_editor/hooks/useSearchFeature.tsx'
import { SearchEditor } from 'fb-components/rich_text_editor/plugins/withSearch.tsx'
import RichTextEditorUtils, { EMPTY_SLATE } from 'fb-components/rich_text_editor/RichTextEditorUtils.tsx'
import RichTextToolbar from 'fb-components/rich_text_editor/RichTextToolbar.tsx'
import RichTextWrapper from 'fb-components/rich_text_editor/RichTextWrapper.tsx'
import { FbRichTextQuillDeltaVisitor } from 'fb-components/rich_text_editor/visitors/FbRichTextQuillDeltaVisitor.ts'
import { FbRichTextSlateVisitor } from 'fb-components/rich_text_editor/visitors/FbRichTextSlateVisitor.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import { AssetType, ImageType } from 'fb-components/utils/upload_cos/uploadType.ts'
import CosUtils from 'fb-components/utils/upload_cos/utils.ts'
import { get as _get, cloneDeep, isEqual, isNil, uniq } from 'lodash-es'
import { ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { BaseEditor, Descendant } from 'slate'
import { ReactEditor, Slate } from 'slate-react'
import { v4 as uuidv4 } from 'uuid'
import { store } from '../../app/store.ts'
import PlaceholderImage from '../../assets/images/placeholder_unpublished_light.svg'
import { BusinessError } from '../../base_services/interceptors/response_interceptor.ts'
import FormSection from '../../components/form/FormSection.tsx'
import ImageCropWrapper from '../../components/image_crop/ImageCropWrapper.tsx'
import { ImageInfo } from '../../components/image_crop/type.ts'
import KeyboardNavigationList from '../../components/KeyboardNavigationList.tsx'
import { UserStruct } from '../../components/realtime_components/realtime_nickname/UserAPI.ts'
import { UserHelper } from '../../components/realtime_components/realtime_nickname/userSlice.ts'
import MentionChannelList from '../../components/rich_text_editor/mention/MentionChannelList.tsx'
import { useEditor } from '../../components/rich_text_editor/RichEditorPreview.tsx'
import { WrapperContext } from '../../components/rich_text_editor/WrapperContext.tsx'
import SingleImageUploader from '../../components/single_image_uploader/SingleImageUploader.tsx'
import ServeSideConfigService from '../../services/ServeSideConfigService.ts'
import { PaginationResp4 } from '../../types.ts'
import environmentSpecificDraftBox from '../../utils/EnvironmentSpecificDraftBox.ts'
import GuildAPI from '../guild_container/guildAPI.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import { GuildContext } from '../home/GuildWrapper.tsx'
import MemberListAPI from '../home/MemberListAPI.ts'
import { MemberUserStruct } from '../member_list/MemberStruct.ts'
import CircleApi from './circle_api.ts'
import CirclePublisherPreview from './CirclePublisherPreview.tsx'
import { circleActions, PublishArticleArgs, PublishPostArgs } from './circleSlice.ts'
import { CircleUtils } from './CircleUtils.tsx'

/**
 * 打开圈子发布器
 */
export default function openCirclePublisher({
  type,
  reedit,
  guildId,
}: {
  type: PostType
  // 这里用 Partial 是因为从 tag 分类中发布时，会自动带上 tag，此时只有 content 字段有值
  reedit?: Partial<PublishArticleArgs | PublishPostArgs>
  guildId: string
}) {
  const guild = GuildUtils.getGuildById(guildId)
  if (!guild) {
    console.error('The guild is not exists')
    return
  }

  if (GuildUtils.isMuted(guild)) {
    fb_toast.open({
      content: '你已被禁言，无法操作',
    })
    return
  }
  if (type === PostType.article) {
    const { destroy } = showFbModal({
      keyboard: false,
      maskClosable: false,
      closable: false,
      width: 'auto',
      content: <RichTextPublisher guildId={guildId} defaultValue={reedit as PublishArticleArgs} onClose={() => destroy()} />,
      footer: null,
    })
  } else {
    const { destroy } = showFbModal({
      keyboard: false,
      maskClosable: false,
      closable: false,
      width: 'auto',
      content: <MediaPostPublisher guildId={guildId} defaultValue={reedit as PublishPostArgs} onClose={() => destroy()} />,
      footer: null,
    })
  }
}

interface MediaPostPublisherProps {
  guildId: string
  onClose: () => void
  defaultValue?: PublishPostArgs
}

const MAX_IMAGES = 9
const ARRAY_9 = new Array(9).fill(0)

enum Step {
  ChooseMedia,
  EditMedia,
  EditText,
}

function MediaPostPublisher({ onClose, defaultValue, guildId }: MediaPostPublisherProps) {
  // 0 是选择图片，1 是编辑图片，2 编辑文字
  const [step, setStep] = useState(defaultValue?.images?.length || defaultValue?.video ? Step.EditMedia : Step.ChooseMedia)
  const [selected, setSelected] = useState(0)
  const [images, setImages] = useState<
    (ImageInfo & {
      id: string
    })[]
  >(() => defaultValue?.images?.map(e => ({ id: uuidv4(), ...e })) ?? [])
  const [video, setVideo] = useState<PublishPostArgs['video']>(defaultValue?.video)
  const [fileDragOver, setFileDragOver] = useState(false)
  const [title, setTitle] = useState(defaultValue?.title ?? '')
  const [processingMedia, setProcessingMedia] = useState(false)
  const { editor, searchNode, editorNode } = useCircleEditor(({ userId, displayName }) => {
    setMentions(mentions => {
      if (mentions.find(e => e.value === userId)) {
        return mentions
      }
      return [...mentions, { label: displayName, value: userId }]
    })
  }, guildId)
  const [visibility, setVisibility] = useState(defaultValue?.visibility ?? CircleDisplay.public)
  const [mentions, setMentions] = useState<Array<{ value: string; label: string }>>(defaultValue?.mentions ?? [])
  // 用于保存 slate 的内容，切换步骤时不会丢失
  const slateContent = useRef<Descendant[] | undefined>()
  const initialSlateValue = useMemo(() => {
    if (slateContent.current) return slateContent.current
    if (defaultValue?.content?.length) {
      return new FbRichTextQuillDeltaVisitor(defaultValue.content).result
    }
    return EMPTY_SLATE
  }, [slateContent.current, defaultValue])

  const [draggingId, setDraggingId] = useState<UniqueIdentifier | null>(null)
  const draggingIndex = useMemo(() => images.findIndex(e => e.id === draggingId), [draggingId])
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const pickMedia = useDebounceFn(
    async (files: UploadFile[]) => {
      const fileTypes = uniq(files.map(e => e.type?.split('/')?.[0] ?? '')).filter(Boolean)
      if (fileTypes.length >= 2) {
        FbToast.open({
          type: 'warning',
          content: '暂不支持同时上传图片和视频哦',
        })
        return
      }

      if (files.length + images.length > MAX_IMAGES) {
        FbToast.open({
          type: 'warning',
          content: `${files.length + images.length - MAX_IMAGES}张图片未上传,你最多只能上传${MAX_IMAGES}张图片`,
        })
      }

      let hasValidFile = false
      setProcessingMedia(true)
      const maxImageKilobytes = 20 * 1024
      if (fileTypes[0] === 'image') {
        const selectImages = await Promise.allSettled(
          files.slice(0, MAX_IMAGES - images.length).map(async file => {
            const url = URL.createObjectURL(file.originFileObj!)
            await CosUtils.verifyImageFile(file.originFileObj!, url, { size: maxImageKilobytes })
            return {
              url,
              file: file.originFileObj,
            }
          })
        )

        const newImages = selectImages.filter(e => e.status === 'fulfilled').map(e => (e as PromiseFulfilledResult<(typeof images)[0]>).value)
        const exceededSizeImages = selectImages.filter(e => e.status && (e as PromiseRejectedResult).reason === 'Exceeded image bytes limit')
        const numLoadErrorImages = selectImages.length - newImages.length - exceededSizeImages.length

        if (exceededSizeImages.length && numLoadErrorImages) {
          FbToast.open({
            type: 'warning',
            content: `${exceededSizeImages.length}张图片过大，单张图片需要小于${maxImageKilobytes / 1024}M ，${numLoadErrorImages}张图片加载错误`,
          })
        } else if (exceededSizeImages.length) {
          FbToast.open({
            type: 'warning',
            content: `${exceededSizeImages.length}张图片过大，单张图片需要小于${maxImageKilobytes / 1024}M`,
          })
        } else if (numLoadErrorImages) {
          FbToast.open({
            type: 'warning',
            content: `${selectImages.length - newImages.length}张图片加载失败`,
          })
        }

        hasValidFile = newImages.length > 0
        if (hasValidFile) setImages([...images, ...newImages.map(e => ({ ...e, id: uuidv4() }))])
      } else if (fileTypes[0] === 'video') {
        const file = files[0].originFileObj!
        const url = URL.createObjectURL(file)
        try {
          const verified = await CosUtils.verifyVideoFile(file, url, { toast: true })
          setVideo({
            url,
            file,
            ...verified,
          })
          hasValidFile = true
        } catch (e) {
          console.warn(e)
          hasValidFile = false
        }
      }

      setProcessingMedia(false)

      if (hasValidFile && step === Step.ChooseMedia) {
        setStep(Step.EditMedia)
      }
    },
    {
      wait: 100,
    }
  )

  function handleDeleteImage(index: number) {
    setImages(images => {
      images = images.filter((_, i) => i !== index)
      // 如果删除图片后，当前选中的位置没有图片，则选中前一个位置
      if (!images[selected] && selected > 0) {
        setSelected(selected - 1)
      }
      if (images.length === 0) {
        setStep(0)
      }
      return images
    })
  }

  function handleNextStep() {
    if (step === Step.EditMedia) {
      setStep(Step.EditText)
    } else {
      publish().catch(e => console.error('Failed to publish circle due to', e))
    }
  }

  async function publish() {
    const ops = new FbRichTextSlateVisitor(editor.children, editor).result.ops
    const args: PublishPostArgs = {
      // 编辑时需要的参数
      cover: defaultValue?.cover,
      post_id: defaultValue?.post_id,
      // 公共参数
      content: ops,
      guildId,
      title,
      mentions,
      visibility,
      images,
      video,
      tag_ids: CircleUtils.getValidTagsFromContent(ops, {
        tag_ids: defaultValue?.tag_ids ?? [],
        ops: defaultValue?.content ?? [],
      }),
    }
    // 下一步操作会修改 ops，即把图片和视频追加到 ops，所以需要在此之前深拷贝并保存
    environmentSpecificDraftBox.save(`circle-${PostType.image}-${guildId}`, cloneDeep(args))
    store.dispatch(circleActions.publishPost(args))
    onClose()
  }

  function handleClose() {
    if (step === Step.ChooseMedia) {
      onClose()
    } else {
      FbModal.error({
        title: '退出编辑',
        content: '当前动态已填写内容，退出后无法保存，确定退出吗？',
        cancelText: '继续编辑',
        okText: '退出',
        onOk: () => {
          environmentSpecificDraftBox.delete(`circle-${PostType.image}-${guildId}`)
          onClose()
        },
      })
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e

    if (active.id !== over?.id) {
      if (!over) return
      setImages(items => {
        const oldIndex = items.findIndex(e => e.id === active!.id)
        const newIndex = items.findIndex(e => e.id === over!.id)

        if (oldIndex === selected) {
          setSelected(newIndex)
        }

        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setDraggingId(null)
  }

  let body: ReactElement
  let mediaEditor: ReactElement | undefined

  if (images.length) {
    mediaEditor = (
      <div className={'w-[720px] flex-shrink-0'}>
        <ImageCropWrapper
          preview={step === Step.EditText}
          index={selected}
          images={images}
          aspectControl={true}
          onCropChange={setImages as never}
          onIndexChange={setSelected}
        />
      </div>
    )
    body = (
      <>
        {/*图片列表*/}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={e => setDraggingId(e.active.id)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingId(null)}
        >
          <div className={'px-6 py-2 w-[480px] gap-3 grid grid-cols-4'}>
            <SortableContext items={images}>
              {ARRAY_9.map((_, index) => {
                const image = images[index]
                return (
                  <MediaPublishImageItem
                    key={image?.id ?? index}
                    selected={selected === index}
                    image={image}
                    onClick={() => setSelected(index)}
                    onDelete={() => handleDeleteImage(index)}
                    withOpacity={image?.id === draggingId}
                  />
                )
              })}
            </SortableContext>
          </div>
          <DragOverlay>
            {draggingIndex > -1 ?
              <MediaPublishImageItem image={images[draggingIndex]} selected={draggingIndex === selected} />
            : null}
          </DragOverlay>
        </DndContext>
        {/* 图片上传区 */}
        <Upload
          disabled={images.length >= MAX_IMAGES}
          multiple
          prefixCls={'w-full'}
          fileList={[]}
          showUploadList={false}
          beforeUpload={() => false}
          accept={Object.values(ImageType).join(',')}
          onChange={({ fileList }) => {
            setFileDragOver(false)
            return pickMedia.run(fileList)
          }}
        >
          <div
            className={clsx([
              'my-4 mx-6 border border-dashed flex flex-col items-center rounded-[10px] h-[231px] transition-colors',
              fileDragOver ? 'bg-fgBlue3 border-fgBlue1' : 'bg-fgB5 border-transparent',
            ])}
            onDragOver={e => {
              e.preventDefault()

              if (e.dataTransfer.types.includes('Files')) {
                setFileDragOver(true)
              }
            }}
            onDragLeaveCapture={() => setFileDragOver(false)}
          >
            <img src={PlaceholderImage} width={120} height={120} alt="" className={'pt-[28px]'} />
            <div className={'pt-3 font-medium text-fgB100'}>
              {MAX_IMAGES - images.length === 0 ?
                '图片上传数量已达上限'
              : fileDragOver ?
                '释放鼠标以上传文件'
              : <>
                  把图片拖拽到这里，或
                  <span className={'cursor-pointer text-fgBlue1'}>点击上传</span>
                </>
              }
            </div>
            <div className={'pt-1 text-[13px] text-[var(--fg-b60)]'}>
              已选{images.length}张，还可选{MAX_IMAGES - images.length}张
            </div>
          </div>
        </Upload>
      </>
    )
  } else if (video) {
    mediaEditor = (
      <div className={'w-[720px] flex-shrink-0'}>
        <video className={'bg-black w-full h-full'} src={'insert' in video ? video.insert.source : video.url} controls />
      </div>
    )
    body = (
      <div className={'flex-1 px-6 flex flex-col'}>
        <img
          className={'rounded-[10px] object-scale-down w-[432px] my-2 bg-black max-w-none h-[240px]'}
          src={'insert' in video ? video.insert.thumbUrl : video.localThumbUrl}
          alt={''}
        />
        <div className={'gap-4 py-2 flex justify-center'}>
          <Button
            danger
            onClick={() => {
              setStep(Step.ChooseMedia)
              setVideo(undefined)
            }}
          >
            删除视频
          </Button>
          <Upload
            accept={AssetType.MP4}
            showUploadList={false}
            fileList={[]}
            beforeUpload={() => false}
            onChange={({ fileList }) => pickMedia.run(fileList)}
          >
            <Button>重新选择</Button>
          </Upload>
        </div>
      </div>
    )
  } else {
    // 没有选择图片时的上传区
    body = (
      <Upload
        className="[&_.ant-upload]:block h-full [&_.ant-upload]:h-full"
        accept={Object.values(AssetType).join(',')}
        showUploadList={false}
        multiple
        fileList={[]}
        beforeUpload={() => false}
        onChange={({ fileList }) => pickMedia.run(fileList)}
      >
        <div className={'mx-6 bg-[var(--bg-bg-2)] border border-dashed flex flex-col items-center mb-6 rounded-xl w-[672px] h-[calc(100%-24px)]'}>
          <div className="flex-1"></div>
          <img src={PlaceholderImage} width={120} height={120} alt="" className="" />
          <div className={'pt-3 font-medium'}>把图片/视频拖拽到这里</div>
          <Button className={'mt-4'} size="large" type={'primary'}>
            点击上传
          </Button>
          <div className="flex-1"></div>
          <div className={'text-xs my-6 text-[var(--fg-b60)]'}>注：图片每次最多上传9张，视频每次最多上传1个</div>
        </div>
      </Upload>
    )
  }

  if (step === Step.EditText) {
    body = (
      <div className={'px-6 w-[480px] flex-1 flex flex-col overflow-hidden'}>
        <GuildContext.Provider value={GuildUtils.getGuildById(guildId)}>
          <Slate editor={editor} initialValue={initialSlateValue}>
            <RichTextWrapper>
              <RichTextToolbar mention channel image={false} link disableWhenNotFocused />
              <Input
                placeholder={'填写标题可能会收获更多赞哦～'}
                variant="borderless"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={'p-0 font-medium leading-[34px] pt-4 pb-1 text-[20px]'}
              />
              {editorNode}
              {searchNode}
            </RichTextWrapper>
          </Slate>
          <WordCount editor={editor} />

          <Divider className={'mt-1 mb-4'} />
          <FormSection title={'提醒谁看'} className={'mb-4'}>
            <MentionSelect guildId={guildId} maxCount={ServeSideConfigService.post_at_limit} value={mentions} onChange={setMentions} />
          </FormSection>
          <PostVisibility value={visibility} onChange={setVisibility} />
        </GuildContext.Provider>
      </div>
    )
  }

  return (
    <SizeAnimation animateAxis={'x'} className={'duration-700'}>
      <div className={clsx(['flex w-fit h-[calc(100vh-80px)]', processingMedia && 'cursor-wait'])}>
        {mediaEditor}
        <div className={'flex h-full flex-col'}>
          <div className={'h-14 flex-shrink-0 pl-6 font-medium justify-between flex text-[18px] pr-[18px] relative items-center'}>
            {mediaEditor && (
              <div className={'text-[14px]'}>
                {step}
                <span className={'text-fgB40'}>/2</span>
              </div>
            )}
            <div className={clsx(['absolute pointer-events-none', step > 0 && 'left-0 right-0 text-center'])}>
              {step === Step.ChooseMedia ?
                '上传'
              : step === Step.EditMedia ?
                video ?
                  '编辑视频'
                : '编辑图片'
              : '发布动态'}
            </div>
            <iconpark-icon class={'ml-auto icon-bg-btn !p-1.5'} name="Close" fill="var(--fg-b100)" size={20} onClick={handleClose} />
          </div>
          <>
            <div className="flex-1 overflow-auto">{body}</div>
            {step > 0 && (
              <div className={'flex gap-4 mx-6 my-4 justify-end'}>
                {step > 1 && (
                  <Button
                    className={'btn-middle'}
                    onClick={() => {
                      if (step == 2) {
                        slateContent.current = editor.children
                      }
                      setStep(Step.EditMedia)
                    }}
                  >
                    上一步
                  </Button>
                )}
                <Button type="primary" className={'btn-middle'} onClick={handleNextStep}>
                  {step === Step.EditMedia ? '下一步' : '发布'}
                </Button>
              </div>
            )}
          </>
        </div>
      </div>
    </SizeAnimation>
  )
}

export function useSearchChannel(editor: SearchEditor, guildId: string): UseSearchFeatureResult {
  const hideCircleTag: boolean = _get(window, 'globalConfig.hideCircleTag', false)

  const [activeKey, setActiveKey] = useState(hideCircleTag ? '1' : '2')
  const [errorMessage, _setErrorMessage] = useState('')
  const errorMessageTimeout = useRef<number | undefined>(undefined)

  function setErrorMessage(message: string) {
    _setErrorMessage(message)
    clearTimeout(errorMessageTimeout.current)
    errorMessageTimeout.current = window.setTimeout(() => {
      setErrorMessage('')
    }, 3000)
  }

  const handleTabClick = useCallback((activeKey: string) => {
    ReactEditor.focus(editor)
    setActiveKey(activeKey)
  }, [])

  const handleSelectTopic = useCallback((topic: TagStruct) => {
    RichTextEditorUtils.insertArbitrary(editor, {
      type: 'topic',
      id: topic.tag_id,
      name: topic.tag_name,
      children: [{ text: '' }],
    } as TopicElement)
  }, [])

  const getTopics = () =>
    [
      ...editor.nodes({
        at: editor.range([]),
        match: e => (e as CustomElement).type === 'topic',
      }),
    ].map(([e]) => e as { id: string; name: string })

  return useSearchFeature(
    editor,
    (search, setSearch, updateResultCount) => (
      <WrapperContext guildId={guildId}>
        <Tabs
          activeKey={activeKey}
          className={'[&_.ant-tabs-tabpane>div]:bg-transparent'}
          tabBarStyle={{ padding: '0 12px' }}
          onTabClick={handleTabClick}
          items={[
            {
              key: '1',
              label: '频道',
              className: 'max-h-[365px] overflow-y-auto',
              children: (
                <MentionChannelList
                  guildId={guildId}
                  filter={search}
                  onUpdateResultCount={updateResultCount}
                  onSelect={data => {
                    setSearch(undefined)
                    editor.selectReplacement()
                    RichTextEditorUtils.insertChannel(editor, data)
                  }}
                  // 圈子的 # 拉起的面板同时包含频道和话题，所以关闭时不能 `setSearch(undefined)` 因为它会导致话题也被关闭
                  onClose={() => {}}
                />
              ),
            },
            ...(!hideCircleTag ?
              [
                {
                  key: '2',
                  label: '话题',
                  children: (
                    <>
                      <div className={clsx([errorMessage ? 'h-9' : '!h-0', 'overflow-hidden transition-[height]'])}>
                        <FbAlert
                          className="text-[var(--function-red-1)]"
                          icon={<iconpark-icon name="ExclamationCircle" size={16}></iconpark-icon>}
                          closable={false}
                          type="error"
                          message={<span className="pl-2">{errorMessage}</span>}
                          banner
                        />
                      </div>
                      <TopicList
                        guildId={guildId}
                        updateResultCount={updateResultCount}
                        onError={setErrorMessage}
                        search={search ?? ''}
                        onSelect={data => {
                          const existingTopics = getTopics()
                          if (existingTopics.length >= ServeSideConfigService.post_tag_limit && !existingTopics.find(e => e.id === data.tag_id)) {
                            setErrorMessage('话题数量已达上限')
                          } else {
                            setSearch(undefined)
                            _setErrorMessage('')
                            editor.selectReplacement()
                            handleSelectTopic(data)
                          }
                        }}
                      />
                    </>
                  ),
                },
              ]
            : []),
          ]}
        />
      </WrapperContext>
    ),
    {
      usePopup: true,
      onClose: () => {
        _setErrorMessage('')
        clearTimeout(errorMessageTimeout.current)
      },
      className: 'bg-[var(--fg-white-1)] border !overflow-hidden',
    }
  )
}

interface MentionSelectProps {
  guildId: string
  value?: Array<{ value: string; label: string }>
  onChange?: (value: Array<{ value: string; label: string }>) => void
  maxCount?: number
}

/**
 * 用于选择成员的 Select 组件，支持搜索。
 *
 * 该组件是通用组件，如果有必要，可以对其进行抽离。
 *
 * @param maxCount    最大可选的数量
 * @param value
 * @param onChange
 * @param guildId
 * @constructor
 */
function MentionSelect({ maxCount, value, onChange, guildId }: MentionSelectProps) {
  const [searchValue, setSearchValue] = useState('')
  const [mentionOptions, setMentionOptions] = useState<MentionSelectProps['value'] & { avatar: string }[]>([])

  const [memberOptions, setMemberOptions] = useState<MentionSelectProps['value'] & { avatar: string }[]>([])

  const getUserList = async () => {
    if (!guildId) return
    const result = await MemberListAPI.fetchMembers({ guildId, channelId: '0', start: 0, end: 99, not_sync: true })
    const { list } = result
    const memberOptions = (list.filter(item => item.type === 'user') as MemberUserStruct[]).map(({ user_id, username, nickname, avatar }) => {
      return {
        value: user_id,
        label: UserHelper.getAliasName(user_id, guildId, nickname),
        username,
        avatar,
      }
    })
    setMentionOptions(memberOptions)
    setMemberOptions(memberOptions)
  }

  const handleSearch = useCallback(
    async (search: string) => {
      setSearchValue(search)
      if (!search.trim()) {
        setMentionOptions(memberOptions)
        return
      }
      const result = await GuildAPI.searchMember(guildId, search.trim())
      setMentionOptions(
        result.map(({ user_id, username, nickname, avatar }: UserStruct) => ({
          value: user_id,
          label: UserHelper.getAliasName(user_id, guildId, nickname),
          username,
          avatar,
        }))
      )
    },
    [guildId, memberOptions]
  )

  const handleChange = useCallback(
    (value: Array<{ value: string; label: string }>) => {
      if (maxCount && value.length > maxCount) {
        return
      }

      onChange?.(value)
    },
    [maxCount, onChange, mentionOptions]
  )

  const optionRender: SelectProps['optionRender'] = useCallback(({ data, label }: { data: unknown; label?: ReactNode }) => {
    const { avatar, username } = data as UserStruct
    return (
      <div className={'h-[60px] flex items-center gap-2'}>
        <FbImage width={40} height={40} className={'rounded-full'} src={avatar} />
        <div className={'flex flex-col'}>
          <div>{label}</div>
          <div className={'text-fgB40 text-xs'}>ID: {username}</div>
        </div>
      </div>
    )
  }, [])

  const tagRender: SelectProps['tagRender'] = useCallback(({ label }: { label: ReactNode }) => {
    return (
      <Tag
        closable
        closeIcon={<iconpark-icon name={'Close'} class={'anticon ml-2 text-fgBlue1'} size={12} />}
        className={'text-fgBlue1 py-1 px-2 bg-fgBlue3 rounded-full flex items-center'}
        bordered={false}
      >
        @{label}
      </Tag>
    )
  }, [])

  const dropdownRender = useCallback(
    (menu: ReactElement) => (
      <>
        <div className={'px-3 font-medium py-2'}>选择成员</div>
        <div className={clsx([maxCount && value && value.length >= maxCount ? 'h-9' : 'h-0', 'transition-[height] overflow-hidden'])}>
          <FbAlert
            className="text-[var(--function-red-1)]"
            icon={<iconpark-icon name="ExclamationCircle" size={16}></iconpark-icon>}
            closable={false}
            type="error"
            message={<span className="pl-2">@人数已达上限</span>}
            banner
          />
        </div>
        {menu}
      </>
    ),
    [maxCount, value]
  )

  useEffect(() => {
    getUserList().catch(e => console.info('Failed to fetch user list due to', e))
  }, [guildId])

  return (
    <FbSelect
      mode="multiple"
      optionRender={optionRender}
      tagRender={tagRender}
      value={value}
      options={mentionOptions}
      searchValue={searchValue}
      onSearch={handleSearch}
      onChange={handleChange}
      popupClassName={'p-0'}
      size={'large'}
      dropdownRender={dropdownRender}
      labelInValue
      className={'w-full [&>div]:!text-sm [&>.ant-select-selector]:!py-1 [&>.ant-select-selector>.ant-select-selection-overflow]:gap-y-2'}
      placeholder={'请输入你想@的成员'}
      suffixIcon={<iconpark-icon name={'UserAdd'} size={16} class={'text-fgB60'} />}
    />
  )
}

// 输入 # 弹出的话题列表
const TopicList = ({
  search,
  guildId,
  onSelect,
  onError,
  updateResultCount,
}: {
  guildId: string
  search: string
  onSelect: (topic: TagStruct) => void
  onError: (message: string) => void
  updateResultCount: (count: number) => void
}) => {
  const { data, loadMore } = useInfiniteScroll<PaginationResp4<TagStruct>>(
    d =>
      CircleApi.searchTopic({ search, guildId, page: (d?.page ?? 0) + 1 }).then(res => {
        // 如果没有搜索到，需要添加添加按钮
        if (!!search && !res?.list.find(e => e.tag_name === search)) {
          return {
            ...res,
            list: [{ tag_id: 'TO_BE_CREATE', tag_name: search, view_count: 0 } as TagStruct, ...res.list],
          }
        }
        return res
      }),
    {
      isNoMore: d => !d?.next,
      reloadDeps: [search],
    }
  )

  useEffect(() => {
    // 这个页面的搜索结果始终不为 0 即可，可以防止键盘导航被编辑器接收
    updateResultCount(1)
  }, [])

  const [createTopicLoading, setCreateTopicLoading] = useState(false)
  const handleAddTopic = () => {
    setCreateTopicLoading(true)
    CircleApi.createTopic(guildId, search)
      .then(topicId => {
        onSelect({ tag_id: topicId, tag_name: search, view_count: 0 } as TagStruct)
      })
      .catch(e => {
        if (e instanceof BusinessError) {
          onError(e.desc ?? e.message)
        } else {
          onError('加载失败，请重试')
        }
      })
      .finally(() => {
        setCreateTopicLoading(false)
      })
  }

  return (
    // 最终高度不能超过 useSearchFeature 的最大高度
    <div className={'px-2 py-2 max-h-[328px] overflow-y-auto'} id={'scrollableDiv'}>
      <InfiniteScroll
        dataLength={data?.list.length ?? 0}
        next={loadMore}
        hasMore={!!data?.next}
        endMessage={<></>}
        scrollableTarget="scrollableDiv"
        loader={<></>}
      >
        <KeyboardNavigationList<TagStruct>
          dataSource={data?.list}
          onSelect={e => {
            if (e.tag_id === 'TO_BE_CREATE') {
              handleAddTopic()
            } else {
              onSelect(e)
            }
          }}
          renderItem={(tag, _, selected) => {
            if (tag.tag_id === 'TO_BE_CREATE') {
              return (
                <div className={clsx(['icon-bg-btn !px-2 flex items-center !rounded-[10px]', selected && 'bg-fgB10'])} onClick={handleAddTopic}>
                  <div className={'flex-1 truncate'}>#{search}#</div>
                  <Button loading={createTopicLoading} type={'link'} className={'px-0'}>
                    添加新话题
                  </Button>
                </div>
              )
            }

            return (
              <div className={clsx(['flex-1 px-2 py-[9px] truncate rounded-[10px]', selected && 'bg-fgB10'])}>
                <div className={'flex-1 truncate'}>#{tag!.tag_name}#</div>
                {tag!.view_count && tag!.view_count > 0 ?
                  <div className={'ml-2 text-fgB60'}>{formatCount(tag!.view_count)}次浏览</div>
                : null}
              </div>
            )
          }}
        />
      </InfiniteScroll>
    </div>
  )
}

function withTopic(editor: BaseEditor & ReactEditor) {
  const { isInline, isVoid, markableVoid } = editor

  editor.isInline = element => {
    return 'topic' === (element.type as string) ? true : isInline(element)
  }

  editor.isVoid = element => {
    return 'topic' === (element.type as string) ? true : isVoid(element)
  }

  editor.markableVoid = element => {
    return 'topic' === (element.type as string) || markableVoid(element)
  }
  return editor
}

/*********************
 * 长文发布器 *
 *********************/
interface RichTextPublisherFormDataStruct {
  mentions: Array<{ value: string; label: string }>
  display: CircleDisplay
  cover: File | { source: string; width: number; height: number }
  title: string
}

function RichTextPublisher({ defaultValue, onClose, guildId }: { defaultValue?: Partial<PublishArticleArgs>; onClose: () => void; guildId: string }) {
  const [preview, setPreview] = useState(false)
  const [form] = useForm<RichTextPublisherFormDataStruct>()
  const initialSlateValue = useMemo(() => {
    if (defaultValue?.content) {
      return new FbRichTextQuillDeltaVisitor(defaultValue.content).result
    }
    return EMPTY_SLATE
  }, [defaultValue])
  const { editor, searchNode, editorNode } = useCircleEditor(({ userId, displayName }) => {
    const mentions = form.getFieldValue('mentions') as Array<{ value: string; label: string }>
    if (mentions.find(e => e.value === userId)) {
      return
    }
    form.setFieldsValue({
      mentions: [...mentions, { label: displayName, value: userId }],
    })
  }, guildId)

  const initialValues = useMemo(() => {
    return {
      display: defaultValue?.visibility ?? CircleDisplay.public,
      mentions: defaultValue?.mentions ?? [],
      cover: defaultValue?.cover instanceof File ? defaultValue.cover : defaultValue?.cover?.source ?? '',
      title: defaultValue?.title ?? '',
    }
  }, [defaultValue])
  const { token } = theme.useToken()

  async function handlePublish(values: RichTextPublisherFormDataStruct) {
    const { ops } = new FbRichTextSlateVisitor(editor.children, editor).result
    const args: PublishArticleArgs = {
      // 编辑时需要的参数
      post_id: defaultValue?.post_id,
      guildId,
      title: values.title,
      content: ops,
      // 重新编辑时，如果封面不是文件，说明使用的网络图片，直接使用就好
      cover: values.cover instanceof File ? values.cover : defaultValue!.cover!,
      mentions: values.mentions,
      visibility: values.display,
      tag_ids: CircleUtils.getValidTagsFromContent(ops, {
        tag_ids: defaultValue?.tag_ids ?? [],
        ops: defaultValue?.content ?? [],
      }),
    }
    store.dispatch(circleActions.publishArticle(args))
    onClose()
  }

  function handleClickPreview() {
    if (preview) {
      setPreview(false)
    } else {
      form.validateFields().then(() => {
        setPreview(true)
      })
    }
  }

  function handleClose() {
    if (isEqual(initialSlateValue, editor.children) && isEqual(form.getFieldsValue(), initialValues)) {
      onClose()
    } else {
      FbModal.error({
        title: '退出编辑',
        content: '当前长文已填写内容，退出后无法保存，确定退出吗？',
        cancelText: '继续编辑',
        okText: '退出',
        onOk: () => {
          environmentSpecificDraftBox.delete(`circle-${PostType.article}-${guildId}`)
          onClose()
        },
      })
    }
  }

  return (
    <Form form={form} className=" h-[calc(100vh-80px)]" initialValues={initialValues} onFinish={handlePublish}>
      <div className={clsx(['relative h-[calc(100%-64px)] flex flex-col transition-[width]', preview ? 'w-[1200px]' : 'w-[800px]'])}>
        <div className={'text-lg font-medium leading-[56px] px-6 justify-between flex items-center'}>
          发布长文 <iconpark-icon class={'ml-auto icon-bg-btn !p-1.5'} name="Close" fill="var(--fg-b100)" size={20} onClick={handleClose} />
        </div>
        <div className={'overflow-y-auto'}>
          <div className={'flex px-6 flex-col'}>
            <GuildContext.Provider value={GuildUtils.getGuildById(guildId)}>
              <Slate editor={editor} initialValue={initialSlateValue}>
                <RichTextWrapper>
                  <RichTextToolbar
                    mention
                    channel
                    link
                    video
                    inlines
                    align
                    blocks
                    disableWhenNotFocused
                    className={'sticky z-10 top-0'}
                    style={{
                      backgroundColor: token.colorBgBase,
                    }}
                  />
                  <Form.Item
                    name={'title'}
                    rules={[
                      {
                        required: true,
                        message: '请先填写标题',
                        whitespace: true,
                      },
                    ]}
                  >
                    <Input
                      placeholder={'填写标题（必填）'}
                      variant={'borderless'}
                      className={'p-0 mb-1 font-medium leading-[34px] pt-4 pb-1 text-[20px]'}
                    />
                  </Form.Item>
                  {editorNode}
                  <WordCount editor={editor} />
                  {searchNode}
                </RichTextWrapper>
              </Slate>
              <Divider className={'mt-1 mb-4'} />
              <FormSection title={'添加封面（必填）'}>
                <Form.Item
                  name={'cover'}
                  rules={[
                    {
                      required: true,
                      message: '请先添加封面',
                    },
                  ]}
                  valuePropName={'url'}
                >
                  <SingleImageUploader
                    useCrop={{
                      title: '添加封面',
                      aspect: true,
                      editable: true,
                    }}
                    size={'large'}
                    onlyIcon
                  />
                </Form.Item>
              </FormSection>

              <FormSection title={'提醒谁看'} className={'mb-4'}>
                <Form.Item name={'mentions'}>
                  <MentionSelect guildId={guildId} maxCount={ServeSideConfigService.post_at_limit} />
                </Form.Item>
              </FormSection>
              <Form.Item name={'display'}>
                <PostVisibility />
              </Form.Item>
            </GuildContext.Provider>
          </div>
          {/* 预览直接覆盖上去，使表单操作保持正确 */}
          {preview && (
            <div className={'absolute z-[10001] left-0 right-0 top-0 bottom-0'}>
              <CirclePublisherPreview
                data={{
                  sub_info: { like_total: 666 } as SubInfo,
                  post: {
                    mentions: (form.getFieldValue('mentions') as RichTextPublisherFormDataStruct['mentions']).map(e => e.value),
                    mentions_info: {},
                    content: new FbRichTextSlateVisitor(editor.children, editor).result.ops,
                    title: form.getFieldValue('title'),
                    cover:
                      form.getFieldValue('cover') instanceof File ? form.getFieldValue('cover')
                      : isNil(form.getFieldValue('cover')) ? ''
                      : defaultValue?.cover,
                    post_type: PostType.article,
                  } as PostStruct,
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className={'h-16 gap-4 px-6 flex border-t justify-end items-center'}>
        <Button className={'btn-middle'} onClick={handleClickPreview}>
          {preview ? '重新编辑' : '预览'}
        </Button>
        <Button type={'primary'} htmlType={'submit'} className={'btn-middle'}>
          发布
        </Button>
      </div>
    </Form>
  )
}

/********************
 * 长文和媒体发布器的通用组件
 ********************/
function useCircleEditor(onInsertMention: (data: { userId: string; displayName: string }) => void, guildId: string) {
  let { editor, searchNode, editorNode } = useEditor(guildId, '分享你的精彩时刻...', {
    className: '!min-h-[94px]',
    onInsertMention,
    channelLink: {
      useSearchChannel: editor => useSearchChannel(editor, guildId),
    },
    renderElement: props => {
      if (props.element.type === 'topic') {
        return (
          <span contentEditable={false} className={'text-fgBlue1'}>
            #{(props.element as { name: string }).name}#
          </span>
        )
      }
    },
    maxSearchLength: 30,
  })
  editor = withTopic(editor) as never

  return { editor, searchNode, editorNode }
}

const MAX_WORD_COUNT = 5000

function WordCount({ editor }: { editor: BaseEditor; onEditorChange?: (wordCount: number) => void }) {
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const onChange = editor.onChange
    editor.onChange = () => {
      onChange()
      handleRichTextEditorChange()
    }
  }, [editor])

  function handleRichTextEditorChange() {
    setWordCount(editor.string([]).length)
  }

  return (
    <div className={clsx(['text-right text-xs', wordCount <= MAX_WORD_COUNT ? 'text-fgB40' : 'text-functionRed1'])}>
      {wordCount}/{MAX_WORD_COUNT}
    </div>
  )
}

function PostVisibility({ value, onChange }: { value?: CircleDisplay; onChange?: (value: CircleDisplay) => void }) {
  return (
    <FormSection title={'谁可以看'} className={'mb-4'}>
      <Radio.Group value={value} onChange={e => onChange?.(e.target.value)} className={'py-2'}>
        <Radio value={CircleDisplay.public}>公开可见</Radio>
        <Radio value={CircleDisplay.circleUnVisible}>仅自己可见</Radio>
      </Radio.Group>
    </FormSection>
  )
}

function MediaPublishImageItem({
  image,
  selected,
  onClick,
  onDelete,
  withOpacity = false,
}: {
  image: ImageInfo & { id: UniqueIdentifier }
  selected: boolean
  onClick?: () => void
  onDelete?: () => void
  withOpacity?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image?.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!image) {
    return (
      <div
        onClick={onClick}
        className={clsx([
          'w-[100px] h-[100px] p-1 group cursor-pointer relative',
          'before:transition-colors before:content-[""] before:-m-[5px] before:box-content before:absolute before:w-[100px] before:h-[100px] before:border before:rounded-[10px]',
          'before:border-dashed pointer-events-none',
        ])}
      />
    )
  }
  return (
    <div ref={setNodeRef} style={style} onMouseUp={onClick}>
      <div
        className={clsx([
          'w-[100px] h-[100px] p-1 group cursor-pointer relative',
          'before:pointer-events-none before:transition-colors before:content-[""] before:-m-[5px] before:box-content before:absolute before:w-[100px] before:h-[100px] before:border before:rounded-[10px]',
          // 选中态/未选中态
          // todo 层级
          selected ? 'before:border-[3px] before:-m-[7px] before:border-[var(--fg-blue-1)]' : 'hover:bg-[var(--fg-b5)]',
          withOpacity && 'opacity-50',
        ])}
      >
        {image && <img {...attributes} {...listeners} src={image.url} className={'object-cover rounded-lg w-full h-full'} alt="" />}
        {image && onDelete && (
          <Tooltip title={'删除'}>
            <iconpark-icon
              class="absolute invisible group-hover:visible w-5 h-5 flex-center rounded-full border-b60 bg-fgB60/40 hover:bg-fgB60/60 active:bg-fgB60/80 transition-colors top-2 right-2"
              name={'Close'}
              onClick={e => {
                e.stopPropagation()
                onDelete()
              }}
              size={12}
              color={'white'}
            />
          </Tooltip>
        )}
      </div>
    </div>
  )
}
