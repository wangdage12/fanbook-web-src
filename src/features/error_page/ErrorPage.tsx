import { Button } from 'antd'
import { useEffect, useState } from 'react'
import ErrorImg from '../../assets/images/error.png'

export default function ErrorPage({ message = '十分抱歉，似乎出现了一点错误~' }: { message?: string; context?: string }) {
  const [toHome, setHome] = useState(false)
  useEffect(() => {
    toHome && (location.href = location.origin)
  }, [toHome])
  return (
    <div className={'flex h-full w-full flex-1 flex-col items-center justify-center'}>
      <img className={'w-[240px]'} src={ErrorImg} alt="出错了" />
      <div className={'mt-[24px] text-center text-lg'}>{message}</div>
      <div className="mt-[24px]">
        <Button size={'large'} shape={'round'} className={'mr-[24px] !h-11 w-[120px] !text-base'} onClick={() => setHome(true)}>
          返回首页
        </Button>
        <Button size={'large'} type={'primary'} shape={'round'} className={'!h-11 w-[120px] !text-base'} onClick={() => location.reload()}>
          点击刷新
        </Button>
      </div>
    </div>
  )
}
