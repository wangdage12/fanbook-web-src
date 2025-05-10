import { App as AntdApp } from 'antd'
import entry from 'fb-components/base_component/entry'
import React, { useEffect } from 'react'
import fixCssOrder from '../../utils/fixCssOrder.ts'
import { WithLocation } from './WithLocation'

interface WithGlobalProps {
  children: React.ReactNode
}

function WithPopup({ children }: WithGlobalProps) {
  entry()
  return children
}

function WithGlobal({ children }: WithGlobalProps) {
  // 修复 tailwind css base 样式与 antd 冲突
  useEffect(fixCssOrder, [])

  return (
    <AntdApp className="h-full w-full">
      <WithPopup>
        <WithLocation>{children}</WithLocation>
      </WithPopup>
    </AntdApp>
  )
}

export default WithGlobal
