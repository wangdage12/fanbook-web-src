import { useHover } from 'ahooks'
import { Button } from 'antd'
import axios from 'axios'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import React, { useEffect, useRef, useState } from 'react'
import codeImage from '../../assets/images/formal_code.png'
import codeIosImage from '../../assets/images/ios_code.jpeg'
import './download.less'

function downloadFile(url: string) {
  const element = document.createElement('a')
  element.setAttribute('href', url)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

interface DownloadInfo {
  androidSixtyFour: string
  androidThirtyTwo: string
  mac: string
  win: string
}
async function getDownloadInfo() {
  return await axios.get<undefined, DownloadInfo>(import.meta.env.FANBOOK_OFFICIAL_DOWNLOAD_URL, { json: true })
}

interface DownloadItemProps {
  name: string
  hoverTitle?: string
  hoverImage?: React.ReactNode
  icon: string
  onClick: () => void
}

const DownloadItem: React.FC<DownloadItemProps> = ({ name, hoverTitle, hoverImage, icon, onClick }) => {
  const targetRef = useRef<HTMLDivElement>(null)
  const isHover = useHover(targetRef)
  return (
    <div ref={targetRef} className="flex cursor-pointer flex-col items-center" onClick={onClick}>
      <div className="mb-[8px] flex h-[124px] w-[124px] items-center justify-center overflow-hidden rounded-[8px] bg-[var(--fg-white-1)] shadow-[0_4px_10px_0px_rgba(18,0,220,0.05)]">
        {isHover ? hoverImage ?? <iconpark-icon name={icon} size={44}></iconpark-icon> : <iconpark-icon name={icon} size={40}></iconpark-icon>}
      </div>
      <span className="text-[14px]">{name}</span>
      <Button
        type={'primary'}
        className="mt-[20px] w-[120px]"
        style={{ ...(isHover ? { background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), #198cfe' } : {}) }}
      >
        {isHover ? hoverTitle ?? '点击下载' : '点击下载'}
      </Button>
    </div>
  )
}

const Download = () => {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null)

  const clientInfo: DownloadItemProps[] = [
    {
      name: 'Windows 客户端',
      icon: 'Windows',
      onClick: () => {
        if (downloadInfo?.win) {
          downloadFile(downloadInfo?.win)
        }
      },
    },
    {
      name: 'macOS 客户端',
      icon: 'Apple',
      onClick: () => {
        if (downloadInfo?.mac) {
          downloadFile(downloadInfo?.mac)
        }
      },
    },
    {
      name: 'Android 客户端',
      icon: 'Android',
      hoverImage: <img src={codeImage} className="h-full w-full" />,
      onClick: () => {
        if (downloadInfo?.androidSixtyFour) {
          downloadFile(downloadInfo?.androidSixtyFour)
        }
      },
    },
    {
      name: 'iOS 客户端',
      icon: 'AppStore',
      hoverImage: <img src={codeIosImage} className="h-full w-full" />,
      hoverTitle: 'App Store 下载',
      onClick: () => {
        window.open(import.meta.env.FANBOOK_APP_STORE_URL, '_blank')
      },
    },
  ]

  useEffect(() => {
    getDownloadInfo().then(info => setDownloadInfo(info))
  }, [])

  return (
    <div className="mx-[40px] flex flex-wrap justify-between gap-[16px] py-[32px]">
      {clientInfo.map(item => (
        <DownloadItem key={item.name} {...item} />
      ))}
    </div>
  )
}

export default Download

export const downloadModal = () => {
  showFbModal({
    className: 'bg-gradient-to-b from-blue-100 to-white download-modal rounded-[8px]',
    width: 800,
    title: '下载Fanbook客户端',
    content: <Download />,
    showCancelButton: false,
    showOkButton: false,
  })
}
