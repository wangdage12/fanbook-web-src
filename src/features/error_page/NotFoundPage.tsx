import { Button } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorImg from '../../assets/images/404.png'
import fixCssOrder from '../../utils/fixCssOrder.ts'

export default function NotFoundPage() {
  useEffect(fixCssOrder, [])
  const navigate = useNavigate()
  return (
    <div className={'flex h-full w-full flex-1 flex-col items-center justify-center'}>
      <img className={'w-[240px]'} src={ErrorImg} alt="出错了" />
      <div className={'mt-[24px] text-center text-lg'}>
        非常抱歉你访问的页面不存在哦！
        <br /> 快去看看其他内容吧
      </div>
      <Button
        size={'large'}
        shape={'round'}
        type={'primary'}
        className={'mt-[24px] !h-11 w-[120px] !text-base'}
        onClick={() => navigate('/', { replace: true })}
      >
        返回首页
      </Button>
    </div>
  )
}
