import { Button } from 'antd'
import clsx from 'clsx'
import React from 'react'
import NullStateImage from '../assets/images/placeholder_nodata_light.svg'

export interface EmptyPageProps {
  message?: React.ReactNode
  context?: string
  className?: string
  image?: string
  imageSize?: number
  onClick?: () => void
  buttonLabel?: string
  buttonOnClick?: () => void
  buttonClass?: string
  buttonGhost?: boolean
}

const EmptyPage = ({
  image = NullStateImage,
  imageSize = 140,
  buttonLabel,
  buttonOnClick,
  onClick,
  message = '空空如也',
  context,
  className = '',
  buttonClass,
  buttonGhost = true,
}: EmptyPageProps) => {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center ${className}`} onClick={onClick}>
      <img src={image ?? NullStateImage} draggable={false} className="mb-4" style={{ width: imageSize }} />
      {message && <span className="mb-1 whitespace-pre-line text-center text-[16px] font-bold">{message}</span>}
      {context && <span className="whitespace-pre-line text-center text-[14px] text-[var(--fg-b60)]">{context}</span>}
      {buttonLabel && (
        <Button className={clsx(['mt-4', buttonClass])} type={'primary'} ghost={buttonGhost} onClick={buttonOnClick}>
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyPage
