import { useEffect, useState } from 'react'

const Delay = ({ waitTime, children }: { waitTime: number; children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, waitTime)

    return () => clearTimeout(timer)
  }, [waitTime])

  return isReady ? children : null
}

export default Delay
