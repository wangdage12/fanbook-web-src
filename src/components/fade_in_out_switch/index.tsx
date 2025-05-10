import React, { HTMLAttributes } from 'react'
import './index.css'

interface FadeInOutSwitchProps {
  index: 0 | 1
  duration?: number
  children: React.ReactNode[]
}

const FadeInOutSwitch: React.FC<FadeInOutSwitchProps & HTMLAttributes<never>> = ({ index = 0, duration = 500, children, className, ...props }) => {
  return (
    <div className={`${className} fade-in-out-switch`} style={{ transitionDuration: `${duration}ms` }} {...props}>
      <div className={`content ${index === 0 ? 'active h-auto w-full' : 'h-0 w-0'}`}>{children[0]}</div>
      <div className={`content ${index === 1 ? 'active h-auto w-full' : 'h-0 w-0'}`}>{children[1]}</div>
    </div>
  )
}

export default FadeInOutSwitch
