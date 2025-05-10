import { Button, Form, GetRef, Input } from 'antd'
import { isNil } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Path } from 'slate'
import { useSlate } from 'slate-react'
import FbModal from '../../base_ui/fb_modal'
import { URL_PATTERN } from '../../rich_text/FbPlainText'
import RichTextEditorUtils from '../RichTextEditorUtils'
import { LinkElement } from '../custom-editor'

function LinkEdit({ onConfirm, onCancel }: { onCancel: () => void; onConfirm: (url: string, name?: string) => void }) {
  const editor = useSlate()
  const isCollapsed = RichTextEditorUtils.isCollapsed(editor)
  const [form] = Form.useForm()
  const linkRef = useRef<GetRef<typeof Input>>(null)

  const {
    url = '',
    name = '',
    mode = 'text',
  } = useMemo(() => {
    const [linkElem] = (RichTextEditorUtils.getCurrentNode(editor, 'link') ?? []) as [LinkElement, Path]
    if (!linkElem) return { url: '', name: '', mode: 'text' }
    return { url: linkElem.url, name: linkElem.children[0].text, mode: linkElem.mode }
  }, [editor])
  const [nextUrl, setNextUrl] = useState(url)
  const [nextName, setNextName] = useState(name)
  const canConfirm = URL_PATTERN.test(nextUrl) && (isCollapsed ? nextName.length > 0 : true)
  const handleClick = () => {
    if (canConfirm) {
      let _url = nextUrl
      if (!nextUrl.startsWith('http://') && !nextUrl.startsWith('https://')) {
        _url = `https://${nextUrl}`
      }
      onConfirm(_url, isCollapsed ? nextName : undefined)
    }
  }
  const onFormChange = ({ name, url }: { name?: string; url?: string }) => {
    !isNil(url) && setNextUrl(url)
    !isNil(name) && setNextName(name)
  }

  useEffect(() => {
    setTimeout(() => {
      linkRef.current?.focus()
    }, 300)
  }, [])

  return (
    <div className="flex flex-col gap-[32px]">
      <Form layout="vertical" form={form} autoComplete="off" initialValues={{ url, name }} onValuesChange={onFormChange}>
        <Form.Item label="链接" name="url" rules={[{ pattern: URL_PATTERN, message: '此链接无效，请重新输入' }]} className="!mb-4">
          <Input ref={linkRef} value={nextUrl} placeholder="请粘贴或输入一个链接" />
        </Form.Item>
        {isCollapsed && mode === 'text' && (
          <Form.Item label="文本" name="name" className="!mb-4">
            <Input value={nextName} placeholder="请输入文本" />
          </Form.Item>
        )}
      </Form>
      <div className="flex justify-end gap-[8px]">
        <Button className="btn-middle" onClick={onCancel}>
          取消
        </Button>
        <Button type="primary" className="btn-middle" disabled={!canConfirm} onClick={handleClick}>
          确定
        </Button>
      </div>
    </div>
  )
}

function LinkEditModal({
  title = '插入链接',
  open,
  afterOpenChange,
  onConfirm,
  onCancel,
}: {
  title?: string
  open: boolean
  afterOpenChange: (open: boolean) => void
  onConfirm: (url: string, name?: string) => void
  onCancel: () => void
}) {
  return (
    <FbModal
      title={title}
      classNames={{ content: '!py-4 !px-6' }}
      maskClosable
      width={440}
      centered
      open={open}
      className="border-[1px]"
      onCancel={onCancel}
      afterOpenChange={afterOpenChange}
      footer={null}
      destroyOnClose
    >
      <LinkEdit onCancel={onCancel} onConfirm={onConfirm} />
    </FbModal>
  )
}

export default LinkEditModal
