import { useEffect, useState } from 'react'

interface CountdownHookOptions {
  initialTime: number // 初始倒计时时间（毫秒）
  interval?: number // 更新间隔（毫秒），默认为 1000 毫秒
}

interface CountdownHookResult {
  time: number // 当前剩余时间（毫秒）
  isRunning: boolean // 是否在倒计时中
  start: () => void // 开始倒计时
  reset: () => void // 重置倒计时时间
}

const useCountdown = (options: CountdownHookOptions): CountdownHookResult => {
  const { initialTime, interval = 1000 } = options
  const [time, setTime] = useState<number>(initialTime)
  const [isRunning, setIsRunning] = useState<boolean>(false)

  useEffect(() => {
    if (isRunning && time > 0) {
      const timerId = setInterval(() => {
        setTime(prevTime => Math.max(prevTime - interval, 0))
      }, interval)

      return () => {
        clearInterval(timerId)
      }
    }
  }, [isRunning, time, interval])

  const start = () => {
    setIsRunning(true)
  }

  const reset = () => {
    setIsRunning(true)
    setTime(initialTime)
  }

  return {
    time,
    isRunning,
    start,
    reset,
  }
}

export default useCountdown
