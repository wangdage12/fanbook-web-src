import { Card } from 'antd'
import React, { ReactNode } from 'react'
import BlueLogoText from '../../assets/images/blue-logo-text.svg'
import LeftBottom from '../../assets/images/login/lb.svg'
import LeftTop from '../../assets/images/login/lt.svg'
import MiddleLeft from '../../assets/images/login/ml.svg'
import MiddleRight from '../../assets/images/login/mr.svg'
import RightBottom from '../../assets/images/login/rb.svg'
import RightTop from '../../assets/images/login/rt.svg'

interface LoginBgWrapperProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

const LoginBgWrapper: React.FC<LoginBgWrapperProps> = ({ children, className, style }) => {
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: '#2B5FF0',
    backgroundSize: 'cover',
    width: '100%',
    height: '100vh',
  }

  return (
    <div className={className} style={{ ...backgroundStyle, ...style }}>
      <img src={LeftTop} draggable={false} className={'absolute left-0 top-0 w-[511px]'} alt="" />
      <img src={LeftBottom} draggable={false} className={'absolute bottom-0 left-0 w-[570px]'} alt="" />
      <img src={RightTop} draggable={false} className={'absolute right-0 top-0 w-[410px]'} alt="" />
      <img src={RightBottom} draggable={false} className={'absolute bottom-0 right-0 w-[397px]'} alt="" />
      <img
        src={MiddleLeft}
        draggable={false}
        className={'absolute left-[50%] top-[50%] w-[210px] translate-x-[-410px] translate-y-[-180px]'}
        alt=""
      />
      <img
        src={MiddleRight}
        draggable={false}
        className={'absolute left-[50%] top-[50%] w-[127px] translate-x-[200px] translate-y-[-240px]'}
        alt=""
      />
      <img src={BlueLogoText} draggable={false} className={'absolute left-[40px] top-[30px] h-[26px] w-[124px]'} alt={''} />

      <Card className={'min-h-[480px] w-[400px]'} styles={{ body: { height: '100%', padding: 32 } }}>
        {children}
      </Card>
    </div>
  )
}
export default LoginBgWrapper
