import { ButtonProps } from 'antd/es/button/button'
import { ModalFuncProps } from 'antd/es/modal/interface'
import { CSSProperties } from 'react'
import { modal } from '../../base_component/entry'
import HoverBox from '../../components/HoverBox.tsx'

export const ModalUniqueKey = 'ModalUniqueKey'

export type FbModalFuncProps = {
  /**
   * 解决多层嵌套弹窗问题
   */
  groupKey?: string
  /**
   * 若传入 则之前存在的弹窗会置顶
   * @todo 可能会导致一些错误 因为返回的是之前的弹窗数据
   */
  uniqueKey?: string
  showOkButton?: boolean
  showCancelButton?: boolean
  onCloseIconTap?: () => void
} & ModalFuncProps

export type ConfigUpdate = ModalFuncProps | ((prevConfig: ModalFuncProps) => ModalFuncProps)

const ModalTypeIcon = {
  error: <iconpark-icon name="ExclamationCircle" size={22} color="var(--function-red-1)" class="anticon"></iconpark-icon>,
  info: null,
  success: null,
  warn: null,
  warning: null,
  confirm: null,
}

export class ModalGroupManager {
  static limit = 3
  static groupMap: Map<string, (() => void)[]> = new Map<string, (() => void)[]>()

  static clearAll() {
    ModalGroupManager.groupMap = new Map<string, (() => void)[]>()
  }

  static top(groupKey: string, callback: () => void) {
    const group = ModalGroupManager.groupMap.get(groupKey)
    if (!group) {
      return
    }
    const index = group.findIndex(item => item === callback)
    if (index < 0) {
      return
    }
    const element = group.splice(index, 1)[0]
    group.push(element)
  }

  static add(groupKey: string, callback: () => void) {
    let group = ModalGroupManager.groupMap.get(groupKey)
    if (!group) {
      group = []
      ModalGroupManager.groupMap.set(groupKey, group)
    }
    group.push(callback)
    if (group.length > ModalGroupManager.limit) {
      // 移除第一个
      group[0]()
    }
  }
  static remove(groupKey: string, callback: () => void) {
    const group = ModalGroupManager.groupMap.get(groupKey)
    if (!group) {
      return
    }
    const _group = group.filter(item => item !== callback)
    _group.length === 0 ? ModalGroupManager.groupMap.delete(groupKey) : ModalGroupManager.groupMap.set(groupKey, _group)
  }
}

type ModalReturn = ReturnType<typeof modal.confirm>
export class ModalTopManager {
  static modalMap: Map<string, ModalReturn> = new Map<string, ModalReturn>()
  static clearAll() {
    ModalTopManager.modalMap = new Map<string, ModalReturn>()
  }

  static add(uniqueKey: string, modal: ModalReturn) {
    ModalTopManager.modalMap.set(uniqueKey, modal)
  }
  static remove(uniqueKey: string) {
    ModalTopManager.modalMap.delete(uniqueKey)
  }
  static get(uniqueKey: string) {
    return ModalTopManager.modalMap.get(uniqueKey)
  }
}

export default function showFbModal({
  groupKey,
  uniqueKey,
  className,
  title,
  onCancel,
  afterClose,
  showCancelButton = true,
  showOkButton = true,
  maskClosable = true,
  closable = true,
  centered = true,
  okButtonProps,
  cancelButtonProps,
  icon,
  type,
  onCloseIconTap,
  ...props
}: FbModalFuncProps): {
  destroy: () => void
  update: (configUpdate: ConfigUpdate) => void
} {
  if (uniqueKey && document) {
    const elem = document.querySelector(`.${ModalUniqueKey}-${uniqueKey}`)
    const result = ModalTopManager.get(uniqueKey)
    if (elem && result) {
      let closestBodyParent = elem
      while (closestBodyParent.parentElement && closestBodyParent.parentElement !== document.body) {
        closestBodyParent = closestBodyParent.parentElement
      }
      document.body.appendChild(closestBodyParent)
      if (groupKey) {
        ModalGroupManager.top(groupKey, result.destroy)
      }
      return result
    }
  }

  const hiddenStyle = {
    style: {
      display: 'none',
    },
  }
  const baseButtonStyle: CSSProperties = { borderRadius: 9999 }
  okButtonProps = { ...okButtonProps, style: { ...okButtonProps?.style, ...baseButtonStyle } }
  cancelButtonProps = { ...cancelButtonProps, style: { ...cancelButtonProps?.style, ...baseButtonStyle } }
  let closeIcon = <iconpark-icon name="Close" fill="var(--fg-b100)" size={20}></iconpark-icon>
  // 自定义关闭icon事件
  // 样式需确保和antd button宽高一致，并阻止冒泡
  if (onCloseIconTap) {
    closeIcon = (
      <HoverBox
        onClick={e => {
          e.stopPropagation()
          onCloseIconTap()
        }}
        className="h-[8] w-[8] !p-1.5"
      >
        {closeIcon}
      </HoverBox>
    )
  }

  const { destroy, update } = modal.confirm({
    icon: null,
    onCancel,
    closable,
    maskClosable,
    centered,
    afterClose:
      groupKey || uniqueKey ?
        () => {
          // 移除
          uniqueKey && ModalTopManager.remove(uniqueKey)
          // 关闭后移除
          groupKey && ModalGroupManager.remove(groupKey, destroy)
          afterClose?.()
        }
      : afterClose,
    okButtonProps: !showOkButton ? hiddenStyle : { className: 'btn-primary', ...okButtonProps },
    cancelButtonProps: !showCancelButton ? hiddenStyle : cancelButtonProps,
    footer: showOkButton || showCancelButton ? undefined : null,
    closeIcon: closeIcon,
    title: title && (
      <div className={'fb-modal-title flex items-center gap-[8px]'}>
        {icon ?? (type ? ModalTypeIcon[type] : null)}
        <div className={'flex-1'}>{title}</div>
      </div>
    ),
    className: `${className} fb-modal ${uniqueKey ? `${ModalUniqueKey}-${uniqueKey}` : ''}`,
    ...props,
  })
  if (groupKey) {
    ModalGroupManager.add(groupKey, destroy)
  }

  if (uniqueKey) {
    ModalTopManager.add(uniqueKey, { destroy, update })
  }

  return { destroy, update }
}

export interface ShowFbModalProps {
  updateOkProps?: (props: ButtonProps) => void
  updateCancelProps?: (props: ButtonProps) => void
}
