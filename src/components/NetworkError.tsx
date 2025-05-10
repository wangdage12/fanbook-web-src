import NetworkErrorImage from '../assets/images/placeholder_networkerror_web_light.svg'
import EmptyPage from './EmptyPage.tsx'

/**
 * 数据错误组件
 * @param onClick
 * @constructor
 */
export function NetworkError({ onClick }: { onClick?: () => void }) {
  return (
    <EmptyPage
      image={NetworkErrorImage}
      context={'数据获取失败，请稍后重试'}
      message={''}
      buttonLabel={'重新加载'}
      buttonOnClick={onClick}
      buttonGhost={false}
    ></EmptyPage>
  )
}
