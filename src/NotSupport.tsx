import Button from 'antd/es/button'
import { useEffect, useState } from 'react'
import NotSupportImage from './assets/images/placeholder_notsupported_web_light.svg'
import fixCssOrder from './utils/fixCssOrder.ts'

function NotSupport() {
  const [clickCount, setClickCount] = useState(0)

  useEffect(fixCssOrder, [])

  const handleClick = () => {
    setClickCount(prevCount => prevCount + 1)
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <img src={NotSupportImage} draggable="false" className="w-[240px]" onClick={handleClick} alt="no support" />
      <span className="my-[24px]">你的浏览器版本过低，请更新至最新版本</span>
      {clickCount >= 5 && <span className="my-[24px]">{navigator.userAgent}</span>}
      <Button type={'primary'} size={'large'} shape={'round'} onClick={() => (window.location.href = import.meta.env.FANBOOK_WEBSITE)}>
        去官网首页看看
      </Button>
    </div>
  )
}

export default NotSupport
