import { Button, Radio, RadioChangeEvent, Space } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { useState } from 'react'
import { QuestionMenuItemKey } from '../features/question/QuestionMenuDropdown.tsx'

export async function showDeleteConfirmModal({
  deleteText = '',
  confirmPromise,
  onDelete,
}: {
  deleteText?: string
  confirmPromise?: (reasonType: number, label: string, reason?: string) => Promise<void>
  onDelete?: () => void
}) {
  const { destroy: close } = FbModal.error({
    type: 'error',
    title: `删除${deleteText}`,
    content: (
      <DeleteConfirmModal
        confirmPromise={confirmPromise}
        onClose={deleted => {
          close()
          if (deleted) {
            onDelete?.()
          }
        }}
      />
    ),
    footer: null,
    closable: false,
  })
}

interface DeleteConfirmModalProps {
  deleteText?: string
  confirmPromise?: (reasonType: number, label: string, reason?: string) => Promise<void>
  onClose: (deleted?: boolean) => void
}

const options = [
  { value: 0, label: '静默删除（不会通知作者）' },
  { value: 1, label: '重复或无意义的内容' },
  { value: 2, label: '恶意引站或带节奏' },
  { value: 3, label: '侵害他人权益' },
  { value: 4, label: '广告或虚假信息' },
  { value: 5, label: '违反法律法规' },
  { value: 255, label: '其他' },
]

function DeleteConfirmModal({ deleteText = '', onClose, confirmPromise }: DeleteConfirmModalProps) {
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [val, setVal] = useState(0)
  const [reason, setReason] = useState('')
  const onConfirm = async () => {
    if (val === 255 && (!reason || reason?.trim() === '')) {
      FbToast.open({ content: '请输入删除理由' })
      return
    }
    try {
      setConfirmLoading(true)
      await confirmPromise?.(val, options.find(option => option.value == val)?.label ?? '', reason)
      await onClose?.(true)
      FbToast.open({ content: `已删除${deleteText}`, key: QuestionMenuItemKey.Delete })
    } catch (err) {
      console.log(err)
    } finally {
      setConfirmLoading(false)
    }
  }

  const onChange = (v: RadioChangeEvent) => {
    setVal(v.target.value)
  }

  return (
    <div>
      <div>
        <Radio.Group onChange={onChange} value={val}>
          <Space direction="vertical" size={[0, 12]}>
            {options.map(({ label, value }) => (
              <Radio key={value} value={value} className={'text-[15px]'}>
                {label}
              </Radio>
            ))}
          </Space>
          {val === 255 && (
            <TextArea
              className={'mt-3'}
              placeholder={`请输入删除${deleteText}的理由`}
              showCount
              maxLength={100}
              defaultValue={reason}
              onChange={e => setReason(e.target.value)}
            />
          )}
        </Radio.Group>
      </div>
      <div className={'h-[22px]'}></div>
      <div className="ant-modal-footer">
        <Button className={'btn-middle'} onClick={() => onClose()}>
          取消
        </Button>
        <Button className={'btn-middle'} type={'primary'} danger onClick={onConfirm} loading={confirmLoading}>
          删除
        </Button>
      </div>
    </div>
  )
}
