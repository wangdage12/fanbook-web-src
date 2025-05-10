function ListFooter({ visible, message = '- 没有更多了 -' }: { visible: boolean; message?: string }) {
  return visible ? <div className={'flex-center h-[48px] text-xs text-[var(--fg-b30)]'}>{message}</div> : null
}

export default ListFooter
