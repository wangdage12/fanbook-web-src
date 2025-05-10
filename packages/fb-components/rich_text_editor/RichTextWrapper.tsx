import { Divider } from 'antd'
import { ReactNode, createContext, useCallback, useMemo, useState } from 'react'
import { Transforms } from 'slate'
import { useSlate } from 'slate-react'
import RichTextEditorUtils from './RichTextEditorUtils'
import HoverToolbar from './components/HoverToolbar'
import LinkEditModal from './components/LinkEditModal'
import { CustomElement, LinkElement, LinkMode } from './custom-editor'

export enum RichtextEditMode {
  Create = 'create',
  Edit = 'edit',
}

const LinkEditModalTitle = {
  [RichtextEditMode.Create]: '插入链接',
  [RichtextEditMode.Edit]: '编辑链接',
}

const useLinkPopup = () => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(LinkEditModalTitle[RichtextEditMode.Create])
  const editor = useSlate()
  const linkModelNode = (
    <LinkEditModal
      title={title}
      open={open}
      afterOpenChange={setOpen}
      onCancel={() => setOpen(false)}
      onConfirm={(url, name) => {
        RichTextEditorUtils.wrapLink(editor, { url, name })
        setOpen(false)
      }}
    />
  )
  const showLinkEditModal = useCallback((mode?: RichtextEditMode) => {
    setTitle(LinkEditModalTitle[mode ?? RichtextEditMode.Create])
    setOpen(true)
  }, [])

  const LinkToolbar = ({ url, linkMode }: { url: string; linkMode: LinkMode }) => (
    <div className="flex items-center rounded-[8px] bg-[var(--fg-b95)] px-[12px] py-[8px] text-[var(--fg-white-1)]">
      <a href={url} target="_blank">
        访问链接
      </a>
      <Divider type="vertical" className="border-[var(--fg-white-1)]"></Divider>
      <span className="inline-flex cursor-pointer items-center gap-[8px]" onClick={() => showLinkEditModal(RichtextEditMode.Edit)}>
        <iconpark-icon name="Edit"></iconpark-icon>编辑链接
      </span>
      {linkMode === 'text' && (
        <>
          <Divider type="vertical" className="border-[var(--fg-white-1)]"></Divider>
          <span className="inline-flex cursor-pointer items-center gap-[8px]" onClick={() => RichTextEditorUtils.unwrapLink(editor)}>
            <iconpark-icon name="Link-Broken"></iconpark-icon>解除链接
          </span>
        </>
      )}
      <Divider type="vertical" className="border-[var(--fg-white-1)]"></Divider>
      <span
        className="inline-flex cursor-pointer items-center gap-[8px]"
        onClick={() => RichTextEditorUtils.wrapLink(editor, { url, mode: linkMode === 'text' ? 'card' : 'text' })}
      >
        <iconpark-icon name="Swap2"></iconpark-icon>
        {linkMode === 'text' ? '切换成卡片' : '切换成链接'}
      </span>
      {linkMode === 'card' && (
        <>
          <Divider type="vertical" className="border-[var(--fg-white-1)]"></Divider>
          <span
            className="inline-flex cursor-pointer items-center gap-[8px]"
            onClick={() => {
              Transforms.removeNodes(editor)
            }}
          >
            <iconpark-icon name="Delete"></iconpark-icon>删除
          </span>
        </>
      )}
    </div>
  )

  return {
    showLinkEditModal,
    linkModelNode,
    LinkToolbar,
  }
}

interface RichTextContextProps {
  showEditModal: (type: CustomElement['type'], mode?: RichtextEditMode) => void
  toggleHoverToolbar: (type: CustomElement['type'], triggerTarget: HTMLElement | null, isActive: boolean, options: Partial<CustomElement>) => void
}

export const RichTextContext = createContext<RichTextContextProps | undefined>(undefined)

function RichTextWrapper({ children }: { children: ReactNode }) {
  const [triggerTarget, setTriggerTarget] = useState<HTMLElement | null>(null)
  const [toolbarActive, setToolbarActive] = useState<boolean>(false)
  // 链接编辑弹窗
  const { showLinkEditModal, LinkToolbar, linkModelNode } = useLinkPopup()

  const [toolbarContent, setToolbarContent] = useState<ReactNode | null>(null)

  const context = useMemo(
    () => ({
      showEditModal: (type: CustomElement['type'], mode?: RichtextEditMode) => {
        switch (type) {
          case 'link':
            showLinkEditModal(mode)
            break
          default:
            break
        }
      },
      toggleHoverToolbar: (type: CustomElement['type'], triggerTarget: HTMLElement | null, isActive: boolean, options: Partial<CustomElement>) => {
        switch (type) {
          case 'link': {
            const { url, mode } = options as LinkElement
            setToolbarContent(<LinkToolbar url={url} linkMode={mode} />)
            break
          }
          default:
            break
        }
        setTriggerTarget(triggerTarget)
        setToolbarActive(isActive)
      },
    }),
    [showLinkEditModal]
  )

  return (
    <RichTextContext.Provider value={context}>
      {children}
      {linkModelNode}
      <HoverToolbar active={toolbarActive} triggerTarget={triggerTarget}>
        {toolbarContent}
      </HoverToolbar>
    </RichTextContext.Provider>
  )
}

export default RichTextWrapper
