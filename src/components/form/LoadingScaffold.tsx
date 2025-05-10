import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import { ReactNode, useEffect, useState } from 'react'
import NoNetImage from '../../assets/images/no-net.svg'
import EmptyPage from '../EmptyPage.tsx'

// 提供加载和错误重载的页面脚手架
export default function LoadingScaffold<T>({ fetch, onLoad, children }: { fetch: () => Promise<T>; onLoad: (data: T) => void; children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<boolean>(false)

  function doFetch() {
    setError(false)
    setLoading(true)
    fetch()
      .then(onLoad)
      .catch(e => {
        console.info(e)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    doFetch()
  }, [])

  if (loading) {
    return (
      <div className={'flex-center h-full'}>
        <CircularLoading size={24} />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyPage
        image={NoNetImage}
        message={'网络质量不佳，请稍后重试'}
        buttonLabel={'重新加载'}
        buttonClass={'btn-primary'}
        buttonOnClick={doFetch}
      />
    )
  }

  return children
}
